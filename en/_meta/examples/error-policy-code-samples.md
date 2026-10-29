# Error policy — code samples (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Purpose: Illustration only. Not SSOT. Normative rules: [`../../error-policy/error-policy.md`](../../error-policy/error-policy.md).

These examples are illustrative only. They must be adapted to your project types, logger API, shared DTO fields, and locale. Do not copy-paste as production code without aligning with binding standards.

Strict alignment: Every property name and whether a field exists on the wire **MUST** match the API contract in [error-policy.md](../../error-policy/error-policy.md) and your shared types. Do not add fields (e.g. `solution`) to HTTP responses unless the contract defines them.

Anti-copy: These blocks are patterns, not drop-in templates. Direct copy without contract and standards alignment is a standards violation.

---

## Registry + carrier + derived severity (canonical model — **M12**–**M15**)

```typescript
// SSoT: one table, code → facts. No severity field — it is derived.
export const ERROR_REGISTRY = {
  CUSTOMER_NOT_FOUND: { httpStatus: 404, category: 'OPERATIONAL', messageKey: 'errors.customerNotFound', retryable: false },
  VALIDATION_ERROR:   { httpStatus: 400, category: 'BUSINESS',    messageKey: 'errors.validation',       retryable: false },
  INVARIANT_VIOLATION:{ httpStatus: 400, category: 'SYSTEM',      messageKey: 'errors.generic',          retryable: false }, // 4xx but still SYSTEM (defect)
} as const;

export type ErrorCode = keyof typeof ERROR_REGISTRY;     // off-registry code = compile error (M14)
export type ErrorCategory = 'OPERATIONAL' | 'BUSINESS' | 'SYSTEM';

// severity is DERIVED, never stored (M15) — exhaustive, fail-loud on a new category
export function severityOf(category: ErrorCategory): 'WARN' | 'ERROR' {
  switch (category) {
    case 'OPERATIONAL':
    case 'BUSINESS': return 'WARN';
    case 'SYSTEM':   return 'ERROR';
    default: { const _x: never = category; throw new Error(`unmapped category: ${String(_x)}`); }
  }
}

// Typed carrier: the code is the identity, context holds operator detail (M13)
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly httpStatus: number;
  readonly category: ErrorCategory;
  readonly context: Readonly<Record<string, unknown>>;
  constructor(code: ErrorCode, context: Record<string, unknown> = {}) {
    super(code); // message = code (stable), NOT a parse-prefix string
    this.name = 'AppError';
    const meta = ERROR_REGISTRY[code];
    this.code = code; this.httpStatus = meta.httpStatus; this.category = meta.category; this.context = context;
  }
}

export function throwError(code: ErrorCode, context?: Record<string, unknown>): never {
  throw new AppError(code, context ?? {});
}
```

---

## Single boundary handler (canonical — **M16**–**M18**)

```typescript
// One boundary. Status/category/severity/message all derive from the registry.
export function handleApiError(error: unknown, res: Response, ctx: { handler: string; language?: string }): void {
  const code = error instanceof AppError ? error.code : undefined;
  const meta = code ? ERROR_REGISTRY[code] : null;
  const httpStatus = meta?.httpStatus ?? 500;
  const category: ErrorCategory = meta?.category ?? 'SYSTEM';        // unmapped → SYSTEM (fail-loud, M16)
  const retryable = meta?.retryable ?? (category === 'SYSTEM');
  const traceId = resolveTraceId(res);                              // same id as crash report (M17)

  if (severityOf(category) === 'WARN') {
    logger.warn(`[${ctx.handler}] ${code}`, { traceId, httpStatus, category });
    incExpectedError(code ?? 'UNKNOWN', category, httpStatus);       // metric channel, NOT crash reporting (N12)
  } else {
    logger.error(`[${ctx.handler}] ${code ?? 'UNKNOWN'}`, error, { traceId, httpStatus, category }); // → crash reporting
  }

  let message: string;
  try { message = translate(meta?.messageKey ?? 'errors.generic', ctx.language); } // M4: user msg from i18n
  catch { message = translate('errors.generic'); }                   // boundary never throws (M18)

  res.status(httpStatus).json({ success: false, error: code ?? 'INTERNAL_SERVER_ERROR', message, traceId, category, retryable });
}
```

---

## Throw (pattern — registry-coded vs free-text)

```typescript
// Registry-coded path (M13): code is the identity, detail goes to context — NOT into the message string
throwError('CUSTOMER_NOT_FOUND', { customerId, rootCause: 'No row for id', source: 'getCustomerById' });

// Non-coded operator/SYSTEM throw (e.g. startup assertion) MAY use Required message shape (operator text only):
throw new Error('Config invalid. Root cause: JWT_SECRET missing. Solution: set JWT_SECRET before boot.');
```

> Forbidden (**N10**): `throw new Error('CUSTOMER_NOT_FOUND - Root cause: ...')` then splitting the message to recover the code.

---

## Semantic API error object (pattern — with envelope)

```typescript
// 4xx (expected): user message from i18n, envelope present, NO rootCause on the wire
{
  success: false,
  error: 'INSUFFICIENT_BALANCE',
  message: 'Insufficient balance',     // from messageKey → i18n
  traceId: 'req-abc123',                // same id as log + crash report (M17)
  category: 'BUSINESS',
  retryable: false,
}
// rootCause is added ONLY for 5xx in non-production (M4) — never on 4xx, never to end users.
```

---

## Try / catch — log ONCE at the boundary (pattern — **M15**)

```typescript
// Inner layer with a downstream boundary: do NOT log here, just let the typed error propagate.
const customer = await findCustomer(customerId);
if (!customer) throwError('CUSTOMER_NOT_FOUND', { customerId }); // boundary will log once (N7)

// Standalone entry point with NO outer boundary (CLI / cron / job) — log at its own outermost catch:
try {
  await runJob();
} catch (error) {
  logger.error('[BackfillJob] failed', error, { rootCause: 'job aborted' });
  throw error;
}
```

---

## Null check after retrieval (pattern — typed carrier)

```typescript
const user = await findUser(userId);
if (!user) {
  throwError('USER_NOT_FOUND', { userId, rootCause: 'User ID does not exist' }); // code + context (M13), not a parse-prefix message
}
```

---

## validate* returning string | null (caller must throw)

```typescript
const validateData = (data: Data): string | null => {
  if (!data.field) {
    return 'Field is required';
  }
  return null;
};
```

Caller must not treat validation failure as success; wrap with policy message format and throw per [error-policy.md](../../error-policy/error-policy.md).

---

## find* returning null (allowed for retrieval)

```typescript
const findUser = async (userId: string): Promise<User | null> => {
  const user = await db.users.findOne({ _id: userId });
  return user;
};
```

# Error handling — code samples (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Purpose: Illustration only. Not SSOT. Normative rules: [`../../error-handling/error-handling.md`](../../error-handling/error-handling.md).

These examples are illustrative only. Adapt to your design system, i18n, logger, and shared types.

Strict alignment: All API error object fields must match the shared contract defined with [error-policy.md](../../error-policy/error-policy.md). Do not introduce properties on the wire that the contract does not define.

Anti-copy: Patterns only — not templates. Direct copy without contract and standards alignment is a violation.

---

## Throw with root cause (client-side guard)

```typescript
throw new Error(
  'User role could not be set. Root cause: User state is null. ' +
    'Solution: Ensure user state is loaded before this call.'
);
```

---

## API error object consumed on client (pattern)

Use exactly the keys your shared contract exports (names may differ in your codebase). Minimal logical fields often include `error`, `message`, `rootCause` — see [error policy API shape](../../error-policy/error-policy.md).

```typescript
{
  error: 'INSUFFICIENT_BALANCE',
  message: 'Insufficient balance',
  rootCause: 'Account balance is less than required amount',
}
```

`rootCause`: **MUST** be logged on the client when handling failures; **MUST NOT** be shown in end-user UI unless [error handling](../../error-handling/error-handling.md) / product policy explicitly allows it for that surface.

Map semantic `error` to UI; do not invent or remap codes (see normative **M2**, **N6**–**N8** in error-handling).

---

## try/catch with logger (client)

```typescript
try {
  const result = await operation();
  return result;
} catch (error) {
  logger.error('Operation failed', error, {
    rootCause: 'Operation error',
    solution: 'Check operation parameters',
  });
  throw error;
}
```

---

## validate* and caller throw

```typescript
const validateData = (data: Data): string | null => {
  if (!data.field) return 'Field is required';
  return null;
};

// Caller **MUST** (no silent pass):
// - If msg is non-null: throw using [error-policy] Required message shape, OR
//   map to form/API error per FORMS + error-policy and shared contract.
// - **MUST NOT** continue the success path as if validation passed.
```

Full rules: [decision-function](../../decision-function/decision-function.md), [error-policy **M10**](../../error-policy/error-model-registry-and-boundary.md).

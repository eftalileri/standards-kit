# Decision functions — code samples (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Purpose: Illustration only. Not SSOT. Normative rules: [`../../decision-function/decision-function.md`](../../decision-function/decision-function.md).

Strict alignment: Throw text must match [error policy Required message shape](../../error-policy/error-policy.md). Anti-copy: patterns, not drop-in templates.

Echo (normative): except `validate*`, non-nullable outcome types (**M10**); critical paths with `null`/`undefined`-risky inner calls → `decision()` (**M8**).

---

## Async + non-nullable (allowed vs forbidden type)

Same logical function twice: allowed uses `Promise<boolean>` + throw; forbidden uses `Promise<boolean | undefined>` (**M10**, **N4**).

```typescript
async function canProceed(): Promise<boolean> {
  if (!token) {
    throw new Error(
      'Cannot continue. Root cause: Token is missing. Solution: Send the user through the login flow.'
    );
  }
  return true;
}

// Forbidden
async function canProceedBroken(): Promise<boolean | undefined> {
  if (!token) return undefined;
  return true;
}
```

---

## False vs throw

```typescript
function canBook(user: User | null, hasPermission: boolean): boolean {
  if (!hasPermission) return false; // valid negative

  if (!user) {
    throw new Error(
      'Cannot decide booking. Root cause: User is missing. Solution: Load user before calling canBook.'
    );
  }

  return true;
}
```

Legitimate no → `false`. Missing/wrong prerequisites → throw (normative table).

---

## Forbidden: null, fallback, async swallow (**M1**, **M2**, **N3**)

```typescript
function decideX() {
  return null; // M1
}

function pickSlot(): AppointmentSlot | null {
  if (!found) return null; // M10, N4 — use non-nullable + throw
  return slot;
}

function decideY(value?: number): number {
  return value ?? 0; // M2
}

function decideZ(value: number | null): number {
  return value || 0; // M2
}

async function implicitUndefined() {
  if (!token) return; // implicit undefined
}

async function catchSwallowFalse() {
  try {
    await something();
  } catch {
    return false;
  }
}

async function catchLogThenReturn() {
  try {
    await something();
  } catch (e) {
    console.error(e);
    return; // N3
  }
}
```

`validate*` only: `return null` = valid; non-null string = invalid (**V1**).

---

## validate* + caller

```typescript
const validateCreateAppointmentData = (data: Data): string | null => {
  if (!data.field) return 'Field is required';
  return null;
};

const error = validateCreateAppointmentData(data);

// Caller **MUST** (V2, M7): throw with error-policy shape OR map to API/form — silent success forbidden.
if (error !== null) {
  throw new Error(
    'Appointment data is invalid. Root cause: ' + error + '. Solution: Check form fields.'
  );
}
```

[error-policy **M10**](../../error-policy/error-model-registry-and-boundary.md), [error-handling **M12**](../../error-handling/error-handling.md).

---

## decision() wrapper (**M8**)

```typescript
function decision<T>(fn: () => T, context?: string, solution?: string): T {
  const result = fn();
  if (result === null || result === undefined) {
    const rootCause = context ? `${context} returned null.` : 'Decision function returned null.';
    const solutionText = solution ?? 'Use throw or return a valid result.';
    throw new Error(
      `No decision result. Root cause: ${rootCause} Solution: ${solutionText}`
    );
  }
  return result;
}

const slot = decision(() => pickSlotMaybeNull(), 'pickSlotMaybeNull', 'Ensure availability is loaded.');

// Forbidden (M8): inner may be null, no wrapper
const bad = pickSlotMaybeNull();
useSlot(bad);
```

Keep error-policy structure in thrown strings (what failed, root cause, solution).

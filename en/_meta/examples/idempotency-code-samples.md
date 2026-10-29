# Idempotency — code samples (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Status: Training / illustration only . Obligations live in [`../../idempotency/idempotency.md`](../../idempotency/idempotency.md) (IDEMP-*, GIDEMP*) .

---

## Illustrative handler wrapper (TypeScript)

```typescript
// Illustration only — adapt to project middleware, DI, and error policy codes.
async function handleIdempotentRequest(
  scope: { tenantId: string; routeId: string },
  idempotencyKey: string,
  operation: () => Promise<{ status: number; body: unknown }>
): Promise<{ status: number; body: unknown }> {
  const existing = await getIdempotencyRecord(scope, idempotencyKey);
  if (existing?.status === 'complete') {
    return { status: existing.httpStatus, body: existing.responseBody };
  }
  const lease = await tryAcquireIdempotencyLease(scope, idempotencyKey);
  if (!lease.acquired) {
    return waitForPeerResult(scope, idempotencyKey);
  }
  try {
    const result = await operation();
    await markIdempotencyComplete(scope, idempotencyKey, result);
    return result;
  } catch (err) {
    await markIdempotencyFailed(scope, idempotencyKey, err);
    throw err;
  } finally {
    await releaseIdempotencyLease(scope, idempotencyKey, lease);
  }
}
```

## Illustrative Zod boundary (request body includes key)

```typescript
import { z } from 'zod';

export const mutationRequestSchema = z.object({
  idempotencyKey: z.string().trim().min(1, 'Idempotency key is required'),
  // ... other fields
});
```

## Client key generation note

Generate `idempotencyKey` in one shared client module per app (crypto / UUID library ) ; do not rely on ad-hoc `Math.random` for payment-class flows (see normative **IDEMP-M12** ) .

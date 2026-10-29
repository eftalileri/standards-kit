# NoSQL query safety — code samples (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Binding SSOT: [`nosql-query-safety/nosql-zod-and-sanitizefilter.md`](../../nosql-query-safety/nosql-zod-and-sanitizefilter.md).

---

## Zod at route boundary (primary)

```typescript
import { z } from 'zod';

const loginSchema = z.object({
  phone: z.string().min(1),
});

const body = loginSchema.parse(req.body);
await User.findOne({ phone: body.phone });
```

---

## Projection (allowlist — do not pass `req.body`)

Forbidden pattern: `Model.find(filter, req.body)` when `req.body` is an object under user control.

Direction: derive projection from Zod (e.g. `z.object({ name: z.literal(1).optional(), ... })` or pick from a fixed server allowlist), then pass only the parse result.

---

## Per-query sanitizeFilter (raw user filter only)

```typescript
// Document why Zod cannot wrap the whole filter; then:
await Model.find(userSuppliedFilter).setOptions({ sanitizeFilter: true });
```

---

## Optional static-analysis guard sketch (example filename only)

Only use this flow if the target project has or chooses to add an equivalent guard. `validate-security-rules.js` is a placeholder name, not an assumed file; verify the current NoSQL standard and the actual guard implementation before relying on it:

1. File contains Mongo query? If no → skip.
2. Direct `req.body` / `req.query` / `req.params` in filter or projection (e.g. find second arg, `select`)? If no → skip.
3. Zod parse on that path? If yes → pass.
4. Per-query `sanitizeFilter`? If yes → pass.
5. Webhook `rawPayload: req.body` pattern per **SEC-M-WH-1**? If yes → pass.
6. Else → WARN or FAIL per **SEC-M-NOSQL-4** documented policy.

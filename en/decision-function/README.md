# Decision functions

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** validation, domain decision, throw, Zod, decision helper


SSOT (two bands, one family): [decision-function.md](decision-function.md) — M1–M12, N1–N5, V1, V2: `validate*`, the `decision()` wrapper, false vs throw, async rules, guard expectations, and how a reader must answer a missing required field — absence or a registered failure at one gate, never an in-range placeholder (M12 / N5). [decision-function-scope-and-contract.md](decision-function-scope-and-contract.md) — C1–C10 and the classification that decides which functions those rows govern: naming prefix, folder path, `@decision` / `@non-decision` JSDoc, body signal, critical initialization.

Related: [Error policy](../error-policy/error-policy.md) (message shape, API). [Error handling](../error-handling/error-handling.md) (client caller rules). [Decision matrix](../decision-matrix/decision-matrix.md).

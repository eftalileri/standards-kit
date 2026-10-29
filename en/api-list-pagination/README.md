# API list pagination (backend)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** pagination, cursor, skip, list endpoint, PaginationResponse


Reading order (routing). Each entry names the file that defines those rule IDs; the obligation is in that file, not in this list. This README routes; it defines no rule rows.

1. [api-list-pagination.md](api-list-pagination.md) — agent execution contract (**GAPI-C1**–**GAPI-C5**), the **GAPI-T1** threshold and the GGAPI1–GGAPI3 decision gates that route cursor vs skip/offset.
2. [list-response-and-cursor-rules.md](list-response-and-cursor-rules.md) — **GAPI-M1**–**GAPI-M11** and **GAPI-N1**–**GAPI-N4**: PaginationResponse contract, default/max limit, stable cursor ordering, invalid-cursor failure, empty result, client alignment, N+1 prevention and row summary fields.
3. [api-list-pagination-appendix.md](api-list-pagination-appendix.md) — non-normative legacy obligation map and determinism note; defines no rule ID and is not part of the reading path.

Related: [Error policy (backend)](../error-policy/README.md). [TanStack Query](../tanstack-query/README.md) (client consumption). [Repository](../repository/README.md) (data access).

Code samples (non-normative): [api-list-pagination-code-samples.md](../_meta/examples/api-list-pagination-code-samples.md)

The adopting project's repository-wide test-artifact prohibition applies to list-pagination work.

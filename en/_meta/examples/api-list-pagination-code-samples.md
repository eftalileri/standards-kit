# API list pagination — code samples (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Status: Illustrative only. Normative rules live in [`../../api-list-pagination/api-list-pagination.md`](../../api-list-pagination/api-list-pagination.md).

---

## PaginationResponse (illustrative TypeScript)

```ts
interface PaginationResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}
```

- items: Records for this page or cursor window.
- total: Per-endpoint semantics (exact, estimate, or `-1`) — see **GAPI-M2** in the SSOT.
- hasMore: Whether another request can return more rows.
- nextCursor: Opaque token for cursor pagination when used (encoding of sort position + tie-breaker is implementation-defined).

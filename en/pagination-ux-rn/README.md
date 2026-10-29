# Pagination and list UX (React Native / Expo)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** infinite scroll, load more, cursor, empty state


Purpose: Normative single source of truth for client list UX (infinite query, load-more, empty and error rows ) on top of [API list pagination](../api-list-pagination/README.md) (server contract ) and [TanStack Query](../tanstack-query/README.md) (`useInfiniteQuery` ).

Normative part file: [`pagination-ux-rn.md`](pagination-ux-rn.md).

---

## Scope (hub)

- Included: End-of-list behavior, pull-to-refresh vs append, skeleton / empty states.
- Excluded: Backend cursor encoding — [api list pagination](../api-list-pagination/README.md).

---

## Reading order (normative)

1. [pagination-ux-rn.md](pagination-ux-rn.md) -- Definitions (**PAG-RN-D\***), **MUST** / **MUST NOT** (**PAG-RN-M\*** / **PAG-RN-N\***), agent contract (**PAG-RN-C\***).

---

## Rule identifier prefix (normative index)

| Prefix | Meaning |
|--------|---------|
| **PAG-RN-C\*** | Agent execution contract |
| **PAG-RN-D\*** | Definitions |
| **PAG-RN-M\*** | **MUST** |
| **PAG-RN-N\*** | **MUST NOT** |

---

## Related

- [TanStack Query](../tanstack-query/README.md) -- useInfiniteQuery , fetchNextPage.
- [Performance](../performance/README.md) -- list virtualization.

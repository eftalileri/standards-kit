# Pagination and list UX (React Native / Expo) -- normative

```kit-cover
type: normative
part-of: README.md
binds: client list UX obligations - append versus replace paging, load-more thresholds, empty and error rows
open-when: shape:frontend-heavy, signal:infinite-list, signal:paged-fetch, signal:empty-state
skip-when: signal:backend-only, signal:no-list-surface
owns: PAG-RN-C*, PAG-RN-D*, PAG-RN-M*, PAG-RN-N*
```

References: [TanStack Query infinite queries](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries); [Performance](../performance/README.md) (**PERF-RLM**-\* ).

---

## Definitions

| ID | Definition |
|----|------------|
| **PAG-RN-D1** | Append pattern means loading older pages at scroll end via `fetchNextPage` (TanStack ) with documented threshold. |
| **PAG-RN-D2** | Replace pattern means pull-to-refresh or explicit “ Refresh ” that resets the infinite query pages. |

---

## Agent execution contract

| ID | Rule |
|----|------|
| **PAG-RN-C1** | Must align page size and cursor fields with [api list pagination](../api-list-pagination/README.md) — no client-only page sizes that break server assumptions. |

---

## **MUST**

| ID | Rule |
|----|------|
| **PAG-RN-M1** | **MUST** show loading / skeleton or footer spinner for **PAG-RN-D1** while `isFetchingNextPage` (or equivalent ) — no silent stall. |
| **PAG-RN-M2** | **MUST** show an empty state when the first page returns no items and not in error (distinct from error state ). |
| **PAG-RN-M3** | **MUST** surface first-page errors with blocking or region error per [error handling](../error-handling/error-handling.md) M5 / [error display UX](../error-handling/error-display-ux.md). |

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **PAG-RN-N1** | Must not auto `fetchNextPage` in a tight loop without `hasNextPage` guard (battery / API abuse ). |
| **PAG-RN-N2** | Must not duplicate items across pages without fixing query key / merge logic per [TanStack Query](../tanstack-query/README.md). |
| **PAG-RN-N3** | Must not answer a lookup by id or unique key (for example "does a record with this phone number already exist?") from the loaded pages of a paged list, and must not render a full-collection list surface over a paged query without requesting later pages. Loaded pages are a window (server page size, `maxPages`): a lookup reads the server (by-id read, exact-key search, or consumption of every page) and a list surface appends at scroll end (**PAG-RN-D1**). |
| **PAG-RN-N4** | Must not set `maxPages` on an infinite query that pages forward only (no `getPreviousPageParam`). Reason: the cap drops the earliest pages once the user scrolls past it and nothing can fetch them back, so the top of the list silently disappears. Bound memory with list virtualization; a cap is allowed only together with a previous-page parameter the server supports. |

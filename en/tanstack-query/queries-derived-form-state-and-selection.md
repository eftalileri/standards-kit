# TanStack Query — cache-derived form state and selection reconciliation

```kit-cover
type: normative
part-of: README.md
binds: QRY obligations for UI state derived from a query cache it does not own - propagating every subsequent authoritative cache update into a form or parent field instead of only the first successful fetch, and reconciling a selection of list identifiers to the genuinely resolved list under one authority on both the read derivation and the write path
open-when: shape:frontend-heavy, signal:server-state-cache, signal:paged-fetch, signal:derived-field
skip-when: signal:backend-only, signal:no-server-state-change
owns: QRY-M10, QRY-M11, QRY-M18, QRY-M19, QRY-N5, QRY-N6
```

Part of: [queries and transforms](queries-and-transforms.md) — same QRY-\* domain, banded across three part files of this folder: [queries-and-transforms.md](queries-and-transforms.md) (**QRY-M1**–**QRY-M9**, **QRY-M12**, **QRY-N1**–**QRY-N4**, **QRY-N7**), this file (**QRY-M10**, **QRY-M11**, **QRY-M18**, **QRY-M19**, **QRY-N5**, **QRY-N6**) and [duplicate query authorities](queries-authority-duplication.md) (**QRY-M13**–**QRY-M17**, **QRY-N8**–**QRY-N10**). The entry file's Scope, Environment, Compliance and enforcement-guidance paragraphs bind these rows unchanged.

Scope: Only the UI state a query does not own but a screen derives from it — a form or parent field initialized from a `useQuery` field, and a selection holding identifiers of a cached list. Excluded: the hook/data path, transform resilience and the forbidden fetch patterns ([queries-and-transforms.md](queries-and-transforms.md)); duplicate query authorities ([queries-authority-duplication.md](queries-authority-duplication.md)); QueryClient defaults and key factories ([query-client-and-keys.md](query-client-and-keys.md)); mutations ([mutations-cache-sync.md](mutations-cache-sync.md)).

Compliance: as in [queries-and-transforms.md](queries-and-transforms.md) — violations are bugs; **must not** ship; STOP dependent features until fixed ([TanStack Query core](tanstack-query.md) **TSQ-C4**, **TSQ-C11**).

References: [queries-and-transforms.md](queries-and-transforms.md); [queries-authority-duplication.md](queries-authority-duplication.md); [ssot-readiness-rules.md](../ssot-readiness/ssot-readiness-rules.md) (**M8** — multi-source form state, which both moved **MUST** rows pair with); [ui-loading-and-persist-options.md](ui-loading-and-persist-options.md) (**UIP-M17**) and [ui-persist-offline.md](ui-persist-offline.md) (**UIP-N3**) — the render-path lookup miss **QRY-M11** forbids throwing on; [mutations-invalidation-and-bridge.md](mutations-invalidation-and-bridge.md) (**MUT-M10** — the fabricated optimistic row that becomes a vanishing selectable identifier); [ssot-principles-and-precedence.md](../ssot/ssot-principles-and-precedence.md) (**SSG-M8** — the one-authority requirement behind the single reconciliation site).

---

## **MUST**

| ID | Rule |
|----|------|
| **QRY-M10** | Cache-to-form field sync: When form or parent state field F is derived from or initialized from a `useQuery` field Q, the UI **must** reflect every subsequent authoritative cache update to Q — not only the first successful fetch. First-load-only guards (`isFirst*LoadRef`, one-shot `useEffect` that skips post-mutation cache patches) **must not** block propagation when Q has `staleTime > 0`. Prefer render-time derivation from query `data` or explicit subscription to field changes without one-shot refs. Pairs with [ssot-readiness **M8**](../ssot-readiness/ssot-readiness-rules.md) when F is part of multi-source form state. |
| **QRY-M11** | Selection ⊆ list invariant: When a screen's selection state holds identifiers of a derived list it does not own (a `useQuery` cache list), the selection **must** be reconciled to the identifiers that actually exist in that list whenever the list changes. The reconciliation **must** live in one authority — the layer that owns the list — and **must** be applied on both the read derivation (the exposed value is always the narrowed one) and the write path (a selection write is narrowed before it is stored), so a stale identifier can neither be displayed nor accumulate in state. Reconcile only when the list is genuinely resolved (`isSuccess`): while the query is disabled, pending, or errored an empty list **must not** erase a valid selection (not-ready ≠ invalid). This is not a display fallback — it makes an invalid selection unable to exist, and it closes deletion, another-device change, and fabricated-optimistic-row drift in one place. Consumers **must not** `throw` on a lookup miss in a render path ([ui-persist-offline **UIP-M17**](ui-loading-and-persist-options.md)/[**UIP-N3**](ui-persist-offline.md)): a `.find` miss is selection staleness, not corruption of loaded data. Pairs with [ssot-readiness **M8**](../ssot-readiness/ssot-readiness-rules.md) and [mutations **MUT-M10**](mutations-invalidation-and-bridge.md) (a fabricated optimistic row is a selectable identifier that will vanish on refetch). The narrowing operation should be centralized rather than reimplemented by each consumer; the server still validates every submitted id per tenant. Review the naming and data-flow context: a shape-only static check (`x.filter(v => y.has(v))`) matches unrelated set-difference and search filtering, so any predicate would have to anchor to the selection/available-set naming pair. |
| **QRY-M18** | Readiness over N same-shape queries is ONE folded verdict. When a screen reads the same resource once per entity (one query per member/row, e.g. `useQueries` over an entity-id list) and a decision needs every answer, the aggregate readiness **must** be derived once, in the hook that owns the queries, by applying the single per-query readiness authority ([ssot-readiness **M16**](../ssot-readiness/ssot-readiness-rules.md)) to each query and folding the verdicts: all-or-nothing (every source ready, otherwise not ready), the error reason wins over pending so the visible retry surface can open ([**M17**/**N11**](../ssot-readiness/readiness-writes-outcome-and-seed.md)), and while not ready the hook exposes no rows — a source that has not answered is never a row that says "none". Each query **must** disable the global previous-data placeholder ([**CLI-M12**](query-client-and-keys.md)) and the verdict **must** exclude placeholder data: an entity switch otherwise lends the previous entity's answer to the new one. An empty source list is vacuously ready only while the scope/precondition gate is open. A read whose answer cannot change the decision in the current mode is not performed (the caller passes an empty list): an unread source that no decision needs never blocks the user. The hook returns the folded verdict with a user-action `refetch`; consumers branch on the closed reason member by member and never re-derive it from raw flags. |
| **QRY-M19** | Per-entity reads of a set share one request. When a resource is read by id once per entity of a rendered set (list rows, group members, one `useQuery` per row or `useQueries` over ids), the single query definition's `queryFn` **must** go through one transport that coalesces the ids requested within one short window into one keyed batch request (the server's set form of the same read, same scope and flags, bounded chunks), while cache keys and invalidation stay per entity. A lone id **must** keep the single-entity request, and an id the batch answer omits **must** take its registered answer from the single-entity request — the client **must not** fabricate the not-found error. Reason: one request per row grows round trips with the set, which repeated-route detection (backend-http-efficiency **BHE-M16**) reports as an N+1. Review-held: the per-row request is visible only across the row component and the query definition; use the adopting project's runtime detection where it exists and record its scope and limits. |

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **QRY-N5** | First-load-only sync from `useQuery` data into form / parent state when the query has `staleTime > 0` — forbidden (**QRY-M10**); stale cache after mutation **must** propagate to dependent UI. |
| **QRY-N6** | Keeping a selection of list identifiers unreconciled with the list that owns them, reconciling it in more than one place, reconciling it while the list query is not resolved (disabled/pending/errored → erasing a valid selection), or throwing from a render path on a lookup miss instead of reconciling — forbidden (**QRY-M11**). |

---

## Implementation checklist

- [ ] **QRY-M10** / **QRY-N5** cache-to-form propagation (no first-load-only guards)
- [ ] **QRY-M11** / **QRY-N6** selection narrowed on both the read derivation and the write path, only while the list query is genuinely resolved, in one authority
- [ ] **QRY-M18** one folded readiness verdict over N same-shape queries (all-or-nothing, error first, no rows while not ready, placeholder excluded)
- [ ] **QRY-M19** per-entity reads of a rendered set coalesce into one batch request through the query definition's transport (per-entity keys kept, omitted id answered by the single read)

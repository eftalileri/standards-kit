# TanStack Query (kit hub)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** cache, mutation, invalidation, stale, refetch, optimistic, server state

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) — P1–P8 when this topic is in scope (P8 verification when implementation-bound); cite in deliverables per [markdown-authoring **M16**](../authoring/markdown-authoring.md).

Related: [Architecture core](../_meta/architecture-core.md) (non-normative: QRY- / TSQ- boundary index and client reading order).

This folder holds the English source of truth for client server state with TanStack Query.

This file is not normative. It does not define **MUST** / **MUST NOT** rules. All binding rules live only in the linked files below.

## Agent TL;DR

- [**TSQ-G1**](tanstack-query.md) — match the installed TanStack Query version to the APIs used; v5-specific patterns require v5 or a documented equivalent. STATE > BEHAVIOR > UI precedence (**TSQ-C3**). All mutations **MUST** follow MUT-* (not ad-hoc setQueryData). A replay-safe/idempotent mutation has exactly one bounded automatic-retry owner: when an HTTP response exists, only the canonical envelope's `retryable === true` authorizes replay; when no HTTP response exists, only the canonical structural wire-error `kind === 'network'` fact may authorize same-key replay. The owner declares a finite cap/backoff and disables lower transport retry for that request (**MUT-M24**/**N4**). No navigation inside mutation callbacks (**RTG-N2**).
- Key factories are required (CLI-*). Global previous-data placeholders are same-scope only; authorization, tenant, actor, entity-owner, and business-filter transitions locally disable them and gate on current-key readiness (**CLI-M12**/**N3**). Transform resilience follows QRY-*. Persist through the application's approved adapter (UIP-*); React Native deployments may use the MMKV adapter. Sensitive families remain memory-only when device storage lacks approved at-rest protection, with prior blobs invalidated through the buster (**UIP-M22**/**N7**).
- Every server-state mutation implements exactly ONE of three post-write methods (**MUT-M28**). A — server-confirmed, the DEFAULT and what an undeclared mutation is: send, await the server, bridge the confirmed response through the domain orchestrator when sufficient, await invalidation of the rest, only then close the UI intent; blocking the caller behind progress is the caller's choice (**MUT-M13**). B — UI-optimistic: pending row from the mutation's own `variables` behind the `pending` gate / `useMutationState`, nothing written to the cache (**MUT-M29**). C — cache-optimistic `onMutate` write with cancel / snapshot / rollback / bridge, only when the in-flight change must appear instantly on several key families / surfaces or through a persisted mutation queue, and the caller does not block. B and C are declared; money, irreversible, legal and provider / store flows are always A (**MUT-N3**). An optimistic representation withholds server-derived fields (**MUT-M30**). A write whose outcome the cache already carries marks families stale without refetching and never shows a loader (**MUT-M31**). No method changes invalidation or cross-entity duties, and A / B never snapshot or roll back (**MUT-N8**).
- Decision gates: **G1**–**G8** (mutation decision gates in mutations-cache-sync.md; **G1** selects the post-write method; **G8** covers correctness-required post-write paused-query proof, matching selection/intent lifetime, and pending fingerprint-input locks).

---

## Reading order

1. [tanstack-query.md](tanstack-query.md) — Core: agent contract (**TSQ-C**\*), global rules (**TSQ-G**\* / **TSQ-N**\*), technology gate, precedence, binding principle.
2. [query-client-and-keys.md](query-client-and-keys.md) — QueryClient defaults, key factories, modular hook layout (CLI-\*).
3. [queries-and-transforms.md](queries-and-transforms.md) — Queries, data flow, transform resilience (QRY-\*). Its rows are banded across three part files of the same domain:
   - [queries-derived-form-state-and-selection.md](queries-derived-form-state-and-selection.md) — **QRY-M10**, **QRY-M11**, **QRY-M18**, **QRY-M19**, **QRY-N5**, **QRY-N6**: UI state derived from a query cache it does not own — every authoritative cache update reaches the form field, a selection of list identifiers stays narrowed to the resolved list on both read and write paths, N same-shape queries fold into one readiness verdict and share one batch request.
   - [queries-authority-duplication.md](queries-authority-duplication.md) — **QRY-M13**, **QRY-M14**, **QRY-N8**: a consumer **must not** open a second authority for what the query path already owns (second direct call site, consumer-side re-sort).
4. [mutations-cache-sync.md](mutations-cache-sync.md) — Entry point of the single SSOT for all mutation-side behavior (MUT-\*): Decision gates (**G1**–**G8**) index, **MUT-N1**–**MUT-N8** (incl. **MUT-N3** binding flows) and the mutation failure path. **G6** / **MUT-M20**–**MUT-M22**: cross-entity cache sync + registry-linked bridges (**SSG-R4**); **G8** / **MUT-M27**: correctness-required post-write paused-query proof, selection-matched intent lifetime, and pending fingerprint-input locks. Its **MUT-M** rows are banded across three part files of the same domain:
   - [mutations-invalidation-and-bridge.md](mutations-invalidation-and-bridge.md) — **MUT-M1**–**MUT-M22**: optimistic shape, bridge, invalidation scope, dedup, orchestration, cross-entity + key-family coverage.
   - [mutations-provider-and-post-write-sync.md](mutations-provider-and-post-write-sync.md) — **MUT-M23**–**MUT-M27**: derived read models, single-owner bounded retry, irreversible provider results, activation fencing, required post-write sync.
   - [mutations-optimistic-strategy.md](mutations-optimistic-strategy.md) — **MUT-M28**–**MUT-M31**: the three post-write methods (server-confirmed default, UI-optimistic, cache-optimistic), what each adds, why server-derived fields stay absent until the response, and why a write whose outcome the cache already holds neither refetches nor shows a loader.
5. [ui-persist-offline.md](ui-persist-offline.md) — Entry point for loading/error UI, prefetch, pull-to-refresh, persist and offline-first alignment (UIP-\*): **UIP-N1**–**UIP-N7** and the failure path. Its **UIP-M** rows are banded across two part files of the same domain:
   - [ui-loading-and-persist-options.md](ui-loading-and-persist-options.md) — **UIP-M1**–**UIP-M17**, including **UIP-M16** vs feature UI MD and the **UIP-M17** render-readiness note.
   - [ui-startup-and-persistence-boundaries.md](ui-startup-and-persistence-boundaries.md) — **UIP-M18**–**UIP-M23**: cold-start gate, idempotent refresh, guarded native calls, canonical list persistence, sensitive-family boundary, last confirmed answer through a failed refetch.
6. [tanstack-query-appendix.md](tanstack-query-appendix.md) — implementation checklists and verification notes (no rule of its own).

Not in this topic: Zod file layout, ESLint housekeeping and null/validation tutorials live in [forms](../forms/forms.md), [error policy](../error-policy/error-policy.md), [decision functions](../decision-function/decision-function.md) and **TSQ-G2**; screen–hook module baselines in [code modularity](../code-modularity/code-modularity.md) (COD-\*).

---

## Code samples (non-normative)

Illustrations and long snippets: [`../_meta/examples/tanstack-query-code-samples.md`](../_meta/examples/tanstack-query-code-samples.md). Decision gates gloss: [`../_meta/examples/tanstack-query-decision-gates-explainer.md`](../_meta/examples/tanstack-query-decision-gates-explainer.md).

---

## Related standards

- [Mobile UI patterns](../mobile-ui-patterns/README.md) — **MUP-C5**, **MUP-M5** with **UIP-M16** and feature UI specifications at the location designated by the adopting project
- [SSOT readiness and form data](../ssot-readiness/ssot-readiness-and-form-data.md)
- [SSOT governance](../ssot/README.md) — **KAT-6** local minimum (**SSG-K6**-\*); MUT-\* is normative for mutations
- [Forms](../forms/forms.md)
- [Error handling](../error-handling/error-handling.md)
- [Decision matrix](../decision-matrix/decision-matrix.md)
- [MMKV (RN persist backing)](../mmkv/README.md)
- [Auth (client integration)](../auth/README.md) — login/logout/refresh mutations

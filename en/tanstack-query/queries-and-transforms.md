# TanStack Query — queries and transforms

```kit-cover
type: normative
part-of: README.md
binds: QRY obligations - useQuery and useInfiniteQuery usage, the hook data path from UI to API, transform resilience and the forbidden fetch patterns
open-when: shape:frontend-heavy, signal:server-state-cache, signal:paged-fetch, signal:derived-field
skip-when: signal:backend-only, signal:no-server-state-change
owns: QRY-M1, QRY-M2, QRY-M3, QRY-M4, QRY-M5, QRY-M6, QRY-M7, QRY-M8, QRY-M9, QRY-M12, QRY-N1, QRY-N2, QRY-N3, QRY-N4, QRY-N7, QRY-N11
```

Scope: Only `useQuery` / `useInfiniteQuery` usage, data flow from UI to API via hooks, transform of server data for UI, and forbidden fetch patterns. Excluded: QueryClient defaults ([query-client-and-keys.md](query-client-and-keys.md)); mutations ([mutations-cache-sync.md](mutations-cache-sync.md)); error copy ([error handling](../error-handling/error-handling.md)).

Rule prefix: **QRY-M**\* / **QRY-N**\* — banded across three part files of the same domain: this file, [cache-derived form state and selection](queries-derived-form-state-and-selection.md) (**QRY-M10**, **QRY-M11**, **QRY-M18**, **QRY-M19**, **QRY-N5**, **QRY-N6**), and [duplicate query authorities](queries-authority-duplication.md) (**QRY-M13**, **QRY-M14**, **QRY-N8**).

Environment: Applies to React / React Native runtimes, network-dependent fetches, and hook modules.

Compliance: Violations of QRY- rules in this file are bugs; **must not** ship; STOP dependent features until fixed, per [TanStack Query core](tanstack-query.md) **TSQ-C4** and **TSQ-C11**.

Enforcement guidance: An adopting project may enforce source-local query patterns. Keep checks for distinct obligations independently scoped so suppressing one finding does not silence another; document actual paths, exclusions, and blind spots with the project's tooling configuration.

---

## **MUST**

| ID | Rule |
|----|------|
| **QRY-M1** | Screens and UI components **must** load server data only through `useQuery` / `useInfiniteQuery`. A wrapper hook may only delegate to those hooks (pass `queryKey`, `queryFn`, options) — no embedded HTTP, business rules, or transform inside the wrapper beyond option wiring. HTTP **must** live in service/API modules used as `queryFn` — not inline `fetch` / `axios` / `apiClient` in presentation components. |
| **QRY-M2** | Ordinary server-backed lists (including infinite queries) **must** isolate per-item transform failures so one bad row does not discard the entire list. Report the failure through the configured diagnostics boundary with a stable row identifier, skip that row, and rely on refetch/invalidation to repair the data. Skip only when omission cannot change a displayed aggregate/count, selection, action eligibility, reconciliation result, or financial/accounting completeness. If rows and such a result describe one authoritative population, they are an integrity unit and **QRY-M8** applies; do not skip a supplied row. |
| **QRY-M3** | Stale time on each hook **must** follow [query-client-and-keys **CLI-M6**–**CLI-M7**](query-client-and-keys.md) — not one-off undocumented values. |
| **QRY-M4** | Screen vs hook split (mandatory): Presentation screens **must** be UI-only (layout, styling, presentational components). Data fetching, TanStack hooks, Zustand, handlers, and transforms **must** live in a paired module (for example a screen hooks file or a `useScreenName` hook) rather than being inlined in a screen when non-trivial. Responsibility boundaries: paired files **must** comply with [code-modularity **COD-M3**](../code-modularity/code-modularity.md). |
| **QRY-M5** | Data access **must** flow from UI to a query/hook module, then to the API or service layer. Presentational components **must not** import services directly and bypass the query hook. |
| **QRY-M6** | Exported hooks in the adopting project's query modules **must** include TSDoc describing parameters, return shape, and cache side effects. |
| **QRY-M7** | `queryFn` failures (HTTP errors or rejection) **must** drive UI from TanStack `isError` / `error` per [ui-persist-offline **UIP-M1**](ui-loading-and-persist-options.md), and map user-facing/telemetry behavior per [error handling](../error-handling/error-handling.md). Do not silently ignore `isError` or use an empty `catch` around `queryFn`. |
| **QRY-M8** | Whole-response transforms and integrity units **must not** return a fake or partial success when the response is unusable. An integrity unit exists when supplied rows and an aggregate/count, selection/action set, reconciliation result, or financial/accounting completeness describe the same authoritative population. If any required or supplied row in that unit cannot be validated or transformed, enter a contained error state and suppress the unit's rows, aggregate/count, selection, and actions until retry: a query transform throws/rejects; a later view-model transform may return an explicit error only when the consuming boundary blocks that whole unit. Report the failure through the configured logging/observability boundary, including query identity and error. A valid cursor/page subset may be rendered beside a server-authoritative full-scope total, provided no row supplied for the current subset was skipped. Per-item skip remains **QRY-M2** only for rows outside an integrity unit. |
| **QRY-M9** | Manual `refetch()` (or equivalent imperative refetch) **must** be used only for user-triggered refresh ([ui-persist **UIP-M5**](ui-loading-and-persist-options.md)), post-mutation cache repair ([mutations MUT-\*](mutations-cache-sync.md)), prefetch ([**UIP-M4** / **UIP-M14**](ui-loading-and-persist-options.md)), or documented `refetchQueries` after orchestration ([**MUT-M16**](mutations-invalidation-and-bridge.md)) — not as the default for screen focus or navigation; those rely on [**CLI-M1**](query-client-and-keys.md) `staleTime` / `refetchOnMount` and **QRY-N4**. |
| **QRY-M12** | `enabled` is a query-only gate — imperative fetch bypasses it. Any access precondition (actor class allowed to reach this resource class, tenant scope resolved, feature entitled) that is expressed in a hook's `enabled` option **must** be re-expressed at every imperative / mandatory-fetch call site — `prefetchQuery`, `ensureQueryData`, `fetchQuery`, and equivalents — because those APIs run the `queryFn` unconditionally and never consult `enabled`. Two obligations: (a) the precondition **must** be evaluated before the imperative call; (b) when the call sits inside an effect, a long-lived listener, a timer, or a background task, the precondition and the identifiers derived from it **must** be read from the authority at call time (e.g. store `getState()` or an equivalent fresh read), not from the surrounding closure — an effect closure captures the values of the render that scheduled it, and an earlier effect in the same commit may already have invalidated them, so the imperative call fires with an identifier the application has just stopped considering valid. The gate itself **must** come from the single derivation that the enforcing boundary uses ([SSOT **SSG-M15**](../ssot/ssot-must-access-and-schema.md)) — a second local predicate is a parallel authority (**SSG-M8**). Because the pattern (bypassing fetch API + closure-captured authority + missing fresh read) is decidable from a single file's AST, enforce it mechanically where the adopting project documents an enforcement mechanism, and record that mechanism's actual scope and limits. |

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **QRY-N1** | `useState` + `useEffect` + direct API as the primary pattern for server list/detail data — forbidden; use **QRY-M1**. |
| **QRY-N2** | Zustand (or equivalent) as the authoritative store for server-fetched entity lists that **must** live in TanStack Query cache per [decision matrix](../decision-matrix/decision-matrix.md). |
| **QRY-N3** | Mock or hardcoded production server data inside query hooks — forbidden (bug, **must not** ship); use real queryFn and test fakes only in tests per project policy. |
| **QRY-N4** | `useFocusEffect` / `useEffect` whose primary purpose is `refetch()` on every navigation or focus — forbidden; use `staleTime` + `refetchOnMount` and user pull-to-refresh ([ui-persist-offline **UIP-M5**](ui-loading-and-persist-options.md)). Scope limit. What this row bans is an effect whose purpose is `refetch()`. It does not ban measuring a query input on screen entry — reading, for example, the device position that the key embeds. Measuring an input is allowed and is sometimes the only correct behaviour: an unchanged input leaves the key unchanged and `staleTime` still governs, so the outcome this row exists to prevent — a request on every entry — stays prevented. |

| **QRY-N7** | Calling `prefetchQuery` / `ensureQueryData` / `fetchQuery` with an access precondition that exists only in some hook's `enabled`, or with an authority value captured from an effect closure instead of read fresh at call time — forbidden (**QRY-M12**); the imperative API never consults `enabled` and the closure value can already be invalid in the same commit. |
| **QRY-N11** | Opening a query to build an argument the callee reads in no branch — forbidden. Before fetching a datum in order to pass it to a shared decision helper, read that helper's body. If no branch consumes the parameter, the fetch is dead computation ([**DCD-M1**](../dead-code/dead-code.md)): a round trip per mount whose answer cannot change the verdict, and — the larger damage — a permission model every later reader misreads, because the code says the verdict depends on the fetched datum and it does not. Remove the query and pass the neutral literal; do not narrow the callee's signature, which may be held deliberately for a datum still alive at another consumer ([**IV-M11**](../implementation-verification/change-acceptance-bar.md)). Record two facts at the call site — the branches measured (callee location) and where the datum's real consumer is — or the next reader restores a dependency that never existed. Limit: an unread argument does not by itself make its source dead; the query stays when another consumer in the same module reads it. |

A local mutation cannot invalidate another device's cache of a reader list whose membership can be revoked there. Put required mount-time verification in `refetchOnMount`, not a focus effect. Until a scope's first post-mount fetch succeeds, hide its older cached rows (loading or error); keep that scope stale so a key switch fetches, and never re-hide verified rows on a later error (**UIP-M1**). A mounted reader needs an event channel for instant revocation. This consent relationship is not decidable from one file; review owns it and reader coverage.

**QRY-N4** enforcement limit: A source-level check may detect a direct refresh effect, but guarded or delegated effects require control-flow and callee review. The per-query `staleTime`/refetch policy and review hold the class.

Stated enforcement limit for **QRY-N11**: Determining whether the callee consumes a parameter in any branch requires inspecting its body, including through re-export barrels, and determining whether the query has another live consumer requires following the value through the module. A single-file predicate cannot prove either fact and would flag the correct remaining query-fed sites; cross-file analysis may help when the project's tooling can resolve those edges, but dynamic flow and wider call graphs remain review obligations.

---

## Implementation checklist

- [ ] **QRY-M1** hook-only data entry from UI
- [ ] **QRY-M2** / **QRY-M8** ordinary-list skip vs whole-response or integrity-unit failure; no supplied financial row is omitted beside a successful aggregate/action surface
- [ ] **QRY-M4** screen / hook files split
- [ ] **QRY-M7** query error wiring to UIP + error handling
- [ ] **QRY-M9** / **QRY-N4** refetch triggers
- [ ] **QRY-M12** / **QRY-N7** imperative `prefetch`/`ensure`/`fetch` re-express the `enabled` precondition and read the authority fresh at call time (never from an effect closure)

Verification guidance: Static review covers imports (no raw fetch in screens), exported hooks, and explicit ordinary-list versus integrity-unit classification at the transform authority. Runtime verification confirms `isError` or contained blocking-error branches suppress every dependent aggregate/selection/action, and logs contain id / query identity where **QRY-M** requires. Follow the consuming project's verification policy.

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|---------------------|
| `queryFn` throws / HTTP error | **QRY-M7** + **UIP-M1** — user-visible or telemetry per [error handling](../error-handling/error-handling.md). |
| Single bad row in an ordinary list transform | **QRY-M2** — warn, skip row only when no aggregate/selection/action/reconciliation or financial completeness can diverge. |
| Single bad row in an integrity unit | **QRY-M8** — contained blocking error; suppress rows, aggregate/count, selection, and actions; no successful partial list. |
| Entire transform / response unusable | **QRY-M8** — error state, no silent empty data or fake success. |

---

Part of: [README.md](README.md) — TanStack Query SSOT. Sibling bands: [cache-derived form state and selection](queries-derived-form-state-and-selection.md) (**QRY-M10**, **QRY-M11**, **QRY-M18**, **QRY-M19**, **QRY-N5**, **QRY-N6**) and [duplicate query authorities](queries-authority-duplication.md) (**QRY-M13**, **QRY-M14**, **QRY-N8**).

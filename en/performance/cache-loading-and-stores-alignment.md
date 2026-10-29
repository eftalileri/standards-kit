# Performance — cache, loading, and store alignment (local minimums)

```kit-cover
type: normative
part-of: README.md
binds: PERF-CLA obligations - the locally enforceable performance minimums where TanStack Query, Zustand and MMKV meet the render path
open-when: shape:frontend-heavy, signal:render-performance, signal:cache-lifecycle, signal:client-state-store
skip-when: signal:backend-only, signal:no-render-path-change
owns: PERF-CLA-M*, PERF-CLA-N*
```

Scope: Performance minimums where TanStack Query, Zustand, and optional persistence meet the render path (loading UX, cache requests, subscriptions). Detailed behavior remains in the cited authorities.

Rule prefix: **PERF-CLA-M\*** / **PERF-CLA-N\***.

Exceptions: [performance.md](performance.md) **PERF-EX-1** only.

Compliance: Treat violations as defects and resolve them before release, following [performance.md](performance.md) **PERF-C4** and **PERF-C11**.

References: [TanStack ui-persist-offline](../tanstack-query/ui-persist-offline.md); [TanStack mutations-cache-sync](../tanstack-query/mutations-cache-sync.md); [TanStack query-client-and-keys](../tanstack-query/query-client-and-keys.md); [Zustand selectors-and-hooks](../zustand/selectors-and-hooks.md); [MMKV](../mmkv/README.md); [SSOT readiness](../ssot-readiness/ssot-readiness-and-form-data.md).

---

## **MUST**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PERF-CLA-M1** | Screens with `useQuery` or `useInfiniteQuery` that render server data must implement the loading order in [**UIP-M2**](../tanstack-query/ui-loading-and-persist-options.md) and must not violate [**UIP-M10**](../tanstack-query/ui-loading-and-persist-options.md). | UX/performance bug — must not ship. | Review the screen's restore, cold-load, and background-fetch states against **UIP-M2**. |
| **PERF-CLA-M2** | Post-mutation cache updates must satisfy [**MUT-M5**](../tanstack-query/mutations-invalidation-and-bridge.md), [**MUT-M6**](../tanstack-query/mutations-invalidation-and-bridge.md), and must not violate [**MUT-N1**](../tanstack-query/mutations-cache-sync.md). | Bug — must not ship. | Pass: Same as **PERF-CLA-N1** and [**PERF-N2**](./performance.md) (empty `invalidateQueries()` forbidden ). |
| **PERF-CLA-M3** | Zustand subscriptions must meet [**ZSS-M1**](../zustand/selectors-and-hooks.md) and [**ZSS-M2**](../zustand/selectors-and-hooks.md). | Bug. | Review store selectors in components against **ZSS-M1** / **ZSS-M2**. |
| **PERF-CLA-M4** | When a React Native application adopts offline-first TanStack persistence, configure `networkMode` and a synchronous persistence adapter to satisfy [**CLI-M1**](../tanstack-query/query-client-and-keys.md), [**UIP-M12**](../tanstack-query/ui-loading-and-persist-options.md), and [**MMK-G3**](../mmkv/mmkv.md) where MMKV is selected. | Contract bug — STOP. | Review QueryClient defaults, persistence wiring, and the application's offline/cold-start requirements. |
| **PERF-CLA-M5** | Post-mutation `refetchQueries` / `invalidateQueries` must use explicit keys or predicates (**MUT-M5** / **MUT-M16**). | Bug. | Review that every refetch/invalidation identifies the affected query family. |
| **PERF-CLA-M6** | Prefetch must follow [**UIP-M4**](../tanstack-query/ui-loading-and-persist-options.md) / [**UIP-M14**](../tanstack-query/ui-loading-and-persist-options.md) where required. Avoid `staleTime: 0` for prefetch-only work unless an explicit decision explains why. | Performance bug. | Review prefetch staleness against the consuming query's freshness policy. |
| **PERF-CLA-M7** | Query-backed lists must align with [**UIP-M1**](../tanstack-query/ui-loading-and-persist-options.md) and [SSOT readiness M9](../ssot-readiness/ssot-readiness-rules.md) where applicable. | UX bug. | Review that error states preserve usable cache and offer recovery where required. |

---

## **MUST NOT**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PERF-CLA-N1** | `invalidateQueries()` with no filter is forbidden (**MUT-N1**). | Bug — must not ship. | Inspect invalidation calls using the project's configured static checks or code review. |
| **PERF-CLA-N2** | `useXxxStore()` with no selector argument is forbidden (**ZSS-N1**). | Bug. | Review store-hook calls against **ZSS-N1**. |
| **PERF-CLA-N3** | `invalidateQueries` for keys where [**MUT-M6**](../tanstack-query/mutations-invalidation-and-bridge.md) answer is not definite yes — forbidden. | Bug. | Pass: Enforced by [**MUT-M6**](../tanstack-query/mutations-invalidation-and-bridge.md) / gate G2 in TanStack SSOT ; this row does not add a separate grep (avoid duplicate normative tests ). |

---

## Failure-path matrix (aid)

| Situation | Binding IDs |
|-----------|-------------|
| Spinner while cache could show | **PERF-CLA-M1**, **UIP-M2**, **UIP-M10** |
| Many parallel refetches after one save | **PERF-CLA-N1**, **PERF-CLA-N3**, **MUT-M6** |
| Whole app re-renders on small Zustand change | **PERF-CLA-N2**, **ZSS-M1** |

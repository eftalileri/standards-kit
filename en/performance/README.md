# Performance (React / React Native)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** memoization, FlatList, cache alignment, bundle, lazy


Purpose: Performance guidance for React and React Native list, navigation, and cache behavior, aligned with the adopting application's TanStack Query, Zustand, and persistence authorities.

Use this folder as the current performance guidance; older project migration notes are historical only.

Non-normative samples: [`../_meta/examples/performance-code-samples.md`](../_meta/examples/performance-code-samples.md).

Application-specific performance budgets and exceptions are defined in [performance.md](performance.md). Record the affected surface, rationale, measured impact, and required approval using the adopting project's architecture process.

---

## Reading order (normative)

1. [performance.md](performance.md) — Scope, agent contract (**PERF-C\***), technology gate, decision gates (GPERF1–GPERF8), rule prefix index, global **MUST** / **MUST NOT** (**PERF-G\***, **PERF-N\***).
2. [react-lists-and-memoization.md](react-lists-and-memoization.md) — FlatList / FlashList, memoization, grid callbacks (**PERF-RLM**-\*).
3. [cache-loading-and-stores-alignment.md](cache-loading-and-stores-alignment.md) — Local minimums vs TanStack, Zustand, MMKV (**PERF-CLA**-\*).
4. [bundle-navigation-images-memory.md](bundle-navigation-images-memory.md) — Bundle, lazy screens, images, network hygiene, memory, monitoring (**PERF-BIM**-\*).

Precedence: Same as [TanStack Query core](../tanstack-query/tanstack-query.md) **TSQ-C3** — STATE > BEHAVIOR > UI; TanStack Query > Zustand > Form > Routing > Performance (this topic does not override TanStack / Zustand rules; it adds UI and routing performance obligations).

---

## Cross-links

- [Backend HTTP efficiency](../backend-http-efficiency/README.md) - Node/Express handler deduplication and outbound cache (BHE-\*); not a substitute for PERF-\* client rules.
- [Decision matrix](../decision-matrix/decision-matrix.md)
- [Mobile UI patterns](../mobile-ui-patterns/README.md) (**PERF-RLM-M11**, **MUP-M4**)
- [TanStack Query](../tanstack-query/README.md)
- [Zustand](../zustand/README.md)
- [MMKV](../mmkv/README.md)
- [Code modularity](../code-modularity/code-modularity.md)
- [Imports](../imports/README.md)

# Performance — React lists and memoization

```kit-cover
type: normative
part-of: README.md
binds: PERF-RLM obligations - FlatList and FlashList discipline, React.memo, useMemo, useCallback and grid or calendar cell callbacks
open-when: shape:frontend-heavy, signal:render-performance, signal:list-virtualization, signal:infinite-list
skip-when: signal:backend-only, signal:no-list-surface
owns: PERF-RLM-M*, PERF-RLM-N*
```

Scope: Only FlatList / FlashList discipline, `React.memo`, `useMemo`, `useCallback`, and grid / calendar cell callbacks. Excluded: TanStack query keys, Zustand store shape, navigator lazy ([bundle-navigation-images-memory.md](bundle-navigation-images-memory.md)).

Rule prefix: **PERF-RLM-M\*** / **PERF-RLM-N\***.

Compliance: Treat violations as defects and resolve them before release, following [performance.md](performance.md) **PERF-C4** and **PERF-C11**.

Numeric thresholds and **PERF-EX-1** : [performance.md](performance.md) § Deterministic thresholds and § Standard exceptions.

References: [performance.md](performance.md) GPERF1–GPERF5; [TanStack UI persist](../tanstack-query/ui-persist-offline.md); [Mobile UI patterns](../mobile-ui-patterns/mobile-ui-patterns-rules.md) **MUP-M4** (elevation lists ).

Code samples: [`../_meta/examples/performance-code-samples.md`](../_meta/examples/performance-code-samples.md) (non-normative).

---

## **MUST**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PERF-RLM-M1** | Configure virtualized-list rendering props such as `initialNumToRender`, `maxToRenderPerBatch`, and `windowSize` according to the app's documented performance profile and the list's interaction needs. Choose clipping behavior based on platform and layout; document a **PERF-EX-1** exception when the selected configuration conflicts with required visual or accessibility behavior. A shared configuration source may provide defaults, with local overrides only when justified. | Bug — must not ship without intentional list-rendering and clipping choices. | Pass: review the list against the app's profile and platform-specific layout; use configured static checks for shared defaults and documented overrides. |
| **PERF-RLM-M2** | `renderItem` must be a stable reference (`useCallback` or module-scope function ) — not recreated each parent render. | Bug. | Pass: use the project's configured AST or lint checks where available; otherwise review callback identity at the list and parent definitions. |
| **PERF-RLM-M3** | `keyExtractor` must be a stable reference (`useCallback` or module-scope ). | Bug. | Pass: use configured static checks where available; otherwise review the extractor definition and dependencies. |
| **PERF-RLM-M4** | The component that renders one list row must be wrapped with `React.memo` when the parent is `FlatList` or `FlashList` (export line must contain `memo(` wrapping that row component ). | Bug when list parent exists. | Pass: For each `renderItem` target component file : `rg` `'memo\('` file exits 0. |
| **PERF-RLM-M5** | When item height is fixed or computable without per-item `onLayout`, `getItemLayout` must be provided. | Bug when height contract is fixed and `getItemLayout` omitted (catch via PR checklist : file must contain `getItemLayout=` or `**PERF-EX-1**:` comment ). | Pass: `rg` `'getItemLayout='` file exits 0 OR `rg` `'**PERF-EX-1**:'` file exits 0 for fixed-height lists (same file as `FlatList` ). |
| **PERF-RLM-M6** | `ListFooterComponent` and `ListHeaderComponent` must not use inline arrow factories that allocate new component each render — use `useMemo` / `useCallback` / top-level component reference. The prop is compared by REFERENCE : an unstable identity REMOUNTS the footer and destroys any state it holds (filter / expanded row / draft ). | Bug. | Prefer AST enforcement (**PERF-RLM-M12** note ) ; grep fallback : `rg` `'ListFooterComponent=\{\('` `.` exits 1 AND `rg` `'ListHeaderComponent=\{\('` `.` exits 1. |
| **PERF-RLM-M7** | When the app's documented list-size, profiling, or frame-rate criteria in GPERF3 are met, use the virtualized-list implementation selected and supported by the app. The right implementation depends on platform, compatibility, and measured behavior; record the choice and profiling evidence. | Bug — must not ship a known list-performance regression. | Pass: measure representative data sizes and devices against GPERF3; confirm the chosen implementation meets the profile and attach evidence in the project's review record. |
| **PERF-RLM-M8** | Grid and calendar cells should not receive fresh callbacks on every render when they cause unnecessary child renders; use `useCallback` or a stable handler with id arguments when profiling or memoization requires stable identity. | Bug when callback churn causes measurable waste. | Pass: use configured static checks where reliable, then confirm callback identity and render behavior through review or profiling. |
| **PERF-RLM-M9** | Do not wrap a child in `React.memo` until GPERF1 passes for callbacks passed into that child. | Wasted complexity. | Pass: review callback stability with the project's configured analysis or at the callback definition site before adding memoization. |
| **PERF-RLM-M10** | When GPERF4 is YES ([performance.md](performance.md) **PERF-T-DERIVE-N**, **PERF-T-JSON**, or **PERF-T-REGEX** ), the work must run inside `useMemo` (or outside render ) with a dependency array listing every non-stable input read. | Bug. | Pass: apply the criteria in the app's performance profile and verify that qualifying derivation, parsing, or regular-expression work runs outside render or uses `useMemo` with complete dependencies. Use a static check only when it accounts for the configured criteria and relevant input forms. |
| **PERF-RLM-M12** | A list row/card component must not open its own subscription to a shared setting or preference authority (currency, time zone, locale, display format). Read the value once in the list owner and pass it down as a prop. Per-row subscriptions multiply work and can render inconsistent values while rows mount at different times. | Bug — must not ship. | Review that row/card components receive shared settings from their list owner; scope project checks to row/card modules. |
| **PERF-RLM-M11** | When row shadows or elevation must remain visible on a platform where clipping occurs, configure the selected list component clipping and layout props using the app shared list-performance authority, if one exists. Apply shared defaults before local overrides and document justified exceptions. | Bug — must not ship clipped visual content without a reviewed configuration or exception. | Pass: review shared defaults and rendered results on affected platforms; use project checks only when they verify the actual shared configuration. |

---

## **MUST NOT**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PERF-RLM-N1** | Inline `renderItem` function in JSX — forbidden (see **PERF-RLM-M2** ). | Bug — must not ship. | Pass: `rg` `'renderItem=\{\('` `.` exits 1. |
| **PERF-RLM-N2** | Inline `keyExtractor` arrow in JSX — forbidden. | Bug. | Pass: `rg` `'keyExtractor=\{\('` `.` exits 1. |
| **PERF-RLM-N3** | Inline functions or elements for list header/footer component props are forbidden when they create a new component identity on each render (**PERF-RLM-M6**). | Bug. | Static analysis or review at the JSX attribute and component definition. |
| **PERF-RLM-N6** | A RUNTIME `typeof x === 'function'` (or `isValidElement` ) check presented as the guard for **PERF-RLM-M6** / N3 — forbidden as a substitute. An inline anonymous arrow IS a `function` and passes such a check, so it never throws and still remounts every render. The defect is not the TYPE but the STABILITY OF THE IDENTITY, which is visible only at the DEFINITION SITE — runtime cannot tell two `function` values apart. Such a check may stay as a type assertion but must not be cited as the stability guard. | False sense of safety — the class ships unmeasured. | Static check at the JSX attribute (**PERF-RLM-N3** ) ; a runtime branch does not satisfy this row. |
| **PERF-RLM-N4** | Ship a list implementation that fails the app's documented GPERF3 criteria — forbidden. | Bug. | Pass: same as **PERF-RLM-M7**. |
| **PERF-RLM-N5** | Fresh inline grid or calendar callbacks that cause unnecessary child renders — forbidden (see **PERF-RLM-M8**). | Bug when callback churn causes measurable waste. | Pass: configured static checks where reliable, or review and profiling of callback identity and render behavior. |

---

## Checklist (non-normative aid)

- **PERF-T-PROP-BAND**; **PERF-RLM-N1** / N2 static checks or review; **PERF-RLM-M11** when clipping affects shadows or elevation; the app-selected virtualized-list implementation when GPERF3 applies; **PERF-RLM-M10** when GPERF4 applies.

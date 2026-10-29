# Performance — core (global SSOT)

```kit-cover
type: normative
part-of: README.md
binds: PERF-C / PERF-G / PERF-N global obligations, the deterministic PERF-T thresholds, the PERF-EX-1 exception and the GPERF gates
open-when: shape:frontend-heavy, signal:render-performance, signal:list-virtualization, signal:anti-pattern-check, signal:optimization-change
skip-when: none
owns: PERF-T-ITEM, PERF-T-PROF-MS, PERF-T-FPS, PERF-T-DERIVE-N, PERF-T-JSON, PERF-T-REGEX, PERF-T-PROP-BAND, PERF-EX-1, PERF-C1, PERF-C2, PERF-C3, PERF-C4, PERF-C5, PERF-C6, PERF-C7, PERF-C8, PERF-C9, PERF-C10, PERF-C11, PERF-C12, PERF-G1, PERF-G2, PERF-G3, PERF-G4, PERF-N1, PERF-N2, PERF-N3, GPERF1, GPERF2, GPERF3, GPERF4, GPERF5, GPERF6, GPERF7, GPERF8
```

Scope

- Included: Performance guidance for React and React Native client code: version compatibility, agent contract, decision routing (GPERF*), global **MUST** / **MUST NOT**, and pointers to part files (PERF-RLM-, PERF-CLA-, PERF-BIM-). List virtualization, memoization, TanStack/Zustand alignment, bundle/navigation, images, and memory detail live in those parts.
- Excluded: TanStack mutation algebra (MUT-* only in TanStack SSOT); Zustand persist shape (ZSP-*); MMKV instance rules (MMI-*); HTTP client timeout numeric (**UIP-M15**); security of tokens (security SSOT).
- Scope exception: **PERF-G4** and **PERF-N3**, and the measurement-discipline paragraph they cite, apply to every JavaScript layer (client and server) with no backend copy; the rest of this file stays client-scoped.

Document type: Normative — core for the performance topic.

Environment: Applies to client applications using React or React Native and their device/runtime performance budgets.

Binding principle: Shipping list screens, navigators, or mutation cache paths that break **PERF-RLM**-, **PERF-CLA**-, or **PERF-BIM**- rows is a performance class bug — must not ship; remedy code or amend these documents.

References: README.md and the relevant performance topic parts.

Code samples: _meta/examples/performance-code-samples.md (non-normative).

---

## Performance budgets and thresholds

Purpose: Replace vague terms such as “heavy” or “high” with comparable measurements. The adopting application documents thresholds for its target devices, build configuration, and workload; these are inputs to the gates below, not universal constants.

PERF-T-ITEM: Define the bounded item count at which list virtualization is required. For infinite lists, use the documented maximum loaded window, not the unbounded total.

PERF-T-PROF-MS: Define a representative render-duration budget and sampling method for supported device classes.

PERF-T-FPS: Define a scrolling frame-rate budget and representative mounted-list workload for supported devices.

PERF-T-DERIVE-N: Define when array sorting/filtering/mapping in render is costly enough to memoize or precompute, using workload and device measurements.

PERF-T-JSON: Define when parsing serialized data in render is costly enough to memoize or precompute, based on input size and device profile.

PERF-T-REGEX: Define when regular-expression work in render is costly enough to memoize or precompute, based on input size and measurement.

PERF-T-PROP-BAND: Document supported list-rendering prop ranges for the application's list sizes and device profile; see PERF-RLM-M1.

Measurement discipline: A performance gate that depends on profiling data cannot treat missing measurements as evidence that the budget passed or failed. Obtain the required measurement or use the conservative choice defined by the adopting application's performance profile. Purely numeric item-count checks may be evaluated from the bounded data definition.

Measurement recipe (**PERF-G4**): a measurement **MUST** run on a release build, not a development build; **MUST** report the first cold call separately from steady-state calls; **MUST** use realistic inputs including malformed and oversize ones; and **MUST** record time and memory as separate figures. A single warm, well-formed, small-input run proves nothing about the cost users and attackers actually trigger.

---

## Standard exceptions (**PERF-EX-1**)

Purpose: Ensure exceptions have a specific scope, measured impact, and accountable approval rather than relying on informal or unverifiable claims.

**PERF-EX-1** is satisfied only if all below are true before merge:

1. A decision record exists in the location selected by the adopting project's architecture and references the specific PERF- rule and affected surface.
2. Measured impact is recorded, such as bundle-size change, render duration, frame rate, or item-count ceiling, with before/after data where applicable.
3. Approval is recorded from the role or owner designated by the adopting project's governance.

If **PERF-EX-1** is not satisfied, the exception is void — STOP (noncompliant merge). "Comment in code" alone is not a valid exception.

---

## Rule identifiers (normative)

| Prefix | Where defined | Meaning |
|--------|----------------|---------|
| **PERF-C*** | This file only | Agent execution contract. |
| **PERF-G*** | This file only | Global **MUST**. |
| **PERF-N*** | This file only | Global **MUST NOT**. |
| **PERF-RLM**-* | react-lists-and-memoization.md | Lists, memoization, grid callbacks — only there. |
| **PERF-CLA**-* | cache-loading-and-stores-alignment.md | TanStack / Zustand / MMKV alignment minimums — only there. |
| **PERF-BIM**-* | bundle-navigation-images-memory.md | Bundle, navigation, images, memory, monitoring — only there. |

Citations must use full IDs (e.g. **PERF-RLM-M2**).

Rule locality: One behavior class per part file. Hub README.md has no M/N tables.

---

## Agent execution contract

PERF-C1: This topic (core + parts) applies to React / React Native UI work in scope.

PERF-C2: [Shared agent contract C2](../_meta/agent-contract.md).

PERF-C3: Precedence: STATE > BEHAVIOR > UI; TanStack Query > Zustand > Form > Routing > Performance — same as TanStack **TSQ-C3**; this topic does not weaken TanStack / Zustand / MMKV rules.

PERF-C4: [Shared agent contract C4](../_meta/agent-contract.md).

PERF-C5: [Shared agent contract C5](../_meta/agent-contract.md) — the affected standards include performance, TanStack Query, Zustand, MMKV and navigation.

PERF-C6: [Shared agent contract C2](../_meta/agent-contract.md); apply **PERF-G** / **PERF-N** and part-file rows exactly (no off-standard workarounds).

PERF-C7: Library compatibility: use APIs supported by the application's selected React version; use the list-virtualization library selected by the architecture where **PERF-RLM-M7** requires virtualization.

PERF-C8: [Shared agent contract C3](../_meta/agent-contract.md).

PERF-C9: [Shared agent contract C4/C5](../_meta/agent-contract.md) governs completion.

PERF-C10: If the installed React version does not support an API assumed by an in-scope rule, stop and select a compatible API or document an equivalent implementation (**PERF-G1**).

PERF-C11: [Shared agent contract C4](../_meta/agent-contract.md).

PERF-C12: [Shared agent contract C12](../_meta/agent-contract.md) — the local minimums are in [cache-loading-and-stores-alignment.md](cache-loading-and-stores-alignment.md).

---

## Technology

| Topic | Rule |
|-------|------|
| React APIs | Use APIs supported by the installed React version (**PERF-G1**). |
| Server cache UI | If used, follow the installed TanStack Query version and its compatible guidance. |
| Client store | If used, follow the installed Zustand version and its compatible guidance. |
| Native persistence | Use the platform-approved adapter; MMKV guidance applies where the React Native app adopts it. |

---

## **MUST** (global)

PERF-G1: The installed React version must support the APIs assumed by an in-scope rule. If not, stop and select a compatible API or document an equivalent implementation and its verification. [Consequence: STOP (**PERF-C10**)] [Verify: Check the installed dependency and the APIs used by the affected code]

PERF-G2: Changes touching in-scope UI must not add new violations of **PERF-RLM-N1** or **PERF-CLA-N1**. Fix them or record an approved exception before merge. [Consequence: Merge blocked / bug] [Verify: Use the adopting project's configured checks or compare findings against the merge base]

PERF-G3: A release that changes a performance-sensitive list or navigation surface must include a reviewable performance measurement or an entry in the adopting project's release review record, according to its release process. [Consequence: Process bug — release review incomplete] [Verify: Confirm that the required measurement or release record exists for the changed surface]

PERF-G4: A change motivated by speed or memory **MUST** carry a before/after measurement taken per the measurement recipe above, and speed **MUST NOT** buy away type safety, validation, single authority or observability. An unmeasured optimization is a guess, and a faster path that drops a check, a type or a log trades a visible cost for a hidden defect. [Consequence: Unproven or quality-eroding optimization — must not merge] [Verify: review-held — the PR attaches both measurements and the diff removes no type, validation, authority or observability call; no mechanical check decides motivation]

---

## **MUST NOT** (global)

PERF-N1: Do not add always-on render instrumentation or an application-wide alternative to React's memoization APIs without a measured need and an architecture decision. A list-virtualization library selected by the architecture for **PERF-RLM-M7** does not count as such an alternative. [Consequence: Architecture bug — must not ship] [Verify: Review dependency changes and the documented performance need]

PERF-N2: Merge code that calls invalidateQueries() with no arguments (**MUT-N1**) — forbidden. [Consequence: Bug — must not ship] [Verify: rg invalidateQueries\s*\(\s*\) repository must return exit code 1]

PERF-N3: Re-copy an accumulator on every loop step (`{...acc}` or `[...acc, x]` inside reduce or an equivalent loop) or spread an unbounded array into function arguments (`Math.max(...arr)`) — forbidden. Per-step copying is quadratic and argument spreading overflows the call stack on large input; mutate a local accumulator, or use a loop or `reduce` with a single initial value. [Consequence: Quadratic cost or stack overflow on large input — must not ship] [Verify: review-held until a single-file AST lint is admitted under [**ENA-A1**](../enforcement-architecture/enforcement-admission.md); grep for `\.\.\.acc` and `Math\.(max|min)\(\.\.\.` as a candidate list only]

---

## Decision gates (normative index)

Purpose: Route work consistently using explicit, reproducible criteria. YES columns are logical OR / AND as stated; avoid subjective adjectives.

GPERF1: Proceed only if YES -> Stable callback boundary: list row or memoized cell receives renderItem / keyExtractor / cell handlers that are not new function references each parent render (see **PERF-RLM-N1**, **PERF-RLM-N5** grep). [Binding: **PERF-RLM-M2**, **PERF-RLM-M3**, **PERF-RLM-M8**, **PERF-RLM-N1**] [If NO: Implement useCallback or id-parameterized handler; STOP until grep passes]

GPERF2: Proceed only if YES -> The list remains within the adopting application's documented item-count and measured render/scroll budgets. [Binding: **PERF-RLM-M1**–**PERF-RLM-M6**] [If NO or measurements are required but unavailable: apply GPERF3 or obtain the missing profile]

GPERF3: Proceed only if YES -> One or more thresholds in the application's performance profile require virtualization. [Binding: **PERF-RLM-M7**] [If YES: use the list virtualization library selected by the architecture; if NO: use the simpler supported list component with M1–M6]

GPERF4: Proceed only if YES -> The work exceeds the adopting application's documented derivation, parse, or regex budget. [Binding: **PERF-RLM-M10**] [If YES: memoize or precompute; if NO: avoid unnecessary memoization]

GPERF5: Proceed only if YES -> React.memo on row: GPERF1 already passes for that row component AND row is a pure function of props (no module-level mutable reads). [Binding: **PERF-RLM-M4**] [If NO: Satisfy GPERF1 first; then apply memo]

GPERF6: Proceed only if YES -> File contains useQuery / useQueries / useInfiniteQuery and renders server data. [Binding: **PERF-CLA-M1**, **PERF-CLA-M2**, **UIP-M2**, **CLI-M1**] [If NO: If no TanStack hooks in file, gate N/A; else must meet UIP / CLA rows]

GPERF7: Proceed only if YES -> File calls useXxxStore / useStore with a Zustand store. [Binding: **PERF-CLA-M3**, **ZSS-M1**, **ZSS-M2**] [If NO: Apply selectors / useShallow per ZSS-*; STOP on forbidden patterns]

GPERF8: Proceed only if YES -> New screen component added to navigator graph. [Binding: **PERF-BIM-M2**] [If NO: Use React.lazy / lazy: or **PERF-EX-1**]

---

## Failure-path and environment notes

Failure / invalid state -> Loading and cache errors — **PERF-CLA-M1** (UIP union); mutation cache — **PERF-CLA-M2**, **PERF-N2**.

Environment -> Client FPS, memory, bundle size — **PERF-BIM**-*; offline — **PERF-CLA-M4**, **CLI-M1**.

N/A -> Pure server services with no React tree — this topic Scope excludes them explicitly.

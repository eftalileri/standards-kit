# Mobile UI patterns — React Native (global SSOT)

```kit-cover
type: normative
part-of: README.md
binds: MUP-C agent-contract obligations and the MUP-G decision gates for cross-cutting React Native screen composition
open-when: shape:frontend-heavy, signal:rn-screen-ui, signal:screen-composition, signal:empty-state
skip-when: signal:backend-only, signal:no-screen-layout-change
owns: MUP-C1, MUP-C2, MUP-C3, MUP-C4, MUP-C5, MUP-C6, MUP-C7, MUP-C8, MUP-C9, MUP-C10, MUP-C11, MUP-G1, MUP-G2, MUP-G3, MUP-G4, MUP-G5
```

Scope

- Included: Binding discipline for cross-cutting React Native screen composition: contextual help (when shipped), primary action surfaces (multi-tile grids and documented equivalents), module-scoped shell styles, elevation `FlatList` SSOT (Android clipping), accessibility minimums for primary tappables, server-backed screen failure surfaces (loading, empty, blocking error), coordination with the authoritative domain-UI specification the adopting project documents, decision gates (**MUP-G**\*).
- Excluded: Theme token definitions — [styling.md](../styling/styling.md); list memo / `renderItem` stability (except **PERF-RLM-M11** citation) — [react-lists-and-memoization.md](../performance/react-lists-and-memoization.md); TanStack cache algebra — [TanStack Query](../tanstack-query/README.md) parts; semantic `error` mapping text — [error-handling.md](../error-handling/error-handling.md); navigator param types — [routing.md](../routing/routing.md).

Document type: Normative — core file for this topic. The **MUP-M**\* / **MUP-N**\* rows and the normative failure-path table live in [mobile-ui-patterns-rules.md](mobile-ui-patterns-rules.md); the traceability anchors and the PR checklist live in [mobile-ui-patterns-appendix.md](mobile-ui-patterns-appendix.md).

Environment: Applies to shipped React Native client screens in the adopting app or package, using that project's documented screen-module location.

Binding principle: Violations of **MUP-M** / **MUP-N** without documented exception ([markdown authoring](../authoring/markdown-authoring.md) Decisions / facts + [gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md) when required) are bugs — **must not** ship; remedy code or amend this document first (**MUP-C4**, **MUP-C10**).

References: [README.md](README.md); [decision matrix](../decision-matrix/decision-matrix.md); the project's documented domain-UI specifications.

---

## Rule identifiers (normative)

| Prefix | Meaning |
|--------|---------|
| **MUP-C**\* | Agent execution contract. |
| **MUP-M**\* | **MUST**. |
| **MUP-N**\* | **MUST NOT**. |
| **MUP-G**\* | Decision gates — binary routing; cite **MUP-M** / **MUP-N** only. |

Citations **must** use full IDs (e.g. **MUP-M3**, **MUP-G2**).

**MUP-M**\* and **MUP-N**\* are defined in [mobile-ui-patterns-rules.md](mobile-ui-patterns-rules.md) — that part file is their single definition site.

Rule granularity: Each **MUP-M** / **MUP-N** row **must** encode one primary obligation (or one primary prohibition) so Verify and review can target it without bundling unrelated surfaces. When **MUP-G5** is YES, **MUP-M6a**, **MUP-M6b**, and **MUP-M6c** apply together — shipping without any one of the three is still a breach (same consequence as before the split).

---

## Agent execution contract

General obligations: [shared agent contract](../_meta/agent-contract.md). Local identities below retain their citation handles.

| ID | Rule |
|----|------|
| **MUP-C1** | This topic is mandatory for new or changed React Native screens that touch any of: contextual help panels, multi-tile primary action surfaces, shared module shell style modules (named in the feature spec), elevated / shadowed `FlatList` rows on Android, or server-backed list / report bodies (TanStack query primary content). |
| **MUP-C2** | Apply [shared **C2**](../_meta/agent-contract.md). |
| **MUP-C3** | Precedence: STATE > BEHAVIOR > UI; TanStack Query > Zustand > Form > Routing > Performance — [**TSQ-C3**](../tanstack-query/tanstack-query.md); this topic does not override STY-*, PERF-*, FORMS M/N, UIP-*, error-handling M/N. |
| **MUP-C4** | Apply [shared **C4**](../_meta/agent-contract.md). |
| **MUP-C5** | If an authoritative feature UI spec exists at the project's documented domain-UI specification location, the agent **must** read it in the same planning pass as this hub (**MUP-M5**). |
| **MUP-C6** | Testability: Every **MUP-M** / **MUP-N** row below has a Verify column; where Verify names a static check, it must pass; where Verify names PR / review, that review is mandatory before merge for touched files — no unscoped "looks fine" as sole proof. |
| **MUP-C7** | Apply [shared **C12**](../_meta/agent-contract.md): the critical behaviours in **MUP-M1**–**MUP-M6c**, **MUP-M7** and **MUP-N1**–**MUP-N5** stay in this topic's rows; linked standards add detail but do not replace them. |
| **MUP-C8** | Apply [shared **C5**](../_meta/agent-contract.md). |
| **MUP-C9** | Apply [shared **C2**](../_meta/agent-contract.md): **MUP-M** / **MUP-N** and **MUP-G** are applied exactly — no alternate structure built from your own design judgment ("UX judgment") in their place. |
| **MUP-C10** | Apply [shared **C4**](../_meta/agent-contract.md). |
| **MUP-C11** | Follow the adopting project's change-class verification policy. The absence of an accessibility lint rule or guard does not waive **MUP-M2** / **MUP-N2** — review holds them. |

*(The **MUP-M** / **MUP-N** rows and their Verify columns referenced by **MUP-C6** and **MUP-C7** are in [mobile-ui-patterns-rules.md](mobile-ui-patterns-rules.md).)*

Testability: Primary: Verify column predicates; secondary: the project's required checks per **MUP-C11**. Do not imply a check covers paths or files it does not inspect; when automated coverage is unavailable, inspect the rendered screen with platform accessibility tools and verify loading, empty, error, and recovery states by hand.

---

## Technology

| Topic | Rule |
|-------|------|
| UI toolkit | React Native primitives + [styling.md](../styling/styling.md) StyleSheet / theme. |
| Server-driven body | TanStack Query per [decision matrix](../decision-matrix/decision-matrix.md); loading / error union per [ui-persist-offline.md](../tanstack-query/ui-persist-offline.md) UIP-\* and [error-handling.md](../error-handling/error-handling.md). |
| Accessibility | Platform a11y APIs; [forms.md](../forms/forms.md) **M7** + **MUP-M2** / **MUP-M7**. |

---

## Decision gates (normative index)

Purpose: Deterministic routing. Proceed only when the YES column holds; if NO, follow the If NO column.

| Gate | Proceed only if YES | Binding rule IDs | If NO |
|------|------------------------------|------------------|-----------|
| **MUP-G1** | The screen is a hub that offers three or more distinct task entry points (not only list row navigation) in the same viewport (product / feature spec). | **MUP-M2** | No mandatory multi-tile grid from this hub; **MUP-M2** still applies to any tiles actually shipped. |
| **MUP-G2** | The change adds or changes a contextual help surface (title + body). | **MUP-M1** | **MUP-M1** N/A for help only; if help is added later without a review update, still violates **MUP-M1** when shipped. |
| **MUP-G3** | The feature ships two or more screens that share the same card / field-shell visual pattern (feature spec or ≥ 2 imports of the same shell module). | **MUP-M3** | Per-screen StyleSheet only; **must** still obey [**STY-M4**](../styling/stylesheet-and-theme-tokens.md) / [**STY-M5**](../styling/stylesheet-and-theme-tokens.md). |
| **MUP-G4** | A `FlatList` in the change renders rows with theme shadow / elevation (shadow tokens, `elevation`, or equivalent from theme) on the row container. | **MUP-M4**, **PERF-RLM-M11** | Use the project's default FlatList performance props or inline **PERF-RLM-M1** literals only; no **MUP-M4** obligation. |
| **MUP-G5** | Primary screen body is driven by `useQuery` or `useInfiniteQuery` (lists, detail data) OR by `useMutation` result as the sole main read output (e.g. report preview after run) with no parallel list query for that body. | **MUP-M6a**, **MUP-M6b**, **MUP-M6c**, **MUP-N4**, **MUP-N5** | **MUP-M6a** / **MUP-M6c** still required if any blocking fetch / mutation gates first paint; **MUP-M6b** N/A only if documented in the feature document or the review's Decisions / facts. |

---

## Enforcement

The adopting project's verification policy decides the applicable checks by the complete change set. Row-level Verify obligations and the test-artifact prohibition remain binding. Merge is blocked and noncompliant UI must not ship when **MUP-C4**, **MUP-C10**, or a **MUP-M** / **MUP-N** rule is breached without a documented exception; stop when **MUP-C8** identifies documentation lag.

---

Part of: [README.md](README.md) — mobile UI patterns hub.

# Styling (React Native)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** StyleSheet, theme, color, typography, spacing

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) — P1–P8 when this topic is in scope (P8 verification when implementation-bound); cite in deliverables per [markdown-authoring **M16**](../authoring/markdown-authoring.md).

Purpose: Normative React Native UI styling — StyleSheet.create, theme tokens, forbidden libraries, inline exceptions, and split rules for style files. Each adopting project records its theme authority, supported styling approach, and any scoped exceptions.

Non-normative samples: [`../_meta/examples/styling-code-samples.md`](../_meta/examples/styling-code-samples.md).

Normative core: [`styling.md`](styling.md) — **STY-C**\*, GSTY\* gates and **STY-EX-1** exceptions. **STY-M**\* / **STY-N**\* rows and their Verify recipes: [`stylesheet-and-theme-tokens.md`](stylesheet-and-theme-tokens.md).

Token authority: the adopting project documents one canonical theme module that exports the color, typography, spacing, border-radius and shadow tokens; it is the single canonical source (**STY-M3**, **STY-N4**).

---

## Reading order (normative)

1. [styling.md](styling.md) — Scope, agent contract, technology gate, decision gates, enforcement, **STY-EX-1**.
2. [stylesheet-and-theme-tokens.md](stylesheet-and-theme-tokens.md) — **STY-M**\* / **STY-LAYOUT-OK** / **STY-N**\* and their Verify recipes.
3. [theming-and-appearance.md](theming-and-appearance.md) — light/dark/system mode, **STY-THM**-\* (token selection).
4. [ui-primitives.md](ui-primitives.md) — Canonical visual primitive list, **STY-CMP**-\* normative rules.

---

## Cross-links

- [Code modularity](../code-modularity/code-modularity.md) (**COD-M3** — single responsibility alongside **STY-M5** StyleSheet block limit).
- [Performance](../performance/README.md) (PERF-\* — list and memoization rules still bind).
- [Mobile UI patterns](../mobile-ui-patterns/README.md) (MUP-\* — module shells, help, action grids, **PERF-RLM-M11** lists).
- [Decision matrix](../decision-matrix/decision-matrix.md)

Precedence: Same stack order as [TanStack Query core](../tanstack-query/tanstack-query.md) **TSQ-C3** — STATE > BEHAVIOR > UI; this topic does not override server state, client store, or performance SSOTs.

# Mobile UI patterns (React Native)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** screen composition, help panel, action grid, module shell, FlatList elevation, accessibility

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) — P1–P8 when this topic is in scope (P8 verification when implementation-bound); cite in deliverables per [markdown-authoring **M16**](../authoring/markdown-authoring.md).

Purpose: Normative cross-screen patterns for React Native product UI that are not fully specified by [styling](../styling/styling.md) tokens alone: contextual help, primary action tiles, module-scoped visual shells, coordination with [forms](../forms/forms.md) **M7** for non-form tappables, and mandatory reading of the authoritative feature UI specification from the domain-document location the adopting project declares, when one exists.

Normative core: [mobile-ui-patterns.md](mobile-ui-patterns.md) — **MUP-C***, **MUP-G*** decision gates, enforcement, rule granularity note (**MUP-M6a**–c). [mobile-ui-patterns-rules.md](mobile-ui-patterns-rules.md) — **MUP-M***, **MUP-N*** (each **MUST** / **MUST NOT** with Consequence and Verify) and the failure-path matrix. [mobile-ui-patterns-appendix.md](mobile-ui-patterns-appendix.md) — traceability table and the PR checklist (no rule of its own).

Non-normative: Feature-specific locks live in domain documents; this hub defines minimum client patterns and precedence only.

---

## Reading order (normative)

1. [mobile-ui-patterns.md](mobile-ui-patterns.md) — scope, agent contract, decision gates, precedence, cross-links.
2. [mobile-ui-patterns-rules.md](mobile-ui-patterns-rules.md) — **MUST** / **MUST NOT** and failure states.
3. [mobile-ui-patterns-appendix.md](mobile-ui-patterns-appendix.md) — traceability anchors and the PR checklist (no rule of its own).

---

## Cross-links

- [Styling](../styling/stylesheet-and-theme-tokens.md) (**STY-M3**, **STY-M4**, shadow tokens)
- [Styling — UI primitives](../styling/ui-primitives.md) (**STY-CMP**-\*) — canonical shared primitives and normative rules
- [Performance — lists](../performance/react-lists-and-memoization.md) (**PERF-RLM-M11**)
- [Forms](../forms/forms.md) (**M7** accessibility)
- [TanStack Query — UI](../tanstack-query/ui-loading-and-persist-options.md) (**UIP-M2**, **UIP-M16**)
- [Error handling](../error-handling/error-handling.md)
- [Imports](../imports/component-and-module-imports.md)
- [Decision matrix](../decision-matrix/decision-matrix.md)

Precedence: Same as [TanStack Query core](../tanstack-query/tanstack-query.md) **TSQ-C3** — STATE > BEHAVIOR > UI; this topic does not override TanStack, forms, styling, performance, or error-handling SSOTs.

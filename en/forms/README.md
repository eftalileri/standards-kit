# Forms

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** Zod, validation, submit, controlled input, dirty guard

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) — P1–P8 when this topic is in scope (P8 verification when implementation-bound); cite in deliverables per [markdown-authoring **M16**](../authoring/markdown-authoring.md).

SSOT: [forms.md](forms.md) — Zod v4+, client vs Query state, TanStack submit, errors, controlled inputs, dirty guard, SSOT readiness message shape, the raw-`issues` display ban plus the schema-message obligation behind it (**M14** / **N8**), and edit-screen fields sent to stored values as user intent only — never a stored-value seed or a client-derived echo (**M15** / **N9**).

SSOT (interaction UX): [form-interaction-ux.md](form-interaction-ux.md) — submit loading/disable, debounced search, **FORMS-IX**-\*.

## Agent TL;DR

- Zod v4+ for validation. TanStack Query for submit, not Zustand. Controlled inputs with dirty guard per FORMS-*. SSOT readiness message shape for user-facing errors.
- Decision gates: Refer to forms.md decision gates section.

SSOT (input UX): [input-clearable-placeholder.md](input-clearable-placeholder.md) — scope, **ICP-C**\* contract, enforcement, GICP gates, verification, and obligation map; the **ICP-M**\* / **ICP-M-F**\* / **ICP-X**\* / **ICP-N**\* rows (clearable typed fields, empty semantics, placeholders, payload boundary, failure paths, cross-binds to error policy) are in [input-clearable-rules.md](input-clearable-rules.md).

## Enforcement

This topic does not assert that an adopting project has a particular linter or guard. Project-specific checks should document their actual scope and blind spots. User-visible copy, whole-flow reset/dirty-guard coverage, and product decisions require review beyond a single-file static check. Declined checks and their admission conditions stay beside the relevant rows in [forms.md](forms.md).

Related: [Architecture core](../_meta/architecture-core.md) (non-normative: client stack map). [SSOT readiness](../ssot-readiness/ssot-readiness-and-form-data.md), [Error handling](../error-handling/error-handling.md), [Error policy](../error-policy/error-policy.md), [Decision functions](../decision-function/decision-function.md), [Decision matrix](../decision-matrix/decision-matrix.md), [Mobile UI patterns](../mobile-ui-patterns/README.md) (**M7** + **MUP-M2**).

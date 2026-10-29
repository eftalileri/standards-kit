# Mobile UI patterns — traceability anchors and the PR checklist

```kit-cover
type: reference
part-of: README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Scope: A project-facing template for recording where mobile UI standards are implemented and how reviewers can verify them. It defines no additional obligations. Replace the example entries with evidence from the adopting application; do not copy another project's paths, rule names, or gate commands as if they applied locally.

Document type: Reference — carries no rule of its own. Every MUP- ID named here is defined in [mobile-ui-patterns.md](mobile-ui-patterns.md) (**MUP-C**\*, **MUP-G**\*) or [mobile-ui-patterns-rules.md](mobile-ui-patterns-rules.md) (**MUP-M**\*, **MUP-N**\*).

---

## Traceability

Purpose: Answer "where is this enforced?" with the adopting project's anchors. Update rows when a lint rule or guard is added that maps to a MUP ID.

| Rule ID | Implementation location | Automated coverage | Manual review evidence |
|---------|-------------------------|--------------------|------------------------|
| **MUP-C**\* | Identify the screens or components in scope. | Name a real lint, type, or build check if one exists; otherwise state none. | Record the review step and representative user flow. |
| **MUP-M**\* | Link to the shared component, token, or screen pattern that implements the rule. | Link to the exact check and its covered file scope; do not imply unmeasured coverage. | Note platform, screen-reader, and device conditions that need a human check. |
| **MUP-N**\* | Identify the affected UI surface. | Name a check only when it detects the prohibited shape. | State the remaining limitation where runtime or visual judgement is required. |
| **MUP-G**\* | Identify the product or design decision authority. | State whether the gate is automated or review-only. | Record the decision, rationale, scope, and any exit condition in the adopting project's own decision record. |

A blank or unavailable check is not evidence of enforcement. Keep the distinction between automated detection and review visible, and avoid introducing a duplicate rule list that can drift from the normative source.

---

## Implementation checklist (non-normative aid)

- [ ] Identify the affected screen, component, and platform combinations.
- [ ] Read the applicable MUP rules and the linked accessibility, styling, data, or performance standards.
- [ ] Reuse the application's established primitives and state authorities.
- [ ] Record any product decision or exception in the adopting project's own decision record.
- [ ] Verify the user-visible flow, including accessibility behavior, on the platforms in scope.
- [ ] Update the traceability table only with checks and paths that exist in the adopting project.

---

Part of: [README.md](README.md) — mobile UI patterns hub.

# Agent planning procedure — appendix

```kit-cover
type: reference
part-of: README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Scope: The ID-less tail of [agent-planning-procedure.md](agent-planning-procedure.md) — the enforcement surface and its stated limit, and the crosswalk to neighbouring standards. None of it defines a rule row; every obligation it mentions is defined in the procedure or in [agent-planning-obligations.md](agent-planning-obligations.md).

Document type: Reference appendix — defines no rule ID.

References: [README.md](README.md); [agent-planning-procedure.md](agent-planning-procedure.md); [agent-planning-obligations.md](agent-planning-obligations.md); [agent-planning-problem-class.md](agent-planning-problem-class.md).

---

## Enforcement and automation

Code: lint rules and guards are authored and run when they pass the admission test ([**ENA-A1**](../enforcement-architecture/enforcement-admission.md)); the gate commands and their timing are the adopting project's ([**BE-M20**](../build-environment/build-environment-repository-and-scripts.md), [**KIT-LIM-7**](../authoring/kit-stated-limits.md)). Verification methods follow **M12** and the project's written policy; a new or changed rule or guard is proven by the three proofs over real files in [**FP-M20**](../false-positive/check-verification-rules.md), never by a harness, and never by the fabricated evidence forms of **FP-N15**.

Agent: the adopting project's root agent-rule file and this procedure are binding; a bypass is a process failure, not a supported mode.

Human review: review of plans and References catches gaps no check sees.



---

## Relation to other standards

| Standard | Relation |
|----------|----------|
| [README index](../README.md) | **P1**; authoritative list of topics — the generated routing index lives there. |
| [Precedence](../_meta/precedence.md) | Conflict layers between the root agent-rule file, standards, project context, skills, and user instructions. |
| [Decision matrix](../decision-matrix/decision-matrix.md) | **P2** on a layer or technology choice; problem class → system → standard file is binding for mapped rows. |
| [Gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md) | **P7** when docs are silent or conflicting after hierarchy; not a replacement for **P2**–**P5**. |
| [Markdown authoring](../authoring/markdown-authoring.md) | **P6** deliverable shape; **M16** matrix citations. |
| [Agent routing aid](../_meta/agent-routing-aid.md) | **P3** shape table + **P4** lookup commands. |
| [Implementation verification](../implementation-verification/README.md) | **P8**; full IV when [markdown-authoring **M17**](../authoring/markdown-authoring.md) applies. |
| [Agent runner protocol](agent-runner-protocol.md) | **C7** when an AED is named; **AR1**–**AR5** with **P1**–**P8**. |
| [Performance](../performance/README.md) | **M11**; **T5**; does not override matrix stack rows. |

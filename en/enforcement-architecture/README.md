# Enforcement architecture (lint rules, guards, gates)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** enforcement architecture, admission test, cost-benefit, lint rule, guard, gate pipeline, table-driven rule, rule removal, stated limit, gate time budget

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) — **P1**–**P8**; every task that adds, edits, merges or removes a lint rule, guard, CI step or gate is `shape:mechanical-enforcement` and opens every part below.

Purpose: A project-independent standard for when a bug class earns mechanical enforcement, which mechanism it gets, how rules and guards are written so they stay cheap, how gates are shaped and budgeted, and how checks are audited and removed. Its premise: enforcement is a cost, the strongest fix makes the wrong thing impossible, and the default answer to "should this fix become a rule?" is no unless the admission test passes.

Scope boundary: This topic decides whether a check exists and what shape it takes. This topic is the single entry point for mechanism choice (**ENA-P1**, **ENA-G1**), verification (**ENA-R6**) and suppression form (**ENA-G5**); predicate and scope design stay with [false-positive prevention](../false-positive/README.md) (FP-M); the kit's own rule procedure stays with [authoring](../authoring/README.md) (KIT-); gate membership declarations stay with [build and environment](../build-environment/README.md) (**BE-M20**).

## Reading order (normative)

1. [enforcement-admission.md](enforcement-admission.md) — preference order (**ENA-P1**–**ENA-P3**), the four-condition admission test and its measurements (**ENA-A1**–**ENA-A6**), governance and the recorded "not enforced, and why" (**ENA-GV1**–**ENA-GV4**).
2. [enforcement-anti-patterns.md](enforcement-anti-patterns.md) — what not to build, each with its failure mode (**ENA-N1**–**ENA-N18**).
3. [enforcement-authoring.md](enforcement-authoring.md) — writing an admitted lint rule (**ENA-R1**–**ENA-R8**) or guard (**ENA-G1**–**ENA-G6**).
4. [enforcement-gates-and-lifecycle.md](enforcement-gates-and-lifecycle.md) — gate pipeline and verified autofix (**ENA-PL1**–**ENA-PL6**), audit, merge, sunset and removal (**ENA-LC1**–**ENA-LC5**).

## Related

- [False positive prevention](../false-positive/README.md) — predicate design, scope binding, fail-closed runtime (**FP-M4**).
- [Implementation verification](../implementation-verification/README.md) — the only-better ratchet and the stated-limit shape (**IV-M11**, **IV-M13**).
- [Authoring](../authoring/README.md) — the kit's own rule procedure and its fences (KIT-ENF, KIT-ADD).
- [SSOT governance](../ssot/README.md) — the authority a fence protects (**SSG-M8**) and the config-driven single-writer categories.

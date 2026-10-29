# Agent planning (procedure)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** planning procedure, **P1-P8**, **C7**, agent runner protocol, standards kit, deliverable

SSOT: [agent-planning-procedure.md](agent-planning-procedure.md) — binding steps **P1**–**P8** and **SEL-M1** (index only on a kit change → matrix on a layer or technology choice → shape → token lookups → the **P5** file set → plan → gray when blocked → verification when implementation-bound). Topic and meta hub paths come from the generated routing index in [`README.md`](../README.md).

Execution SSOT (when an authoritative plan MD is @ referenced): [agent-runner-protocol.md](agent-runner-protocol.md) — **C7** / **AR1**–**AR5** (evidence-first reads; user questions batched at the end). Use with **P1**–**P8**, not instead of them.

Parts: [agent-planning-obligations.md](agent-planning-obligations.md) (**M1**–**M8**, **M10**–**M15**, **M20**, **N1**–**N8**); [agent-planning-registry-and-divergence.md](agent-planning-registry-and-divergence.md) (**M16**, **M17** — when a registry entry leaves, and plan-versus-rules divergence); [agent-planning-registry-admission.md](agent-planning-registry-admission.md) (**M18** — the five conditions an entry meets before it may enter); [agent-planning-problem-class.md](agent-planning-problem-class.md) (**A1**–**A5**, **T1**–**T5**); [agent-planning-procedure-appendix.md](agent-planning-procedure-appendix.md) (enforcement surface and standards crosswalk — no rule rows).

When to invoke: Point the agent at this file, for example: "Plan the work per `$KIT_ROOT/en/agent-planning/agent-planning-procedure.md` and the applicable standards under `$KIT_ROOT/en/`." When driving execution from a program or phase document, add: "Authoritative execution document: `@<path-to-plan.md>`; follow `agent-runner-protocol.md`."

Related: [Agent runner protocol](agent-runner-protocol.md) (**C7**); [Decision matrix](../decision-matrix/decision-matrix.md) (stack routing); [Gray-situation decisions](../agent-gray-decisions/README.md) (ambiguity after **P7**); [Markdown authoring](../authoring/README.md) (deliverable shape).

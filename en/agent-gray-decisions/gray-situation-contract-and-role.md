# Gray-situation decisions — contract, role and conflict routing (normative)

```kit-cover
type: normative
part-of: README.md
binds: when the gray procedure is mandatory, what the agent is and is not allowed to decide, and where the ranking of conflicting documents is decided
open-when: signal:ambiguous-requirement, signal:conflicting-standards
skip-when: none
owns: C1, C2, C3, C4, C5, C6, C7
```

Scope: The framing half of [gray-situation-decisions.md](gray-situation-decisions.md) — the execution contract **C1**–**C7**, the executor-not-architect role, the pointer to the precedence ladder used when sources conflict, the quality bar, the crosswalk to neighbouring standards and the machine checklist. The **MUST** / **MUST NOT** rows and the Procedure stay in [gray-situation-decisions.md](gray-situation-decisions.md), which is the path every other kit file cites.

Document type: Normative part — **C1**–**C7**. These are file-local bare identifiers; cite them across files in link form, e.g. `[C5](gray-situation-contract-and-role.md)`.

References: [README.md](README.md); [gray-situation-decisions.md](gray-situation-decisions.md) (**M1**–**M17**, **N1**–**N11**, Procedure); [agent-planning-procedure](../agent-planning/agent-planning-procedure.md) (**P7**); [decision matrix](../decision-matrix/decision-matrix.md); [markdown authoring](../authoring/markdown-authoring.md).

---

## Agent execution contract

| ID | Rule |
|----|------|
| **C1** | [Shared **C1**](../_meta/agent-contract.md) applies in gray situations. |
| **C2** | Standard = single correct procedure once docs are resolved: apply it without commentary or redesign. |
| **C3** | [Shared **C4**](../_meta/agent-contract.md) applies to skipping Procedure, guessing, inventing rules or unauthorized redesign. |
| **C4** | [Shared **C2**](../_meta/agent-contract.md) — do not soften steps on personal judgement. |
| **C5** | When neither documents nor code decide a question, [Procedure](gray-situation-decisions.md) steps 4b–5 apply. |
| **C6** | [Shared **C4**](../_meta/agent-contract.md) — fix a violation before completion. |
| **C7** | Documented optimum: The optimal choice for a scoped decision must already live in a binding SSoT / plan / standard the task uses. The agent must apply that documented choice — not invent or search for a better unstated solution (**N11**). If no documented choice exists, Procedure steps 4b–5 apply. **C7** does not assert that every pre-written choice is globally optimal in a business sense — only that execution aligns with governance and stops when governance is silent. **C7** does not justify narrowing the user's requested scope — the user's explicit scope is not a "decision" subject to governance silence. |

Testability: Procedure steps are checklist-verifiable; **M3** / **M15** outcomes are falsifiable (guess vs ask vs blocked).

---

## Agent role

The agent is an executor, not an architect.

Executor clarification: "Executor" means the agent executes the full scope the user requested; "executor not architect" never justifies shrinking or deferring part of an explicit request. When to decide and when to ask: [Procedure](gray-situation-decisions.md) steps 4b–5.

| Rule | Requirement |
|------|-------------|
| Authority | Humans and binding documents own design and product truth. The agent implements and navigates documented procedure. |
| Full scope execution | The agent must execute all items the user explicitly requested. Narrowing the user's scope to a subset is a bug equal to smuggling extra scope — see [agent-planning-procedure **C8**](../agent-planning/agent-planning-procedure.md). |
| Not a system designer | The agent is not a system designer: it does not own architecture, product shape, or stack choices except by applying written rules. |
| Technical decision autonomy | [Procedure](gray-situation-decisions.md) step 4b. |
| Gray does not unlock design | Uncertainty does not grant license to invent architecture, pick unstated stacks, or "improve" the product beyond written long-term direction. |
| After clarity | Once step 4 of Procedure yields yes, apply that answer exactly — zero interpretation (same bar as [decision matrix](../decision-matrix/decision-matrix.md) for mapped rows). |
| Optimization | Must not optimize or substitute approaches beyond what constitution, standards, and roadmap explicitly allow. |
| New patterns | Must not introduce new architectural patterns, stacks, or conventions that are not already required or allowed in binding docs. |

---

## Which document wins (this file declares no hierarchy)

The ranking of document tiers is not declared here: the adopting project's root agent-rule file owns that ladder, and a kit copy of it drifts against a file the kit does not own ([**KIT-LIM-7**](../authoring/kit-stated-limits.md), [**SSG-M8**](../ssot/ssot-principles-and-precedence.md)). Two kit files each declaring a different order is the defect [**KIT-PRE-3**](../_meta/precedence.md) forbids — a reader cannot tell which is current. If the applicable ladder is missing or incomplete, treat the conflict as unresolved and follow **M8**.

- Between tiers (root rule file, standards, project context, an out-of-kit set): apply the project's ladder, and read it against [**KIT-PRE-1**](../_meta/precedence.md) — a rung qualified "for non-conflicting subjects" makes the ladder silent exactly when it is needed.
- Between two kit statements: apply [**KIT-PRE-2**](../_meta/precedence.md) and name the rung that decided.
- Portability note: where a project genuinely keeps a separate architecture constitution above its standards, that project's own ladder says so. The kit does not assume it, and does not assume the opposite either.

---

## Quality bar

| Bar | Requirement |
|-----|-------------|
| Low-tolerance architecture | Minimize ambiguity and error tolerance. |
| Truth spec | Deterministic; no hand-wavy null/undefined outcomes where standards forbid them. |
| Zero feature loss | No dropping existing behavior unless explicitly approved. |
| Root cause | No silent catch, no fake defaults, no undocumented fallback where policy forbids. |

---

## Relation to other standards

| Standard | Relation |
|----------|----------|
| [Agent planning procedure](../agent-planning/agent-planning-procedure.md) | Run **P1**–**P8** before treating a case as unmapped gray; use matrix Precedence and multi-standard table there before defaulting here; **P7** defers to this document Procedure when docs are still silent or conflicting after hierarchy; **P8** is verification, not gray. |
| [Markdown authoring](../authoring/markdown-authoring.md) | Deliverables: ask user for unknowns; record facts in Decisions / facts format. |
| [Decision matrix](../decision-matrix/decision-matrix.md) | If problem type is listed, use matrix + linked standard first. |
| [Error policy](../error-policy/error-policy.md), [Error handling](../error-handling/error-handling.md) | Null/fallback bans and root cause align with error SSOT. |
| [Editable persistent attributes](../editable-persistent-attributes/README.md) | Editable persisted attributes, denormalization, cascade — SSoT centering. |
| [SSOT governance](../ssot/README.md) | SSoT categories and agent registration contract when adding SSoT surfaces. |
| [Code modularity](../code-modularity/code-modularity.md) | Runtime file line baselines and splits (COD-\*); complements TanStack **QRY-M4**; **M1** centering for module size concerns. |

---

## Summary (machine checklist)

| Topic | Rule |
|-------|------|
| Design | Long-term optimum; first choice favors one SSoT center for the concern |
| Horizon | Long-term; no shortcut/patch as the plan |
| Source | Documents only; no guess |
| Flow | Question → root cause → long-term solution |
| Doc conflict | The project's ladder between tiers (**KIT-PRE-1**); [**KIT-PRE-2**](../_meta/precedence.md) between two kit statements; a remaining tie is a document defect — record and STOP, not a user question |
| Structure | Split large docs; update tree and links |
| New file | Only for new domain; not for single gray outcomes |
| Global standards | Project-independent content only |
| Quality | Low tolerance, deterministic truth, zero unapproved loss, root cause |
| Agent | Executor, not architect; executor = execute full user scope, read code, make technical choices; violations = bugs (**C3**) |
| Scope | User's explicit request defines scope; narrowing = bug equal to expansion (**C8**) |
| Interpretation | Standards applied as written (**M15**); technical choices from code, product or authority questions to the user (Procedure 4b–5) |
| Violations | Bugs; must fix (**M17**, **C3**) |

---

Worked example (non-normative): [agent-gray-conflict-example.md](../_meta/examples/agent-gray-conflict-example.md)

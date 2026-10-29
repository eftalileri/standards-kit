# Gray-situation decisions (agent)

```kit-cover
type: normative
part-of: README.md
binds: the MUST / MUST NOT rows and the strict procedure an agent follows when documentation is unclear, missing or conflicting
open-when: signal:ambiguous-requirement, signal:conflicting-standards
skip-when: none
owns: M1, M2, M3, M4, M5, M6, M7, M8, M9, M10, M11, M12, M13, M14, M15, M16, M17, N1, N2, N3, N4, N5, N6, N7, N8, N9, N10, N11
```

Scope: Agent behavior when documentation is unclear, missing, or conflicting — project- and language-independent procedure. Not the stack routing table; that is [decision matrix](../decision-matrix/decision-matrix.md).

Part of this topic: [gray-situation-contract-and-role.md](gray-situation-contract-and-role.md) — the execution contract (**C1**–**C7**), the executor role, the pointer to the precedence ladder, the quality bar, the standards crosswalk and the machine checklist. This file keeps the M / N rows and the Procedure, because every other kit file cites this path.

Environment: N/A for runtime hosts — this standard defines procedure only; logging and hosting-platform rules live in [logging policy](../logging-policy/logging-policy.md) when applicable.

Binding principle: Skipping Procedure, guessing, or using gray to relax other standards is a bug (**M17**, **N10**). Remedy: correct behavior or update binding docs — no informal waiver.

References: [Markdown authoring](../authoring/markdown-authoring.md), [cross-impact analysis](../authoring/cross-impact-analysis.md) (**M14** extension), [backend HTTP efficiency](../backend-http-efficiency/backend-http-efficiency.md) (BHE-\*), [decision matrix](../decision-matrix/decision-matrix.md), [error policy](../error-policy/error-policy.md), [error handling](../error-handling/error-handling.md).

SSoT design rule: When "long-term / permanent / optimum" is required, the first proposal must prefer a single center (one module, service, or document) for that concern; consumers go through that center. Avoid scattered patches before centering.

---

## **MUST**

| ID | Rule |
|----|------|
| **M1** | Optimize for long-term (including late roadmap phases): scalable, inclusive. Reject shortcuts and temporary patches as the chosen solution. |
| **M2** | Decision test: not "does it work today?" — "what is correct architecture long-term?" |
| **M3** | Use only documented rules and facts read from code — no guessing; a gap is handled by Procedure steps 4b–5. |
| **M4** | Forbidden phrasing in decisions and user-facing rationale: "would be better", "usually", "probably", "I think". Allowed: what documents explicitly state. |
| **M5** | Follow Question → root cause → long-term optimum order; do not skip root cause. |
| **M6** | All decisions and doc updates must align with the standards source the adopting project designates (for this kit, `$KIT_ROOT/en/`); a project that keeps its standards elsewhere maps that directory to the same role. |
| **M7** | When documents conflict, apply the adopting project's precedence ladder — its root agent-rule file owns it and [precedence](../_meta/precedence.md) names its owner and the completeness it must have ([**KIT-PRE-1**](../_meta/precedence.md)). This file declares no hierarchy of its own. |
| **M8** | Conflict resolution: (1) Apply **M7**. (2) If both sides are kit statements, apply [**KIT-PRE-2**](../_meta/precedence.md) and name the rung that decided plus the file property it read. (3) If **M7** and **KIT-PRE-2** both leave it open, the conflict is a defect in the documents, not a question for the reader: record it and STOP. Ask the user only for a genuine product decision — two rule texts disagreeing is not one. |
| **M9** | Split oversized documents into child MD files; do not inflate a single hub. |
| **M10** | New standard file: open only for a new domain / scope defined by documentation tree or [markdown authoring](../authoring/markdown-authoring.md). Do not create a new standard file only to record one gray decision — update an existing relevant standard or project doc. |
| **M11** | Content added to global standard files must be project-independent. Project-only facts (concrete paths, product names, one-off endpoints) belong in project docs (roadmap, tech notes), not in shared standards. |
| **M12** | After split or move: update documentation tree / index and fix all cross-references. |
| **M13** | Solutions must satisfy Quality bar (below). |
| **M14** | Run Procedure (below) in order; do not skip steps. |
| **M15** | Standards are applied as written — no inferred obligations or stretched wording; when Procedure step 4 is yes, apply that text exactly. A silent text is handled by Procedure steps 4b–5. |
| **M16** | The agent must not redesign systems or choose undeclared stacks; it runs Procedure (steps 4b–5) or the [decision matrix](../decision-matrix/decision-matrix.md). |
| **M17** | Violations of Agent execution contract, Agent role, **MUST**, **MUST NOT**, or Procedure in this document are bugs and must be corrected before the work is treated as complete — same bar as [decision matrix](../decision-matrix/decision-matrix-governance.md) **C3**–**C4**. |

---

## Procedure (strict order)

| Step | Action |
|------|--------|
| 1 | Detect uncertainty — missing doc, conflicting rules, or multiple valid readings. |
| 2 | Scan SSoT — constitution, roadmap, standards tree, relevant technical docs. |
| 3 | Root cause — missing doc? conflicting rule? out-of-scope scenario? |
| 4 | Is the answer already in docs? Yes → apply it; no commentary. No → step 4b. |
| 4b | Decide technical questions from code. Read the production code of the affected flow; when code and standards together give a compliant path, take the decision and proceed. A technical choice (code pattern, file structure, query shape) is never a reason to stop, ask or narrow scope. An action the project's agent policy reserves for owner approval (for example installing a dependency, changing an external console) is not a technical choice; that policy governs it. No path → step 5. |
| 5 | Ask only a product or authority question. When neither documents nor code decide it, ask the user one product question (what to build, which business rule, which UX flow) or authority question (who may see, change or be charged for what) or output Uncertainty: [reason]; blocked, and hold only the work that depends on the answer. No guessing. Step 5 never narrows the user's requested scope. This step and 4b are the kit's single statement of when to stop and ask on a gap; other kit rules cite them, and the project's own approval list still applies. |
| 6 | Record the outcome only when it is a new reusable rule ([**KIT-ADD-12**](../authoring/kit-rule-addition.md)), in the existing appropriate standard or project document; no new standard file unless **M10** allows. Project-only facts stay out of global standards (**M11**). |

If the problem class matches [decision matrix](../decision-matrix/decision-matrix.md), use that before treating the case as unmapped gray.

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **N1** | Apply "industry best practice" that is not in your binding docs. |
| **N2** | Resolve standard-vs-standard conflict with personal preference — apply **M8**. |
| **N3** | Change code or docs based on "probably / usually / I think". |
| **N4** | Propose short-term fixes that contradict roadmap or constitution. |
| **N5** | Proceed with silent assumptions when uncertain. |
| **N6** | Keep content that must be split in one file (bloat). |
| **N7** | Finish moves/splits without updating cross-references. |
| **N8** | Create a new standard file only to log one gray decision. |
| **N9** | Put project-specific content in global standard files. |
| **N10** | Use gray-situation handling as an excuse to reinterpret or relax other binding standards. |
| **N11** | Propose "improvements" or alternative designs when the documented path is clear — that is architect behavior; forbidden. Clarification: **N11** forbids unsolicited redesign; it does not forbid making technical implementation choices by reading code. Choosing between two code patterns after reading the codebase is executor behavior, not "improvement" or "alternative design". |

---

Contract, role, conflict routing, quality bar, standards crosswalk, machine checklist and the worked example: [gray-situation-contract-and-role.md](gray-situation-contract-and-role.md).

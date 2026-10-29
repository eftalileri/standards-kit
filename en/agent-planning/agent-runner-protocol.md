# Agent runner protocol

```kit-cover
type: normative
part-of: README.md
binds: the evidence-first execution discipline AR1-AR5 that applies on top of P1-P8 when the user names an authoritative execution document
open-when: signal:authoritative-execution-document
skip-when: signal:no-named-plan-md
owns: AR1, AR2, AR3, AR4, AR5
```

**Keywords:** agent execution, evidence-first, authoritative execution document, handoff, **AR1**–**AR5**, automation

Scope

- Included: How an executor agent reads repository evidence and batches questions to the user when work is driven by a named authoritative execution document (AED), in addition to [agent-planning-procedure.md](agent-planning-procedure.md) **P1**–**P8**. Replaces repeated chat preambles ("read everything then ask me only at the end").
- Excluded: Replacing **P1**–**P8** or matrix **MUST** rows; product requirements definition; duplicating normative rules from topic hubs.

References: [agent-planning-procedure.md](agent-planning-procedure.md) (**C7**); [gray-situation-decisions.md](../agent-gray-decisions/gray-situation-decisions.md); [markdown-authoring.md](../authoring/markdown-authoring.md) (**M6**, **M15**, **M16**)

Binding principle: When [procedure **C7**](agent-planning-procedure.md#agent-execution-contract) applies, skipping **AR1**–**AR5** or asking the user to restate planning rules already in the AED or in **P1**–**P8** is a process failure — same spirit as procedure **C3** for skipped matrix reads.

---

## Authoritative execution document (AED)

An AED is a project Markdown file that the user @ references or explicitly names as the binding plan for the task, and that typically includes References, Decisions / facts, and a Technical plan (or equivalent). [Markdown-authoring **M6**](../authoring/markdown-authoring.md) implementation-bound plans are the usual case; other playbooks may declare AED status in Scope.

When no AED is named, **AR2**–**AR5** still encourage evidence-first reads and end-batched questions, but the primary gate remains **P1**–**P8**, **P7**, and [Tie-break **T4**](agent-planning-problem-class.md#tie-break-when-multiple-compliant-options-remain).

---

## Procedure (strict order) — **AR1**–**AR5**

| Step | Action |
|------|--------|
| **AR1** | Run [agent-planning-procedure.md](agent-planning-procedure.md) **P1**–**P8** before the first edit when procedure **C1** applies. For the active work unit inside the AED (phase, milestone, numbered Technical plan section), extract [**A1**–**A5**](agent-planning-problem-class.md#problem-class-extraction) for that unit's problem classes when **P2** applies. |
| **AR2** | Evidence-first read order: (1) The AED from Scope through the active work unit and any child MD paths it cites; (2) every spec, audit, or requirements row the AED references for that unit; (3) every listed production code path — open files and trace imports/callees until the owning handler, service, or documented boundary is clear; (4) References entries and matrix-linked hubs required for the unit's problem classes. **AR2** obligation: The agent must read all code files in the affected flow (not just the files explicitly listed) to build sufficient context for autonomous technical decisions. When a technical choice depends on understanding existing code patterns, the agent must read enough code to decide — not narrow scope or defer to the user for questions that code reading would answer. |
| **AR3** | No mid-run product questions for choices already recorded in the AED Decisions / facts (or equivalent) or in ordering / phase tables, unless repository evidence contradicts the AED — then cite path:line, STOP, or propose an AED update per [gray-situation](../agent-gray-decisions/gray-situation-decisions.md). |
| **AR4** | Synthesis before or alongside implementation: (a) current behavior from code with paths; (b) gap vs AED goal; (c) planned change mapped to problem classes and norms; (d) required verification evidence, including the lint/typecheck gates the project allows and confirmation that the applicable verification policy (**M12**) was followed — no artifact that policy prohibits was created, preserved, or run; the project's aggregate gate runs at push when [**BE-M20**](../build-environment/build-environment-repository-and-scripts.md) requires it, not here. |
| **AR5** | User decision block (end only): If and only if product ambiguity (what to build, which business rule, which UX flow), missing product priority, or doc/code conflict remains after **AR2**–**AR4** and **P7** (where applicable), append "User decisions required" with numbered items — one decision per item, optional default recommendation, and a one-line reason user input is unavoidable. Technical implementation choices (code patterns, file structure, query shape) that can be resolved by reading code + standards must not appear in this block — the agent must resolve them autonomously per **AR2**. If nothing remains: state "No user decisions required — proceeding per the authoritative plan." |

---

## Relation to tie-break and gray

| Situation | Action |
|-----------|--------|
| **T4** applies for a product decision and the AED has no recorded choice | **AR5** must surface the decision — no silent pick ([Tie-break](agent-planning-problem-class.md#tie-break-when-multiple-compliant-options-remain)). Technical tie-breaks: resolve by reading code + standards (**T4** updated scope). |
| Blocking uncertainty after **P7** | Procedure **C5** — STOP; **AR5** does not replace gray [Procedure](../agent-gray-decisions/gray-situation-decisions.md#procedure-strict-order). |

---

## Summary (machine checklist)

| Check | Rule |
|-------|------|
| [**C7**](agent-planning-procedure.md#agent-execution-contract) | If the user named an AED, **AR1**–**AR5** apply with **P1**–**P8**. |
| Reads | **AR2** before large edits — docs + all affected flow code evidence, not chat-only guesses. Agent reads code to make technical decisions autonomously. |
| Questions | **AR5** once at the end — only product questions; technical choices resolved by code reading must not appear. |

# Decision matrix — contract, role and rules (normative)

```kit-cover
type: normative
part-of: README.md
binds: the non-negotiable agent contract, the agent role, the MUST / MUST NOT rows, the frontend stack-layer precedence and the change-impact steps of the decision matrix
open-when: signal:stack-choice
skip-when: none
owns: C1, C2, C3, C4, C5, C6, C7, M1, M2, M3, M4, M5, M6, M7, M8, N1, N2, N3, N4, N5
```

Scope: The governance half of [decision-matrix.md](decision-matrix.md) — the contract that makes the matrix non-negotiable, the agent's role, the **MUST** / **MUST NOT** rows, the frontend stack-layer precedence used when two rows compete, the mandatory change-impact steps, and the ordered usage. The Matrix table itself stays in [decision-matrix.md](decision-matrix.md), which is the file the planning procedure **P2** names.

Document type: Normative part — **C1**–**C7**, **M1**–**M8**, **N1**–**N5**. These are file-local bare identifiers; cite them across files in link form, e.g. `[M4](decision-matrix-governance.md)`.

References: [README.md](README.md); [decision-matrix.md](decision-matrix.md) (the Matrix); [gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md); [markdown authoring](../authoring/markdown-authoring.md) (Decisions / facts); [agent-planning-procedure](../agent-planning/agent-planning-procedure.md) (**P2**).

---

## Agent execution contract

**C1**: This document is mandatory and non-negotiable for agent behavior. It is not a guideline, suggestion, or default. Discretion to relax it does not exist.

**C2**: Every rule here is mandatory. If wording looks soft ("if possible", "prefer"), apply the strictest reading.

**C3**: Code or documentation that violates this matrix is a bug — reject / must fix before merge.

**C4**: Violations must be fixed like any production defect — not argued away, not silently deferred. Only a standards change can change the rule.

**C5**: Refactor, feature add, or delete: do not change code without updating affected standards first when this matrix is impacted.

**C6**: If Precedence + Matrix + [gray-situation](../agent-gray-decisions/gray-situation-decisions.md) still leave the row ambiguous, STOP — do not pick a stack by guess; resolve the gap through the adopting project's documented decision process.

**C7**: Interpretation is forbidden for mapped rows (**M6**); Enforcement: non-compliance -> invalid architecture choice (bug).

Testability: Compliance is verified by static inspection (problem class -> row -> standard path) and code (the implementation matches the concrete stack choice the adopting project recorded for that row). State any part that cannot be verified from available evidence.

---

## Agent role

| Rule | Requirement |
|------|-------------|
| Role | Apply documented rules. You are not the architect; humans and binding standards own design. |
| Architecture | Must not redesign architecture or replace the matrix-assigned stack for a mapped problem class. |
| Optimization | Must not "optimize" or refine choices beyond what the linked standard files explicitly allow. |
| Alternatives | Must not propose equivalent or substitute stacks, libraries, or patterns for a row that already maps a system — unless [gray-situation](../agent-gray-decisions/gray-situation-decisions.md) procedure and a documented user exception ([markdown authoring](../authoring/markdown-authoring.md) Decisions / facts) apply. |

---

## **MUST**

**M1**: Identify the problem class (row in Matrix below).

**M2**: Use the System column for that row. When it names a project-selected role, follow the exact implementation recorded in the linked standard or architecture record; if none is recorded, use **M8** rather than guessing.

**M3**: Read and follow the Standard file for that row under `$KIT_ROOT/en/<topic>/`.

**M4**: When two rows could apply, resolve with Precedence (below), then Matrix order, not personal preference.

**M5**: After applying the matrix, do not propose an equivalent alternative stack for the same problem class without a documented user exception recorded per [markdown authoring](../authoring/markdown-authoring.md) Decisions / facts.

**M6**: Interpretation is forbidden. For mapped problem classes, the matrix row plus its Standard file define the only valid solution path. Do not reinterpret, stretch, "adapt," or mentally replace the row with a preferred approach.

**M7**: Follow Agent role above on every task that touches a matrix-covered area.

**M8**: Failure / unmapped class: If the task is in scope for this matrix but no row clearly applies after **M1**–**M4** and [gray-situation](../agent-gray-decisions/gray-situation-decisions.md), STOP — document the gap; do not invent a System or Standard file column value.

---

## **MUST NOT**

**N1**: Do not invent architecture preferences, alternate frameworks, or "better" options outside the matrix and linked standards.

**N2**: Do not ask permission to deviate from the matrix; if deviation is required, follow gray-situation rules and record the exception.

**N3**: Do not use vague language ("probably", "typically") to choose a stack row.

**N4**: Do not interpret, optimize, reword, or adjust matrix or Precedence rules to fit a preferred implementation. Apply them exactly as written.

**N5**: Do not exercise design judgment over the matrix: no "I would use X instead" for mapped rows.

---

## Precedence when frontend stack layers conflict

Scope: frontend stack-layer disputes only. This is not a general tie-breaker between two kit rules; for that, apply [**KIT-PRE-2**](../_meta/precedence.md), which reaches this ordering only at its rung (5) and only when the dispute is stack-class. Ranking anything else here would be the second ordering [**KIT-PRE-3**](../_meta/precedence.md) forbids.

Apply in order:

1. State ownership > behavior orchestration > presentation. A rendering or presentation layer does not become the authority for durable or shared state.
2. The documented authority for each concern takes precedence over adjacent presentation concerns: server state > client state > form state > routing > performance. Server-owned data follows the project's server-state standard (for example TanStack Query, never a client-state store); client draft state follows its form/client-state standard; routing and performance mechanisms do not create parallel data authorities. Resolve exact implementation choices from the linked standards and the adopted architecture record.

If still unclear after this and the matrix, the dispute was not stack-class: return to [**KIT-PRE-2**](../_meta/precedence.md), then [gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md).

---

## How this list stays true

The Matrix in [decision-matrix.md](decision-matrix.md) is written by hand, and that is deliberate ([**KIT-ENF-4**](../authoring/kit-rule-change-and-enforcement.md), **KIT-LIM-6**).

- It is not an authority for which topics exist. The generated topic index in [`../README.md`](../README.md) is, and the Matrix keeps no copy of it. The Matrix answers a different question: given a *problem class*, which system and which standard file.
- It cannot be generated. "Which problem class this file answers" is an editorial judgement; no cover-block field carries it and no file property implies it. Deriving it would mean inventing a classifier for a semantic question.
- What is mechanical, and not gated. Every `Standard file` destination the Matrix names must resolve on disk. That is the drift class that actually bites — a row pointing at a file that moved or was deleted — so a change that moves or deletes a standard file repoints the Matrix row in the same change ([**KIT-CHG-4**](../authoring/kit-rule-identity-and-relocation.md)); the path check that once gated this was retired with the other kit-document guards ([**KIT-LIM-12**](../authoring/kit-stated-limits.md)) and review holds it.
- What is not mechanical, and why that is safe. Coverage. A topic with no Matrix row is a correct state, not drift, so a completeness check would fire on correct work. The gap is closed by procedure instead: under **M8** an in-scope problem class with no row is a STOP — the agent escalates rather than guessing, and the missing row is added deliberately.

---

## Change impact (mandatory)

| Step | Action |
|------|--------|
| 1 | List every standard file this change affects. |
| 2 | Check for conflicting rules. |
| 3 | If the change breaks a standard, stop — update standards first, then code. |

---

## Usage (ordered)

| Step | Action |
|------|--------|
| 1 | Detect problem class. |
| 2 | Find the row in Matrix. |
| 3 | Open the Standard file and apply it. |
| 4 | Implement without offering alternate stacks. |

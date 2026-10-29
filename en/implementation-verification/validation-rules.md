# Implementation verification — validation rules (normative)

```kit-cover
type: normative
part-of: README.md
binds: the agent execution contract, the decision definitions, the output shape, the failure paths and the cross-standard minima of MD-code verification
open-when: signal:md-code-verification, signal:plan-vs-code-drift
skip-when: signal:no-implementation-bound-md
owns: IV-C1, IV-C2, IV-C3, IV-C4, IV-C5, IV-C6, IV-C7, IV-C8, IV-D1, IV-D2, IV-D4, IV-D5, IV-F1, IV-F2, IV-F3, IV-O1, IV-O2, IV-O3, IV-O4, IV-XB1, IV-XB2, IV-XB3
```

Scope: Same as [README.md](README.md) hub Scope. This file is the rule engine for when verification applies (IV-C), what the terms mean (IV-D), what the output must look like (IV-O), when to stop (IV-F), and the domain minima that bind remediation (IV-XB). The **MUST** / **MUST NOT** rows themselves are in [verification-must-rules.md](verification-must-rules.md).

Document type: Normative — IV-C / IV-F / IV-D / IV-O / IV-XB rows below are binding.

References: [README.md](README.md); [verification-must-rules.md](verification-must-rules.md) (IV-M, IV-N); [execution-procedure.md](execution-procedure.md) (order, **A2** definition, **V1**–**V8**); [anti-loop-rules.md](anti-loop-rules.md) (IV-AM, IV-AN).

---

## Agent execution contract

| ID | Rule |
|----|------|
| **IV-C1** | This topic is mandatory whenever Scope / **M17** says verification applies; partial execution is non-compliant. |
| **IV-C2** | [Shared **C2**](../_meta/agent-contract.md) governs reading the verification rules. |
| **IV-C3** | Compliance is only from IV- rows in this folder, read per [shared **C2**](../_meta/agent-contract.md); ambiguity → STOP and clarify or revise the governing specification, or ask the user (**IV-C7**). |
| **IV-C4** | Precedence: Domain standards (error, logging, transactions, repository, etc.) win on what the code must do; this folder wins on how MD items are enumerated, proven, and reported. |
| **IV-C5** | Violations → verification invalid, output rejected, and it must not be reported as complete until remedied. |
| **IV-C6** | Change impact: If inventory or Evidence rules change, update [`markdown-authoring.md`](../authoring/markdown-authoring.md) **M17** / KV pointers in the same change set. |
| **IV-C7** | If a term is still ambiguous after IV-D rows, STOP — do not guess; clarify the specification or request the user's decision. |
| **IV-C8** | When the user designates a target implementation or verification MD (path, title, or explicit quote) as authoritative for the current pass, every data row in every checklist, verification, or evidence table in that MD revision must become one frozen inventory item and one verification table row with Evidence (**IV-M1**, **IV-D5**, **IV-O1**). No sampling, no "representative" rows, no Compliant for a whole section without per-row inventory unless the MD explicitly merges obligations under one Item id (if unclear → STOP **IV-C7**). Skipping any such row invalidates the pass (**IV-O4**). See [execution-procedure.md](execution-procedure.md) **A2b**. |

Enforcement: Standard breach → verification invalid; agent output rejected; critical breach (**IV-F2**, **IV-F3**, fabricated Evidence, skipped IV-O rows, **IV-C8** checklist omissions) → STOP further dependent work until fixed.

---

## Enforcement (normative summary)

| Outcome | When |
|---------|------|
| Verification invalid | Any IV-O breach; skipped inventory item; empty Evidence; **IV-F3**. |
| Agent output rejected | IV-N breach; Compliant without IV-D-satisfying read; guessed compliance. |
| STOP | **IV-F2** (broken reference chain / unreadable SSOT); **IV-F3**; **IV-C7**; user approval gate per **IV-AM1** while waiting. |

---

## Decision definitions (normative) — IV-D

| ID | Definition |
|----|------------|
| **IV-D1** | 1:1 behavioral match means: for the obligation stated in the MD item, the code implements the same branching conditions (same predicates and order where the MD orders them) and the same externally observable outcomes named in the MD (HTTP status, semantic error codes, returned fields, writes, emissions, or other side effects the MD names). Stated literals (field names, enum values, numeric codes, route paths) must match exactly. Paraphrase of prose is allowed only if Boolean structure (AND / OR / negation) is unchanged; if equivalence is unclear → item is Missing (**IV-C7**). |
| **IV-D2** | Code read (Evidence-quality) means: the agent inspected at least one contiguous executable region (≥1 statement block inside a function/method/handler) or the full declarative body the MD targets (e.g. schema object literal) using a tool-backed file read in the same session. Signature-only inspection does not satisfy **IV-D2** unless the MD item only asserts existence/name of an export and nothing about behavior. |
| **IV-D4** | Missing vs Invalid (reason): If the code location cannot be found (**IV-F1**) and the MD item still asserts the obligation (feature exists, must call X, field Y required, etc.) → status **MUST** be Missing (default). Invalid (reason) **MUST** be used only when the MD explicitly states the item is removed, superseded, out of scope, or obsolete with a traceable sentence or table row in the same MD or a user-approved linked child doc. Must not choose Invalid solely because the agent believes the MD is outdated. |
| **IV-D5** | Explicit checklist / evidence-matrix rows: When the target MD contains a table whose purpose is verification, evidence, compliance, or test tracking (e.g. columns Item id, Test, Requirement, Evidence, Status, or a checklist with stable IDs), each data row is one atomic obligation for **IV-M1** and one row in the output table (**IV-O1**), including rows that concern UI copy, i18n keys, locale files, or accessibility labels if the row text names them. Excluded from row count: header-only rows, purely decorative separators, and rows explicitly marked N/A or Excluded in the MD. **IV-C8** must be applied when the user designates that MD as authoritative for the pass. |

---

## Output shape (normative) — IV-O

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **IV-O1** | The verification table **MUST** contain exactly one row per frozen inventory item from **IV-M1** (neither merged sections nor duplicate rows for the same item). | Output invalid — reject. | Pass: row count = inventory count; each inventory id appears once. |
| **IV-O2** | Required columns (exact names may be localized but must exist and mean the same): Item id \| MD expectation (short) \| Code location \| Evidence \| Status \| Change note (use — if none). Evidence **MUST NOT** be empty for any row and **MUST** satisfy **IV-M5** (a–c). | Output invalid — reject. | Pass: every Evidence cell matches **IV-M5** Verify. |
| **IV-O3** | Status **MUST** be exactly one of: Compliant \| Missing \| Invalid (reason). | Output invalid — reject. | Pass: grep table Status column values ⊆ allowed set. |
| **IV-O4** | If any inventory item is missing from the table or Evidence is blank or status is invented outside **IV-O3**, the verification **MUST** be treated as failed (no "partial pass"). | STOP — invalid verification. | Pass: manual or script check of **IV-O1**–**IV-O3**. |

---

## Failure paths (normative) — IV-F

| ID | Condition | Outcome |
|----|-----------|---------|
| **IV-F1** | After **IV-M2** search, no code location can be found for an item. | Default: Missing — not Compliant (**IV-D4**). Invalid only if **IV-D4** obsolete / superseded condition is met. |
| **IV-F2** | A normative referenced file in the MD chain cannot be read (missing path, permission, or unavailable in the current workspace) or the SSOT dependency link is broken. | STOP — resolve access or link; no fabricated Evidence. |
| **IV-F3** | Evidence cannot be produced honestly (**IV-AM4** applies) or would require guessing. | Verification invalid — STOP. |

---

## Cross-standard binding (local minima) — IV-XB

Detail remains in linked SSOT; these rows obligate agents during remediation and re-verification after Missing → code change.

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **IV-XB1** | When implementing or fixing code found Missing, error shape and client/server handling **MUST** comply with [error policy](../error-policy/error-policy.md) and [error handling](../error-handling/error-handling.md) local minima (no silent failures; no `null` decision returns where those standards forbid it). | Bug — item not Compliant until fixed. | Pass: changed files cite patterns required by those standards; reviewer checks throw / structured error paths. |
| **IV-XB2** | When code emits logs on the paths under change, logging **MUST** follow [logging policy](../logging-policy/logging-policy.md) (structured fields, transport, PII rules as applicable). | Bug — reject until aligned. | Pass: logger calls match policy module / field rules in diff. |
| **IV-XB3** | When code mutates durable state across multiple writes that the MD treats as atomic, **MUST** follow [transaction policy](../transactions/transaction-policy.md) or document N/A with one-line reason in the verification Change note. | Bug — reject if atomicity required but missing. | Pass: service-layer session / transaction usage matches TX-M rows or N/A is explicit. |

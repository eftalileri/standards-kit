# Markdown authoring (deliverables)

```kit-cover
type: normative
part-of: README.md
binds: the agent execution contract and the MUST / MUST NOT rows every Markdown deliverable satisfies
open-when: signal:plan-deliverable, signal:analysis-deliverable
skip-when: signal:no-markdown-deliverable
owns: C1, C2, C3, C4, C5, C6, C7, C8, M1, M2, M3, M4, M5, M6, M7, M8, M9, M10, M11, M12, M13, M14, M15, M16, M17, M18, M19, M20, N1, N2, N3, N4, N5, N6, N7, N8, N9, N10, N11
```

Scope

- Included: Markdown deliverables that agents or humans produce (plans, analysis, implementation notes, blueprints, and similar) when this standard applies.
- Excluded: Application source code files; the normative body of topic standards under `$KIT_ROOT/en/<topic>/` (those documents are SSOT for domain rules, not governed as "deliverables" here).
- This file: Normative standard for deliverable shape, sections, and verification. Every deliverable **MUST** include its own Scope section satisfying **M18**.

Environment constraints: N/A — this standard does not govern runtime hosts, logging transport, or prod vs dev binaries; it governs deliverable Markdown only.

Binding principle: Violation of this standard yields invalid or un-auditable deliverables and is a bug. Remedy: fix the Markdown, fix the verification output, or update this standard — no silent relaxation. Do not implement from a non-compliant plan until it is corrected or an explicit user exception is recorded in Decisions / facts (see **M15**, **M10**).

Goal: Short, strict rules and output shape limits. Do not shrink completeness by leaving rules implicit; compress using **MUST**/**MUST NOT**, tables, and caps. Narrative and sample Q&A live outside this file (see [Examples (non-normative)](../_meta/examples/markdown-authoring-scenarios.md)).

Alignment: Planning / scoping (before writing an implementation-bound deliverable) follows [`$KIT_ROOT/en/agent-planning/agent-planning-procedure.md`](../agent-planning/agent-planning-procedure.md) **P1**–**P8** when work touches stack, forms, routing, errors, or APIs (**P8** verification when implementation-bound). Decision discipline and no multi-branch solutions follow [`$KIT_ROOT/en/agent-gray-decisions/gray-situation-decisions.md`](../agent-gray-decisions/gray-situation-decisions.md). Problem class → stack / standard choices follow [`$KIT_ROOT/en/decision-matrix/decision-matrix.md`](../decision-matrix/decision-matrix.md). When two standards conflict on domain priority, use decision matrix precedence and gray-situation Document hierarchy before inventing a merge.

Corpus: English SSOT here. All topics live under `$KIT_ROOT/en/`.

Part of this topic: [markdown-authoring-deliverable-shape.md](markdown-authoring-deliverable-shape.md) — required section order, Decisions / facts format, output size guard (**G1**, **G2**), risk template, implementation-MD shape (**I1**–**I3**), workflow, and the MD–code verification rows (**KV0**, **KV1**). It also holds the kit's [document shape codes](markdown-authoring-deliverable-shape.md#document-shape-codes) glossary — `§2a`–`§2o`, `§10`, `§15a`. [markdown-authoring-bare-identifier-limit.md](markdown-authoring-bare-identifier-limit.md) holds the stated enforcement limit on bare file-local identifiers, binding as if written here. Nothing here is ever renumbered: [**KIT-INV-4**](kit-structural-invariants.md) freezes this file.


---

## Agent execution contract

| ID | Rule |
|----|------|
| **C1** | This document is mandatory for agent-produced Markdown deliverables in scope. |
| **C2** | [Shared **C2**](../_meta/agent-contract.md) governs reading these rules. |
| **C3** | [Shared **C4**](../_meta/agent-contract.md): a violating deliverable is invalid; dependent implementation waits for correction or a standards update. |
| **C4** | Apply [Shared **C2**](../_meta/agent-contract.md) and **M10**; unresolved choices follow [gray Procedure](../agent-gray-decisions/gray-situation-decisions.md). |
| **C5** | Change impact: If you change rules here, list affected topic standards and fix conflicts before relying on old deliverables. |
| **C6** | [`markdown-authoring-scenarios.md`](../_meta/examples/markdown-authoring-scenarios.md) is non-normative (**N8**); obligations live in M / N rows only. |
| **C7** | If **M15** requires user input and none is given, STOP — do not invent requirements. |
| **C8** | When **M17** applies, MD–code verification is mandatory in full — partial checks are invalid — see [`implementation-verification/README.md`](../implementation-verification/README.md) (IV- rows). |

Enforcement consequence: STOP / reject treat-as-final / bug — see **C3**; every M / N is testable by static inspection of the Markdown (and KV rules add code inspection when triggered).

---

## **MUST**

| ID | Rule |
|----|------|
| **M1** | Use only ASCII apostrophe `'` (U+0027) and ASCII double quote `"` (U+0022) in prose (headings, lists, tables, paragraphs). Scope limit — this row is about QUOTE CHARACTERS only: see [**KV2**](markdown-authoring-deliverable-shape.md). |
| **M2** | Open every fenced code block with a language tag (e.g. `typescript`, `tsx`, `json`). Bare ` ``` ` without a language is forbidden. |
| **M3** | Before writing a deliverable, read the applicable standards: the file set [agent-planning-procedure](../agent-planning/agent-planning-procedure.md) **P4**/**SEL-M1** selects through the identity, signal and registry lookups. The kit index and hub READMEs are not read for orientation (**P1**, **P5**) — a reading path that starts from an index opens files no declared token selects and skips ones it does. |
| **M4** | List References at the top or immediately after Scope: paths to every standard file you relied on (no silent application of rules). Quality bar: **M19**. |
| **M5** | Technical obligations (new field, endpoint, idempotency key, invalidation targets, full file paths, new shared types, Zod schema paths) **MUST** appear as separate numbered items or separate table rows — never only inside a paragraph. |
| **M6** | Implementation / plan deliverables (anything that will be checked against code) **MUST** satisfy Risk documentation (strict) and Implementation MD shape sections in [markdown-authoring-deliverable-shape.md](markdown-authoring-deliverable-shape.md). |
| **M7** | Risk documentation: include exactly one risk section when **M6** applies. Max 5 rows. Table only. Columns: `Risk` \| `Root cause` \| `Fix` \| `Standard ref`. No prose paragraphs inside that section (header row + up to 5 data rows only). |
| **M8** | Each risk row **MUST** have a non-empty Fix and a Standard ref (path or title). |
| **M9** | Apply decision discipline from [`gray-situation-decisions.md`](../agent-gray-decisions/gray-situation-decisions.md) when choosing fixes; do not paste that document into the deliverable. |
| **M10** | State one chosen approach in the body. No equivalent branches (no "Option A / Option B", "Alternative 1 and 2") in the deliverable body (matches [decision matrix](../decision-matrix/decision-matrix.md) single path and [gray-situation](../agent-gray-decisions/gray-situation-decisions.md) no interpretation). |
| **M11** | Plan modular code files; do not inflate single entry files. New/changed types and Zod locations must align with [monorepo](../monorepo/monorepo-architecture.md) / [forms](../forms/forms.md) / related standards. |
| **M12** | When naming code files in the deliverable, use repo-root-relative full paths (e.g. `<project-relative-path>/src/<module>.ts`). File-name-only references are forbidden. |
| **M13** | If a deliverable would exceed ~300 lines or 5+ phases, split into linked files; the parent file **MUST** link to each part. |
| **M14** | For cross-impact: document only negative impact or required follow-ups. If none: one short row or sentence: e.g. "Cross-impact reviewed; no negative impact identified." Do not list unaffected areas at length. Scope: full table only when **XIA-M1** (a)–(d) apply; otherwise **M14** only (**XIA-M5**). When a full Cross-impact analysis section is used, **MUST** follow [cross-impact-analysis.md](cross-impact-analysis.md) (**XIA-M1**–**XIA-M5**, **XIA-N1**–**XIA-N3**); BLOCKER when **XIA-M1** requires the full table and shape/rows fail (**XIA-M4**, **XIA-C3**). |
| **M15** | Resolve ambiguity before finalizing: ask the user; do not invent requirements. Record approved answers in Decisions / facts using Decision / facts format in [markdown-authoring-deliverable-shape.md](markdown-authoring-deliverable-shape.md) — not narrative filler. |
| **M16** | For each technology / layer choice covered by the matrix (server state, client state, forms, routing, errors, etc.), the deliverable **MUST** name the problem class, cite [`decision-matrix.md`](../decision-matrix/decision-matrix.md) (row or problem description), and the linked standard file you will follow. No substitute stack in the same class without an explicit user exception recorded as a Decisions / facts row with reason. |
| **M17** | When MD–code verification is triggered ([`implementation-verification/README.md`](../implementation-verification/README.md) Scope, or user asks for 1:1 MD vs code, item-by-item, function-by-function, or equivalent), the agent **MUST** execute **IV-C8** (when a target MD is authoritative), IV-M / IV-N (through **IV-N8**) / IV-O / IV-F / IV-D (including **IV-D4** and **IV-D5**) / IV-XB / IV-AM / IV-AN in that folder completely — no partial tables, no rows without Evidence, no skipped checklist / evidence-table data rows (**KV1**). |
| **M18** | The deliverable's Scope section **MUST** state explicitly: (1) what is in scope (included), (2) what is out of scope (excluded), and (3) whether the document is implementation-bound (**M6** applies — will be checked against code) or analysis-only (**M6** does not apply — no implementation checklist against code). Scope fidelity is [agent-planning-procedure **C8**](../agent-planning/agent-planning-procedure.md). |
| **M19** | References **MUST** list only standards or docs actually used to justify content in that deliverable. Each listed reference **MUST** be necessary for at least one concrete **MUST**-backed obligation, Decisions / facts row, Technical plan item, Blueprint row, or Risk row — not decorative reading lists. |
| **M20** | A deliverable that reproduces measurement output taken from production (audit dump, DB query result, log or crash-report paste, console capture) **MUST NOT** carry the fields that identify a person or tenant: phone, email, name, address, or any identifier that embeds or is derived from one — a slug or record id built from a phone or a name is PII-backed, and lossy transliteration inside it does not anonymize it ([**SEC-M-LOG-4**](../security/security-logging-core.md) tag corollary states the same classification test for the log egress; this row applies it to the document egress). Replace each with a stable pseudonym held constant across the whole document tree, so the measurement's evidence — repetition, grouping, cardinality, and identity shared between two documents — survives while the person does not. Deleting the row is the wrong fix: it destroys the evidence the document exists to carry, and a measurement is cited by its counts and its schema, never by its records. The document tree is not a second store of production data; when a raw dump must be kept for reproduction, it is quarantined outside version control (ignore rule) rather than committed and redacted later, because a commit is not retractable without rewriting shared history. |

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **N1** | Do not use Unicode "smart" quotes or apostrophes (U+2018–U+201F, etc.) in MD prose. |
| **N2** | Do not hide technical requirements only in flowing paragraphs. |
| **N3** | Do not duplicate long explanations that already exist in a standard; cite the standard path instead. |
| **N4** | Do not add unnecessary explanatory prose, tutorial text, or large code samples in deliverables; use the minimum text that satisfies **MUST** rows and format tables. **N4** governs prose verbosity, not scope breadth ([agent-planning-procedure **C8**](../agent-planning/agent-planning-procedure.md)). |
| **N5** | Do not exceed 5 risk rows where **M7** applies. Split work or defer lower-priority risks with explicit user agreement documented in the same table (last row may state deferral). |
| **N6** | Do not use fallback or silent defaults where standards require root-cause handling; say what is unknown and stop for input if needed. |
| **N7** | Do not paste full standard bodies into the deliverable. |
| **N8** | Do not treat [`../_meta/examples/markdown-authoring-scenarios.md`](../_meta/examples/markdown-authoring-scenarios.md) as normative; it is training / illustration only. |
| **N9** | Implementation checklist **MUST** contain only items that appear as numbered technical obligations in Technical plan and/or as rows in Blueprint / actions. No extra "nice to have", no duplicate phrasing of the same obligation, no items without a matching numbered or blueprint line. |
| **N10** | When **M17** applies: do not skip technical items; do not mark Compliant without Evidence (path + short quote or signature); do not answer "probably" or "generally aligned" (**IV-N1**, **IV-N2**, [`verification-must-rules.md`](../implementation-verification/verification-must-rules.md)). |
| **N11** | Do not add paths to References that support no rule, decision, plan line, blueprint row, or risk row in this document (**M19**). |

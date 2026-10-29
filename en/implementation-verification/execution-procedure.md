# Implementation verification — execution procedure (normative)

```kit-cover
type: normative
part-of: README.md
binds: the applicability gate, the mandatory step order, the inventory shape, the completion definition and the V1-V8 acceptance checklist
open-when: signal:md-code-verification, signal:plan-vs-code-drift
skip-when: signal:no-implementation-bound-md
owns: A1, A2, A2b, A3, C1, C2, C3, C4, C5, V1, V2, V3, V4, V5, V6, V7, V8
```

Scope: Same as [README.md](README.md) hub Scope. This file defines order, inventory shape, the completion definition and the acceptance checklist; binding rules are IV-C / IV-F / IV-D / IV-O / IV-XB in [validation-rules.md](validation-rules.md), IV-M / IV-N in [verification-must-rules.md](verification-must-rules.md), and IV-AM / IV-AN in [anti-loop-rules.md](anti-loop-rules.md).

---

## Applicability gate (binary)

All must be true to start the MD–code protocol:

| # | Condition |
|---|-----------|
| **A1** | User request or **M17** trigger matches hub Scope (Included). |
| **A2** | Target MD is implementation-bound (see **A2** definition below) or the user explicitly demands a code parity check (any unambiguous user phrase). |
| **A3** | Target MD contains ≥1 concrete technical obligation (path, function, field, behavior, error code, endpoint). |

If **A3** is false → this standard does not apply; stop this protocol.

### **A2** definition — "implementation-bound" (normative)

For **A2**, implementation-bound means the MD contains at least one of the following machine-checkable anchors (not prose intent alone):

| Anchor type | Examples (non-exhaustive) |
|-------------|---------------------------|
| File path | A path to a source file relative to the relevant project or workspace root. |
| Function / method / hook name | Symbol name tied to behavior (not a generic word like "handle" without a defined identifier). |
| API endpoint | HTTP method + path pattern, or OpenAPI operation id. |
| Database / persistence field | Schema field, collection key, migration column, or ORM property name. |

If none of the above appear and the user did not explicitly demand MD–code parity → **A2** is false; this protocol does not apply.

Target MD examples (non-exhaustive): technical specifications, analyses, blueprints, plans with Implementation / Solution / Actions sections.

### **A2b** — User-designated authoritative implementation / verification MD (normative)

When the user names a markdown file (by path, title, or unambiguous reference) as the authoritative implementation or verification specification for the current MD–code pass:

| Rule | Binding |
|------|---------|
| Row expansion | Each data row in Verification, Evidence, Checklist, Test matrix, or similarly titled tables in that file must be listed in the frozen inventory before code comparison (**IV-M1**, **IV-D5**, **IV-C8**). |
| No sampling | Must not verify only a sample of rows or mark a section Compliant without per-row Evidence (**IV-N2**, **IV-O1**). |
| Reference chain | Links (See, Reference, `../`) still expand per **IV-M6** — append items; do not skip nested obligations. |

If the target MD has no such tables, only **A2** anchors and **IV-M1** bulleted / numbered obligations apply.

---

## Inventory vs execution chunking (normative)

| Concept | Rule |
|---------|------|
| Global inventory | **IV-M1** + **IV-M6** produce one closed inventory for the target MD revision before any item is verified against code. Inventory creation is not chunked. |
| Execution chunks | **IV-AM1** applies only to locate → read → Evidence → status → remediation work (Mandatory order steps 7–11): use bounded chunks with an explicit item list and size agreed with the user before dependent work. Boundary approval may be a written standing approval only for an exact fixed sequence with listed item sets; scope/item expansion or a chunk-size increase requires new written approval. |

---

## Mandatory order (do not reorder)

| Step | Action | Binding rows |
|------|--------|----------------|
| 1 | Confirm Applicability gate | **A1**–**A3** |
| 2 | Read target MD end-to-end once | **IV-M1** |
| 3 | Build initial inventory from this MD only (stable Item id per atomic obligation, including each blueprint table row) | **IV-M1**, **IV-O1** |
| 4 | Expand reference chain (**IV-M6**): read nested MDs; append new technical items with new Item ids only — **IV-N8** | **IV-M6**, **IV-F2**, **IV-N8** |
| 5 | Repeat step 4 until no new normative MD obligations appear (closure); freeze inventory (row count fixed for this pass) | **IV-M1** stability |
| 6 | For each frozen inventory item in order (**IV-AM1** may limit how many per chunk): locate code | **IV-M2**, **IV-F1**, **IV-D4** |
| 7 | For each item in chunk: read per **IV-D2**, compare per **IV-D1**, assign **IV-O3** status, fill **IV-M5** Evidence | **IV-M3**–**IV-M5**, **IV-M4** |
| 8 | Emit or update verification table for completed chunks; full table **MUST** satisfy **IV-O1**–**IV-O4** when pass is complete | IV-O\* |
| 9 | For each Missing item in scope: implement per **IV-M7**, **IV-XB1**–**IV-XB3** | **IV-M7**, IV-XB\* |
| 10 | Re-run steps 6–8 for items affected by code changes; run **IV-M8** | **IV-M8** |
| 11 | During steps 6–10, apply [anti-loop-rules.md](anti-loop-rules.md) | IV-AM, IV-AN |

Step 4–5 note: Appending from refs must not change existing Item ids (**IV-N8**). If the agent discovers the initial inventory was wrong, STOP, fix the MD or inventory document, and restart from step 2 (full re-verification per **IV-M1**).

---

## Inventory shape (required fields)

Each inventory row must contain:

| Field | Requirement |
|-------|-------------|
| Item id | Stable string: e.g. `A.1.2`, `BP-row-3`, `§4-bullet-2`, `REF1-A.1` for ref-appended items. |
| Source pointer | MD heading path + list index or table row key. |
| MD expectation (one line) | Verbatim technical claim to test. |

---

## Blueprint / action tables

When the MD contains a Blueprint, Net decision / action, or similar table:

| Rule | Binding |
|------|---------|
| Each data row is one inventory item | **IV-M1** |
| If a Status / Done / Code column says not done, row must end Missing until code matches | **IV-M4** |

---

## Completion definition

Work may be called complete only if:

| # | Criterion |
|---|-----------|
| **C1** | **IV-O1**–**IV-O4** satisfied for final frozen inventory. |
| **C2** | No open Missing items unless user explicitly scoped them out in Decisions / facts (per [markdown-authoring](../authoring/markdown-authoring.md)). |
| **C3** | **IV-M8** satisfied or N/A documented. |
| **C4** | Verification checklist **V1**–**V8** below all pass. |
| **C5** | Deterministic rerun: Re-running this procedure on the same MD revision and same repo tree (no code or MD changes) **MUST** yield the same Status per Item id and the same Code location strings. Evidence quotation may differ only in non-semantic whitespace. If statuses or locations differ, the first run was invalid or the procedure was not followed (**IV-N1**, **IV-AM4**). |

---

## Verification (acceptance checklist)

Use as binary pre-flight before claiming MD–code work is complete:

| # | Check |
|---|--------|
| **V1** | Every MD technical item from the frozen inventory appears exactly once in the verification table (**IV-O1**). When **IV-C8** applies, every checklist / evidence-table data row in the authoritative MD is in that inventory (**IV-D5**). |
| **V2** | Every row has Evidence satisfying **IV-M5** (path, line range, executable or declarative quote per **IV-D2**) (**IV-O2**). |
| **V3** | Every code location was found via opened file or repo search with a logged tool invocation (**IV-M2**, **IV-AM4**). |
| **V4** | Every Compliant row satisfies **IV-D1** and **IV-D2**. |
| **V5** | No inventory row was skipped or merged into a "section summary" (**IV-N2**). |
| **V6** | Reference chain from the MD was followed to termination or STOP (**IV-F2**) (**IV-M6**). |
| **V7** | If code changed: domain minima (**IV-XB1**–**IV-XB3**) were applied; project CI command ran if required (**IV-M8**). |
| **V8** | Deterministic rerun ([Completion definition](#completion-definition) **C5**): same MD revision + same repo tree → same Status per Item id and same Code location strings. |

### Automation and scripting (non-blocking)

**V1**–**V8** are designed to be machine-checkable where the repo exposes stable files: e.g. row count = frozen inventory count (**IV-O1**), Status column ∈ allowed set (**IV-O3**), Evidence cells matching a `path + L\d+-L\d+` pattern (**IV-M5**). A project may add scripts that fail CI when these predicates fail; such scripts are project local — not part of this kit until published under `_meta/examples/` (optional).

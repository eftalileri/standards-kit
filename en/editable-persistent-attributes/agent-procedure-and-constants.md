# Editable persistent attributes — agent procedure and normative constants

```kit-cover
type: normative
part-of: README.md
binds: EPA-T1 and EPA-T2 (the chunk-size and mandatory-chunking thresholds) plus EPA-P1 to EPA-P7, the ordered procedure for adding or changing an editable persistent attribute and its cascade behaviour
open-when: shape:backend-heavy, signal:editable-attribute, signal:mongo-cascade, signal:denormalization, signal:bulk-write-chunking
skip-when: signal:no-denormalized-copy, signal:client-only
owns: EPA-T1, EPA-T2, EPA-P1, EPA-P2, EPA-P3, EPA-P4, EPA-P5, EPA-P6, EPA-P7
```

Scope: Guidance for selecting system-specific batch thresholds, the seven ordered procedure steps for changing an editable persistent attribute, and the implementation checklist that maps those steps to the part files' rows.

Document type: Normative part — **EPA-T1**, **EPA-T2**, **EPA-P1**–**EPA-P7**.

References: [README.md](README.md); [ssot-denormalization-and-impact-matrix.md](ssot-denormalization-and-impact-matrix.md) (EDM-\*); [cascade-engine.md](cascade-engine.md) (CAS-\*); [execution-async-batch-logging.md](execution-async-batch-logging.md) (EXE-\*); [mongo-cascade-indexing.md](mongo-cascade-indexing.md) (MCI-\*); [validation-types-and-migration.md](validation-types-and-migration.md) (EVL-\*); [decision-gates.md](decision-gates.md) (GEPA1–GEPA8).

---

## System-specific thresholds (configuration guidance)

| ID | Value | Meaning |
|----|-------|---------|
| **EPA-T1** | Set by the adopting system | Maximum documents per bulk-write chunk, chosen to stay within database and operational limits (**EXE-M1**). |
| **EPA-T2** | Set by the adopting system | Affected-document threshold above which chunking is required (**EXE-M1** / GEPA3). |

---

## Agent procedure (normative steps — legacy §8)

Execute in order when adding or changing an editable persistent attribute or its cascade behavior.

| ID | Step |
|----|------|
| **EPA-P1** | Define the attribute: which collection/field is SSoT; where the UI/API updates it. |
| **EPA-P2** | Name the value's copies and copy targets in its registry row contract: SSoT vs denormalized copy vs ID-only; cascade targets (**EDM-M5**–**EDM-M7**). |
| **EPA-P3** | Run [decision gates](decision-gates.md) (GEPA\*) to decide cascade required/forbidden, batch, async (GEPA1–GEPA8). |
| **EPA-P4** | Write cascade rules: target collections, fields, optional `body` replace, type filters if needed (**CAS-M1**–**CAS-M7**). |
| **EPA-P5** | Apply validation, types, index, batch, async, logging, error policy rows (EVL-\*, MCI-\*, EXE-\*). |
| **EPA-P6** | Integrate: after successful SSoT update, trigger cascade without awaiting in the HTTP/controller path (**EXE-M2**, **EXE-N2**). |
| **EPA-P7** | Keep the registry row contract and cascade module updated in the same change when collections or denormalized fields change (**EDM-M8**). |

Violation of any cited row in **EPA-P**\* is a bug — must not ship ([shared **C4**](../_meta/agent-contract.md), applied by each part file's **C2** row — **EDM-C2**, **CAS-C2**, **EXE-C2**, **EVL-C2**, **MCI-C2**).

---

## Implementation checklist (blueprint — legacy §9)

| # | Check |
|---|--------|
| 1 | Domain cascade module exists; functions grouped under one module (**CAS-M1**). |
| 2 | Per attribute: update `data.\*` and, when `body` is user-visible, apply `body` replace with word boundaries (**CAS-M2**–**CAS-M4**). |
| 3 | Type targeting when one field serves multiple entity kinds (**CAS-M5**). |
| 4 | Batch: chunks obey the configured **EPA-T1**; no unbounded `Promise.all` over all chunks; paging by a unique-key cursor, never `skip`, when the write removes documents from the filter (**EXE-M1**, **EXE-N1**, **EXE-M6**). |
| 5 | All update flows trigger cascade; call sites documented (**CAS-M8**). |
| 6 | Cascade not `await`ed from request path (**EXE-N2**). |
| 7 | Logger records entity, tenant, updated count (**EXE-M3**). |
| 8 | Cascade failure: SSoT not rolled back; idempotent completion documented (**EXE-M4**, **EXE-M5**). |
| 9 | Copies and copy targets named in the registry row contract (**EDM-M5**, **EDM-M8**). |
| 10 | Shared types for cascade inputs/outputs (**EVL-M1**). |
| 11 | Zod (or project equivalent) on cascade parameters (**EVL-M2**). |
| 12 | Indexes verified/added for cascade filters (**MCI-M1**, **MCI-M2**). |
| 13 | Migration: value-only cascade without new required schema fields needs no migration script (**EVL-M4**). |

# SSOT governance — config-driven categories (**KAT-1** to **KAT-4**)

```kit-cover
type: normative
part-of: README.md
binds: KAT-1–KAT-4 config-driven category obligations (SSG-K1–SSG-K4)
open-when: signal:guard-config, signal:protected-field, signal:model-mutation, signal:new-semantic
skip-when: signal:no-ssot-surface
owns: KAT-1, KAT-2, KAT-3, KAT-4, SSG-K1-1, SSG-K1-2, SSG-K1-N1, SSG-K2-1, SSG-K2-2, SSG-K2-N1, SSG-K3-1, SSG-K3-2, SSG-K3-N1, SSG-K4-1, SSG-K4-2, SSG-K4-N1
```

Scope

- Included: **KAT-1** Single writer, **KAT-2** Single caller, **KAT-3** Model mutation access, **KAT-4** Derived data integrity — every admitted member is a syntax-tree lint registration whose question is *"is this SSOT-owned surface used outside its owner's files?"*: a **KAT-2**/**KAT-4** member is a row of one usage-boundary table rule, a **KAT-1** field or **KAT-3** model a row of one write-ownership table rule — one rule per question, because the write question has its own surface vocabulary (update operators and bodies, hydrated documents, model write methods) that the usage question never needs (**SSG-K1-2**, **SSG-K3-2**; see [guard and agent](ssot-guard-and-agent.md) **SSG-G-1**, [**ENA-R3**](../enforcement-architecture/enforcement-authoring.md)). Members registered before a write table exists may run on its engine through migration adapters until they become rows; no line-scanning config motor is kept alongside the rules.
- Excluded: **KAT-5** and **KAT-6** — [convention-driven categories](ssot-categories-convention-driven.md).
- Band set: this entry file and [ssot-categories-config-driven-2.md](ssot-categories-config-driven-2.md) (the **SSG-M8** applications at a **KAT-3** authority's consumers).

Document type: Normative — **SSG-K1**-\* through **SSG-K4**-\*.

References: [Principles and precedence](ssot-principles-and-precedence.md); [Precedence and enforcement](ssot-precedence-and-enforcement.md) (**SSG-P1**, **SSG-P2**); [Guard and agent](ssot-guard-and-agent.md); [Enforcement architecture](../enforcement-architecture/README.md) (**ENA-A1**, **ENA-N2**, **ENA-R8**); [Error policy](../error-policy/error-policy.md).

Why a lint table, not a line-scanning guard: a configuration-driven script motor that matches one source line at a time does not fire on a formatted multi-line update body (the operator on one line, the field on the next) while the gate reads green, and its context-pattern and annotation exemptions excuse only declaration lines, which a syntax-tree predicate does not report in the first place. Moving such entries to a usage-boundary table rule and a write-ownership table rule is done with no loss of findings — every previously authorized site surfaces again and carries a reasoned, rule-scoped suppression or row-scoped allow comment — and the old motor is then removed ([**ENA-LC3**](../enforcement-architecture/enforcement-gates-and-lifecycle.md)).

Project binding: the adopting project records, in its own enforcement documentation, the rule names, the row-table locations and the row-scoped allow-comment syntax for the usage-boundary and write-ownership rules; a disable directive naming either rule, or naming no rule, is an unsuppressible finding of the project's scoped-suppression rule ([**ENA-R8**](../enforcement-architecture/enforcement-authoring.md)). Migration adapters are retired with their last registration: once every **KAT-1** field and **KAT-3** model is a row, no adapter path remains.

---

## **KAT-1** — Single writer

Definition: Only listed files may write a protected field.

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SSG-K1-1** | A write to a protected field — every update surface the shared predicate knows (operator key, operator-less or replacement body, variable-built body, bulk operation), a hydrated assignment (`=`, compound, `++`, `set(path)`) and, where the row names it, in-place array mutation — is allowed only in the writer files its row declares. Where another model uses the same field name, the row names its model and counts only writes whose call receiver resolves to that model (or, for document writes, files that import it) — a syntactic receiver check, not a type query. | Lint error — merge blocked. | Write-ownership table rule row. |
| **SSG-K1-2** | A new protected field whose check passes [**ENA-A1**](../enforcement-architecture/enforcement-admission.md) is registered before merge, proven by [**FP-M20**](../false-positive/check-verification-rules.md), as a row of the write-ownership table rule declaring the field, its write surfaces, its writer files and its registry authority — never a rule per field ([**ENA-N2**](../enforcement-architecture/enforcement-anti-patterns.md)) and never a copy of the shared predicate; no line-scanning config entry is added (see the paragraph below the table). A field another rule already fences gets no second registration ([**ENA-N18**](../enforcement-architecture/enforcement-anti-patterns.md)). A field absent from both the strict persistence schema and the document type gets no row either: the schema drops the update path and the hydrated assignment does not compile — a stronger mechanism ([**ENA-A4**](../enforcement-architecture/enforcement-admission.md)). | Merge blocked — missing registration (**SSG-A-1**). | PR review + lint gate. |

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SSG-K1-N1** | Must not write a protected field outside its registered writer files without a line suppression carrying a verified reason — forbidden. | Lint fail / bug. | Write-ownership table rule row. |

Stated limit ([**KIT-INV-8**](../authoring/kit-structural-invariants.md)(b)) — writer files and owner globs are a file-identity predicate. They answer *"is this file on the list"*, never *"is this write reachable only from the listed authority"*. They therefore go stale the moment an authority keeps its decision, validation and gating but moves the physical write behind a persistence seam (a repository function, a single-statement adapter): the rule reports the authority's own implementation. Nothing in the row separates that from a genuine second writer, because the separating fact — the seam's caller set — is cross-file. Resolve it by measuring the caller set (every importer of the seam is the listed authority) and then placing a reasoned line suppression (for a table rule, the row-scoped allow comment — [**ENA-R8**](../enforcement-architecture/enforcement-authoring.md)) at the seam's line with a reason naming that caller. Do not widen the writer set to the seam file: that authorizes every present and future write of the field in it — the rule edit the false-positive policy forbids ([**FP-M20**](../false-positive/check-verification-rules.md)). Widening stays correct only where the seam is genuinely a new authorized authority, at narrowest scope (**SSG-A-2** / **SSG-N12**). A computed key (`{ [k]: v }`) and an update body built in another file are not visible to a single syntax tree; they stay review-bound.

Where the check lives, and how its writer set is re-derived. A stored field's closed writer set is decidable from one file's syntax tree, so it is an AST lint rule, not a line-scanning config entry; a line motor cannot see an update body that the formatter splits across lines, and the entry then reads as covered while the likeliest second writer passes. When such an entry moves to the AST rule, do not copy its `allowedPaths`: run the AST predicate with an empty writer set over the governed trees and derive the set from what fires. The old list is neither complete nor minimal — typically one entry lacks a registered writer the line motor never saw, and another carries directory and context allowances that no write uses. Each surviving writer is named by its registry authority; each dropped allowance is recorded as dropped, not silently lost. The empty-set run also tests the predicate: a writer the authority is known to have that does not fire is a written form the predicate cannot see — for example a model hook's hydrated increment call stays invisible until the shared predicate learns that form. The rule reads its update-operator and write-method vocabulary from the one shared predicate module and lists no operator or method name itself (**FP-M29**(b)); a dotted sub-path (`'field.sub'`) is a write to the root field. When the last config entry of the family has moved, retire the entry list and its engine in the same change (**DCD-M2**): an engine scanning an empty list reports the category as covered while checking nothing.

---

## **KAT-2** — Single caller

Definition: SSOT functions may be called only from allowed locations.

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SSG-K2-1** | A call of a registered SSOT function — by its name or through an import alias of it — occurs only in the row's owner files. Declarations and imports are not calls. | Lint error — merge blocked. | Table rule row. |
| **SSG-K2-2** | A new single-caller SSOT function, where [**ENA-A1**](../enforcement-architecture/enforcement-admission.md) admits the check, gets a uniquely identified row with its names, owner globs and authority before merge. | Merge blocked. | PR + lint gate. |

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SSG-K2-N1** | Must not call a registered SSOT function outside its owner files — forbidden (duplicate SSOT). | Lint fail / bug. | Table rule. |

Stated limit: the row matches by name; a re-implemented copy under another name is a parallel authority that only review and [**SSG-M8**](ssot-principles-and-precedence.md) catch ([**ENA-N3**](../enforcement-architecture/enforcement-anti-patterns.md)).

---

## **KAT-3** — Model mutation access

Definition: Mutations on listed models run only from allowed files. Read operations (`find`, `findOne`, `aggregate`, etc.) are out of scope for this KAT unless a row extends it.

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SSG-K3-1** | A call of a write method from the shared vocabulary on a listed model (the model resolved by name and import provenance), a `new Model(...)` birth or a driver-collection write on a receiver bound to the model occurs only in the writer files its row declares (the model's own schema file is exempt). When only a subset of the vocabulary is owned — for example irreversible deletes of a money-bearing model while updates stay open — the row names that subset, taken from a named export of the shared vocabulary; such a row does not own `new Model(...)` births. | Lint error — merge blocked. | Write-ownership table rule row (model-write surface). |
| **SSG-K3-2** | A new model mutation restriction that passes [**ENA-A1**](../enforcement-architecture/enforcement-admission.md) is registered before merge as a model-write row of the write-ownership table rule declaring the model file, its writer files and its registry authority — never a rule per model ([**ENA-N2**](../enforcement-architecture/enforcement-anti-patterns.md)), never a hand-written method list (**FP-M29**(b)), and no line-scanning config entry. | Merge blocked. | PR + lint gate. |

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SSG-K3-N1** | Must not run model mutation APIs outside the registered writer files — forbidden. | Lint fail / bug. | Write-ownership table rule row (model-write surface). |

Where the check lives. Which file calls a model's write method is one file's syntax tree, so it is an AST lint rule that reads the one shared write-method vocabulary (**FP-M29**(b)) and derives its writer set from an empty-set run, as for **KAT-1** above. A line pattern per entry drifts: hand-written method memberships diverge between entries and keep naming methods the installed driver no longer defines, and a split line, a bulk write, a driver-collection write, a `new Model(...)` birth and an aliased import are all invisible; an empty-set run typically finds registered writers (a cascade delete, a reconciler) no entry listed, and allowances no write uses. The model is recognised by name and by import provenance. Stated limit ([**KIT-INV-8**](../authoring/kit-structural-invariants.md)(b)): a hydrated document's `save()`/`deleteOne()` and a model passed through a variable or parameter need the receiver's type, which one file's tree lacks — review.

Consumers of a **KAT-3** authority — an operator or maintenance script, and identity erasure — are two **SSG-M8** applications in the second band, [ssot-categories-config-driven-2.md](ssot-categories-config-driven-2.md).

---

## **KAT-4** — Derived data integrity

Definition: Derived values must come from the authorized computation, not a known stale shortcut form.

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SSG-K4-1** | A row names one syntactic derivation form that is known to produce a second answer (for example an identity lookup with the wrong key kind, or an embed populate that bypasses the snapshot owner); the form is allowed only in the owner files. Context heuristics ("the correct helper appears nearby") are not a predicate. | Lint error — merge blocked. | Table rule row. |
| **SSG-K4-2** | A new "no stale derivation" rule that passes [**ENA-A1**](../enforcement-architecture/enforcement-admission.md) gets a uniquely identified (or class-named) row with the form, owner globs and authority before merge. A form another rule already fences gets no row. | Merge blocked. | PR + lint gate. |

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SSG-K4-N1** | Must not use a registered stale derivation form outside the authorized owner — forbidden. | Lint fail / bug. | Table rule. |

Stated limit: a derivation rewritten into a different syntactic form (another arithmetic spelling, a helper under a new name) escapes the row; the authority helper plus review is the protection.

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|---------------------|
| The rule reports a violation in new code | Fix the implementation, or edit the row per [guard and agent](ssot-guard-and-agent.md) when the authority itself changed — never merge a red lint gate. |
| An owner glob matches no file | The rule fails loud at load; remove or realign the glob in the same change (**SSG-N12**). |
| Row missing for a new protected surface whose check was admitted | STOP — add the row before merge (**SSG-K1-2**, **SSG-K2-2**, **SSG-K3-2**, **SSG-K4-2**). |
| New protected surface whose check was not admitted | Stated limit in the owning rule ([**ENA-GV3**](../enforcement-architecture/enforcement-admission.md)); no row. |

---

Part of: [README.md](README.md).

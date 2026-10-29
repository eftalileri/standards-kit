# SSOT governance — guard architecture and agent registration

```kit-cover
type: normative
part-of: README.md
binds: SSG-G guard architecture, SSG-A agent registration and SSG-N11–SSG-N17 prohibitions
open-when: signal:guard-config, signal:guard-authoring, signal:new-semantic, shape:mechanical-enforcement
skip-when: signal:no-ssot-surface
owns: GSS1, GSS2, GSS3, GSS4, GSS5, GSS6, SSG-A-1, SSG-A-2, SSG-A-3, SSG-A-4, SSG-G-1, SSG-G-2, SSG-G-3, SSG-G-4, SSG-G-5, SSG-N11, SSG-N12, SSG-N13, SSG-N14, SSG-N15, SSG-N16, SSG-N17
```

Scope

- Included: Check layout (**KAT-1**–**KAT-4** lint rows and registrations vs convention-driven checks), agent registration procedure for **KAT-1** to **KAT-4**, forbidden behaviors, and decision gates for routing new SSOT work.

Document type: Normative — SSG-G-\*, SSG-A-\*, **SSG-N11**–**SSG-N17**, GSS\*.

References: [Principles](ssot-principles-and-precedence.md); [Config-driven categories](ssot-categories-config-driven.md); [Convention-driven categories](ssot-categories-convention-driven.md). Example row and registration shapes: [`../_meta/examples/ssot-guard-config-shape.md`](../_meta/examples/ssot-guard-config-shape.md) (non-normative).

---

## Guard architecture (normative)

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SSG-G-1** | Project SSOT standards in this hub are normative; **KAT-2**/**KAT-4** surfaces are rows of one table-driven lint rule (the adopting project's usage-boundary rule), and a **KAT-1** field or **KAT-3** model is a row of one write-ownership table rule (the adopting project's write-ownership rule; migration adapters are retired with their last registration — **SSG-K1-2** / **SSG-K3-2**). A member whose predicate the row schema cannot express — for example one that needs the type checker to tell a document receiver apart — stays its own rule under [**ENA-R8**](../enforcement-architecture/enforcement-authoring.md) and says why in its header. A new member is a row, never a new rule body, adapter or guard ([**ENA-N2**](../enforcement-architecture/enforcement-anti-patterns.md)); no line-scanning config motor is kept alongside the rules. The rule body is never edited to whitelist one file — a verified FP takes a reasoned line suppression (for the table rule, the row-scoped allow comment — [**ENA-R8**](../enforcement-architecture/enforcement-authoring.md)). | Bug — merge rejected. | Review + lint gate. |
| **SSG-G-2** | A usage-boundary row names the surface (authority call, second definition of an authority function, derivation form) and the owner's file globs; a write-ownership row names the field or model, its write surfaces and its writer files. Each rule reports any use outside the owner and fails loud at load when a declared path matches no file. | N/A — design contract. | Rule header + table. |
| **SSG-G-3** | **KAT-5** convention motor must live in a dedicated check invoked from the blocking gate. Name it by what runs, never by what used to run: a retired script's filename is not an address — a reader who looks it up finds nothing and cannot tell "not enforced" from "I searched wrong". Where no such check exists yet, the row states the absence and what a check would need, instead of naming a file. | Enforcement gap — STOP if missing from the project's required blocking gate. | The project's gate configuration; the gate's own registry lists the check by its live name, or the row declares the absence. |
| **SSG-G-4** | **KAT-6** is enforced by the optimistic-mutation lint rules (rollback context on error, row bridge on success); a parallel line-regex motor for the same class is not kept ([**ENA-N18**](../enforcement-architecture/enforcement-anti-patterns.md)). Review blocks the remaining optimistic anti-patterns. | Process bug if the rules are off. | Lint gate + review. |
| **SSG-G-5** | A hand-maintained DERIVED VIEW of a record register — a plan index, a board, a status table — is a reader, never a second status writer ([**SSG-M8**](ssot-principles-and-precedence.md)); where both sides are hand-edited, their parity **MUST** be fenced by the guard that ALREADY reads the register's live and retired identity sets, not by a new one. The drift is one-directional and therefore invisible: a record is closed and retired, the derived row survives, and finished work reads as open work — the reader cannot tell a stale row from a live one, so the view silently outranks the authority it derives from. Bind the predicate to the column the table's own HEADER labels as the worklist, and derive that column index from the header row — never a fixed index, and never the row's prose. Such documents deliberately carry historical sentences ("closed in that round", "its identity is in the retired ledger"); a prose-scanning predicate flags every one of them, is silenced on its first run, and takes the real findings with it — while a fixed column index reads the wrong cell the moment the table shape changes. Carry a gap fence: if the scan finds files but zero header-labelled worklist tables, that is a violation, not a pass — otherwise a renamed label or a moved view leaves the check green without reading one identity. Mechanism: the predicate compares three documents (derived view, live register, retired ledger), so it is cross-file residue ([**FP-MS4**](../false-positive/mechanism-selection.md)) — and where the view is a document format the linter has no configured parser for, it is not single-file decidable for the linter at all ([**FP-MS5**](../false-positive/mechanism-selection.md)).  | Bug — the derived view is a second status authority. | The check names the label set it derives the column from, the gap fence, and the three [**FP-M20**](../false-positive/check-verification-rules.md) proofs over the real tree. |

Failure path: If the full gate does not run lint and guards before release, treat as **SSG-G-3** / **SSG-G-4** gap — STOP until fixed.

---

## Agent registration procedure (**KAT-1** to **KAT-4**)

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SSG-A-1** | When a new SSOT surface falls in **KAT-1**/2/3/4 and [**ENA-A1**](../enforcement-architecture/enforcement-admission.md) admits a check, the agent must select the category; for a **KAT-2**/**KAT-4** surface allocate a unique row id under the project's id policy and append a row to the usage-boundary table rule; for a **SSG-K1-2** field or **SSG-K3-2** model allocate a unique row id the same way and append a row to the write-ownership table rule (**SSG-G-1**) — never a new rule, a migration-adapter registration, a guard or a copied predicate — and prove it ([**FP-M20**](../false-positive/check-verification-rules.md)). Not admitted: a stated limit ([**ENA-GV3**](../enforcement-architecture/enforcement-admission.md)). | Merge blocked — incomplete registration. | PR + gate log. |
| **SSG-A-2** | When updating a row's owner globs or a registration's writer files, the agent must edit the existing row or registration and prove it as in **SSG-A-1**. | Same. | Same. |
| **SSG-A-3** | When removing a row or registration, the agent must delete it and every allow comment or suppression naming it, per [**ENA-LC5**](../enforcement-architecture/enforcement-gates-and-lifecycle.md). | Same. | Same. |
| **SSG-A-4** | **KAT-5** and **KAT-6** require no row; the agent must still implement handler and mutation code per [convention-driven](ssot-categories-convention-driven.md) rows. | Bug if code violates convention. | Project checks + review. |

---

## **MUST NOT** — forbidden behaviors (guard and process)

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SSG-N11** | Must not introduce an SSOT field or function without a **KAT-1**/2/3/4 row (a **SSG-K1-2** field or **SSG-K3-2** model: a row of the write-ownership table rule) when that category applies and **SSG-A-1** admits a check — forbidden. | Merge blocked / bug. | Review + project gate. |
| **SSG-N12** | Must not widen a row's owner globs or a registration's writer files without review and without narrowest-scope justification — forbidden. Nor may it be left un-narrowed: an entry matching no file in the scanned tree is removed in the same change that deletes or renames the writer it named. A dead entry costs nothing today, so nothing reports it, yet it is a silent future exemption — a file re-created under that name inherits write access with nobody deciding so, and the single-writer claim reopens to a second writer (**SSG-M8**). Mirror of [**SSG-R2**](ssot-registry-rules-and-protocol.md)'s "authority GAINS a file": that case is silent because the list does not grow; this, because it does not shrink. Stated limit ([**FP-M25**](../false-positive/check-verification-rules.md)): only *reachability* is mechanized. Whether an allowlist's cardinality contradicts the singularity the citing registry row claims in prose is not checked — that sentence carries no machine-readable scope (a row may claim one authority for a *command* while the rule guards a *field*), so the predicate fires on correct rows. | Review rejection / bug; silent SSoT reopening. | PR review + the rules' load-time reachability check. |
| **SSG-N13** | Must not bypass **KAT-5** with `req.body as Type` (or equivalent) — forbidden. | Check fail / bug. | **KAT-5** check + review. |
| **SSG-N14** | Must not add optimistic cache entries without cleanup and bridge rules per TanStack SSOT — forbidden. | Bug / review reject. | **KAT-6** lint rules + review. |
| **SSG-N15** | Must not change rule code to hard-code a one-off file exception — use the row and the row-scoped allow comment — forbidden. | Compliance failure. | Audit. |
| **SSG-N16** | Must not create two conflicting rows for the same protected symbol — forbidden (**SSG-P1-2**). | Load-time table validation. | Validator. |
| **SSG-N17** | Must not document **KAT-5** as “static only” and omit runtime use of `parse` / `safeParse` `.data` — forbidden (**SSG-P2**). | Bug. | Review + tests. |

---

## Decision gates (normative index)

Purpose: Binary routing for new SSOT work. Cite SSG- / KAT rows only.

| Gate | Proceed only if YES | Binding rule IDs | If NO |
|------|---------------------|------------------|-------|
| GSS1 | New protected mutable field — single writer policy needed | **SSG-K1-2**, **SSG-A-1** | Do not add field without **KAT-1** plan |
| GSS2 | New canonical function — single caller policy needed | **SSG-K2-2**, **SSG-A-1** | Do not add function without **KAT-2** plan |
| GSS3 | Model mutations must be restricted to authorized paths | **SSG-K3-2**, **SSG-A-1** | Use **KAT-3** registration |
| GSS4 | Stale derivation must be blocked | **SSG-K4-2**, **SSG-A-1** | Use **KAT-4** registration |
| GSS5 | Handler accepts raw request payload | **SSG-K5-1**–**SSG-K5-5** | Establish one validation barrier and pass only validated output |
| GSS6 | Mutation uses optimistic `setQueryData` | **SSG-K6-1**–**SSG-K6-6**, TanStack MUT-\* | Align with [mutations-cache-sync](../tanstack-query/mutations-cache-sync.md) |

---

## Stated enforcement limits — authority classes no mechanism here decides

A registry row whose enforcement cell says only `review` is read as *"nobody has looked yet"*. For the four classes below nobody ever can, with the mechanisms a repository of this shape has, and the cell must say which class it falls in — [**KIT-INV-8**](../authoring/kit-structural-invariants.md)(b): where a rule genuinely cannot be mechanically enforced, say so in the rule, naming what a check would need and why the repository lacks it.

Before declaring any limit, take the higher rungs of [**ENA-P1**](../enforcement-architecture/enforcement-admission.md) and the search of [**ENA-A4**](../enforcement-architecture/enforcement-admission.md): a concern moved into the contract-producing file so the invalid call fails to compile ([**FP-MS4a**](../false-positive/mechanism-selection.md)), or a class already locked by an enforcer found by predicate on the effective configuration ([**FP-MS9**](../false-positive/mechanism-selection.md)), is not a limit. Only what survives both is. Adding a file to an enforcer's path list is not coverage when the enforcer needs a per-file data entry to do anything: without it the check returns nothing and is indistinguishable from a clean tree ([**FP-M22**](../false-positive/check-design-rules.md)(d)).

A limit is usually PARTIAL, and the honest cell says which half. Most rows in these classes have one half closed by the compiler or by a running check and one half open. Naming only the open half understates the protection; naming only the closed half overstates it. Write both.

| Class | (a) What cannot be enforced | (b) What a check would need | (c) Why this tree cannot supply it |
|-------|-----------------------------|-----------------------------|------------------------------------|
| 1 — cross-file absence | *"This is the ONLY producer/writer/caller of X"*, and its mirror *"this call happens at EVERY site where the triggering fact occurs"* (mount-time, transition-time, prefetch-set, single-pipeline claims). | For the *only* half: a whole-tree oracle for semantic equivalence — two functions may compute one value with no shared syntax. For the *every* half: a machine-readable marker saying *"this function IS a transition of that kind"*. | Absence is not a property of any single file's syntax tree, so no lint rule reaches it; the equivalence and the trigger claim live in prose in each authority's header, in no form a tool reads. A closed reason/scope union proves the call is made correctly; it never proves it is made at all. |
| 2 — authority outside this repository | Any parity between a value here and its real owner elsewhere — a sibling repository outside this checkout, or an external provider console. | The other side, present in this checkout in a machine-readable form: a mirrored source tree, or a committed export of the console configuration. | It is not here, by construction. Mechanism availability is measured from the production linter configuration ([**FP-MS5**](../false-positive/mechanism-selection.md)); a file outside the checkout is outside every configuration. Enforcement is possible only in the owning repository, under its own registration. A fixture standing in for the external side is worse than the gap: it makes a fake proof path. Where the claim is single-file decidable there (for example "only this file writes cookie X"), first measure which gate runs the owning repository's linter — its own scripts, its deploy build — then admit the fence there ([**ENA-A1**](../enforcement-architecture/enforcement-admission.md)) and name the rule, its row and that gate in the registry cell here; the row then leaves this class. |
| 3 — value origin | *"This boolean/string is proof that it came from the canonical seam"* — a flag whose meaning is not its value but its provenance. | Provenance carried by the value itself. | A syntax tree carries a value's type, never its history, and the producing seam is in another file. This class is the standing **FP-MS4a** candidate: the repair is not a check but a type — make the flag an opaque/branded witness only the canonical seam can mint, and a wrong `true` stops compiling. Until then the claim is review. |
| 4 — product logic and behavioral contracts | *"These three booleans are the correct readiness rule"*, *"this error maps to that recovery flow"*, *"this warmed set equals the reachable set"*. | A machine-readable twin of the product rule, the error→flow binding, or the navigation graph. | The twin does not exist, and writing one would create a second authority for the same condition — the failure [**SSG-M8**](ssot-principles-and-precedence.md) and [**FP-MS4**](../false-positive/mechanism-selection.md) forbid. A rule re-deriving the logic would not verify it, it would restate it. The registry-carried half (an error code's status/category/message key) is closed; the binding to a client flow is not. |

The adopting project records its own evidence for each class, and any explicit owner decision, beside the applicable authority. A recorded owner decision to leave a single-file-decidable sub-condition unaudited is not a technical limit: only a later owner decision closes it, and the row must not present the decision as a technical impossibility.

---

## Related standards (non-normative index)

| Legacy / topic | Relation |
|----------------|----------|
| [Payment SSOT](../payment-ssot/README.md) | Payment SSOT — **KAT-1** / **KAT-2** application |
| [Editable persistent attributes](../editable-persistent-attributes/README.md) | Editable persistent fields — **KAT-1** |
| [SSOT readiness](../ssot-readiness/ssot-readiness-and-form-data.md) | Form readiness SSOT — **M11**–**M15**, **C10**–**C12**; backend field writes still **KAT-1** / hub |
| [TanStack Query](../tanstack-query/README.md) | **KAT-6** detail — MUT-, invalidation, bridge |

---

Part of: [README.md](README.md).

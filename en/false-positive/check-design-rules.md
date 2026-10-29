# False positive prevention — check design rules (normative)

```kit-cover
type: normative
part-of: README.md
binds: narrow invariants, rollout integrity, predicates, operand semantics, declaration tables and location resolution
open-when: shape:mechanical-enforcement, signal:new-lint-rule, signal:new-guard, signal:check-rollout, signal:suppression-review
skip-when: signal:no-enforcement-change
owns: FP-M17, FP-M18, FP-M19, FP-M31, FP-N12, FP-N13, FP-N14, FP-N21, FP-M22, FP-M39, FP-N17, FP-M40, FP-N23, FP-M41, FP-M42, FP-N24, FP-M23, FP-M38, FP-N18, FP-N22
```

**Keywords:** predicate quantifier, composite expression, disjunction, conjunction, De Morgan, silent zero, specimen, declaration table, hand-maintained list, membership audit, derived subject set, coupled obligation, precision layer, predicate discipline, location value resolution

Scope: Narrow invariants, staged rollout and required-set integrity.

Document type: Normative part — **FP-M17**–**FP-M19**, **FP-M31**, **FP-N12**–**FP-N14**, **FP-N21**.

References: [README.md](README.md) — topic map; [rules.md](rules.md) — definitions, output and failures.

---

## **MUST** (normative) — FP-M

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-M17** | A source-shape rule or guard **MUST** name the concrete regression it blocks and explain why contract or behavior verification alone cannot enforce that regression. It **MUST** target the narrow invariant, not freeze the exact complete function/module source, serialized AST identity, or source hash. | Reject an unexplained, whole-shape, refactor-hostile, or freeze-breaching action. | Description/scope review. |
| **FP-M18** | A new check **MUST NOT** absorb existing debt at warning severity. Roll it out as a staged ratchet: (a) governed scope only widens, severity stays blocking, each candidate subtree is measured separately and admitted only at zero baseline; record residual paths with file/line/call and closure order at the scope declaration. (b) Exemptions only shrink; an entry no longer violating fails the run, as does declared-count/actual-count disagreement. (c) The ceiling is a constant in check source, not its data, and only decreases. One dated raise is allowed only by the check's owner, once, when every admitted finding is a measured false positive and fixing the correct source would regress it. An agent cannot raise it to make a gate green. | Reject warning debt floors, shrinking scope, growing baselines, data-owned ceilings and unmeasured scope extensions. | Inspect scope/severity history and source ceiling; observe dead-entry and count-mismatch failures. Each admitted subtree has a zero baseline; the residual closure order is recorded. |
| **FP-M19** | Every derived required input **MUST** fail loud before comparison when empty or unreachable: keys, locales, files, rules and inventories included. Missing external/environment inputs cannot share a success exit with measured-clean inputs; a warning is not gating. Member reads are included: report the count actually read, never merely enumerated; count/report unreadable or genuinely absent members, or fail, never silently skip or truncate a loop. A contract whose breach includes disappearance is asserted positively: demand that the required construct was seen, anchored on provenance rather than name. | STOP — CI **MUST** fail; silent success is missing coverage. | Inspect each integrity/exit branch and its named input; observe absence and unreadable-member failures. A tooling-only bail-out check was declined under **ENA-A3**/**ENA-N10** and **ENA-A5**(ii), because its suppressions outnumbered genuine defects. |
| **FP-M31** | Every entry in a check's EXEMPTION or ACCOUNTING record **MUST** be one the check's MAIN PATH actually CONSULTS — an entry the main path never reaches is a DEAD exemption. A check accumulates two kinds of hand-kept data: entries that excuse a finding, and entries that account for a case as already handled. Both are read by a human as *"this one is covered"*. But where the main path skips the subject before the record is ever consulted — a global filter applied first, an early `continue`, a branch that returns ahead of the lookup — the entry is never reached: the check stays green, the record still names the case, and nothing distinguishes that from real coverage. This is **FP-M19**'s emptiness defect one level down — not an empty *set*, but a populated set no comparison ever touches — and it is the more durable of the two, because the record sits in the repository looking maintained. Three obligations bind. (a) Prove consultation from the check's OWN flow. The check records which record keys its main path actually consulted during the same run, and fails on any key that set does not contain. (b) Do NOT open a second list. That consulted-key set is *derived* from the run in progress; a hand-maintained "keys we expect to consult" list is a second authority for the same fact and drifts the day the main path changes ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md)) — which is the very defect this row exists to surface. (c) An unreached entry FAILS — it is not warned about and not silently pruned. Failing forces the author to decide which of the two is true: the main path is wrong to skip the case, or the record entry is obsolete. Auto-pruning answers "obsolete" without asking, and that answer is wrong in exactly the case where the skip is the bug. *Measured shape: a field-scope guard whose main path `continue`d on every field belonging to a global masking set, so one entry of its accounting record was never evaluated — green check, dead entry, and a reader who believed the field was covered.* | Reject — a record entry the main path cannot reach; the check publishes coverage it does not perform. | The check derives its consulted-key set from its own main path in the same run and exits non-zero naming every record key absent from that set; the consulted set has no second, hand-written definition. |

---

## **MUST NOT** (normative) — FP-N

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-N12** | Freeze an entire production function/module by exact source text, serialized AST identity, or hash when a narrower invariant can express the regression. | Reject — violates **FP-M17** and creates a quality-ratchet regression. | Static review of rule/guard constants and match scope. |
| **FP-N13** | Open a new check at warning severity to accommodate existing debt, shrink an already-governed scope, let an exemption baseline grow — absent the dated, one-time owner raise **FP-M18**(c) admits — or store the exemption ceiling inside the data file it bounds (**FP-M18**). | Reject — quality-ratchet regression. | Scope/severity history plus ceiling-location review. |
| **FP-N14** | Let a derived required set, language/locale set, file set, or path inventory read empty — or an input go unreached, or a printed warning stand in for a measurement — and continue with a success exit code (**FP-M19**). | CI **MUST** fail — silent false green. | Emptiness-branch review on every derived input. |
| **FP-N21** | Keep an entry in a check's exemption or accounting record that the check's own main path never consults — or answer an unreached entry with a warning, a silent prune, or a second hand-written list of the keys the run is expected to reach (**FP-M31**). | Reject — dead exemption: documented coverage the check does not perform. | Consulted-key derivation review — the set comes from the run itself, and every record key appears in it. |

---

## False positive prevention — predicate discipline and the witness it rests on (normative)


Document type: Normative part — **FP-M22**, **FP-M39**, **FP-N17**.


---

## **MUST** (normative) — FP-M

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-M22** | A check **MUST** express the guarantee it protects, not the shape the code has today. (a) No count, length or exact-shape equality where presence or superset expresses the invariant: correct growth must not turn it red. (b) A text or policy contract is verified by observed behaviour, never by matching the document's wording. (c) A derived set follows the authority, not the file it lives in today — walk the registration tree from its root so relocating a registration cannot change the answer; a wrong derivation is never answered with exception entries. (d) A prohibition's zero findings prove nothing until a violation in the authority's exact current form is watched to fire; a require-shaped check's zero is proof of sight, and a defect that *removes* a guarantee needs a require-shaped predicate. (e) A witness that is a graph closure is recorded with its transitive and direct-edge counts where the predicate is defined; a closure that is a large multiple of the direct edge is re-anchored on the direct edge. (f) A predicate on an imported binding classifies every reference of that binding — alias, reassignment, computed key, `call`/`apply`/`bind`, hand-off, re-export, the package's other entry points — and rejects an unclassified position; the entry points are one closed set in one module every consumer imports ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md)). Reason: a predicate that measures spelling either alarms on correct code or stays green while the guarantee dies. | Reject the check; a false alarm produced this way is a bug in the check and is never suppressed. | The predicate names its invariant in one sentence; the reviewer names the legitimate change considered and, for a prohibition, what the check was watched to flag (one fire per evasion shape for (f)). Stated limits: (e) is review-held — it needs the check's traversal semantics, which no file property carries; (f) does not reach a binding whose value escapes the file, a dynamically obtained entry point, a package the closed set does not name, or a shape that is periodic only at runtime. |
| **FP-M39** | Candidate DISCOVERY and the OBLIGATION a check imposes are ONE predicate; widening the first without re-deriving the second is not a fix. A heuristic discovery hides a matching heuristic obligation — a fixed argument position. Dropping a name filter alone can admit many real call sites and produce a wave of findings, none of them a defect. | Reads as an FP storm, gets reverted, gap re-declared unclosable. | Review: derive both from the target's AST in one change. |

---

## **MUST NOT** (normative) — FP-N

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-N17** | Encode a count/length equality (`=== N`) — or any exact-shape predicate — where a presence or superset test expresses the invariant; assert a text/policy contract by matching a document's literal content instead of its observable behavior; or answer the resulting false alarm by suppressing it rather than by rewriting the predicate (**FP-M22**). | Reject — quality-ratchet regression; the brittle predicate blocks correct code and will be disbelieved when it is finally right. | Predicate review naming the invariant and the legitimate change that must not trip it. |

---

## False positive prevention — predicate operand semantics (normative)



Document type: Normative part — **FP-M40**, **FP-N23**.


---

## **MUST** (normative) — FP-M

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-M40** | A composite predicate **MUST** follow the construct's operand quantifier: existential for disjunction, universal for conjunction; negation flips it by De Morgan. A fixed walker fold is blind on the other form. Proof uses the composite itself, not a single operand, with left-only and right-only qualifying cases under both polarities. A more defensive composite must not escape a predicate that sees its simple form. Clauses (e) and (f) below also apply. | Silent false green on a composite or canonical operand. | State the modeled operator and observe every operand-position/polarity specimen under production configuration, using real out-of-tree files. A single-operand proof is insufficient. |

**FP-M40**(e) — a SET-valued operand has two legitimate spellings, and a predicate that reads only the inline one rewards the duplicate it exists to prevent. Where a check asserts that a declared set *contains* a required member, that set may be written as an inline literal list or as a reference to the authority that owns it — and the second spelling is the one the project's own single-authority rules mandate. A predicate that walks inline literals therefore decides correctly on the duplicated copy and reports the canonical form as *missing*. This is worse than a blind spot: the check's message now instructs the author to restore the parallel writer, and it fires precisely when the code is corrected, so the last edit before the red run is the improvement. Three obligations follow. (i) The set operand is resolved through one resolver that accepts both spellings and follows a reference to its declaration; the resolver is the same one the surrounding rules already use. (ii) Where the check file *already imports* such a resolver for a sibling field, a second ad-hoc walk standing beside it is itself the defect ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md)) — two answers to "what are this set's members?" will diverge, and the ad-hoc one is the copy that does not get corrected. (iii) When a structural check goes red immediately after a refactor that removed a duplicate authority, suspect the predicate before the refactor: the check may be right about the shape it looks for and wrong about the guarantee it claims, and reverting the refactor to satisfy it trades an SSoT guarantee for a green run. The specimen rule of **FP-M40**(c) extends here unchanged — a predicate proved only on the inline spelling is unproven for the reference spelling. 

**FP-M40**(f) — the same trap for a SCALAR operand that crosses a module boundary: a reference the single-file AST cannot follow **MUST** be resolved through the type checker before the check declares itself unable to decide, and a still-unresolved operand is a finding, never a silent pass. Moving a literal into one exported constant shared by its two consumers is the single-authority correction; a predicate that resolves only literals and same-file constants then goes silent on exactly the corrected form — unlike (e) it does not go red, so nothing announces the loss. In a type-aware configuration an exported `const` keeps its literal type, so its value is readable from the current file's type information with no cross-file walk ([**FP-MS1**](mechanism-selection.md) — still a single-file rule). (i) Resolve AST first, type second. (ii) "Cannot resolve" reports, because an operand of unknown value cannot be counted as compliant. (iii) Prove it on the imported-constant spelling (**FP-M40**(c)). 

---

## **MUST NOT** (normative) — FP-N

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-N23** | Fold the operand verdicts of a composite construct with a boolean operator chosen by the walker rather than by the construct; treat a negated composite as carrying the same quantifier as its un-negated form; accept a single-operand specimen as proof that a composite-aware predicate sees the composite form; or answer the resulting silent zero by recording the class as fenced (**FP-M40**). | Reject — the check is blind on half its inputs and reports zero while the class stays open; any record, inventory or review conclusion resting on that zero is void. | The specimen set names one case per operand position and per polarity, each measured under the production configuration; the modelled operator is stated in one sentence next to the predicate. |

---

## False positive prevention — declaration tables (normative)



Document type: Normative part — **FP-M41**, **FP-M42**, **FP-N24**.


---

## **MUST** (normative) — FP-M

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-M41** | A hand-maintained table that a check consults for a datum it cannot derive **MUST** have its membership enforced by that check against the check's shape-derived subject set, and **MUST** carry one field per obligation it gates. (a) The check compares its derived subjects with the table and reports a subject absent from it. (b) A declared empty entry ("measured, carries none") is expressible and distinct from absence. (c) Membership never triggers more than one independent obligation: one field per obligation. (d) Each field defaults to *obligation required*; the permissive value is a per-subject exception that states the other route to the guarantee and why one file's syntax tree cannot see it; a field never re-asks a question a universal layer of the same check already asks. A spelling difference is fixed in the predicate; a different route to the same guarantee is a declared exception. Reason: an unaudited table decays one way — new subjects are never added — while the green run reads as complete. | A coverage claim resting on an unaudited table is void. | The record shows the shape-derived subject count from the tool itself, that count against the table, the membership comparison firing on a deliberately undeclared subject under the real gate, and per obligation the field and its measured value. Stated limit ([**KIT-INV-8**](../authoring/kit-structural-invariants.md)(b)): whether a declaration's content is true is the domain knowledge the table exists to hold and is review-held; membership, empty-as-statement and per-obligation separation are mechanical and taken above. |
| **FP-M42** | A DEBT table's entry is justified by the REACHABILITY of the thing it excuses, not by that thing's existence in the tree — and the reachability **MUST** be measured through whatever gate stands in front of it. A ratcheted debt list (**FP-M18**) is populated by a survey, and a survey counts *call sites*: a string literal, a response shape, an emitted identifier. Whether control can ever ARRIVE at that site is a different question, and it is decided one layer up — by a schema, an enum, a type narrowing, an earlier guard that already rejected every input the site was written to catch. An entry admitted on the site's existence alone therefore carries an unverified premise, and the premise is invisible afterwards precisely because the entry *looks* measured: it cites a real `file:line` that a reader can open and confirm. (a) Phantom debt is not merely inert — it inverts the repair. The debt list states a closing action, and the action follows from the premise: *live* prescribes registering, adopting, translating, keeping; *unreachable* prescribes deleting. So the next author, trusting the entry, performs the more expensive half of a fork whose cheap half was correct, and in doing so makes the dead construct permanent by giving it an authority. (b) The ceiling lies in the same direction. A ceiling sized to a phantom population reports headroom that no real obligation occupies, and every later entry measured against it inherits the inflation. (c) Therefore each entry records the gate it was measured THROUGH, not only the site it was measured AT — the schema, narrowing or predicate that stands upstream, with its own `file:line` — and an entry whose upstream gate was not opened is not measured, which **FP-N24** already forbids from sharing a representation with *measured, nothing to declare*. Deleting such an entry is a ratchet step, not a scope reduction: the population it claimed never existed. | Reject the entry and any count, ceiling or closing plan derived from it; a debt table holding an unreachability-unverified entry is unproven, and work prescribed by that entry is presumed to be the wrong half of the fork. | Each debt entry cites both the site and the upstream gate it was measured through, with `file:line` for each, and states the input that reaches the site; on closure the record shows which entries were satisfied and which were deleted as unreachable, and the ceiling is lowered by both.  |

---

## **MUST NOT** (normative) — FP-N

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-N24** | Consult a hand-maintained table from a check that can derive its own subject set without comparing the two; represent "measured, nothing to declare" and "never looked at" with the same absence; gate two independent obligations on bare membership in one table; or answer an unlisted subject by widening the table with an entry whose value was assumed rather than measured (**FP-M41**). | Reject — the table is unproven, every underived subject is presumed undeclared, and any obligation the membership silently imposed is presumed to have blocked the table's own growth. | The check reports an undeclared subject; an explicitly empty declaration exists and is distinguishable in the source; each gated obligation has its own field; every field's value cites the `file:line` it was measured from. |

---

---

## False positive prevention — location value resolution (normative)


Document type: Normative part — **FP-M23**, **FP-M38**, **FP-N18**, **FP-N22**.


---

## **MUST** (normative) — FP-M

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-M23** | A check **MUST NOT** validate a value that names a LOCATION by its form alone — it **MUST** resolve the value relative to the DECLARING FILE and confirm the target exists. A path, file name, directory or module specifier is a *reference*; formal validity proves nothing about the referent. The trap is that a name can be grammatically valid in every context and present in only some — `README.md` is well-formed in every folder and exists in a few — so a format-only predicate returns success everywhere, including where the reference points at nothing. The failure is latent in exactly the way **FP-M19**'s empty set is: the check is green before the defect and green after it is fixed, so its own output can never distinguish the two, and the defect survives every run that was supposed to catch it. Resolution is the whole check: parse, resolve against the declaring file's own directory (not the repository root, not the process working directory), then existence-test the result and give each failure mode its own named code (unresolved / outside the governed tree / self-reference). Which fields are location-valued is derived by measuring the real declarations, never assumed — a field that carries no directory component and no extension across the whole corpus is not one. Non-vacuity is part of the rule (**FP-M19**): the run prints how many targets it actually resolved and reconciles that against the number of declarations, so "resolved nothing" can never read as "all resolved". | Reject — a format-only location check is treated as a missing check, and every field it declared valid is unproven until re-measured with resolution enabled. | A specimen carrying a well-formed but absent target makes the check exit non-zero; each location-valued field has a resolution branch with its own named code; the run output shows resolved-count reconciled against declaration-count.  |
| **FP-M38** | A hand-maintained PERMISSION list is a second authority that decays silently, so every one of its location-valued entries **MUST** be reachability-audited against the set its consuming engine actually scans — completeness, not existence. An allowlist, exemption list or accepted-divergence list *grants* something. An entry that matches nothing today has not stopped granting: it grants to whatever is created under that name tomorrow, and nobody decides at that moment — the singularity claim the rule exists to defend reopens in silence. The entry is therefore a location-valued field under **FP-M23**, with one difference that changes the predicate: the referent set is not "the filesystem" but the file set the consuming engine really walks, because a file the engine never sees cannot use the permission. Where one configuration feeds several engines with different scopes, the audit **MUST** read each engine's own scope — its own root, its own file filter, its own per-rule scan field — since a single shared scan set reports a narrower engine's legitimate entry as dead. Ask *how many entries resolve*, never *do any entries resolve*: a partially measured permission list is the shape that reports clean over a hole. | The rule stays green while its exemption surface rots; a file re-created under a dead name inherits write or call rights that no one granted, and the guard that "audits the allowlist" certifies the half it happens to cover. | Run the audit inside the production configuration, not a fixture. The run **MUST** print, per entry, the size of the scanned set it was measured against, and the totals must reconcile with the configuration's entry count. Land it at a zero baseline only (**FP-M18**): an entry proven dead is deleted in the same change, never baselined.  |

FP-M23 resolution detail: derive candidates from the project's real module-suffix set, never generic `extname()`; a dot in a filename is not a supported extension. Measure the resolver over every real declaring-file/specifier pair and report resolved counts against the authority before claiming wider or narrower reach.

---

## **MUST NOT** (normative) — FP-N

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-N18** | Accept a location-valued field (path, file name, directory, module specifier) as validated because it parses, matches a name pattern, or carries the right extension — without resolving it against the filesystem relative to the declaring file and confirming the target exists (**FP-M23**). Equally forbidden: resolving against the repository root or the process working directory instead of the declaring file; assuming which fields are location-valued instead of deriving that set from the real declarations; and reporting "0 findings" without the resolved-count reconciliation that proves resolution ran at all. | Reject — the field is unvalidated and every "valid" verdict the check issued over it is void until re-measured with resolution enabled. | Resolution branch present per location-valued field and resolved relative to the declaring file; run output shows resolved-count reconciled against declaration-count; an absent-target specimen exits non-zero. |
| **FP-N22** | Delete a permission entry because a scan reported it unreachable — without first resolving what the entry names and proving no live consumer depends on it. An entry is a *grant*: removing one can only tighten, but removing the wrong one converts a permitted call into a violation at the next run, and a bare token may still name a live consumer under a different spelling. Equally forbidden in the other direction: keeping an entry proven dead "in case it comes back", or re-deriving the audit's scanned set from the very configuration being audited (**FP-M38** measures the engine's real walk, not the config's self-description). | Prove per entry: the name resolves to nothing in the engine's scanned set, and a source-only search (excluding dependency trees and declaration files, checking dynamic, barrel and cross-workspace use) finds no consumer. Record the evidence with the deletion. |

Permission-need auditing is declined under FP-M18: a reachable entry on which no matcher fires today is usually still a legitimate grant; deciding need requires each grant's authorized write/call form, not merely whether today's matcher fired.

---

## Derive a required set structurally, not by text scan (**FP-M19**)

**FP-M19** fences a derived set that reads empty and a member that goes unread. A regex over
the authority's source text defeats both and the count discharging them: prose there is not
data, but a text scan cannot tell, so one character makes the extractor swap real members for
comment fragments — set non-empty, members all "read", cardinality unchanged.

(a) Derive from structure: parse the authority with its parser, so comments are excluded by
construction and the failure cannot occur at all; a text scan is admissible only where no parser
exists, then a stated limit. (b) Fence shape, not size: assert each member
against the vocabulary's own form, and fail loud on a duplicate — the `Set` receiving them
collapses a repeat silently, a loss no count shows.

Text extraction can mistake comments or string fragments for declared data while still returning the expected item count — for example, a quoted-string regex that meets an apostrophe in a comment can drop genuine members, admit comment fragments, keep its size and print `OK`, where the parsed syntax tree reads every member. Do not treat cardinality alone as proof.

---

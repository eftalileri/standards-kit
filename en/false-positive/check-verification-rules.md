# False positive prevention — check verification rules (normative)

```kit-cover
type: normative
part-of: README.md
binds: real-file proof, anchors, scope and binding, probe diagnosis, shared resolver and aggregate coverage
open-when: shape:mechanical-enforcement, signal:new-lint-rule, signal:new-guard, signal:check-rollout, signal:guard-runtime
skip-when: signal:no-enforcement-change
owns: FP-M20, FP-M26, FP-M32, FP-N15, FP-M27, FP-M33, FP-N20, FP-M29, FP-MS10, FP-M35, FP-M36, FP-M37, FP-M25, FP-M28, FP-M30, FP-M34
```

Scope: Real-file proof, violation form coverage and structural membership.

Document type: Normative part — **FP-M20**, **FP-M26**, **FP-M32**, **FP-N15**.

References: [README.md](README.md) — topic map; [rules.md](rules.md) — definitions, output and failures.

---

## **MUST** (normative) — FP-M

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-M20** | Three proofs over real files — defined by [**ENA-R6**](../enforcement-architecture/enforcement-authoring.md); its clauses (a) positive, (b) negative, (c) binding are cited under this identity. | — | See **ENA-R6**. |
| **FP-M26** | A prohibition's firing probe **MUST** carry every syntactic form the violation can legitimately take, and a probe that fires only PARTIALLY is a finding about the CHECK. [**FP-M22**](check-design-rules.md)(d) requires watching a prohibition fire before believing its silence; it says "a violation in the authority's exact current form", which reads as one form. Real violations are polymorphic: the same defect is written as a validator chain in one file, a comparison in another, a destructured read in a third — and the authority itself may express the guarded value in a spelling the predicate never names. A probe carrying one form and firing once proves sight of that form only, and the form left out is routinely the one the defect will actually take, because it is the spelling the surrounding code already prefers. Write the probe as the full set of forms, then read the fire count against it: fewer fires than forms is blindness located, not noise, and the repair is the predicate, never the probe. The same asymmetry binds the authority's own writing — where the authority expresses the value one way (a computed key, a template literal) and a hand-written violation would express it another (a plain identifier, a bare string), both belong in the set. | Reject a prohibition proved by a single-form probe, and treat a partial fire as an unproven check rather than a passing one. | The change record enumerates the violation forms the probe carries and shows the fire count equal to the form count; any probe form that did not fire is accounted for by a named predicate repair.  |
| **FP-M32** | A hand-listed membership cannot prove coverage by a negative run: unlisted subjects are unseen. Membership **MUST** derive from the subject's structure, with the check scoped to the class's whole directory/tree and the non-subject return inside its body. Do not encode that test as configuration ignores or suppressions. Before fixing, run the widened scope and enumerate subjects the list missed; prove the conversion as a scope extension under **FP-M29**. A zero-missing-subject claim needs the measurement too. | Reject coverage based on an unproved name list; unlisted subjects remain unenforced. | Record expanded pattern matched to a real path, widened pre-fix missing subjects, post-fix zero, and the structural subject test in the body. |

---

## **MUST NOT** (normative) — FP-N

| ID | Prohibited | Consequence | Verify |
|----|-----------|-------------|--------|
| **FP-N15** | Verify a check through an input channel the tool may silently ignore, or present configuration text in place of a measurement (**FP-M20**). The specific trap: feeding source to a linter over a stream / standard input while naming a *different* on-disk path for it (a `stdin` + `stdin-filename`-style invocation). That flag pair is not honoured uniformly — in a flat-config, plugin-heavy setup the tool can read the file on disk and discard the piped content entirely, then report on source the author never submitted. The failure is silent and inverted: the command succeeds, so nothing signals that both a "the rule fires" and a "this file is clean" conclusion were drawn from the wrong artifact. Equally forbidden: substituting an in-repository fixture / test artifact for the out-of-tree specimen required by **FP-M20** (a), and asserting coverage by quoting a configuration file instead of expanding the effective pattern and comparing it to a real target path (**FP-M20** (c)).  | Reject — the evidence is fabricated. Any conclusion built on it (a rule declared working, a file class declared covered, a record closed) is void and **MUST** be re-measured over real files. | Every verification command in the record names a real file path on disk; no stream/`stdin` content injection appears anywhere in the evidence; the coverage claim shows an expanded pattern next to the target file's real path, not a config quote. |

---

## False positive prevention — check anchor and the fence it must not duplicate (normative)


Document type: Normative part — **FP-M27**, **FP-M33**, **FP-N20**.


---

## **MUST** (normative) — FP-M / FP-MS

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-M27** | Anchor a check on what cannot vary, and do not fence a half another mechanism already closes. Clauses (a)–(e) [below](#fp-m27--check-anchor-clauses) bind. | Reject — a name-anchored check is blind by construction unless (e) applies and the blindness is written down; a duplicated fence is a parallel authority; an over-reaching one invites suppression of real defects. | The anchor is the defect's invariant output, covered across literal and template forms with native characters and an inflection-safe boundary; the registered entry names which half is closed by which mechanism; and where the anchor is a name under (e), the check states the shape coincidence that forced it and the binding it therefore cannot see. |
| **FP-M33** | Before replacing hand-listed membership, **MUST** measure a widened pre-fix run and classify findings as contract violated or contract absent. First put the role-based subject test inside the body: almost-all-red may mean missing classification, not a legitimate name anchor. Retain a list as an anchor only when no structural role property exists. The replacement **MUST NOT** lose listed subjects: union the guarded-operation shape with each subject's own contract adoption marker/import/interface, never a retained name residue. For an unconverted anchor, record path, widened finding lines, why conversion is not expressible and closure order at its scope declaration. | Reject an unmeasured, scope-losing conversion or a widening that demands absent contracts. | Record both finding classes, before/after subject counts and every difference; inspect structural union arms and each unconverted anchor's evidence. |

<a id="fp-m27--check-anchor-clauses"></a>

### Check anchor — **FP-M27** clauses

(a) Choose the anchor by asking what the defect cannot avoid carrying. A name — of a function, a helper, a constant — is the weakest anchor available, because the second copy of a derivation is free to be called anything or to be no function at all, written inline at its call site. Where the regression is a duplicated *output* (a formatted user-visible string, a composed identifier, a serialized key), the invariant thing is the produced text, and the check anchors there: every syntactic form that can produce it, plain string literal and template part alike, since the real code usually holds the interpolated form and a literal-only predicate would not see even the authority it protects. When the anchored text is natural language, it is written in the check with its full native characters; a transliterated or ASCII-folded pattern matches nothing the product actually ships. The complementary risk is over-reach, and it is answered in the same predicate rather than later by exemption: anchor the text so an inflected or compounded legitimate use cannot match.

(b) Two mechanisms guarding one invariant is a parallel path, not depth. Before writing a check, establish which half of the contract is genuinely open. Where a value set is already derived from one constant that the request schema, the persistence schema and the static type each import, an out-of-set value is impossible at both compile time and run time; a lint rule asserting the same thing adds a second authority over one invariant ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md)) — one that will drift from the constant it shadows. The check belongs on the half no other mechanism sees, which for such a datum is the write path: placing a field into a store-update operator is type-valid, so nothing but a check can hold it to its single writer. When a half is deliberately left unfenced for this reason, say so where the invariant is registered, naming the mechanism that closes it — a silent absence reads as an oversight, and the next author adds the duplicate.

(c) A predicate that over-reaches into siblings sharing the defect class but not the subject is narrowed to the subject — never resolved by suppressing at source, and never by widening the fix. The findings are real; they are simply another entry's business. Suppressing them in the flagged files would silence a genuine defect, and repairing them turns a one-rule change into a cross-collection migration. The third option is the correct one: bound the predicate to what the entry actually owns, record every over-reach finding with `file:line` evidence as a deferred observation for direction, and state the resulting blindness in the check and in the entry — so the narrowing is visible as a decision rather than read as coverage.

(d) Where a sibling consumer legitimately reads the raw value with a *different* semantic, the check's scope stays narrow and says which reader it froze. The same field can be the wrong answer for one question ("when was this subject last active") and exactly the right answer for another ("when did it last authenticate"). A tree-wide scope accuses the legitimate reader on its first run, and the usual repair — an exemption for it — converts a scope error into permanent noise in the rule's own source. Register the check on the consumer it genuinely freezes, and record that other files are unprotected; a narrow fence that states its edge is worth more than a wide one that must be argued with.

(e) Where the defect's syntax is BYTE-IDENTICAL to a legitimate construct, the name anchor stops being the weakest option and becomes the MANDATORY one — and its blindness is declared, never removed. (a) ranks a name last because the second copy of a derivation is free to be called anything; that ranking holds only while the defect's *shape* still distinguishes it from correct code. Where it does not — the same two tokens compose a national dial prefix and a zero-padded minute, the same concatenation builds an identifier and a label — dropping the name constraint does not widen coverage. It makes the check born red on legitimate work, which [**FP-M18**](check-design-rules.md) forbids, and the repair that follows is a file of exemptions over correct code, which (c) forbids. So keep the name anchor and record, in the check itself, the one thing it cannot see: the same defect written onto a neutrally named binding. That statement is the whole difference between a narrow fence and a silent one, and it is what (b)'s "say so where the invariant is registered" requires of an anchor chosen under this constraint.

---

## **MUST NOT** (normative) — FP-N

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-N20** | Anchor a check on a function/helper name where the defect's invariant is its produced output; scan only plain string literals where the real form is a template; write a natural-language pattern transliterated or ASCII-folded; open a second mechanism over an invariant a constant-derived type and schema already close; suppress an over-reaching predicate's findings at their source instead of narrowing the predicate; or scope a check across a tree holding a legitimate reader of the same value under a different semantic (**FP-M27**). The one exception is **FP-M27**(e) — a name anchor forced by a defect whose syntax is byte-identical to legitimate code — and it is a *declared* anchor, never an unstated default. | Reject — a blind check reports "0 findings" indistinguishably from a clean tree, or a parallel fence drifts from the authority it shadows. | Blindness measurement against the authority's present code form, plus a statement of which half each mechanism closes. |

---

## False positive prevention — check scope binding (normative)


Document type: Normative part — **FP-M29**, **FP-MS10**.


---

## **MUST** (normative) — FP-M / FP-MS

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-M29** | (a) A SCOPE extension is proved by the predicate FIRING inside the newly added scope, not by a green exit code. Adding a file or subtree to an existing check's scope claims coverage the check may not have: its predicate was written around the shapes it already governed, and the new file may carry the same defect class in a shape it never matches — a sibling driver member, a different write form, another field-name family. The reading is then "0 findings" while nothing is enforced, and the registry entry, config block and scope list all read as covered. Before claiming an extension, prove the predicate reaches the new scope: introduce the defect in the new file's own shape, see it flagged, revert. If it does not flag, the extension is blind — do not register it as coverage; record the measured predicate gap and its cost. (b) Inside a scope already held, a predicate anchored to ONE written form silently exempts the others — and the exemption reads as coverage. A hand-maintained subject file routinely writes the same fact in more than one form: the line carrying a record's decision is a list item in one entry and a bare paragraph in the next, both legitimate to a human reader, only one matched by the predicate. The unmatched entries then carry no finding for exactly the reason a compliant entry carries none, so the count is not *clean* but *short*, and no exit code separates the two. This is the false-negative twin of (a) — there a new scope the predicate cannot reach, here an old scope it reaches only half of. The repair is not to widen the predicate until the baseline goes green: measure which forms the subject file actually uses, declare ONE, normalise the subject to it, and make the check fail loud on a record matching none. A second accepted form is a second authority for the same fact and the first thing to drift. The same holds one level up, in the rule engine itself: where several checks assert ONE predicate over different subjects (for example "this field has a closed writer set", one check per field), the predicate is implemented once and each check declares only its subject, its writers and its message; a per-check copy is a second authority for the predicate and drifts without a finding (**SSG-M8**).  A check whose extra semantics depend on the operator's or the persistence METHOD's IDENTITY (birth-only, value-introducing, field-naming; write, delete, single-document, returns-the-document) expresses them as a NAMED subset declared beside the shared predicate, never as a local operator or method list; a check that re-declares either vocabulary is itself the finding, and where the rule engine is linted that is mechanical.  Derive a vocabulary from the installed library's source, not from memory, and keep a name the library does not define out of it. The sharpest case is a presence check that runs CONDITIONALLY — only over the records some other surface happens to reference — because there every unreferenced record is exempt by construction and its silence is indistinguishable from compliance; a presence check runs over the whole population or it is not one. (c) Where the subject is prose, anchor to the single declared decision line, never to the body. A living ledger states its verdict once and then narrates its history, so the verdict's own vocabulary recurs throughout the body as past tense, quotation and retraction; a body-wide predicate counts those and reports a backlog that does not exist. Anchor on the one line the document declares as its verdict, and let the narration be narration. | Reject a scope extension never watched to fire in the new shape, reject a presence check scoped to the subset another surface references, and reject a predicate widened to accept a second written form where the subject should have been normalised to one. | The registration records which written forms the subject was measured to use and which one is declared; the whole-population baseline; and a probe for each arm — the defect in the new scope's own shape, and the fact written in a non-declared form — each seen to fire and reverted. |
| **FP-MS10** | The file set a rule is bound to is part of its design: choose it by MEASURING candidate scopes, and prove the binding by watching the rule fire inside each one. **FP-MS1** requires binding to "the exact file set it governs" and stops there; this row says how that set is found and how the binding is proven. (a) Scope by DECISION SITE, not by symbol name. A field or symbol that answers a question in one layer routinely appears, legitimately, as *display copy* or as a *derived read* in others; binding to "everywhere the name occurs" makes the baseline non-zero and the check unopenable. The repair is never a suppression at each legitimate reader, and never a predicate straining to tell display from decision — nothing in a single file's syntax tree marks that difference. Bind to the layer allowed to answer the question, and record in the registration which legitimate readers were measured out and why, so the exclusion is a stated limit rather than an unexplained gap. (b) Where an earlier profile disables the rule family over a subtree, the registration **MUST** be repeated after it — and the repetition is proven by INTRODUCING a violation in that subtree and watching it fail. Reading the configuration is not the proof: *"the rule is registered"* and *"this file is protected"* are different claims, and a lock that lives only in the domain block goes silently dark over the very tree that declares the shared constant it protects. The mirror trap is a configuration key holding a SINGLE value: a second block in the same scope silently replaces the first, so a new entry joins the existing one and the proof is that a PRE-EXISTING entry there still fires. (d) Where the contract is stated AS a name ("X is the sole writer"), measure that name's ambiguity first. A generic identifier legitimately names unrelated things elsewhere and a name-keyed predicate burns them; re-key onto an unambiguous property of the defect and record the un-lockable half as a stated limit. (c) Both halves are measurements, so both are reported: the candidate-scope baselines that chose the set, and the fired-and-reverted probe that proved each block. A scope justified by reasoning alone is unproven in the same way **FP-M22**(d)'s prohibition is unproven when nothing was watched to fire. | Reject a binding argued from the symbol's name, and reject a re-registration after a disabling profile that was never watched to fire. | The registration comment carries the measured baseline per candidate scope, names the legitimate readers excluded and why, and — for every block placed after a disabling profile — records the probe that fired there and was reverted. |

---

## False positive prevention — reading a verification run's result (normative)


Document type: Normative part — **FP-M35**, **FP-M36**.


---

## **MUST** (normative) — FP-M

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-M35** | A silent probe **MUST** be diagnosed before recording blindness. Inspect the specimen's binding before the predicate: a subject without its required position, type or binding is outside the declared extent. Copy a real occurrence unedited from the governed tree/pre-fix revision and rerun; only that shape inside the declared extent can establish a predicate gap. For a deletion/presence probe, count all occurrences the anchor sees; remove them all or choose an exactly-once member. If several survive, read the authority decision path to decide whether they are equivalent union members or an exemption/comment/unrelated literal exposing a wrong anchor. An undiagnosed gap can wrongly prescribe widening a correct check. | Reject hand-written-gap evidence, blindness concluded from one silent run or an uncounted deletion probe. | Record specimen file/revision, missing binding and copied-shape rerun; for deletion record occurrence count and equivalence or anchor repair. |
| **FP-M36** | A composite finding **MUST** isolate its unmet leg before judging it or suppressing it. Temporarily satisfy the suspected leg and rerun: clearing identifies that leg; persistence requires another isolation. Revert and prove byte-identical restoration. Do not contort correct code to a weaker named construct or suppress an unmeasured conjunction. If the isolated leg is a confirmed false positive and no narrower anchor exists, the reason names it and every co-silenced leg with evidence they hold today. Prefer a node allowing one-leg suppression. | Reject an unisolated verdict or a reason hiding residual coverage loss. | Record leg, temporary change, both results and identical revert; the reason enumerates co-silenced legs. |

---

## False positive prevention — was the check bound to the file at all (normative)


Document type: Normative part — **FP-M37**.


---

## **MUST** (normative) — FP-M

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-M37** | A quiet run proves a path clean only after the path's resolved configuration has been read back and shown to carry the check at blocking severity. (a) An exclusion is co-located only with the checks it was written for; a shared registration block's exclusion silently binds every check in it. (b) Coverage is the configuration resolver's per-file answer for a concrete path inside each exclusion — severity and options — read before and after the change, never the configuration text; a block restating only severity keeps the earlier options. (c) A predicate widening re-measures every inherited exclusion against the new extent before it lands, and the block is split rather than the blind spot accepted. (d) An exclusion that delegates a tree to another check is worth exactly that check's reach: both reaches come from one deriver ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md)), and a specimen at the widest excluded path proves the gap closed. Reason: an unbound check and a clean file are the same silence. | Reject a negative proof, coverage claim or closed record argued from configuration text; reject an exclusion co-located with a check it was not written for, or a delegating exclusion whose reach was never compared. | The record shows, for a concrete path inside every exclusion the block carries, the resolver's per-file answer before and after, and which check each exclusion was written for. Stated limit: no configuration format records which check an exclusion was written for, so co-location and delegation pairs are review-held; a shape predicate is born red on deliberate cases ([**FP-M18**](check-design-rules.md)). |

---

## False positive prevention — enforcement that exists only on paper (normative)


Document type: Normative part — **FP-M25**, **FP-M28**, **FP-M30**, **FP-M34**.


---

## **MUST** (normative) — FP-M

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **FP-M25** | An unregistered check body **MUST** take one of three exits: (a) admit under **ENA-A1**, prove under **FP-M20** over the whole governed set and register at blocking severity; (b) correct a predicate contradicting current deliberate decisions, then admit/prove/register; (c) retire under the retirement procedure and record why. Measure clean-tree findings and their decision conflicts before choosing. Derive the body/registration join on demand; no committed inventory. | Reject unresolved unregistered bodies or enabling one without the measurement. | Inspect plugin/config/runner/gate registrations; every remaining unregistered body has a recorded exit and measured finding count. Review chooses the exit from actual defects and deliberate decisions. |
| **FP-M28** | A shared resolver **MUST** be proved through every actual consumer's own authority anchor, with the consumer set derived from the tree. Audit local copies by differential execution of each copy and the authority over every real file/specifier pair, not by code reading. Measure the divergence set before folding a defective copy onto the authority, then rerun the gate and handle newly reachable findings under cascade-stop, never bulk suppression. A copy encoding a deliberate written scope limit remains with that reason on the copy. Distinguish unaudited from measured-clean. | Reject helper-only proof; resolver-dependent zero findings are void until the consumers are proved. | Record enumerated consumers, each firing proof, real input population and divergence count per copy; each copy is folded or retained with its written limit. |
| **FP-M30** | An aggregate runner **MUST** derive its exit as process-failure OR reported-finding, from the same error/warning counts its report publishes. A child that exits zero under its own warning policy cannot override the aggregate's zero-warning requirement. Start/crash/nonzero and collected findings are independent signals; the failure message names which fired. | Silent false green: exit contradicts the report. | Observe warning-only failure naming the finding signal, then zero exit with zero counts. Read the runner's own status without a masking pipe. |
| **FP-M34** | A check that forbids a VALUE **MUST** be designed against every channel the target surface accepts that value through, and each channel its predicate cannot read **MUST** be named as a stated limit. Where one call surface takes the same datum through more than one channel — a structured metadata object, a typed parameter, and a free-text message argument assembled by concatenation — a predicate written against a single channel reports zero while the datum still reaches the sink through another. This is worse than no check: the tree measures clean, the debt is recorded as closed, and the next author copies the surviving spelling because nothing objects to it. (a) Enumerate before you author or extend: read the target surface's own signature and list every parameter and shape a caller can put the forbidden value in; record which of them the predicate reads. (b) Name what it cannot read. A channel outside the predicate is a stated enforcement limit written beside the check ([**KIT-INV-8**](../authoring/kit-structural-invariants.md)) — an unnamed omission is indistinguishable from coverage, and the rollout record inherits the same silence. (c) A staged ratchet's remaining-debt record carries the uncovered channel too ([**FP-M18**](check-design-rules.md)): "this subtree is closed" means closed for the channels the predicate reads, and a closure claim that does not say so overstates itself. (d) Where a hand-written call site is the flagged one, choose the remedy from the value's whole path, not the flagged line — a value that looks like it only reaches a sink may also be the input a later branch classifies on, and deleting or summarising it there removes a decision rather than a disclosure. (e) Where the predicate gates on MEMBERSHIP in a registry, the authority's completeness is a coverage variable — an omitted value is invisible, so the check reads greenest where governance is weakest. Registering it is an enforcement action: close registry-first, lock-second.  | Silent false green — a green check over a closed tree while the forbidden value keeps arriving through an unscanned channel, and the closure record says otherwise. | For each channel the surface accepts, extract a real call site that carries the forbidden value through that channel into a sample inside the guarded tree, run the check in the production configuration, and record which channels fail. A channel that does not fail is either covered by the predicate — prove it fires — or a stated limit written beside the check; nothing is left in a third state.  |

---

## Scope and authority set — derived, never listed (reading aid for **FP-M19** / **FP-M29**)

**FP-M19** fences a derived set that reads *empty*. Two sibling shapes produce the same latent
false green while every derived set is non-empty. Read them as instances of **FP-M19**, not as new obligations.

(a) Scope pinned to a hard-coded file list. A check that decides "do I apply here?" from a
list inside its own source returns "nothing to check" for every file outside it. The call surface
it governs grows; the list does not. The exit code cannot separate *measured clean* from *never
ran*, and the config block that names the paths reads as coverage. The failure is worse than a
missing check, because the config and the check can disagree: a file listed in the config but
absent from the check's internal list is announced as covered and is measured by nothing.
Derive the scope from the artefact itself — "does this file call the governed entry point?" —
so a new call site is in scope the day it is written. Where a *precision layer* genuinely needs
field knowledge no syntax carries, keep that layer opt-in beside a universal derived layer,
and say in the check's source which half each file gets.

(b) Predicate that recognizes only part of the authority set. Where a rule requires "call the
authority", it must recognize every authority that decides the same question. Recognizing a
subset makes correct code go red; the reflex is then to keep those paths out of scope, so the
predicate's blindness silently shrinks the governed set — the opposite of **FP-M18** (a). Inventory
the authorities from the tree before writing the predicate, and re-inventory before every scope
extension. A predicate that matches a writing style rather than the relation fails the same
way: it fits the shapes it was written against, and the first honest variant outside them reads as
a violation. When an extension turns a clean tree red, suspect the predicate before the code.

---

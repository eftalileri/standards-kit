# Stated limits of the kit's own fences

```kit-cover
type: normative
part-of: README.md
binds: the steps of the kit-change procedure no check covers, each with what a check would need and why this tree cannot supply it
open-when: signal:kit-rule-change, shape:mechanical-enforcement
skip-when: signal:no-kit-change
owns: KIT-LIM-3, KIT-LIM-6, KIT-LIM-7, KIT-LIM-12
```

**Keywords:** stated limit, unenforceable step, mechanical fence boundary, kit change, restatement, citing end

Scope

- Included: Every step of adding, changing, moving, fencing or citing a kit rule that no check decides, with the information a check would need and why this tree does not hold it.
- Excluded: Whether a fence is admitted at all and the mechanism choice behind it ([kit-rule-change-and-enforcement.md](kit-rule-change-and-enforcement.md), KIT-CHG and KIT-ENF); adding a rule ([kit-rule-addition.md](kit-rule-addition.md), KIT-ADD); the structural invariants ([kit-structural-invariants.md](kit-structural-invariants.md), KIT-INV); the limits of the retirement procedure, stated inside its own rules ([kit-rule-retirement.md](kit-rule-retirement.md), KIT-RET).
- Document type: Normative part — the KIT-LIM family. **KIT-LIM-1**, **KIT-LIM-2**, **KIT-LIM-4**, **KIT-LIM-5**, **KIT-LIM-8**, **KIT-LIM-9**, **KIT-LIM-10** and **KIT-LIM-11** are not defined; the gaps are never back-filled.

Binding principle: [**ENA-GV3**](../enforcement-architecture/enforcement-admission.md) decides what an unfenced rule records.

References: [kit-rule-change-and-enforcement.md](kit-rule-change-and-enforcement.md) (KIT-CHG, KIT-ENF); [kit-rule-addition.md](kit-rule-addition.md) (KIT-ADD); [kit-structural-invariants.md](kit-structural-invariants.md) ([**KIT-INV-8**](kit-structural-invariants.md) — enforcement names are stated when a check exists); [check-design-rules.md](../false-positive/check-design-rules.md) ([**FP-M19**](../false-positive/check-design-rules.md) empty-set fence, [**FP-M22**](../false-positive/check-design-rules.md) predicate expresses the guarantee); [ssot-principles-and-precedence.md](../ssot/ssot-principles-and-precedence.md) ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md) — one authority).

---

## Stated enforcement limits

These steps are not mechanically enforced. Each row names what a check would need and why the kit tree cannot supply it.

| ID | Limit |
|----|-------|
| **KIT-LIM-3** | Whether a rule is in the *right* topic cannot be checked. Every structural fence in this kit answers "is this well-formed?"; none answers "does this obligation belong to this subject?". A check would need a machine-readable statement of each topic's subject boundary precise enough to classify an arbitrary new rule — a semantic judgement, not a derivable fact. **KIT-ADD-1** and **KIT-ADD-2** are review obligations, and the review is the only enforcement. |
| **KIT-LIM-6** | A hand-maintained list's *completeness* cannot be checked, only its destinations. That every path such a list names resolves is mechanical, but it is not gated (**KIT-LIM-12**). That every subject which *ought* to have a row has one is not: the selection rule is editorial in every real case — a migration tracker's rows are the historical documents that were replaced and no file records which document a topic replaced; a crosswalk's rows are the subjects that *had* a predecessor, so a net-new subject legitimately has none; a problem-class map's rows are problem classes, not subjects, so a subject with no row is a correct state. A check would need a machine-readable coverage contract per list, and writing one would create a second authority for the same question that must itself be kept true (**SSG-M8**) — the very failure the generated index removed. The enforcement that does exist: **KIT-ENF-4** obliges the list to declare what it is not, and the map's own procedure covers the gap it leaves (an unmapped in-scope class is a STOP, not a silent pass). |
| **KIT-LIM-7** | Some binding obligations belong to the consuming project's root agent-rule file, and the kit *names* them instead of restating them. A project-independent kit cannot carry a harness or house rule — the language a maintainer is answered in, the commit-message shape, who may authorise a release, how an assistant's memory is kept — without becoming a second, drifting copy of a file it does not own (**SSG-M8**: one authority, and for those subjects the root file is it). So the kit deliberately holds none of them. The failure this creates is silence read as coverage: an agent that finds nothing in the kit concludes there is no obligation. The fence is a *named* boundary, not an empty one — the classes left out are listed, with the root file named, in [`_meta/precedence.md`](../_meta/precedence.md) under "What the root agent-rule file carries". A class absent from both the kit and that list is a gap, not a boundary: write it into the kit or add it to the list; never trim the list to make a gap look intentional. Not checkable: no property of a kit file states which obligations exist outside it, so the list's completeness is editorial — the **KIT-LIM-6** limit again. Hence the list states how it was derived, so a reader re-derives it against the root file instead of trusting it. |
| **KIT-LIM-12** | No structural obligation of this kit is mechanically fenced: every check on the kit's own Markdown was declined by the admission test, because its harm class is reading ergonomics ([**ENA-A3**](../enforcement-architecture/enforcement-admission.md)), so every kit obligation is held by review and running the lookup generators is the cheapest structural check. |

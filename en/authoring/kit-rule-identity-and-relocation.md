# A kit rule's identity when its text changes, moves or is deleted

```kit-cover
type: normative
part-of: README.md
binds: what survives when an existing kit rule is edited, relocated or removed -- byte-identical relocation, identity continuity across an edit, permanent retirement of a deleted number, same-change citation repointing, index regeneration, and the single-change move with no surviving parallel path
open-when: signal:kit-rule-change, shape:mechanical-enforcement
skip-when: signal:no-kit-change
owns: KIT-CHG-1, KIT-CHG-2, KIT-CHG-3, KIT-CHG-4, KIT-CHG-5, KIT-CHG-6
```

**Keywords:** kit change, rule deletion, identity gap, rule move, citation repointing

Part of [Changing a kit rule, and fencing it mechanically](kit-rule-change-and-enforcement.md). The KIT-ENF family — the mechanism choice, the proof obligation and what the kit's own addresses and rule text must keep true — is defined there and binds alongside these rows, as does the binding principle it states: *a rule's identity is a promise to everyone who cited it.* Retirement eligibility is [kit-rule-retirement.md](kit-rule-retirement.md) (KIT-RET), the unfenced steps are [kit-stated-limits.md](kit-stated-limits.md) (KIT-LIM), adding a rule is [kit-rule-addition.md](kit-rule-addition.md) (KIT-ADD) and the structural invariants are [kit-structural-invariants.md](kit-structural-invariants.md) (KIT-INV). Those five files plus this one are the complete part set for this authoring family; all of them carry the same `open-when` and `skip-when`, so any declaration that opens one opens them all.

Document type: Normative — the KIT-CHG family.

References: [kit-rule-change-and-enforcement.md](kit-rule-change-and-enforcement.md) (KIT-ENF); [kit-rule-addition.md](kit-rule-addition.md) (**KIT-ADD-2**, **KIT-ADD-4**, **KIT-ADD-5**, **KIT-ADD-9**); [kit-structural-invariants.md](kit-structural-invariants.md) (**KIT-INV-2**, **KIT-INV-4**, **KIT-INV-5**); [kit-rule-retirement.md](kit-rule-retirement.md) (**KIT-RET-5** — the retired-identity ledger **KIT-CHG-3** writes into); [**SSG-M8**](../ssot/ssot-principles-and-precedence.md) (one authority, no parallel path).

---

## Changing, moving and deleting

| ID | Rule |
|----|------|
| **KIT-CHG-1** | Relocated rule text moves intact. When a rule moves between files, the moved block is byte-identical to its source; compressing, paraphrasing or merging it is a rule change wearing a move's clothes. Prove it rather than assert it: compare the extracted block on both sides (`sha256`) and record the comparison. The only lines allowed to differ are the ones a move forces — relative link targets that must be re-based, and identity cells that take the link form (**KIT-INV-3**) — and each such line is named with its reason in the change record. |
| **KIT-CHG-2** | Editing what a rule says keeps its identity. Do not express an edit as "delete the old identity, add a new one". The identity is the citation handle; a new number breaks every existing citation while the old number becomes a dangling reference. If the obligation genuinely becomes a different obligation, that is a deletion (**KIT-CHG-3**) plus an addition, and both halves carry their full consequences. |
| **KIT-CHG-3** | A deleted rule's identity is retired permanently — the gap is never back-filled. The next addition to that family continues past the gap. The identity enters the retired-identity ledger, which is the authority for what is retired, and the file that used to hold the rule mirrors the gap in its `**Document type:**` line ([**KIT-RET-5**](kit-rule-retirement.md)), so a reader who follows a stale citation learns the identity is retired instead of finding a different rule wearing that number. |
| **KIT-CHG-4** | A deletion or a move repoints every citation in the same change. Find them before deciding, not after: run an exact search for the rule identity and the old path across the whole adopting repository (for example `grep -rnw "BE-M10" .`), and remember that the kit's identity lookup answers only the *definition* side. Citations that cannot be repointed because their target no longer exists are deleted with a written record of what they claimed — never repointed to a plausible-looking neighbour. |
| **KIT-CHG-5** | Regenerate the derived indexes after any change to the identity set, and compare before with after. Generate the identity lookup before the edit and again after it (with the kit tool `node tools/kit-lookups.mjs`, plus `node tools/kit-index.mjs` when a hub changed), and diff the two local copies: after a deletion the lookup **MUST** lose exactly the deleted lines and nothing else; after a move it **MUST** show the same identity against its new path. A diff larger than the change is the first sign that a row was mis-cut. The lookup is a derived artefact ([**KIT-ADD-9**](kit-rule-addition.md)), so the comparison is the author's own, never a gate's. |
| **KIT-CHG-6** | A move is one change, with no surviving parallel path. Source removed, target written, citations repointed, indexes regenerated — together. Leaving the old copy "for now" creates a second definition site, contrary to [**SSG-M8**](../ssot/ssot-principles-and-precedence.md); no gate catches it ([**KIT-LIM-12**](kit-stated-limits.md)), so the same-change discipline is the whole protection. |

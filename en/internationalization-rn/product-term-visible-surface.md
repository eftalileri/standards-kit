# Product terms — the surface the reader already sees is the authority

```kit-cover
type: normative
part-of: README.md
binds: I18N-CAT-M9 -- where the name of a product concept comes from when that concept is already drawn on a surface the reader opens
open-when: shape:backend-heavy, shape:frontend-heavy, shape:full-stack, signal:user-facing-string, signal:translation-catalog, signal:locale-sourced-label, signal:new-language, signal:notification
skip-when: signal:no-user-facing-string
owns: I18N-CAT-M9
```

**Keywords:** product term, concept name, screen title, menu label, tab label, in-app vocabulary, term collision, naming authority, two-sided product

Scope

- Included: Which word a user-facing string uses for a product concept that the product already shows somewhere — a screen title, a tab, a menu row, a search entry. Where that word is read from, which audience's surface owns it, and what happens when a pointer names a destination.
- Excluded: The change set a reported collision owes ([user-text-catalogs-and-parity.md](user-text-catalogs-and-parity.md), **I18N-CAT-M5**) — this row decides what the replacement *is*, that row decides how widely it lands. Concepts with no visible surface: for those there is still no term authority, and that limit stands as written in [internationalization-rn.md](internationalization-rn.md). Whether the surface should exist, what it should be called when it is first invented, and which register or form of address a language uses — all product decisions. (Its consistency is not: see (f), which governs a single leaf deviating from the register its own catalog already uses.) Code identifiers, route names, database fields and registry ids, which this row never touches.
- Document type: Normative part — **I18N-CAT-M9**.

References: [README.md](README.md); [user-text-catalogs-and-parity.md](user-text-catalogs-and-parity.md) (**I18N-CAT-M1**, **I18N-CAT-M5**); [internationalization-rn.md](internationalization-rn.md) (the stated per-language terminology limit this row narrows); [ssot-principles-and-precedence.md](../ssot/ssot-principles-and-precedence.md) (**SSG-M8**); [kit-structural-invariants.md](../authoring/kit-structural-invariants.md) (**KIT-INV-8** — why the limit below is written rather than left implied).

---

## **MUST**

| ID | Rule |
|----|------|
| **I18N-CAT-M9** | A product concept the product already DRAWS on a surface takes its name, in every other user-facing string, from that surface's own label in the same language — the name is read off the product, never invented and never carried over from an internal identifier. The sibling row ([**I18N-CAT-M5**](user-text-catalogs-and-parity.md)) governs the change set a reported term collision owes and says no authority exists for choosing the replacement word. That is true only while the concept has no visible surface. Where the product shows it — a screen title, a tab, a menu row, a search entry — that label is the authority, because it is a term the product is already teaching its readers, in a catalog it owns, in every declared language at once. Naming the same concept differently elsewhere is a second authority for one name ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md)), and the reader pays for it: two vocabularies for one thing, and nothing connecting what one screen promises to what another screen shows. The subordinate clauses below are part of this rule. |

<a id="i18n-cat-m9--clause-a"></a>

### Clause a — [I18N-CAT-M9](#must)

(a) The authority is the surface the concept's own audience sees — not the audience being written to. In a two-sided product the side a concept is *about* is frequently not the side reading the sentence: a provider reads "appear in X" about a list only consumers ever open. The name still comes from the consumers' screen, because that is where the thing exists. Giving the provider a private synonym leaves the two sides unable to name the same feature, and it is the provider who then cannot find what was promised.

<a id="i18n-cat-m9--clause-b"></a>

### Clause b — [I18N-CAT-M9](#must)

(b) An internal identifier is not a candidate. A key path, a route name, a collection, a folder or a domain term is written for the code, usually predates the product decision, and is under no obligation to be a word at all. Translating one into the reader's language is exactly how a word that names nothing on screen enters the copy — and it enters every declared language at once, because the translator translates the source string rather than re-deciding it.

<a id="why-the-word-is-not-a-small-defect"></a>

<a id="i18n-cat-m9--clause-c"></a>

### Clause c — [I18N-CAT-M9](#must)

(c) A pointer uses its destination's own title. "Turn it on in the X settings", where no screen is called X, sends the reader to look for something that does not exist; this half is decidable by anyone holding both strings and is the most common residue after a rename.

<a id="i18n-cat-m9--clause-d"></a>

### Clause d — [I18N-CAT-M9](#must)

(d) Where the visible surface is ITSELF the unclear name, the defect is upstream. Rename the surface first — that rename is **I18N-CAT-M5**'s change set — and let the dependent copy follow it. Renaming only the dependent copy makes the collision permanent, because the surface keeps teaching the old word to everyone who opens it.

<a id="i18n-cat-m9--clause-e"></a>

### Clause e — [I18N-CAT-M9](#must)

(e) The SOURCE language's own word is not a candidate either. (b) rejects an internal identifier; this half rejects the word the source string used, which is the identifier's twin and enters by the same door — the translator renders the sentence and leaves the concept's name untouched, so a fully idiomatic target sentence carries one foreign word inside it. It survives every parity gate: the key exists, the placeholders match, the spelling is correct, and the value is *not* equal to the source value, so an untranslated-value check cannot see it either. The tell is inside the target catalog: the same block already teaches that language's own word for the concept, so one catalog names one thing twice ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md)), and the foreign word is the one with no visible surface behind it. Remove it — do not explain it, and do not keep it beside a gloss, which makes the second name permanent.

<a id="i18n-cat-m9--clause-f"></a>

### Clause f — [I18N-CAT-M9](#must)

(f) One catalog, one register. Which register a language addresses the reader in is a product decision this row does not make; that the decision holds across the catalog is not. A single leaf addressing the reader differently from the block around it is the same defect shape as (e) — one surface speaking with two voices — and it is closed by measuring the surrounding catalog and aligning the deviating leaf to it, never by changing the block to match the stray. Stated limit ([**KIT-INV-8**](../authoring/kit-structural-invariants.md)): the naming half stays undecidable by a check. It needs the key-to-concept mapping **I18N-CAT-M5**'s own limit already names, and, on top of it, a machine-readable statement of which key is a surface label rather than prose mentioning one — nothing in a catalog's shape tells a screen title from a sentence about it. One narrow leg of (e) IS mechanisable: once a specific foreign term has been cleaned out of a language, *its return* is decidable without any dictionary — a declared term list, matched as a word inside catalog values (never keys, which readers never see), scoped to the locales where that term is not native, at zero baseline. Such a check proves nothing about terms not on the list, so a list is a ratchet and never coverage. No check is claimed ([**ENA-GV3**](../enforcement-architecture/enforcement-admission.md)): a term-list check over one cleaned term family with no demonstrated recurrence, carried by a hand-declared list, fails [**ENA-A1**](../enforcement-architecture/enforcement-admission.md)(a) and (d); a returning term is a review finding. A generic dictionary-free predicate for the rest is not a safe substitute: "a word shared with the source string for the same key and rare in this language's corpus" reports mostly legitimate text — country names, currency names, placeholder identifiers and brand names. (f) is likewise unfenced: register is a property of a language's grammar, not of a catalog's shape. What this row removes is not the detection but the argument: once a collision is reported, the replacement is read off the product instead of debated, and the answer is the same in every language because every language already has that label.

---

# Confirmation gates — the challenge shown and the answer accepted

```kit-cover
type: normative
part-of: README.md
binds: I18N-CAT-M6 -- the single authority a gate owes when it shows the reader a value through a catalog and then checks what the reader typed back
open-when: shape:frontend-heavy, shape:full-stack, signal:user-facing-string, signal:translation-catalog, signal:new-language
skip-when: signal:no-user-facing-string
owns: I18N-CAT-M6
```

**Keywords:** confirmation gate, irreversible action, type-to-confirm, challenge value, expected answer, exact match, localized digits, interpolation

Scope

- Included: Any gate whose catalog text shows the reader a value the reader **must** then reproduce, and whose code compares what was typed against an expected value — an arithmetic challenge before a destructive action, a "type the word shown to continue" confirmation, a code the reader **must** copy back. What owns the value, which side of the pair is derived, and what the conversion may not change.
- Excluded: Whether such a gate should exist at all, and how hard it should be — a product decision, never an outcome of a refactor. The catalog obligations that hold for the sentence around the value ([user-text-catalogs-and-parity.md](user-text-catalogs-and-parity.md), **I18N-CAT-M1**–**I18N-CAT-M5**). A value the code merely displays as information rather than checking back, which is [**I18N-RN-M10**](internationalization-rn.md)'s subject and carries the ordering obligation this row depends on. The substitution engine and its syntax ([**I18N-RN-M6**](internationalization-rn.md)).
- Document type: Normative part — **I18N-CAT-M6**.

References: [README.md](README.md); [internationalization-rn.md](internationalization-rn.md) (**I18N-RN-M10** the binding conversion order this row inherits, and its stated enforcement limit); [user-text-catalogs-and-parity.md](user-text-catalogs-and-parity.md) (**I18N-CAT-M4** cross-language key and placeholder parity); [internationalization-prohibitions.md](internationalization-prohibitions.md) (**I18N-RN-N8** the converse supply case); [ssot-principles-and-precedence.md](../ssot/ssot-principles-and-precedence.md) (**SSG-M8**); [check-design-rules.md](../false-positive/check-design-rules.md) (**FP-M18**, [**FP-M20**](../false-positive/check-verification-rules.md)); [mechanism-selection.md](../false-positive/mechanism-selection.md) (**FP-MS1**).

---

## **MUST**

| ID | Rule |
|----|------|
| **I18N-CAT-M6** | When a gate shows the reader a value and then checks what the reader typed back, the value shown and the value accepted **MUST** derive from ONE authority. The authority holds the value; the accepted answer is computed from it, and the catalog sentence receives it as an interpolation placeholder. A value written literally into the catalog is a second authority for the challenge (**SSG-M8**), and the two can then be edited apart. This class is strictly harsher than a value the code only displays, and the difference decides how it is triaged. A stale displayed number misinforms the reader, who can still act; a stale *challenge* is checked against an answer nobody can now produce, so the gate cannot be passed and the operation behind it — usually the irreversible one the gate was put there to protect — becomes unperformable. Because the sentence lives in a per-language catalog, the blockage can exist in exactly ONE language. Every language but one passes, and the remaining one is walled off, no error is raised anywhere, and the only signal is a reader who cannot proceed and has no vocabulary for saying why. That asymmetry is also why the defect survives review: whoever changes the code answers the challenge correctly in their own language and sees a working gate. (a) The conversion order is the one already binding for an interpolated value — the call site supplies the value before the catalog declares the placeholder ([**I18N-RN-M10**](internationalization-rn.md)); reversing it trades a divergence that *might* bite for raw delimiters drawn on screen in every language at once, which is a regression, not a partial fix. (b) The rendering and the reading of the value are one authority too. Where the value is written in the reader's own script — a numeral system, a letter case convention, a digit-grouping form — the function that renders it and the function that accepts it back **MUST** share one table. Two tables let the gate display a character it will not accept: the reader copies exactly what is on screen and is refused. (c) The conversion **MUST NOT** change what the reader sees. Difficulty, wording and format are product decisions and are out of scope for a change whose purpose is to remove a second authority; the obligation is discharged by comparing the rendered string, in every declared language, against the text that shipped, and the comparison is over the exact bytes — the per-language spacing, sign and punctuation conventions the catalogs already encode are part of the approved text, not noise to normalise away. (d) A gate keyed on a value the reader **must** match is not a place for a fallback. Where the authority cannot produce the value, the gate fails loud rather than showing a placeholder, an empty string or a default: a challenge nobody can answer and a challenge everybody can answer are both failures of the thing the gate exists for.  |

---

## Stated enforcement limit — a gate whose catalog key is composed at runtime

The supply half of [**I18N-RN-M10**](internationalization-rn.md) can be guarded, and such a guard does not reach this row's own call site. A guard of that kind derives, from the reference catalog, every key that declares a placeholder and fails when a translator call on that key omits it. It resolves a key only where the key is written as a string literal in the call — its own declared limit, and not a defect in it: where the key is assembled at runtime the catalog entry it lands on is decided while the program runs, and no single file's syntax tree can name it.

A confirmation gate is a shared component, so it is precisely the shape that composes its key. One component serves several call sites, each passing its own key prefix and namespace, and the lookup is therefore built rather than typed. Verified by introducing the violation deliberately against the real tree ([**FP-M20**](../false-positive/check-verification-rules.md)(c)), a literal-key guard stays green on a composed-key call that drops its placeholder arguments, so this class is not under that guard. Use the enforcement mechanism the adopting project documents, and record its actual scope and limits.

What holds the class instead, and why that is not a weaker answer. The obligation above is discharged structurally: one constant produces the accepted answer *and* the rendered value, so there is no second place for the two to diverge — a stronger guarantee than a check that reports divergence after it exists. Cross-language parity of the placeholder set is separately gated ([**I18N-CAT-M4**](user-text-catalogs-and-parity.md)(b)), which closes the "one locale silently loses the placeholder" half across every declared language.

What a check would need in order to close the remaining half. A derivable binding from a composed key to the catalog entries it can resolve to — the set of prefixes a component is reachable with, taken from the type that constrains them rather than from a hand-written list, which is the parallel authority that goes stale in silence (**I18N-CAT-M4**(c); **SSG-M8**). Where a project's key prefixes are already a closed union type, that binding is derivable and the check is buildable as an aggregate; where they are free strings it is not, and this paragraph is the statement that the half is carried by review rather than covered.

# Internationalization (React Native / Expo)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** translation catalogs, localization, pluralization, RTL, user-visible text

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) -- **P1-P8** when this topic is in scope (P8 verification when implementation-bound); cite in deliverables per [markdown-authoring **M16**](../authoring/markdown-authoring.md).

Purpose: Normative single source of truth for user-visible text the product shows a reader -- app strings, pluralization, interpolation and language switching on React Native with Expo, plus the catalog obligations that hold wherever the text is emitted from, including a server. Complements [locale names](../locale-names/README.md) (rule prefix LCN-*) for ISO country/currency labels only.

Normative core: [`internationalization-rn.md`](internationalization-rn.md) for the RN/Expo stack; [`user-text-catalogs-and-parity.md`](user-text-catalogs-and-parity.md) for the stack-independent catalog obligations, banded with [`confirmation-gate-challenge-authority.md`](confirmation-gate-challenge-authority.md), [`orthographic-corruption-shapes.md`](orthographic-corruption-shapes.md), [`catalog-gate-scope-and-source-direction.md`](catalog-gate-scope-and-source-direction.md), [`catalog-gate-unresolvable-call-shapes.md`](catalog-gate-unresolvable-call-shapes.md) and [`product-term-visible-surface.md`](product-term-visible-surface.md) — the complete **I18N-CAT** part set. This README routes; it defines no rule rows.

---

## Scope (hub)

- Included: Translation resources, namespaces, `useTranslation`, device locale via expo-localization, fallback language, RTL layout flags where required, TypeScript-safe key patterns, no silent missing-key display in production builds (policy in normative file). Also the server-emitted user-visible string -- notification and e-mail bodies, SMS, push payloads -- its catalog authority, its recipient-language chain, and cross-language key/placeholder parity (**I18N-CAT**-*).
- Excluded: ISO country/currency display names from codes -- [locale names](../locale-names/README.md). The registered-error message contract, which the error policy owns (**M29**) and which **I18N-CAT-M1** treats as one consumer of a catalog rather than its boundary. Legal PDFs fixed to one locale unless the same pipeline uses this hub for in-app language. Which word is correct in a given language -- there is no per-language term authority; the limit and what a check would need are stated in [internationalization-rn.md](internationalization-rn.md) under "Stated enforcement limit -- per-language terminology".

Decision gates: Applies -- wrong layer (hardcoded strings vs i18n) causes locale drift and unshippable gaps on new languages.

Environment: Applies -- align Expo SDK versions with `npx expo install` for expo-localization; verify Hermes / Intl behavior per Expo release notes for plural rules.

---

## Reading order (routing)

Each entry names the file that defines those rule IDs; the obligation is in that file, not in this list.

1. [internationalization-rn.md](internationalization-rn.md) -- Definitions (**I18N-RN-D1-I18N-RN-D5**), agent contract (**I18N-RN-C1-I18N-RN-C2**), **MUST** (**I18N-RN-M1-I18N-RN-M18**; M15–M18 formatting locale + region, week start, collation, distance unit), SHOULD (**I18N-RN-S1**), the retired-identity gap that file records, **M10**'s split enforcement status (its supply half — a declared placeholder no caller fills — is guarded; its number-identity half stays review-carried, with why a value-only predicate is the wrong one), and the per-language terminology limit.
2. [internationalization-prohibitions.md](internationalization-prohibitions.md) -- **I18N-RN-N1-I18N-RN-N10** -- fixed-language fallback in every shape, hardcoded strings, ISO label duplication, a second placeholder engine, a fixed language-code default, the startup catalog-loading shape (active + fallback only, one loader authority, load before the engine switches, with the enforcement split stated), and the validation branch a schema library still answers in its own language because the author's message was bound to one rule only (**N10** — the missing-value branch, which is the branch a selection field always takes; it is the language half of [forms **M14**](../forms/forms.md)'s schema-message obligation, not a second copy of it).
3. [user-text-catalogs-and-parity.md](user-text-catalogs-and-parity.md) -- **I18N-CAT-M1-I18N-CAT-M5**, **I18N-CAT-M10**, **I18N-CAT-M11**, **I18N-CAT-M12** -- the catalog authority behind server-emitted user text, recipient-language resolution, which mechanism rows are stack-independent, cross-language key/placeholder parity as a gate, the change set a reported product-term collision owes, and per-language casing, capitals and emoji in catalog values. This part carries no backend-only negative.
4. [confirmation-gate-challenge-authority.md](confirmation-gate-challenge-authority.md) -- **I18N-CAT-M6** -- the second band of the **I18N-CAT** family: what a catalog owes when the reader's typing is measured back against the code, why a stale challenge blocks the operation instead of misinforming, why the blockage can exist in one language alone, and the measured limit that the interpolation-supply guard does not reach a gate whose catalog key is composed at runtime.
5. [orthographic-corruption-shapes.md](orthographic-corruption-shapes.md) -- **I18N-CAT-M7** -- the third band of the **I18N-CAT** family: why a spelling audit is scoped by the transformation that damaged the word rather than by the word class, the three measured shapes (mark stripping, digraph expansion, elision dropping) and why one arm's predicate is structurally blind to the other two, the corpus-dominance evidence that decides a misspelling without a dictionary, why a corrected spelling is taken from the corpus rather than composed, and the stated limit that a correct form the language has never written cannot be seen.
6. [catalog-gate-scope-and-source-direction.md](catalog-gate-scope-and-source-direction.md) -- **I18N-CAT-M8** -- the fourth band of the **I18N-CAT** family: the two decisions a parity gate takes before its inputs are read — where its key set enters the catalog (the root, never a block inside it, and the composed object the program reads) and which direction it asks in, since catalog-to-catalog parity is structurally blind to a key no catalog holds; how two gates over one catalog divide it by subtraction from an authority rather than by a list; and the third direction, over the view tree, for a sentence that never became a key at all.
7. [catalog-gate-unresolvable-call-shapes.md](catalog-gate-unresolvable-call-shapes.md) -- no rule rows (`owns: none`) -- the fifth band of the **I18N-CAT** family: **I18N-CAT-M8**(d)'s two stated limits — a key assembled while the program runs, and a translator whose namespace binding is established in a different file from the call — each with what a closing check would need, why an adopting project may not have it, and why both close by a product change to the calling code rather than by a gate change.
8. [product-term-visible-surface.md](product-term-visible-surface.md) -- **I18N-CAT-M9** -- the sixth band of the **I18N-CAT** family: where the name of a product concept comes from once that concept is drawn on a surface the reader opens — the surface's own label, in the same language, rather than an invented word or a translated internal identifier; why the owning surface is the one the concept's audience sees even when the sentence addresses the other side of a two-sided product; why a pointer uses its destination's real title; what to do when the visible surface is itself the unclear name; and the stated limit that no check decides this, since the row removes the argument rather than the detection.

---

## Rule identifier prefix (normative index)

| Prefix | Meaning |
|--------|---------|
| **I18N-CAT**-\* | **MUST** rows that bind a user-text catalog whatever stack emits it |
| **I18N-RN-C**\* | Agent execution contract |
| **I18N-RN-D**\* | Definitions |
| **I18N-RN-M**\* | **MUST** |
| **I18N-RN-N**\* | **MUST NOT** |
| **I18N-RN-S**\* | SHOULD |

---

## Related

- [Locale names](../locale-names/README.md) -- LCN-\* for ISO label display.
- [Forms](../forms/README.md) -- validation messages and accessibilityLabel patterns.
- [Styling](../styling/styling.md) -- theme tokens; RTL may affect layout.

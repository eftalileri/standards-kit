# Catalog parity gates — what the gate's scope is derived from, and which direction it measures

```kit-cover
type: normative
part-of: README.md
binds: I18N-CAT-M8 -- where a catalog parity gate takes its scope from, and why the catalog-to-catalog direction alone cannot see a key no catalog holds
open-when: shape:frontend-heavy, shape:full-stack, signal:user-facing-string, signal:translation-catalog, signal:new-language
skip-when: signal:no-user-facing-string
owns: I18N-CAT-M8
```

**Keywords:** catalog parity gate, gate scope, derived key set, catalog root, source call site, missing key, raw key on screen, dynamic key, declared limit, two gates one surface

Scope

- Included: How a gate over translation catalogs decides *which* keys it asks about, and *which way round* it asks. The entry point its key set is derived from; the second direction that reads the keys the source actually calls; how two gates that share one catalog divide it; and how the call shapes a static reader cannot resolve are reported.
- Excluded: What parity itself **must** assert once the scope is fixed — completeness, placeholder parity, derived inputs, the typed-catalog half ([user-text-catalogs-and-parity.md](user-text-catalogs-and-parity.md), **I18N-CAT-M4**), which this row depends on and does not restate. The engine's placeholder syntax ([**I18N-RN-M6**](internationalization-rn.md)). Which word is correct in a language, and whether a value's letters were transliterated ([orthographic-corruption-shapes.md](orthographic-corruption-shapes.md), **I18N-CAT-M7**). Whether a gate should be staged over pre-existing debt, which is [**FP-M18**](../false-positive/check-design-rules.md)'s subject.
- Document type: Normative part — **I18N-CAT-M8**.

References: [README.md](README.md); [catalog-gate-unresolvable-call-shapes.md](catalog-gate-unresolvable-call-shapes.md) (this row's two stated limits, in the fifth band); [user-text-catalogs-and-parity.md](user-text-catalogs-and-parity.md) (**I18N-CAT-M4** — the parity obligations this row scopes, including (c) derived inputs and the fail-loud duty); [internationalization-rn.md](internationalization-rn.md) (**I18N-RN-M6** one catalog, one engine, one syntax; **I18N-RN-M10** the supply order); [ssot-principles-and-precedence.md](../ssot/ssot-principles-and-precedence.md) (**SSG-M8**); [check-design-rules.md](../false-positive/check-design-rules.md) (**FP-M18**, **FP-M19**, [**FP-M20**](../false-positive/check-verification-rules.md)); [mechanism-selection.md](../false-positive/mechanism-selection.md) (**FP-MS1**, **FP-MS4**); [kit-structural-invariants.md](../authoring/kit-structural-invariants.md) (**KIT-INV-8**).

---

## **MUST**

| ID | Rule |
|----|------|
| **I18N-CAT-M8** | A catalog parity gate **MUST** derive its scope from the catalog ROOT, and the catalog-to-catalog direction **MUST** be paired with a source-to-catalog direction. [**I18N-CAT-M4**](user-text-catalogs-and-parity.md)(c) binds the gate's *inputs* to their authorities; this row binds the two decisions taken before those inputs are read — how much of the catalog is in scope, and which way round the question is asked. The subordinate clauses below are part of this rule. |

<a id="i18n-cat-m8--clause-a"></a>

### Clause a — [I18N-CAT-M8](#must)

(a) The entry point is the catalog, not a block inside it. A gate whose reader descends to a named sub-tree before collecting keys has a scope that is a literal in the gate's own source, and it is the worst-disguised kind: the run reports a *derived* key count, which reads as a measurement of coverage, when it is only a measurement of the block the gate was pointed at. Nothing about the green line says how much of the catalog it did not open, and every namespace added after the gate was written lands outside it in silence. The key set is therefore collected from the catalog's root and the gate reports both numbers — leaves seen, leaves required — so the distance between them is visible rather than inferred. Where the catalog is composed at runtime from several modules, the object the gate reads is the composed one the program reads, taken from the single place that composes it; recomposing it inside the gate makes the gate a second authority for the composition (**SSG-M8**) and silently drops whatever the second copy forgets.

<a id="i18n-cat-m8--clause-b"></a>

### Clause b — [I18N-CAT-M8](#must)

(b) Catalog-to-catalog parity is structurally blind to a key NO catalog holds, and that is the class the reader sees. Parity asks "does every key of the reference language exist in the others"; a key the source calls but no catalog defines is in no reference set, so every language agrees, the difference is zero, and the gate is green — while the reader is shown the raw key or a generic last-resort sentence. The blindness is symmetric to (a): (a) loses keys the catalogs *do* hold, (b) loses keys they do not. A gate family over catalogs **MUST** therefore carry a direction that starts at the call sites: every key written as a literal where the program looks one up **must** resolve in at least one catalog. That direction reads source, so its key set is derived from the source's syntax tree — a textual scan of the same calls can hold a count constant while the members beneath it change, which is a measured failure shape in its own right.

<a id="i18n-cat-m8--clause-c"></a>

### Clause c — [I18N-CAT-M8](#must)

(c) Where two gates cover one catalog, the second's scope is derived by SUBTRACTION from the first's authority — never by a list. A surface that already has its own gate, with its own staged baseline, **must not** be counted a second time: two counters of one population diverge the moment one is corrected and the other is not (**SSG-M8**). The subtraction is computed from the authority that owns the first gate's key set, so a key that authority stops owning falls to the second gate automatically and no gap opens between them; an exclusion typed into the second gate is the stale list **I18N-CAT-M4**(c) already forbids one layer up. Two gates may legitimately read the same keys when their predicates differ — one asking existence, the other asking placeholder sets — and that is not a second counter.

<a id="i18n-cat-m8--clause-d"></a>

### Clause d — [I18N-CAT-M8](#must)

(d) A call shape the gate cannot resolve **MUST** be reported with a COUNT, in the gate's own source and in its output. Where the looked-up key is assembled at run time, no static reader can name the entry it lands on: asking anyway makes every such call a false positive, and skipping quietly makes the green line a claim the gate never measured. The third way is the required one — count them, break the count down by the shape that defeated resolution, and print it beside the successes, so "all clear" and "all asked" stay visibly different numbers ([**FP-M19**](../false-positive/check-design-rules.md); [**KIT-INV-8**](../authoring/kit-structural-invariants.md)). 

<a id="i18n-cat-m8--clause-e"></a>

### Clause e — [I18N-CAT-M8](#must)

(e) The source direction **MUST** also ask whether the rendered string went through the lookup AT ALL. (b)'s population is the keys the program *looks up*; a sentence written straight into the view tree as a literal child never becomes a key, so it is invisible to every direction above it — catalog-to-catalog finds no key to compare, and call-site-to-catalog finds no call to resolve. It is nevertheless the class the reader notices, because it renders identically in every declared language. A gate family **MUST** therefore carry a third direction over the view tree: a literal rendered as a display element's child is a finding unless it carries no letter in any script. The letter test is the whole exclusion and it is derived, not listed — punctuation, separators, digits and symbols do not translate, and requiring them in the catalog would write one character once per language; an allowlist of component or identifier names is the stale parallel authority (c) already forbids. That third direction **MUST** descend into the child's conditional branches, and where the literal DUPLICATES a non-text carrier the closure is REMOVAL, not invented copy. A string reached only through a `?:`, `||` or `&&` branch renders exactly as a bare literal child does, so a reader resolving only the bare form under-reports the class and its zero states a scope, not a measurement — the descent (f) requires of attribute values. Closing what it surfaces binds the second half: before inventing a word in every declared language, measure what else in that row already says the thing — an icon, a dimmed style, an unpressable control, a state the platform announces in the reader's own language. Where those carriers exist and the literal is additionally not announced at all (an explicit row label replaces its children's text for assistive technology), removal costs no information any user relied on, while an invented badge word in every declared language costs the risk of a new unreviewed product string in each of them. Removal is *measured*: name the carriers, the single condition driving each, and confirm nothing else in the row produces that signal.  Attribute positions are a different population and **MUST** be measured separately, never folded in: most attribute strings are machine identifiers, so one predicate over both positions cannot be born green ([**FP-M18**](../false-positive/check-design-rules.md)). 

<a id="i18n-cat-m8--clause-f"></a>

### Clause f — [I18N-CAT-M8](#must)

(f) That separate attribute predicate takes its discriminator from the ATTRIBUTE'S OWN NAME and the VALUE'S identifier shape — never from a file or component list — and it **MUST** descend into the value's conditional branches. (e) settles that the population is separate; this settles what separates it, because the obvious two answers both fail measurably. A name gate alone cannot work: the same attribute that carries a screen-reader sentence carries the machine identifiers, so fencing the name reports every one of them. A value gate alone cannot work either: an identifier and a one-word sentence are the same shape until something says which attributes are read to a person. The predicate is therefore both — a name test derived from the name's own ending (the suffixes a user-facing prop is spelled with, minus those spelled as key-carriers), and a value test that asks whether every letter-bearing static fragment is an identifier token in the project's own identifier casing. Two shapes of the value test are load-bearing and are missed by the obvious version: a fragment that is capitalised or spaced is a sentence even when it is pure ASCII, and a fragment reached only through a `?:`, `||` or `??` branch inside the value is still rendered — a reader that collects a template's static segments and stops there under-reports. Both halves are derived, so a new file inherits the gate and no list decays (the failure **I18N-CAT-M4**(c) names).  A directional gate cannot see a key DELETED from its reference — so deleting one is an operation the gate does not measure, and it **MUST** be done in every declared language in a single change set. Parity looks *from* the reference catalog *to* the targets: a key the reference no longer holds is asked about nowhere. Adding a key is therefore fenced and removing one is not, which inverts the usual intuition and is exactly why it is written down. Delete from the reference alone and the gate stays green while the dead text lives on in every other language — where, being unreachable, nothing will ever correct it; a label with zero source consumers survives in every other catalog, where some copies may even carry a hard-coded product fact in the sentence. The source-to-catalog direction this row requires does not close the gap either: it reports keys the source *calls* and cannot hold an opinion about a key nobody calls. *(The removal is a whole-set edit for the same reason **I18N-CAT-M5**(a) gives for a term replacement: the locales whose readers never report anything are the ones that keep the defect.)*

---

## Stated enforcement limits — in the fifth band

Clause (d)'s two unresolvable call shapes — a run-time-assembled key, and a translator bound in a different file from the call — are stated in [catalog-gate-unresolvable-call-shapes.md](catalog-gate-unresolvable-call-shapes.md) with what a closing check would need for each. The obligation to count them stays in (d) above, its only definition site.

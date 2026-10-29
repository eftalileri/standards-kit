# Markdown authoring — the bare file-local identifier limit

```kit-cover
type: normative
part-of: README.md
binds: the consequences of this topic's identifiers being bare -- that a new identifier family takes a hyphenated prefix unique in the kit, that a cross-file citation of a bare identifier uses the link form, and the declared gap where a root agent-rule file cites one
open-when: signal:plan-deliverable, signal:analysis-deliverable
skip-when: signal:no-markdown-deliverable
owns: none
```

Part of [Markdown authoring (deliverables)](markdown-authoring.md). The agent execution contract (**C1**–**C8**) and every M / N row are defined there and bind this limit; the required section order, **G1**/**G2**, **I1**–**I3** and the KV rows are in [markdown-authoring-deliverable-shape.md](markdown-authoring-deliverable-shape.md). Those two files plus this one are the complete band set for the deliverable family; this file defines no identifier of its own, which is what lets it exist without adding another bare name to the set the limit below freezes.

Document type: Normative part — one stated enforcement limit; defines no identifier.

References: [markdown-authoring.md](markdown-authoring.md) (**C1**–**C8**, **M1**–**M20**, **N1**–**N11**); [markdown-authoring-deliverable-shape.md](markdown-authoring-deliverable-shape.md) (**G1**, **G2**, **I1**–**I3**, **KV0**–**KV3**); [kit-structural-invariants.md](kit-structural-invariants.md) (**KIT-INV-3** one definition site, **KIT-INV-4** the outside-citation freeze, **KIT-INV-7** the hyphenated-prefix requirement for a new family); [kit-rule-addition.md](kit-rule-addition.md) (**KIT-ADD-5**(c), **KIT-ADD-6** the link-form citation); [kit-stated-limits.md](kit-stated-limits.md) (KIT-LIM — the sibling family of declared gaps).

---

Bare file-local identifiers require a cross-file citation in link form, for example `[M8](../ssot-readiness/ssot-readiness-rules.md)`. New identifier families **MUST** take a kit-unique hyphenated prefix; existing bare families are frozen because renaming changes their identity. Root agent-rule citations without a link cannot be resolved from the identifier alone.

# SSOT **MUST** — a duplicate authority that is declared, not stored (2/2): single values and raw inputs

```kit-cover
type: normative
part-of: README.md
binds: reusable shapes in which duplicate authority appears around a single value rather than a closed value set -- a sentinel shipped in place of a resolved value, or a consumer reading a derivation's raw input
open-when: never-by-default
skip-when: none
owns: none
```

Part of: [SSOT principles and precedence](ssot-principles-and-precedence.md). **SSG-M8** itself is defined there and is not restated here; this file carries only its applications, so the rule keeps exactly one definition site ([**KIT-INV-3**](../authoring/kit-structural-invariants.md)).

Example file: opened when the **SSG-M8** shape list names one of the shapes below; the closed-value-set shapes are in [declared, not stored (1/2)](ssot-must-duplicate-authority-declaration-shapes.md).

References: [SSOT principles and precedence](ssot-principles-and-precedence.md) (**SSG-M0**, **SSG-M6**–**SSG-M8**, **SSG-M23**); [authority, write access and derived fields](ssot-must-authority-and-derivation.md) (**SSG-M1**); [duplicate-authority applications](ssot-must-duplicate-authority-applications.md) (stored-state patterns); [closed value sets](ssot-must-duplicate-authority-declaration-shapes.md); [dead code](../dead-code/dead-code-rules.md) (**DCD-M2** — remove the losing copy in the same change).

---

## The sentinel token shipped in place of the value

Where a producer can resolve a value itself, shipping a SENTINEL TOKEN instead — a key the consumer is expected to recognise and translate — opens one authority per consumer for a decision the producer had already made. The shape appears wherever an entity has no name to print: a deleted record, an unresolved reference, a missing measurement. The producer knows the state; instead of emitting the text for it, it emits a marker (`'<namespace>.<entity>.deleted'`) into the display field and relies on every reader to special-case it. That marker is not data — it is an instruction to each consumer to re-derive the display decision, so the number of authorities for that decision equals the number of consumers, and each new one inherits an obligation nothing in the type declares. The fact that current consumers handle the token correctly is not evidence of safety. A bare copy of the token can survive while present consumers special-case it; a later consumer may treat it as display text. The failure is latent by construction: it arrives with the next consumer, not with the current one, which is why "it renders correctly" never closes this shape.

The test is whether the producer can resolve it, not whether the consumer can. Where the vocabulary and the audience's language are both reachable on the producer's side — a server-rendered report whose language is the tenant's, not the caller's — resolving there is a pure reduction: the wire carries finished text, the field's type stops lying, and derived operations over the field (ordering, grouping, search) start operating on what the reader sees rather than on the marker. Where the producer genuinely cannot resolve it — the audience's language is only known at the consumer — the token is legitimate, and then the obligation is the reverse one: the token has exactly one declaration, consumers import it rather than retyping it, and the fact that consumers must handle it is stated at the field's contract. Ordering is the tell: if sorting the collection puts the marker where its letters fall instead of where its text falls, the field is already being read as data by something that was never told about the special case.

Reducing this is a merge, so it is measured first ([**SSG-M23**](ssot-principles-and-precedence.md)). The producer's existing status vocabulary usually has a neighbouring entry for a related entity class, and wiring the consumer into the neighbour silently changes the words the user reads. First compare the producer's existing vocabulary with the needed display state. If the consumer has a distinct meaning, add an explicitly named arm to the single label authority; do not absorb it into a neighboring branch. [On violation: Bug — a display decision with one authority per consumer, whose failure arrives with the next consumer and shows a raw key where text belongs] [Verify by: the display field carries resolved text on the wire, or the token has one declaration, every consumer imports it, and the contract states the obligation; plus an import-level fence keeping the producer's text catalogue reachable through one resolver only]

## The sibling reading the raw input

Where a derived fact reaches more than one screen, every screen **MUST** call the derivation; a sibling reading its RAW INPUT field instead is a second answer to one question. It is not a second *writer* and it type-checks. It diverges only for the records the derivation exists for — raw field stale or never written — so the screens agree except in production. The ordering key is the half that does not follow: when ordering by it would mean deriving the whole matching set before paging, keeping the raw sort is a legitimate cost decision — but the shown value and the ordering key are then different facts, and that limit **MUST** be written at the contract, the registry row and the deferred-work record — unstated, it reads as coverage. [On violation: Bug — two screens answer one question differently] [Verify by: AST rule registering each consumer of the derivation]

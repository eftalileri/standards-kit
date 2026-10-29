# Code modularity — runtime modules (global SSOT)

```kit-cover
type: normative
part-of: README.md
binds: the single-responsibility module shape, the thin transport adapter and the one-helper-per-derivation rule for runtime modules
open-when: shape:refactoring, shape:frontend-heavy, shape:backend-heavy, signal:source-file-change, signal:module-split, signal:file-size
skip-when: signal:no-source-file-change
owns: COD-C1, COD-M3, COD-M4, COD-M5, COD-M6, COD-N3, COD-N4
```

Scope

- Included: TypeScript / TSX (or project equivalent) runtime source files: single responsibility, the thin transport adapter, and one named helper per repeated derivation, for feature hooks, screens, co-located UI modules and backend handlers.
- Excluded: Markdown deliverable length and split rules ([authoring/markdown-authoring.md](../authoring/markdown-authoring.md)); backend-only repository contracts ([repository/repository-contract.md](../repository/repository-contract.md)); monorepo workspace graph and package boundaries ([monorepo](../monorepo/monorepo-architecture.md) MRP-\*).

Document type: Normative — global SSOT for runtime module shape. **COD-C2**, **COD-C3**, **COD-C4**, **COD-M1**, **COD-M2**, **COD-N1** and **COD-N2** are not defined; the gaps are never back-filled.

Binding principle: Splitting a file to evade a locality rule in another topic (e.g. MUT- / QRY- rule IDs) is a bug.

References: [Gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md) M1 (single center for a concern); [Decision matrix](../decision-matrix/decision-matrix.md) — Domain business aggregation row (backend domain services, not controllers); [TanStack Query **QRY-M4**](../tanstack-query/queries-and-transforms.md); [Imports](../imports/component-and-module-imports.md) (IMP-\* / GIM\* for paths and feature boundaries); [Monorepo](../monorepo/monorepo-architecture.md) (MRP-\* workspace package graph); [Name consistency](../name-consistency/name-consistency.md) (NCM-\* — canonical display names in domain, not TS file names); [Markdown authoring](../authoring/markdown-authoring.md) (deliverables only — not runtime code); [False positive](../false-positive/check-design-rules.md) (**FP-M17** — why **COD-M6** cannot be mechanically enforced); [SSoT](../ssot/ssot-principles-and-precedence.md) (**SSG-M8** one authority per question, **SSG-M23** measure before merging). Monetary and revenue-reporting domain rules: [Payment SSOT](../payment-ssot/README.md) (supplements this file; does not replace COD-\* layout rules).

---

## Agent execution contract

The shared [agent execution contract](../_meta/agent-contract.md) applies.

**COD-C1**: This topic is mandatory for new or materially changed feature modules in product scope.

---

## **MUST**

**COD-M3**: Single responsibility: A file does not combine unrelated responsibilities; its line count is only a review signal, never a reason to split.

**COD-M4**: TanStack alignment: Where TanStack **QRY-M4** applies, the screen and its paired hook file each satisfy **COD-M3** on their own.

**COD-M5**: Transport adapter is thin: A module whose job is to receive a transport request and return a transport response — an HTTP controller, route handler, RPC handler, queue consumer entrypoint or their project equivalent — must contain only adapter work: read and shape the input, delegate, map the result and the error to the transport, return. Every business decision the request implies — invariants, authorization outcomes, multi-entity orchestration, derived values, state transitions, compensations — must live in a named domain module the adapter calls, and that module must be callable from a second transport without change. The rule is about *where the decision is taken*, not about which storage API is used: delegating persistence to a repository does not make an adapter thin, because the decision can still sit in the adapter. [Consequence: business rules become reachable only through one transport, cannot be reused or tested from another entrypoint, and drift between two transports that implement "the same" operation.] [Verify: for each decision in the adapter body, name the domain module it belongs to and show the adapter only calls it; a second caller of that module — an existing one or a plausible one named in the deliverable — must need no adapter code.]

**COD-M6**: One derivation, one named helper — inside a single module too: When the same multi-step derivation of a value (normalize, then parse, then strip — or any equivalent chain) is written more than once inside ONE file, each copy is an independent authority for the same question, and the module can answer that question differently in different places the moment one copy is corrected and the others are forgotten. Extract exactly one named helper and route every site through it. The helper stays LOCAL to that module when no other tier needs it — this is a single-file duplication problem, not a cross-boundary contract, so exporting it or lifting it into a shared package is a different (and usually wrong) change. Measure equivalence before merging: compare the copies step by step — order of operations, exact patterns, edge handling — and record the comparison. If every copy is byte-identical, merge them as they are. If any copy DIVERGES, the merge must not flatten the difference: determine by measurement which behavior is correct, and give the helper a NAMED branch for the divergence that survives, so the merge cannot silently delete a behavior some caller depends on. [Consequence: the same input classifies differently in the same module; a one-line correction reaches a fraction of the call sites and the gap is invisible at review because every copy still "looks right".] [Verify: name the sites the helper replaced and show the equivalence measurement that preceded the merge; where a branch was kept, name the caller whose behavior it preserves.]

---

## **MUST NOT**

**COD-N3**: Place a business decision inside a transport adapter — forbidden. This includes an invariant check, an authorization outcome, a cross-entity orchestration, a derived business value or a state transition written in the controller/handler body, and it stays forbidden when the adapter is short: a five-line adapter that decides is still the wrong owner (**COD-M5**). Satisfying a persistence-access rule is not a defence, and neither is "the domain module would only have one caller".

**COD-N4**: Leave a verbatim-repeated derivation standing because "it is only a few lines" or "it is all in one file anyway", or collapse repeated copies into one helper WITHOUT first measuring that they are equivalent — both forbidden (**COD-M6**). Size is not the criterion; number of authorities for one question is. A merge performed without the comparison is a silent behavior deletion, and it is indistinguishable from a correct merge in the resulting diff.

---

## Implementation checklist

- [ ] **COD-M3** responsibility boundaries clear
- [ ] **COD-M4** + **QRY-M4** where TanStack screens/hooks exist
- [ ] **COD-M5** / **COD-N3** every business decision the request implies is named and lives in a domain module the adapter calls
- [ ] **COD-M6** / **COD-N4** no derivation is written twice inside one module; where copies were merged, the equivalence measurement is recorded

---

Part of: [README.md](README.md) — code modularity hub.

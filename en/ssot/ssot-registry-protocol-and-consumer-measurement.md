# SSoT Registry — update and consumer-measurement protocol

```kit-cover
type: normative
part-of: README.md
binds: the executable registry procedure -- Section 4's ordered update protocol and Section 5's counting contract plus the repeatable consumer-measurement recipe that SSG-R3 and SSG-R4 read from
open-when: signal:registry-update, signal:new-semantic, signal:authority-move
skip-when: signal:no-ssot-surface
owns: none
```

Part of: [SSoT Registry rules](ssot-registry-rules-and-protocol.md), where **SSG-R1**–**SSG-R6** are defined and bind every step below; both files hang off the [reusable authority map](ssot-registry.md). No rule identity is defined here; this file carries only what an agent runs. Project-specific commands, paths and identifier conventions belong in the adopting project's registry.

References: [SSoT Registry rules](ssot-registry-rules-and-protocol.md) (**SSG-R1**–**SSG-R6**); [registry map](ssot-registry.md); [SSoT principles and precedence](ssot-principles-and-precedence.md) (**SSG-M6**–**SSG-M8**, the lifecycle Section 4 walks); [dead code](../dead-code/dead-code-rules.md) (**DCD-N4**, **DCD-M8** — the two counting traps Section 5 fences).

---

## Section 4 — Update protocol

**SSG-M8** application — derived work indexes. When one living-work ledger owns status and an index repeats the assigned work in multiple named tables, the index is a read-only projection. A cross-file comparison checks the active identifiers in those tables against each other and against the ledger's live status; a partial status with a remaining obligation is live. A recorded product decision is live only when its stated implementation remains pending; the decision label alone is insufficient. Retired identifiers are rejected only in cells that claim current work, not in historical prose. Such a comparison must derive table columns from headers and fail if a required table or its measured subject set disappears. A ledger item without an index assignment is not inferred to be missing from the index; that relationship requires an explicit assignment authority. A mechanical index/ledger check protects documentation bookkeeping only and fails the admission test ([**ENA-A3**](../enforcement-architecture/enforcement-admission.md), [**ENA-N10**](../enforcement-architecture/enforcement-anti-patterns.md)); index/ledger parity is review-bound.

**SSG-M8** application — authority lookup. A search convenience over an authority registry is a read-only projection. It derives hits from the registry's parsed rows themselves, expands a row's contract pointer only after validating its target and anchor, and refuses an empty or partially routed corpus. A separately maintained search index would need a freshness gate and a second reader for the same registry; where a direct query is fast enough, query the rows on demand instead. The lookup must expose the authority, contract, consumers and row-specific Guard from one result, without becoming a writer of any of them. A contract field continues through its own following lines until the next field or block heading; a missing consumer or related field stays explicitly absent, never replaced with unrelated contract prose. A defect in one row, header, link or block must never hide another row: the lookup still emits every match, reports every defect with its `file:line` in the same run and exits non-zero ([**FP-M19**](../false-positive/check-design-rules.md)); aborting on the first defect turns one bad row into a failure of every query. Field and column recognition derive from the role word of the label, never from a hand-kept list of label spellings, so a reworded or new row needs no lookup change. A free-text query matches when every word occurs, in any order, somewhere in the row's cells, its linked block or its body, folded for case, locale-specific letters versus ASCII, Unicode form and Markdown marks; semantic-cell hits rank first. The adopting project documents its lookup command, if any.

1. **SSG-M6** / **SSG-R1**: search the domain routing table and read the matching registry file; search architecture, schemas, types and implementation sources for the same semantic. If an adequate authority exists, use it and confirm that its registry path and contract are current.
2. **SSG-M7**: if none exists, create exactly one authority before adding consumers.
3. **SSG-M8**: if the authority is insufficient, refactor it; leave no parallel path. Where parallel authorities exist, compare their behavior, preserve any legitimate distinct modes explicitly, route consumers through one authority and retire the duplicate in the same change.
4. Update the registry: add the row to the relevant registry file with its **SSG-R3** consumer cell (the find pattern that re-derives the consumers first; no bare count; with no consumer, `no consumers — <reason>`). Build the pattern with the Section 5 recipe and counting contract. The row and contract block carry only the **SSG-R6** content budget. The number of rows is set by **SSG-R6** — one row per authority; type/schema files are named on the contract-shape line of that row's contract block, never given a row of their own. The identifier is allocated by **SSG-R5** — under the default numeric policy, read the highest identifier across all registry files fresh and add 1. The new identifier is not written into the routing table; only when a new registry file is opened is its file name added to the domain's routing row (a new domain opens a new routing row).
5. Cache bridge consumers: where the registry has a cache bridge or mutation-cache row, a new direct or cross-entity write path is added by name to the closed, complete name list of its consumer cell under **SSG-R4** — no count, no `+`/`etc.` tail; conformance with TanStack **MUT-M20**–**MUT-M22** (server side: Redis **RDS-M20** (a) / **RDS-N12**) is verified in review.
6. Verify: if the project provides a lookup, it returns the new row; the row's shape is verified in review. Name a row-specific check only when it enforces that row's invariant and its real scope covers the current authority path; otherwise record `review` and the known limit (**SSG-R2**).
7. Repair local references: links, contract blocks, domain routing and project-local rule references are updated in the same change; paths and anchors resolve and retired entries cannot be mistaken for live authorities.
8. Commit and review under the project's conventions; the registry row is mandatory in review of the change. Run the project's applicable documentation and source gates; a missing project-specific validator is reported honestly, never invented.

> When a row is retired, the file's cover-block `owns:` does not change. The retired row stays in the table as a tombstone (for example `~~N~~`) and its identifier stays in the file's `owns:` field: `owns:` is an identity allocation declaration, not a list of live rows (**SSG-R5**); a dropped identifier becomes ownerless and could be defined a second time in another file. A project-provided identity extractor ([**KIT-ADD-7**](../authoring/kit-rule-addition.md)) tolerates the tombstone marker and reports a disagreement between `owns:` and the table. The denominator of "how many live records are there?" is the table rows, not `owns:`.

> Authority symbol claim (symbol half of **SSG-R2**): a source path in the Authority cell carries, in the parenthesised group immediately after it, at least one valid inline-code identifier claim; an empty group, prose, or a group that yields no claim is not protection. Verification is by review.
>
> Claim classification procedure: first verify the registry row's semantic, then verify that the source declaration actually carries that semantic. A consumer, a pure contract shape or a historical path does not receive an Authority claim: it is removed from the Authority cell or moved to the correct consumer or contract-shape surface. If the real runtime authority is only an anonymous expression, it is extracted into a single, unambiguous binding without changing behavior, and the row is bound to that; an arbitrary binding found in the file cannot be claimed (**SSG-R2**, **SSG-R6**).

---

## Section 5 — Consumer knowledge: declared limit and measurement recipe

This section is the single measurement authority for **SSG-R3** and **SSG-R4**; it is not repeated per record.

Counting contract. As long as what constitutes a consumer stays undefined, it cannot even be said whether a result is "correct". Definition:

- The authority file itself is not a consumer — it is excluded from the enumeration.
- Type-only imports are included. A type-only import is also bound to the contract and must be updated when the authority moves, so it is a consumer.
- A re-export is a path, not a consumer. The barrel/re-export file is not named; what counts is the real use site at the end of that path (otherwise one real consumer appears twice).
- Third-party dependency directories and generated or built output are excluded. Scanning generated/packaged output and concluding "used" violates [**DCD-N4**](../dead-code/dead-code-rules.md) — built output is only a copy of the source and counts the same use a second time.
- A published wire surface is invisible in the source tree. An old client binary in the field is a consumer and no scan can find it — [**DCD-M8**](../dead-code/dead-code-rules.md). Such a consumer is written into the cell by name with a **DCD-M8** reference; the silence of the scan does not mean "no consumers".

Recipe (executable). For each exported symbol of the authority separately:

```bash
grep -rlw '<symbol>' <source-dirs...> \
  | grep -E '\.(<source-extensions>)$' \
  | grep -v '<authority-path>'
```

The resulting file list is raw input, not the answer: each file is opened and it is verified that the use really consumes this authority (a same-named local symbol is eliminated). The cell first records this pattern (symbol + search scope); a count or names are optional, and in the **SSG-R4** class names are mandatory (**SSG-R3**). With more than one symbol, the lists are combined and deduplicated.

This section's own limit. The recipe is a manual measurement; no gate runs it and no gate compares its result with the cell (the declared limit in **SSG-R3**). The information needed — cross-resolution of the whole tree plus the horizon of clients in the field — exists neither in a single file's AST nor inside the registry itself; so what is written here is not a check but a repeatable method. Writing the method down makes the measurement auditable: two people running the same recipe get the same list. Unless the adopting project supplies a validated cross-file inventory mechanism, consumer completeness stays a review obligation.

Part of: [SSoT governance](README.md) — [registry map](ssot-registry.md).

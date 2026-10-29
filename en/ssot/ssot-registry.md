# SSoT Registry — reusable authority map

```kit-cover
type: normative
part-of: README.md
binds: the registry structure and the procedure for recording a new project's authorities
open-when: signal:new-semantic, signal:authority-lookup, signal:registry-update
skip-when: signal:no-ssot-surface
owns: none
```

## Purpose

The registry is a project-maintained map of canonical authorities. It records where each authority lives, what it owns, who consumes it, and how the project verifies its contract. It is not itself an authority for runtime data and must not duplicate full implementation details.

This copy contains no project's authority entries. Each adopting project creates its own domain routing table and registry rows using the template below. Keep repository-specific paths, symbols, identifiers, commands, and examples in that project's registry only.

Environment: applies at runtime (consumers import the authority paths the registry lists) and in human review; each row's own Guard cell names its row-specific mechanism. Registry shape itself is review-bound ([**ENA-N10**](../enforcement-architecture/enforcement-anti-patterns.md)).

Binding principle: a stale or wrong registry breaks **SSG-M6** (locate the existing authority). A wrong path or a parallel definition is a bug — STOP; fix the registry and the row's mechanism in the same change as the authority change.

## Domain routing table

Create one row per project-defined domain (split a domain across files, or the routing table across parts, only when needed to keep the registry navigable):

| Domain | Registry file(s) |
|---|---|
| `<domain>` | `<registry/<domain>.md>` |

The routing table is the single entry point and the only source of domain routing. A routing row carries only the domain name and that domain's registry file names — no row counter, topic list or domain summary, which would be a second description of the rows (**SSG-M8**). New authority work searches this table first and opens the applicable registry file. Do not maintain a parallel hand-written routing list elsewhere; a second routing surface is rejected in review. If the project has no authorities registered yet, leave the table empty and state that explicitly.

## Authority row template

Create one row per authority: one writer of stored data, one executor of an operation, or one canonical derivation. A type, schema, enum, or validation shape that describes an authority is named inside that authority's row rather than given a second row. Use project-relative paths. A row carries nothing beyond the **SSG-R6** content budget.

| ID | Semantic | Authority | Contract | Consumers | Guard |
|---|---|---|---|---|---|
| `<next unique ID>` | `<the one question or datum it owns, one sentence>` | `<project-relative path>` (`<symbol or operation>`) | `<link to the contract block, or the governing rule id>` | `<find pattern first (SSG-R3); names where required>` | `<row-specific mechanism, or review>` |

For a detailed contract, use a project-local contract block linked from exactly one row. A contract block carries only what a consumer must honour — input/output, invariants, error behaviour — plus the line naming the contract-shape files. Keep each authority's contract and consumer pattern current with the implementation.

## Recording a new project's authorities

Follow this order for each new semantic or authority change:

1. Classify the semantic as stored data, an operation, or a canonical derivation. Search the project registry and relevant architecture/schema sources before designing a new authority.
2. If one sufficient authority exists, use it, cite its path in the deliverable's references, and verify that its registry entry points to the current path and contract.
3. If no authority exists, define exactly one owner/writer (or canonical derivation) first (**SSG-M7**), then implement consumers against it. If a KAT applies, add the category's lint row or registration where [**ENA-A1**](../enforcement-architecture/enforcement-admission.md) admits it (**SSG-A-1**). Record the new authority in the registry in the same change (**SSG-R2**).
4. If multiple parallel authorities exist, consolidate to one and remove the obsolete path in the same change. Record the surviving authority and update every consumer.
5. Assign a stable, unique identifier using the project's chosen ID policy (**SSG-R5**). Never reuse a retired identifier. If identifiers are not useful for the project's scale, use stable semantic headings instead.
6. Record consumers by the find pattern that re-derives them (**SSG-R3**). Include type-only imports and actual use sites; do not count a barrel/re-export as a consumer when the consuming site can be named. Account explicitly for consumers outside the source tree, such as released clients, where applicable. If there are no consumers, state why.
7. For cache bridges or mutation orchestrators, list every direct and indirect write path by name (**SSG-R4**). Keep this list closed and exhaustive; do not use open-ended counts or "etc.".
8. Name only verification that checks the row's invariant. Put registry-wide structural validation once at the registry level, not in every row. Use `review` when no mechanical check covers the invariant and state the limit in the relevant standard.
9. Update domain routing (only when a registry file is added) and all project-local links to the row in the same change. Verify the registry links and listed paths resolve.
10. Run the adopting project's required documentation and source gates; include registry validation or lookup if the project provides it.

## Authority lookup

A search convenience over the registry is optional. Where the project provides one, it is a read-only query over the registry rows themselves, not a gate and not a separately maintained index (the obligations are the authority-lookup application in [the update protocol](ssot-registry-protocol-and-consumer-measurement.md#section-4--update-protocol)). Each match returns the source `file:line`, the row's status (live, retired, unparsed), every cell of the row, the linked contract block and the row's body table; a field the source does not declare stays explicitly absent. A free-text query matches every word in any order across cells, block and body, ignoring case, letter-folding and Markdown marks. Row syntax defects (**SSG-R5**, **SSG-R6**) never hide other rows: every query lists them with `file:line` and exits non-zero; zero matches exits with a distinct code.

## Registry-wide notes

Record project-specific anti-patterns, screen or module maps, and implementation details only when the adopting project has verified evidence and a clear maintenance owner. Keep those details out of this reusable standard. No separate notes file or per-domain summary is written for registry rows — a binding caveat goes into the row's contract block (**SSG-R6**).

Rule identities (**SSG-R1**–**SSG-R6**), the failure path and the maintainer checklist: [registry rules](ssot-registry-rules-and-protocol.md). Update protocol and consumer-measurement recipe: [update and measurement protocol](ssot-registry-protocol-and-consumer-measurement.md).

Part of: [SSoT governance](README.md).

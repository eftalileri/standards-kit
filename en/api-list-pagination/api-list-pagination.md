# API list pagination (backend SSOT)

```kit-cover
type: normative
part-of: README.md
binds: the GAPI agent execution contract, the GAPI-T1 threshold and the GGAPI decision gates that route cursor vs skip/offset paging
open-when: shape:backend-heavy, signal:list-endpoint, signal:pagination
skip-when: signal:client-only, signal:no-list-endpoint-change
owns: GAPI-C*, GAPI-T1, GGAPI*
```

**MUST** / **MUST NOT** rows of this topic (**GAPI-M1**–**GAPI-M11**, **GAPI-N1**–**GAPI-N4**) live in [list-response-and-cursor-rules.md](list-response-and-cursor-rules.md) and are cited from here by ID, never restated. Non-binding traceability tail: [api-list-pagination-appendix.md](api-list-pagination-appendix.md).

Scope

- Included: HTTP list endpoints that return collections with pagination (REST or documented GraphQL list fields ); PaginationResponse contract; cursor vs skip/offset; stable ordering for cursor lists; default/max limit; N+1 prevention; invalid cursor and empty results; client alignment (TanStack Query patterns ) local minimum.
- Excluded: Database index design ([nosql-declaration-index-and-destructive-writes.md](../nosql-query-safety/nosql-declaration-index-and-destructive-writes.md), [repository-index-migrations-and-validated-reads.md](../repository/repository-index-migrations-and-validated-reads.md)); full HTTP error taxonomy ([error policy](../error-policy/error-policy.md)) — this file binds only pagination failure minimums ; repository internals ([repository contract](../repository/repository-contract.md)) except where list handlers call repositories.

Document type: Normative — rule engine for list pagination .


Environment: Applies — server handlers ; logging follows [logging policy](../logging-policy/logging-policy.md) at call sites .

Binding principle: [Shared agent contract C4](../_meta/agent-contract.md) applies to every **GAPI-M** / **GAPI-N** row (**GAPI-C4**).

References: [README.md](README.md); [error policy](../error-policy/error-policy.md); [TanStack Query](../tanstack-query/README.md) (client alignment ).

Code samples (non-normative): [`../_meta/examples/api-list-pagination-code-samples.md`](../_meta/examples/api-list-pagination-code-samples.md).

Repository program (non-normative routing aid): The adopting project's repository-wide test-artifact prohibition applies here. The **GAPI-M** / **GAPI-N** rules in [list-response-and-cursor-rules.md](list-response-and-cursor-rules.md) and the GGAPI rules here remain authoritative.

---

## Normative constants

| ID | Value | Meaning |
|----|-------|---------|
| **GAPI-T1** | 10000 | Maximum documented upper bound on filtered row count for which skip/offset paging may be used (see GGAPI1 ) . |

Carve-out (bounded small lists): If the route-registration comment or the project's endpoint catalog row states a hard maximum row count ≤ **GAPI-T1** (e.g. enum values, fixed room slots ) , that statement satisfies the documented bound for GGAPI1 without a per-request count query .

---

## Rule identifiers (normative)

| Prefix | Meaning |
|--------|---------|
| **GAPI-C\*** | Agent execution contract . |
| **GAPI-M\*** | **MUST** . |
| **GAPI-N\*** | **MUST NOT** . |
| GGAPI\* | Decision gates (normative index ) . |

---

## Agent execution contract

| ID | Rule |
|----|------|
| **GAPI-C1** | This topic is mandatory for in-scope list endpoints (Scope ) . |
| **GAPI-C2** | [Shared agent contract C2](../_meta/agent-contract.md). |
| **GAPI-C3** | [Shared agent contract C2](../_meta/agent-contract.md); pagination choices come only from **GAPI-M**/GAPI-N and GGAPI rows here ; deviation → STOP . |
| **GAPI-C4** | [Shared agent contract C4](../_meta/agent-contract.md). |
| **GAPI-C5** | Precedence: [error policy](../error-policy/error-policy.md) wins on HTTP status and semantic error codes ; this file adds pagination shape and routing minimums only . |



---

## Decision gates (normative index) — GGAPI

Use this table first when choosing cursor vs skip . Gates cite existing **GAPI-M**/GAPI-N rows ; they do not add hidden requirements .

| Gate ID | Proceed YES when | Binding rule IDs | If NO |
|---------|---------------------------|------------------|------------|
| GGAPI1 | Documented upper bound on filtered rows for this endpoint is ≤ **GAPI-T1** (10000), or the resource is marked in the route-registration comment or the project's endpoint catalog row as a bounded small list (hard cap ≤ **GAPI-T1** ) . | **GAPI-M4**, **GAPI-N2** | Cursor pagination required for paging ; must not use offset/skip for sequential pages (**GAPI-M4**, **GAPI-N2** ) . STOP until design or catalog is updated . |
| GGAPI2 | Stable total ordering across pages is not a stated contract requirement for this endpoint (e.g. best-effort feeds ) , or the endpoint returns at most one page . | **GAPI-M6**, **GAPI-N3**, **GAPI-N4** | Cursor-only pagination for multi-page sorted lists ; must not use offset/skip for page traversal (**GAPI-M6**, **GAPI-N4** ) . |
| GGAPI3 | GGAPI1 is YES and GGAPI2 is YES (both ) . | **GAPI-M5**, **GAPI-M3** | Skip/offset paging may be used subject to **GAPI-M3** ; if either gate fails , do not rely on offset for multi-page traversal — use cursor per **GAPI-M4** / **GAPI-M6** . |

Ordering of evaluation : GGAPI1 → GGAPI2 → GGAPI3 .

<a id="gapi-m8-application--durable-work-hidden-by-the-ordinary-list"></a>

## Durable work hidden by the ordinary list — [**GAPI-M8**](list-response-and-cursor-rules.md) application

If a normal list intentionally excludes records after a durable, retryable operation begins, the owner needs a separate authenticated, bounded discovery read for those unfinished records. The read derives its scope from persistent actor and record ownership, not a client panel projection; it returns only the identity and display fields needed to resume. Otherwise a restart can make a committed partial operation impossible to find. The discovery list follows **GAPI-M1**–M10, including a hard limit and stable cursor when no hard population bound is known. The relationship between the ordinary-list filter, the persistent operation state and the recovery read is cross-file and domain-specific, so it requires review; a single-file lint predicate cannot prove it.

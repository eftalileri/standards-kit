# MongoDB indexing for cascade (editable persistent attributes)

```kit-cover
type: normative
part-of: README.md
binds: MCI-C, MCI-M and MCI-N -- verifying or creating the indexes that back every cascade filter predicate before a large cascade runs
open-when: shape:backend-heavy, signal:editable-attribute, signal:mongo-cascade, signal:mongo-index
skip-when: signal:no-denormalized-copy, signal:client-only
owns: MCI-C1, MCI-C2, MCI-C3, MCI-C4, MCI-M1, MCI-M2, MCI-N1
```

Scope

- Included: Before large cascade work, verify or create indexes on fields used in filter predicates (tenant id, entity ids, `data.type`, join keys); testability of index presence.
- Excluded: Full database performance tuning — only cascade-relevant filters; query injection — [NoSQL query safety](../nosql-query-safety/nosql-zod-and-sanitizefilter.md).

Document type: Normative — part of `editable-persistent-attributes/` hub.

Decision gates: Applies — [decision gates](decision-gates.md) (GEPA8).

Environment: Applies to MongoDB deployments, whether managed or self-hosted.

References: [README](README.md); [cascade engine](cascade-engine.md) (**CAS-M6**).

---

## Rule identifiers (normative)

| Prefix | Meaning |
|--------|---------|
| **MCI-C**\* | Agent execution contract. |
| **MCI-M**\* | **MUST**. |
| **MCI-N**\* | **MUST NOT**. |

---

## Agent execution contract

| ID | Rule |
|----|------|
| **MCI-C1** | This file is mandatory when adding or changing cascade queries that filter MongoDB collections. |
| **MCI-C2** | Apply [shared **C4**](../_meta/agent-contract.md). |
| **MCI-C3** | Apply [shared **C2**](../_meta/agent-contract.md). |
| **MCI-C4** | STOP if production cascade ships without index verification for every new filter field introduced on a large collection (**MCI-M1**). |

---

## **MUST** — **MCI-M**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| MCI-M1 | Before releasing a cascade that filters a large collection, confirm an index supports the actual filter fields or add an index through the datastore's migration process. | Full collection scan — bug / outage risk on large data. | Review index metadata or deployment evidence for the relevant query shape. |
| **MCI-M2** | When **CAS-M6** introduces a join or lookup path, indexes **MUST** exist on both sides’ join keys used in cascade or be added with the feature. | N+1 or scan — bug. | Same as **MCI-M1** for join key fields. |

---

## **MUST NOT** — **MCI-N**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **MCI-N1** | Must not ship a first production cascade on a large collection with only unindexed filter fields that **MCI-M1** lists for that query shape. | Operational bug — must not ship. | PR review blocks merge until **MCI-M1** evidence exists. |

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|-------------------|
| Staging has no index but prod should | STOP — add index before enabling cascade in prod (GEPA8). |
| Index exists with wrong key order for filter | STOP — fix index design; **MCI-M1** Verify must fail until fixed. |

---

## Verification note

**MCI-M1** requires observable evidence that the relevant indexes exist, such as an index-listing command or deployment record; an unverified assumption is insufficient.

---

Part of: [README.md](README.md).

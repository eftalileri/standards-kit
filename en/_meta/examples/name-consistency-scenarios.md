# Name consistency — scenarios (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Status: Non-normative — training and illustration only. Normative rules: [`../../name-consistency/name-consistency.md`](../../name-consistency/name-consistency.md).

Example data model: The scenarios below assume a multi-tenant product with tenant-scoped member entities and a separate global user record. This is an illustrative resolver model, not a required schema; adapt or omit these scenarios when the target project has different identity ownership or name sources.

---

## Create flow (happy path)

1. Resolve `(tenantId, canonicalPhone)` through the single domain resolver (**NCM-M1**).
2. Tier order: tenant primary entity, then secondary tenant entity per architecture, then global user, then form fallback (**NCM-M2**, **NCM-M3**).
3. Persist the resolved `firstName` / `lastName` on the new entity from that result — do not replace with raw form text when a higher tier returned a non-empty name (**NCM-N1**).

---

## Tier-1 vs global user disagree

Illustrative scenario: A tenant-scoped member record and a global user record contain different names for the same identity. Example values: "Alex" and "Sam".

Default: In tenant context, tier-1 wins for resolution unless architecture documents a different merge rule for a specific screen (**NCM-M6**).

---

## Post-create rename (requires architecture)

Before exposing "edit name" on an entity, architecture must define who may edit and how denormalized copies update (**NCM-M7**). Until then, STOP shipping that mutation (**NCM-N4**, GNC4).

---

## List performance

Anti-pattern: N list rows each trigger a separate resolver round-trip with no batching or cache.

Direction: Document batch API, JOIN, or cache + invalidation on name or link mutation (**NCM-M9**, GNC6).

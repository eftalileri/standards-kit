# SSoT, denormalization, and copy declaration (editable persistent attributes)

```kit-cover
type: normative
part-of: README.md
binds: EDM-C, EDM-M and EDM-N -- which field is the single source of truth, how denormalized copies and copy targets are declared in the value's registry row contract, and multi-tenant isolation of the update
open-when: shape:backend-heavy, signal:editable-attribute, signal:denormalization, signal:impact-matrix, signal:multi-tenant-write
skip-when: signal:no-denormalized-copy, signal:client-only
owns: EDM-C1, EDM-C2, EDM-C3, EDM-C4, EDM-M1, EDM-M2, EDM-M3, EDM-M4, EDM-M5, EDM-M6, EDM-M7, EDM-M8, EDM-N1, EDM-N2, EDM-N3
```

Scope

- Included: Definitions for editable persistent attributes; multi-tenant isolation for SSoT updates and cascade; two update scenarios (identity/name vs content/price); single non-ambiguous solution (no gray); declaring each value's copies and copy targets in its registry row contract; keeping that contract current on schema changes.
- Excluded: Implementation of cascade algorithms ([cascade engine](cascade-engine.md)); batch/async ([execution](execution-async-batch-logging.md)); MongoDB index DDL ([mongo cascade indexing](mongo-cascade-indexing.md)). Global KAT taxonomy — [SSOT governance](../ssot/README.md).

Document type: Normative — part of `editable-persistent-attributes/` hub.

Decision gates: Applies — cascade routing is high-impact; use [decision gates](decision-gates.md).

Environment: Applies to server-side persistence and cascade paths. Tenant-scoping requirements apply when the adopting system is multi-tenant.

References: [Gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md); [Markdown authoring](../authoring/markdown-authoring.md); [README](README.md) (**EPA-T\***).

---

## Rule identifiers (normative)

| Prefix | Meaning |
|--------|---------|
| **EDM-C**\* | Agent execution contract. |
| **EDM-M**\* | **MUST**. |
| **EDM-N**\* | **MUST NOT**. |

---

## Definitions (normative)

| Term | Meaning |
|------|---------|
| Editable persistent attribute | A durable field that an authorized user may change through a product interface or API (for example a display name, price, or description). |
| SSoT (Single Source of Truth) | The one authoritative collection and field(s) for that attribute; updates are applied there first. |
| Denormalized copy | The same semantic value duplicated elsewhere (another collection or another field, including free text inside `body`). If SSoT changes and copies do not, data is inconsistent. |
| Cascade | After SSoT update, updating denormalized copies to the new value. |
| Tenant isolation | When data is tenant-scoped, all writes and cascade filters are constrained to the same tenant. |

---

## Agent execution contract

| ID | Rule |
|----|------|
| **EDM-C1** | This file is mandatory when defining or changing editable persistent attributes, denormalization, or cascade scope for MongoDB-backed data. |
| **EDM-C2** | Apply [shared **C4**](../_meta/agent-contract.md). |
| **EDM-C3** | Apply [shared **C2**](../_meta/agent-contract.md). |
| **EDM-C4** | A new denormalized attribute whose copies are not named in its registry row contract (**EDM-M5**) does not merge. |

---

## **MUST** — **EDM-M**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| EDM-M1 | When data is tenant-scoped, every SSoT update and cascade filter **MUST** include the same tenant predicate as the authoritative record. | Cross-tenant data corruption — bug; must not ship. | Review shows the tenant constraint on every update path. |
| **EDM-M2** | Scenario A — identity / name change (organization, person, group name, etc.): **MUST** update the SSoT document; **MUST** cascade to all denormalized fields and, where applicable, `body` per [cascade engine](cascade-engine.md). Collections that store only the entity ID (no denormalized name field) **MUST NOT** receive cascade for that name; new rows **MUST** read the current name from SSoT. | Stale names in UI — bug. | The registry row contract marks ID-only collections as no cascade; GEPA2 YES path. |
| **EDM-M3** | Scenario B — content / price / numeric (item name/content/price/quantity, etc.): **MUST** update SSoT; **MUST** cascade where denormalized copies exist; **MUST NOT** touch collections that only store IDs with no denormalized price/name fields; new records **MUST** use current SSoT. | Wrong financial or display data — bug. | Registry row contract; GEPA2; code review. |
| **EDM-M4** | Cascade design **MUST** name exactly one approved approach per attribute — no “pick A or B” in the same contract. | Bug — ambiguous implementation. | One approach per attribute + scenario; no contradictory entries. |
| **EDM-M5** | The copies of a value and its copy targets are named in that value's registry row contract ([**SSG-R6**](../ssot/ssot-registry-rules-and-protocol.md)); no separate impact document is kept beside it (a second list, [**SSG-M8**](../ssot/ssot-principles-and-precedence.md)). | Bug — undocumented cascade surface. | Review of the row contract. |
| **EDM-M6** | For each editable persistent attribute, that contract **MUST** state: SSoT collection and field(s); denormalized targets (collection + field(s), `body` flag); excluded ID-only collections with a one-line reason. | Bug — missing cascade or wrong target. | Review of contract completeness. |
| **EDM-M7** | Each named collection states: tenant field (yes/no/N/A); role (SSoT / denormalized / ID-only); effect on attribute change (cascade target / none). | Bug — not reviewable. | Review of the contract. |
| **EDM-M8** | When a new collection or new denormalized field appears, the registry row contract and cascade module **MUST** be updated in the same change. | Stale cascade — bug. | Diff touches contract + code. |

---

## **MUST NOT** — **EDM-N**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **EDM-N1** | Must not apply cascade to name/value fields to collections that only store a foreign key (for example `customerId`) without denormalized text for that attribute. | Wrong or redundant writes — bug. | GEPA2; contract marks ID-only. |
| **EDM-N2** | Must not apply cascade outside the tenant boundary (**EDM-M1**). | Security / integrity bug. | Query filter audit. |
| **EDM-N3** | Must not ship two equivalent cascade designs for the same attribute without [gray-situation](../agent-gray-decisions/gray-situation-decisions.md) resolution (**EDM-M4**). | STOP. | One design row. |

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|-------------------|
| New denormalized field not named in the registry row contract | Does not merge — **EDM-C4**, **EDM-M8**. |
| Unclear whether collection is ID-only or denormalized | Read the schema and writers (gray Procedure 4b), complete the contract (**EDM-M6**); run GEPA1 / GEPA2. |

---

Part of: [README.md](README.md).

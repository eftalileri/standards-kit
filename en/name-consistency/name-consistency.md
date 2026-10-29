# Name consistency — canonical display names

```kit-cover
type: normative
part-of: README.md
binds: the agent execution contract, the GNC decision gates, the failure path and the implementation checklist of canonical display-name resolution
open-when: shape:backend-heavy, shape:full-stack, signal:company-personnel, signal:display-name, signal:name-snapshot, signal:identity-matching
skip-when: signal:no-person-name-surface
owns: NCM-C1, NCM-C2, NCM-C3, NCM-C4, NCM-C5, NCM-C6, GNC1, GNC2, GNC3, GNC4, GNC5, GNC6, GNC7, GNC8, GNC9
```

Scope

- Included: Backend (or server-side) canonical display name resolution for person / contact-style entities in a company (tenant) context: single resolver, priority tiers, create and invite flows, normalization minimums, read vs write paths, explicit conflict precedence, post-create edit and cascade requirements, and performance minimums (batch, cache, invalidation). Consumer apps must use APIs that implement this contract or document equivalence.
- Excluded: File or module naming ([code modularity](../code-modularity/code-modularity.md)); full audit log or immutable history product standard — N/A here until a dedicated standard migrates (one-line reason: out of scope for this document's binding minimums; optional extensions live in architecture only); phone UI masking detail — [phone](../phone/README.md) for E.164 / input rules beyond **NCM-M5** minimum.

Document type: Normative — domain behavior for consistent human names per identifier in company context. The **NCM-M** / **NCM-N** rows live in [name-consistency-rules.md](name-consistency-rules.md).

Environment: Applies to server-side resolution, persistence, and API surfaces that expose resolved names.

Binding principle: Ad hoc precedence or unbounded per-row resolver calls without a documented strategy are defects. Document domain-specific precedence and scale strategy where they are chosen.

References: [Error policy](../error-policy/error-policy.md); [Decision functions](../decision-function/decision-function.md); [Gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md) (M15); [SSOT readiness](../ssot-readiness/ssot-readiness-and-form-data.md) (client forms — does not override NCM tier truth on server); [editable persistent attributes](../editable-persistent-attributes/README.md) (cascade — must not contradict **NCM-M7** when both apply).

Code samples / scenarios (non-normative): [`../_meta/examples/name-consistency-scenarios.md`](../_meta/examples/name-consistency-scenarios.md).

Decision routing: [Decision gates (normative index)](#decision-gates-normative-index).

Part of this topic: [name-consistency-rules.md](name-consistency-rules.md) — **NCM-M1**–**NCM-M13**, **NCM-N1**–**NCM-N7**.

---

## Rule identifiers (normative)

| Prefix | Meaning |
|--------|---------|
| **NCM-C\*** | Agent execution contract. |
| **NCM-M\*** | **MUST**. |
| **NCM-N\*** | **MUST NOT**. |
| GNC\* | Decision gates — binary routing; cite NCM- rows only. |

---

## Agent execution contract

| ID | Rule |
|----|------|
| **NCM-C1** | This topic is mandatory for new or changed flows that set or show canonical person / contact names keyed by company + identifier in product scope. |
| **NCM-C2** | Apply [shared **C4**](../_meta/agent-contract.md). |
| **NCM-C3** | Apply **NCM-M** / **NCM-N** and GNC as written (gray M15). |
| **NCM-C4** | Project architecture or Decisions / facts owns identifier choice (**NCM-M4**), post-create edit policy (**NCM-M7**), denormalized read strategy (**NCM-M8**), and cache / batch details (**NCM-M9**) — this file binds minimums and defaults where stated. |
| **NCM-C5** | When a required resolution input (identifier type, tier ownership) is not documented, [gray Procedure](../agent-gray-decisions/gray-situation-decisions.md) steps 4b–5 decide it and the answer is recorded in architecture. |
| **NCM-C6** | [Shared agent contract C2](../_meta/agent-contract.md). |



---

## Decision gates (normative index)

Purpose: Binary routing for name consistency work — no new obligations beyond cited NCM- rows.

| Gate | Proceed only if YES | Binding rule IDs | If NO |
|------|---------------------|------------------|-------|
| GNC1 | Flow creates or links an entity that needs a display name from company + identifier context | **NCM-M1**, **NCM-M2**, **NCM-M3** | Resolver not required — do not invent parallel precedence |
| GNC2 | Canonical identifier type and key are documented for this flow | **NCM-M4**, **NCM-M5** | Decide and record it (**NCM-C5**) before proceeding |
| GNC3 | Normalization pipeline is applied before identity equality | **NCM-M5**, **NCM-N2** | STOP — add normalization |
| GNC4 | Post-create name edit: architecture defines permission and cascade (**NCM-M7**) | **NCM-M7**, **NCM-N4** | Block mutation UI/API until recorded (**NCM-C5**) |
| GNC5 | Read path: either resolver-backed read or documented denormalized snapshot with invalidation | **NCM-M8** | Pick (a) or (b) and record it (**NCM-C5**) |
| GNC6 | List scale: batch/cache/index strategy documented for resolver usage | **NCM-M9** | Do not ship the hot path without mitigation |
| GNC7 | Historical/event-time name consumer has a stored snapshot; any legacy materialization is explicitly current-state, exact-associated, migrated before activation, and post-verified | **NCM-M10**, **NCM-N5** | STOP — do not activate the strict consumer or add a runtime fallback |
| GNC8 | Event-time snapshot write side: one derivation authority, called unconditionally by every create / re-assign / bulk path (path list proven by a required builder input or an equivalent static rule, not by manual search), with any legacy duplicate field or delete-time freeze step removed in the same change | **NCM-M11**, **NCM-M12** | STOP — do not ship a partial snapshot (some rows permanently unlabelled) or a second parallel snapshot store |
| GNC9 | Unresolvable name is represented as absence end-to-end: resolver returns no entry, persisted field is omitted, and each render surface prints its own localized marker | **NCM-M13**, **NCM-N6** | STOP — remove the shared placeholder before shipping; decide per call site |

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|---------------------|
| Two tiers both non-empty and order unclear for a new entity family | Decide per **NCM-C5** and extend architecture before shipping. |
| Resolver omitted on create where GNC1 applies | STOP — must not ship (**NCM-C2**). |
| Name mutation shipped without **NCM-M7** documentation | STOP — **NCM-N4**. |
| List view causes unbounded per-row resolver without **NCM-M9** mitigation | STOP — must not ship at scale without documented strategy. |
| Required event-time snapshot is missing in legacy rows | STOP runtime activation; use an exact-associated, explicitly non-historical one-time materialization with dry-run/apply/post-verification, or leave the strict reader fail-loud (**NCM-M10**/N5). |
| A create/bulk path writes the record without calling the snapshot derivation authority | STOP — wire that path (**NCM-M11**); a partially populated snapshot is not a valid intermediate state. |
| A second snapshot store (legacy column / delete-time freeze step) still exists after the write-time authority lands | STOP — remove it and migrate its data in the same change (**NCM-M12**). |
| No source can produce the name for a legacy row after migration | Keep the row and its non-name data; render a localized "absent" marker per surface (**NCM-M13**); never a placeholder string from the data layer (**NCM-N6**). |

---

## Implementation checklist

- [ ] **NCM-M1** single module and stable return shape
- [ ] **NCM-M2** / **NCM-M3** / **NCM-N1** on all create and invite paths
- [ ] **NCM-M4** / **NCM-M5** / **NCM-N2** for identifier and normalization
- [ ] **NCM-M6** conflict precedence understood for disagreements
- [ ] **NCM-M7** / **NCM-N4** for any name field updates
- [ ] **NCM-M8** read path choice documented
- [ ] **NCM-M9** for list/hot paths
- [ ] **NCM-M10** / **NCM-N5** for event-time snapshots and legacy materialization
- [ ] **NCM-M11** / **NCM-M12** one write-time derivation authority; every create / re-assign / bulk path wired; no parallel snapshot store left
- [ ] **NCM-M13** / **NCM-N6** absence surfaced as a per-surface localized marker; no shared placeholder anywhere
- [ ] GNC1–GNC9 reviewed for the change

---

Part of: [README.md](README.md) — name consistency hub.

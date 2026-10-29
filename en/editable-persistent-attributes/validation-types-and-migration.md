# Validation, shared types, and migration (editable persistent attributes)

```kit-cover
type: normative
part-of: README.md
binds: EVL-C, EVL-M and EVL-N -- shared cascade input/output types, Zod validation on update and cascade parameters, and when a migration script is and is not required
open-when: shape:backend-heavy, signal:editable-attribute, signal:mongo-cascade, signal:schema-migration, signal:shared-types
skip-when: signal:no-denormalized-copy, signal:client-only
owns: EVL-C1, EVL-C2, EVL-C3, EVL-C4, EVL-M1, EVL-M2, EVL-M3, EVL-M4, EVL-M5, EVL-M6, EVL-M7, EVL-N1, EVL-N2, EVL-N3
```

Scope

- Included: Shared TypeScript types for cascade inputs and outputs; Zod (or project-standard) validation on update endpoints and cascade parameters; migrations for new required fields; default-policy changes and nullish normalization/backfill for optional persisted preferences; alignment with monorepo shared packages.
- Excluded: Form-only validation — [forms](../forms/forms.md); repository null semantics — [repository](../repository/repository-contract.md).

Document type: Normative — part of `editable-persistent-attributes/` hub.

Decision gates: Applies — [decision gates](decision-gates.md) (GEPA7).

Environment: Applies to the server-side validation, persistence, and migration paths used by the adopting system.

References: [README](README.md); [monorepo](../monorepo/monorepo-architecture.md); [SSoT authority and derivation](../ssot/ssot-must-authority-and-derivation.md) (**SSG-M1**); [SSoT principles and precedence](../ssot/ssot-principles-and-precedence.md) (**SSG-M8**); [repository contract](../repository/repository-contract.md).

---

## Rule identifiers (normative)

| Prefix | Meaning |
|--------|---------|
| **EVL-C**\* | Agent execution contract. |
| **EVL-M**\* | **MUST**. |
| **EVL-N**\* | **MUST NOT**. |

---

## Agent execution contract

| ID | Rule |
|----|------|
| **EVL-C1** | This file is mandatory when defining cascade API surface, types, or migrations for editable persistent attributes. |
| **EVL-C2** | Apply [shared **C4**](../_meta/agent-contract.md). |
| **EVL-C3** | Apply [shared **C2**](../_meta/agent-contract.md). |
| **EVL-C4** | STOP if cascade parameters are not validated at domain boundary (**EVL-M2**). |

---

## **MUST** — **EVL-M**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **EVL-M1** | Cascade function parameters and return types **MUST** be declared once, in a single module every consumer imports from — never re-declared per call site. That module is the backend module owning the cascade unless a client actually consumes the contract; a cascade that never crosses the FE↔BE boundary does not belong in the shared cross-boundary package ([GMR1](../monorepo/monorepo-architecture.md)). | Type drift — bug; publishing a backend-only contract across the boundary is the same bug in the other direction. | Typecheck: every cascade import resolves to that one module; no `any` for public cascade API without **EVL-N1** exception (forbidden). |
| **EVL-M2** | Cascade entrypoint inputs (for example tenant key, entity key, old value, and new value) **MUST** be validated with the adopted schema mechanism at the domain boundary before persistence writes. | Invalid data — bug. | Review that invalid input is rejected before the first write. |
| **EVL-M3** | User-facing update endpoints that change SSoT **MUST** validate request bodies per [forms](../forms/forms.md) / project standard (typically Zod). | Bug — inconsistent with API policy. | Handler uses same schema as client contract test. |
| **EVL-M4** | When cascade only updates values of existing optional or required fields and does not introduce a new required schema field, no Mongo migration script is required for cascade correctness; if a new required field is added to documents, project migration rules **MUST** be followed (STOP until migration exists). | Broken reads — bug. | GEPA7; PR contains migration if schema change. |
| **EVL-M5** | Conditional — identity or primary-key change: If an entity's canonical identity changes, classify every reference before migration (registry row contract, **EDM-M5**/**M7**). Update only references whose semantics follow that identity; preserve records anchored to stable record identifiers. Use an atomic migration strategy supported by the datastore (for MongoDB `_id`, this may require insert, repoint, and delete as one transaction). | Lost links / corrupted identity — bug. | The registry row contract documents each reference and the atomic migration plan. |
| **EVL-M6** | When the effective default of an optional persisted preference changes, exactly one server/domain policy **MUST** own the canonical default, nullish classification, and runtime validation. Creation/role-entry writes, canonical API projection, background candidate/dispatch gate, and migration/self-heal **MUST** delegate to that policy instead of recomputing it; client settings **MUST** consume the normalized API snapshot without a local default. Only whole-field missing/null may receive the new default; every explicit valid value (especially boolean `false`) is user data and **MUST** survive conditional writes and reruns. A backfill **MUST** be explicit-mode, idempotent, and post-apply verified; concurrent loss of its nullish condition **MUST** skip rather than overwrite. | Duplicate defaults or truthiness collapse overwrite user intent and make consumers disagree — bug. | Trace create → API → candidate/dispatch → settings; inspect conditional whole-field nullish filters; dry-run/apply/rerun leaves explicit values unchanged and zero nullish candidates. |
| **EVL-M7** | Retiring or rewriting a stored editable attribute that feeds a derivation **MUST** (a) rewrite the stored values while every running derivation still yields the same output for them (the old code reading the old input, or as a pre-deploy step of the release that removes the input; a pre-deploy rewrite that is not equal-output for the old code **MUST** be restored by its inverse before any later failing step lets the old code keep serving), and re-run the idempotent rewrite after any writer that could still store the retired value (a released client, an old instance) has stopped; (b) in the dry run, compute the derived output per record before and after and report every lost or changed output and every dependent record bound to a lost output; (c) never silently change a record whose dependents are bound to a lost output — skip and report it fail-loud — and either run the downstream re-derivation an ordinary edit triggers or show in the dry run that it would change no dependent record. | A "value-preserving" rewrite still changes the derivation at its boundaries; a rewrite outside an equal-output window exposes users to an intermediate result; a skipped re-derivation without proof leaves dependent records stale — bug. | Dry-run output lists per-record before/after derived output, bound dependents and skipped records; release record places the apply in an equal-output window; final dry run after the last old writer stops shows zero records left. |

---

## **MUST NOT** — **EVL-N**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **EVL-N1** | Must not use `any` for public cascade function signatures in shared types outside the two exceptions in [**BE-N9**](../build-environment/build-environment-prohibitions.md). | Loss of type SSOT — bug. | Typecheck / lint. |
| **EVL-N2** | Must not add a runtime fallback reader (e.g. resolve by `phone` when `userId` is stale) to mask a stale identity / bond field. The bond field **MUST** have exactly one self-healing writer that keeps it correct; stale reads fail loud (`log.warn` + not-found, a repair signal), never silently compensate. Two readers giving different answers for the same datum (authority vs. fallback) is an SSoT violation (**SSG-M8** / no-fallback). | Diverging sources — masked corruption, bug. | grep: no `phone`-fallback in resolver; single writer surface documented in SSoT registry. |
| **EVL-N3** | Must not copy a nullish-to-default rule into UI, repository, scheduler, or dispatcher, and must not use truthiness to merge `false` with missing/null. Clients consume the normalized server contract; server consumers call the policy, while DB filters may only select the nullish set and receive the policy-produced value. | Parallel authority and involuntary opt-in/opt-out — bug. | Search for duplicated default literals/nullish fallbacks; verify one policy call graph and explicit-false query exclusion. |

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|-------------------|
| New required Mongo field | STOP — **EVL-M4**; ship migration before relying on field. |
| Optional persisted preference default changes | Apply **EVL-M6** end to end; nullish-only conditional normalization/backfill and explicit-value preservation are mandatory. |
| Invalid cascade params | STOP — **EVL-M2**; reject at domain layer. |

---

Part of: [README.md](README.md).

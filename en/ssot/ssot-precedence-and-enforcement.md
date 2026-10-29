# SSOT precedence, enforcement type and failure path

```kit-cover
type: normative
part-of: README.md
binds: SSG-P1 deterministic precedence and SSG-P2 enforcement-type obligations
open-when: signal:multi-kat, signal:guard-config, signal:enforcement-type
skip-when: signal:no-ssot-surface
owns: SSG-P1, SSG-P1-1, SSG-P1-2, SSG-P1-3, SSG-P1-4, SSG-P1-5, SSG-P2, SSG-P2-1
```

Part of: [SSoT principles and precedence](ssot-principles-and-precedence.md).

## **SSG-P1** — Precedence and deterministic conflict resolution

**SSG-P1-1**: Multi-KAT evaluation uses logical AND over all applicable categories: every relevant KAT must pass. Satisfying one KAT must not cancel another. [On violation: Bug — STOP; fix the rule or the interpretation] [Verify by: Lint output / rule review]

**SSG-P1-2**: The same protected field, function or model must not have two KAT rows or lint registrations with conflicting authorities or overlapping owner globs / writer files with incompatible claims — a second registration of an already fenced surface is also a second mechanism ([**ENA-N18**](../enforcement-architecture/enforcement-anti-patterns.md)). One resolved row or registration per protected symbol — "merge both" without resolution is forbidden. [On violation: Merge blocked] [Verify by: Review before merge — a table-driven rule typically rejects only a duplicate row id at load; overlapping claims across rows or rules are not mechanically detected unless the adopting project's mechanism documents that it does (record the actual scope as a stated limit, [**ENA-GV3**](../enforcement-architecture/enforcement-admission.md))]

**SSG-P1-3**: **KAT-1** vs **KAT-4**: if **KAT-1** fails, the line is invalid. If **KAT-1** passes, **KAT-4** still applies independently — both must pass. [On violation: Lint fail / bug] [Verify by: Lint output]

**SSG-P1-4**: **KAT-2** vs **KAT-3**: SSOT call sites must satisfy **KAT-2** and model mutations must satisfy **KAT-3** — violations reported per category. [On violation: Lint fail / bug] [Verify by: Lint output]

**SSG-P1-5**: Conflict with external standards: apply [precedence](../_meta/precedence.md) — the project's ladder between tiers, and [**KIT-PRE-2**](../_meta/precedence.md) when both sides are kit statements; the [decision matrix](../decision-matrix/decision-matrix.md) decides only a frontend stack-layer dispute (rung 5), never a general tie. False positives: use false-positive process — do not silently delete the underlying rule without normative change. [On violation: STOP — compliance failure] [Verify by: Review / audit]

---

## **SSG-P2** — Enforcement type (static, runtime, review)

| Category / section | Required enforcement type | Notes |
|--------------------|---------------------------|-------|
| [**KAT-1**](ssot-categories-config-driven.md) | static where [**ENA-A1**](../enforcement-architecture/enforcement-admission.md) admits a check; otherwise a stated limit | Row of the write-ownership table rule (**SSG-K1-2**) |
| [**KAT-2**](ssot-categories-config-driven.md) | Same | Row of the table-driven lint rule (**SSG-K2-2**) |
| [**KAT-3**](ssot-categories-config-driven.md) | Same | Model-write row of the write-ownership table rule (**SSG-K3-2**) |
| [**KAT-4**](ssot-categories-config-driven.md) | Same | Row of the table-driven lint rule — pattern + context |
| [**KAT-5**](ssot-categories-convention-driven.md) | static + runtime | Static: lint rule; runtime: use `.data` from parse — [convention-driven](ssot-categories-convention-driven.md) |
| [**KAT-6**](ssot-categories-convention-driven.md) | static + review | Rollback-context and row-bridge lint rules; everything else is review — [TanStack Query](../tanstack-query/mutations-cache-sync.md) MUT-* |
| Derived counter written into the relation owner (**SSG-M8**) | static + review | A counter derived from a countable relation is recomputed from the authority on every read; it is never persisted into the owning document as a TTL copy. Any genuinely required cache lives outside that document, in a shared store, with an explicit TTL and invalidation from every relation writer. AST lint rejects the single-file pattern "count/aggregate result assigned to a `*Count` field of a saved document (or `$set`)". |
| Read integrity (**SSG-M3**) | runtime + review (+ static where configured) | Consumers use the registered helper; snapshot branches prove exact expected-id match, multi-tenant joins carry every authority dimension, coupled anchors are validated before metrics, and persisted configuration is used strictly rather than replaced by a default. Mismatch/missing/malformed state fails loud. |
| External-provider projection integrity (**SSG-M9**) | runtime + review (+ static where expressible) | Client-initiated writes require a fresh provider record and exact matching item; authenticated provider webhooks use their own validated event evidence. Both paths enforce runtime environment policy before side effects. Protect single-file bypasses with AST lint where possible. |
| Durable notification outbox and provider-attempt phase | static + runtime + review | Where the architecture uses a durable outbox, static checks may lock the prohibition on dispatch inside a transaction or a transitive helper, and the ordering correlation → lease fence → exact provider-phase conditional write → provider dominance. Runtime uses a same-session outbox, exact leases / conditional writes, recipient idempotency and stuck-pending phase reconciliation. Review covers crashes, unknown external outcomes and partial recipient results. |
| Stateful third-party client SDK session authority (**SSG-M10**) | static + runtime + review | AST lint protects raw mutator/import boundaries; the authority serializes identity mutation with dependent operations and verifies the SDK post-condition. |
| Provider evidence provenance and known-event boundary (**SSG-M11**) | runtime + review (+ static where expressible) | Preserve provider environment in durable projections; gate both persistence and every later live side effect under the current runtime. Unknown event kinds are audit-only. |
| Provider projection ordering and side-effect freshness (**SSG-M12**) | runtime + review (+ static where expressible) | Use a provider-owned scalar version or exact predecessor-chain head in one conditional writer. Gap-capable predecessor mismatch is durable unresolved evidence, not proof of age; every success runs a bounded exact-predecessor drain, a remaining edge retains a durable continuation/retry trigger, ambiguity fails loud and retains evidence, and CAS replacement does not use upsert as a direction oracle. Shared generation acceptance dominates only cache/response use; durable effects use the provider ordering writer and any required persistent epoch fence. |
| Effective access end vs provider billing-period end (**SSG-M13**) | runtime + review | Keep the semantics explicit and separate; provider lifecycle consumes only provider-owned period/event evidence and fails closed when it is absent or invalid. |
| Scheduled capacity reduction vs durable admissions (**SSG-M14**) | static + runtime + review | A provider-verified lower target capacity constrains new durable admissions immediately through the same canonical status snapshot; preflight/client intent does not. |
| Input-schema vs persistence-schema validity parity (**SSG-M16**) | static (cross-file guard) + review | One invariant behind both schemas. A cross-file guard compares each `required` persistence field with the value the feeding input schema can emit — including the empty value — because no single-file AST can see the other schema. Cross-field `refine` never discharges a per-field requirement. After a product-approved relaxation, review every derivation of the field for empty-input behavior and reject fabricated defaults. |
| Actor-class access restriction across layers (**SSG-M15**) | static + review | One exported derivation; read/write wrappers delegate to it. AST ESLint proves the initiating layer's `enabled`-style gate resolves to that derivation and that gate-bypassing fetch APIs re-read the authority in scope. The boundary's resource-class classification is a registered authority. |
| Cross-domain owner-glob / writer-file expansion | static (lint row or registration) + review | Narrowest scope (**SSG-N12**) |

**SSG-P2-1**: Every new KAT row or lint registration, or PR that adds SSOT coverage, must state the enforcement type (static / static+runtime / review / combined per table above) in the rule's admission header ([**ENA-A6**](../enforcement-architecture/enforcement-admission.md)), the row's authority field, the PR description, or an architecture doc. [On violation: Merge rejected — incomplete documentation] [Verify by: PR checklist / review]

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|---------------------|
| Unclear which KAT applies or two rows / registrations overlap | STOP — resolve per **SSG-P1-2** before merging the row or registration. |
| A KAT lint rule fails after a valid SSOT change | Fix the code, or update the row / registration per **SSG-A-2** in [guard and agent](ssot-guard-and-agent.md) — never to whitelist a false positive ([**FP-M20**](../false-positive/check-verification-rules.md)); do not accept the change while the project's required gate fails. |
| Precedence vs error / security unclear | Follow [decision matrix](../decision-matrix/decision-matrix.md) — STOP if uncovered (gray procedure). |

---

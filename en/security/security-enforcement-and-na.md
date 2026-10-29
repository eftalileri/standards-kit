# Security — enforcement types and N/A policy (audit SSOT)

```kit-cover
type: normative
part-of: README.md
binds: SEC-ENF-M1, SEC-NA-1 with SEC-NA-1a to SEC-NA-1e, SEC-NA-N1 and SEC-NA-2 -- what counts as static, runtime or review enforcement, the only sanctioned way to record that a control does not apply, and the review window after which such a record expires
open-when: shape:backend-heavy, signal:security-audit, signal:not-applicable-record, signal:enforcement-type
skip-when: signal:no-security-surface
owns: SEC-ENF-M1, SEC-NA-1, SEC-NA-1a, SEC-NA-1b, SEC-NA-1c, SEC-NA-1d, SEC-NA-1e, SEC-NA-N1, SEC-NA-2
```

Normative part split out of this file: [control family / enforcement type matrix](security-enforcement-matrix.md) (audit aid, no rule of its own).

Scope

- Included: Enforcement type vocabulary (static, runtime, review), SEC-NA-1 (global N/A record), and a control-family matrix answering: *Which controls are automated vs manual?*

Document type: Normative — SEC-NA-1, SEC-NA-N1, SEC-ENF-M1; matrix is audit aid (does not replace per-row Verify by in part files).

Environment: Applies to any project using this security hub (all runtime hosts and CI); N/A records are living documents (update when controls change).

References: [Governance](security-governance.md); [Decision gates](security-decision-gates.md); [CI and monitoring](security-ci-and-monitoring.md).

---

## Enforcement types (normative definitions)

| Type | Meaning | Typical evidence |
|------|---------|------------------|
| static | Determined from repo, config, or CI without production traffic | CI job, linter, grep, lockfile scan, IaC |
| runtime | Determined from running system behavior or live logs / metrics | Staging/prod log sample, observed real behavior, APM |
| review | Requires human judgment (design, threat context, partial coverage) | PR checklist, security review notes, pen-test finding |

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-ENF-M1** | Audits **must** classify controls using static / runtime / review as defined above; the matrix in this file + per-row Verify by in parts **must** be consistent. WARN-only CI **must not** be reported as full static enforcement without qualification. | Misleading audit answer. | Sample audit prep. |

A single obligation may carry multiple types (e.g. static + review). Per-row Verify by in part files remains the fine-grained checklist; this file states the automation vs manual posture at family level.

---

## SEC-NA-1 — N/A record (global)

When any normative row in this hub allows or requires marking a control N/A (out of scope, not applicable surface, accepted gap), the project **must** maintain a single register (e.g. section in `SECURITY.md`, security wiki page, or `docs/security/na-register.md`) that satisfies all of:

| Sub-rule | Required content |
|----------|------------------|
| SEC-NA-1a | Reason — why the control does not apply (product shape, no surface, substitute control, etc.). |
| SEC-NA-1b | Risk acceptance — who accepts residual risk (role or named approver) and what risk remains (one short paragraph or bullet list). |
| SEC-NA-1c | Owner — accountable role or team for revisiting the N/A (e.g. *Security lead*, *Platform*, *CTO office*) — not anonymous. |
| SEC-NA-1d | Linked rule IDs — cite SEC- / SEC-C1- / TM- rows being marked N/A. |
| SEC-NA-1e | Review date — last confirmed date; **must** be revalidated on major architecture or threat-model change (SEC-GC-6). |

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-NA-1** | N/A claims without SEC-NA-1a–SEC-NA-1e are invalid — treat as missing control until the register is updated. | Audit failure; STOP for production sign-off if gap is material. | Register doc + review trail. |
| **SEC-NA-N1** | **Must not** use vague N/A ("not needed", "later") without reason, risk acceptance, and owner. | Same as SEC-NA-1. | Register audit. |
| **SEC-NA-2** | An accepted risk expires; it never becomes permanent through inaction. The adopting project's security/risk policy MUST define a finite maximum review interval and document why that interval is appropriate to the risk. Every record's SEC-NA-1e row **must** state its last review date and next review date, no later than that policy limit. If no finite, justified limit is defined, the review interval is unresolved: the N/A risk acceptance is invalid and production sign-off MUST STOP until the policy is set or the control is implemented. A passed review date makes the record invalid under SEC-NA-1 until its evidence is revalidated against the current system and the risk is freshly approved, or the control is implemented. Renewal is a new decision by the risk accepter, not a date edit. Where the register is machine-readable, a check **must** fail on a missing, malformed, past, or policy-exceeding date. | Same as SEC-NA-1; stop release. | Risk-policy review plus register review or automated date check. |

Replaces: Informal "one-line N/A" mentions elsewhere — those lines **must** point to a SEC-NA-1-compliant register entry (the one-line may be a summary + link).

### Register template

Use [security-na-register.md](security-na-register.md) as a blank record template. The consuming project keeps its live register in its own security documentation.

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|---------------------|
| Auditor asks *why is control X not implemented?* | Answer with SEC-NA-1 register row or admit non-compliance and fix. |
| N/A stale after architecture change | STOP — refresh SEC-NA-1e and content or implement control. |

---

## Actor-class gate placement — check reach

A local handler check cannot prove a gate in route middleware, a delegate, a declared membership-sufficient surface or gate middleware itself. Each suppression **MUST** name the actual route/delegate and prove rejection of the actor class, not only record narrowing. A handwritten actor decision additionally duplicates its canonical authority (SSG-M8); record and resolve that debt under the adopting project's SSoT policy. Route-to-handler parity requires cross-file review.

---

## Missing sibling guard — check reach

Sibling middleware similarity is not a gate predicate: one router legitimately mixes authenticated self-service and public recovery routes. A declared-only anchor misses the undeclared failing route; transitive provider reach is cross-file evidence. Preserve deny-by-default route access declarations (missing declaration fails at boot) and registered-code/single-boundary response locks. Touched-flow review **MUST** first identify the irreversible or billed operation the chain reaches, then assess proportional protection; a hand-maintained route/middleware list cannot prove completeness.

---

## Control family — enforcement type matrix (moved)

The audit aid that maps each control family to its enforcement types is in [security-enforcement-matrix.md](security-enforcement-matrix.md).

---

Part of: [README.md](README.md).

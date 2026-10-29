# Payment SSOT — rule engine (normative)

```kit-cover
type: normative
part-of: README.md
binds: PAY-C1 to PAY-C5, the PAY-D definitions (PAY-D11 in status-economics.md), the PAY-F failure paths and the PAY-O output minima -- the contract, vocabulary, closed failure outcomes and API shape every payment rule is written against
open-when: shape:backend-heavy, shape:full-stack, signal:financials, signal:payment-field, signal:payment-status, signal:money-derivation
skip-when: signal:no-payment-surface, signal:reporting-only
owns: PAY-C1, PAY-C2, PAY-C3, PAY-C4, PAY-C5, PAY-D1, PAY-D2, PAY-D3, PAY-D4, PAY-D5, PAY-D6, PAY-D7, PAY-D8, PAY-D8b, PAY-D9, PAY-D10, PAY-F1, PAY-F2, PAY-F3, PAY-F4, PAY-O1, PAY-O2
```

Normative parts split out of this file: [MUST and MUST NOT](payment-must-and-must-not.md) (PAY-M1–PAY-M14, PAY-M18, PAY-M20, PAY-M27–PAY-M30, PAY-N1–PAY-N10); [retained financial history, subject teardown and live migration](payment-retention-and-migration.md) (PAY-M15, PAY-M16, PAY-M17); [lifecycle status economics](status-economics.md) (PAY-D11, PAY-M22–PAY-M24).

Scope: Same as [README.md](README.md) hub Scope. This file is the rule engine for payment derivation, exact multi-row financial settlement selection, SSOT writer/caller obligations, failure paths, and outputs.

Document type: Normative — PAY-C / PAY-M / PAY-N / PAY-F / PAY-D / PAY-O rows below are binding.

Related normative parts: [derivation.md](derivation.md) (truth tables, mapper precedence), [ui-binding.md](ui-binding.md), [reporting.md](reporting.md), [risks.md](risks.md).

Cross-SSOT (detail in linked files; local minima here): [error-policy/error-policy.md](../error-policy/error-policy.md), [error-handling/error-handling.md](../error-handling/error-handling.md), [ssot-readiness/ssot-readiness-and-form-data.md](../ssot-readiness/ssot-readiness-and-form-data.md), [repository/repository-contract.md](../repository/repository-contract.md), [ssot/ssot-principles-and-precedence.md](../ssot/ssot-principles-and-precedence.md), [agent-gray-decisions/gray-situation-decisions.md](../agent-gray-decisions/gray-situation-decisions.md).

---

## Definitions (normative) — PAY-D

| ID | Definition |
|----|------------|
| **PAY-D1** | No explicit total field means `totalAmountFieldPresent !== true`. No user payment input for status derivation means: `payments.length === 0` after PAY-D7 normalization and `totalAmountFieldPresent !== true`. unpaid baseline must not use numeric zero alone without PAY-D2. |
| **PAY-D2** | Conscious zero total means `totalAmountFieldPresent === true` and `totalAmount === 0` (user or system explicitly set the field on the document). |
| **PAY-D3** | paidAmount means the sum of `payments[j].amount` for all records where `payments[j].status === 'completed'` minus the sum of the record's server-owned refund ledger ([PAY-M25](status-economics.md)), computed only by the canonical payment authority. |
| **PAY-D4** | Canonical payment derivation (the SSOT payment mapper) means the single module that computes `paidAmount`, `remainingAmount`, and `paymentStatus`. No other module may publish these as authoritative for API/UI. |
| **PAY-D5** | A lifecycle status (completed, cancelled, pending, etc.) does not answer whether payment was collected; it answers lifecycle and revenue-accrual questions only. Whether payment is expected is answered only by [PAY-D11](status-economics.md)'s payment-expected column; status never answers whether payment was collected. |
| **PAY-D6** | Derivable expected total for status means: for a priced-item transaction, the stored total, a custom price or frozen item-snapshot prices are available under the canonical expected-total precedence; for a bundle transaction, the populated bundle total price, then the frozen bundle-snapshot total, then the same record's stored total or custom price, through the same expected-total resolver. Stored alternatives remain subject to PAY-R-D7's birth/explicit re-selection provenance; no live catalogue, default or neighbouring-record fallback. |
| **PAY-D7** | Ingress payments array for read-time derivation: if the persisted record omits the payment-entries key, the transform **MUST** pass `payments: []` into the mapper and **MUST NOT** treat omitted vs empty array as different for paidAmount (both yield no completed rows unless records exist). If `payments` is non-array (wrong type), PAY-F1 applies. A query-engine aggregation that reads persisted payment entries **MUST** first consume one canonical shape adapter with the same array/object/finite non-negative amount/closed method/closed status/optional-string contract as the JavaScript parser; arithmetic may consume only that adapter's validated rows. Because an expression builder cannot raise the typed application carrier, it propagates an invalid marker and the owning list/total service **MUST** raise the registered invalid-payment-item error before returning any row or total. |
| **PAY-D8** | Payment comparisons and remaining amounts **MUST** use integer minor units or one fixed-scale policy shared by persistence, sums and comparisons. Binary-float drift **MUST NOT** flip paid/partial or any monetary threshold. Under a rounding policy every accumulation/hop re-normalizes (`acc = round(acc + x)`); rounding rows or final output alone is insufficient. Integer-minor-unit addition is exempt by exactness. Non-money item/session counters **MUST NOT** use currency normalization. |
| **PAY-D8b** | The accumulation half of PAY-D8 is mechanically checkable only by provenance, never by name: a check that rejects raw `+` / `+=` on the output of a declared money-normalizing authority (or a same-file local bound from it), unless the addition is that authority's direct argument, may be used; names cannot distinguish money from counters. Money derivations that bypass the normalizer, untracked rebindings and cross-file folds remain a review obligation, and the absence of a check on those paths is not coverage. Record the adopting project's actual check scope and limits. |
| **PAY-D9** | No payment collected signal for border/UI means PAY-D3 yields zero and either no completed payment row exists or the server-owned refund ledger exactly equals those completed rows; a fully refunded record has historical payment rows but no net collected money. |
| **PAY-D10** | Exact multi-row financial selection means a bounded set of explicit, durable item IDs chosen by the actor. A filter or scope value named "All" means only "read every item in the authorized scope"; it is not a selection command and must not implicitly select current, hidden, or future rows. |

---

## Failure paths (normative) — PAY-F

| ID | Condition | Outcome |
|----|-----------|---------|
| **PAY-F1** | Invalid payment schema, negative amount, invalid enum or completed write without paidAt. | **MUST** reject through the error boundary without coercion/default. Persisted malformed rows raise the registered invalid-payment-item error as a system error; query-engine invalid markers reach the owner before output. Schema-valid empty placeholders (zero amount plus a seeded current timestamp) **MUST NOT** trigger due-time notifications from due time alone: one named selection predicate reads the already-derived money fact, and dropped candidates WARN with structural evidence, never crash. Where the [error policy](../error-policy/error-policy.md) blocks a new write-gate code because its user sentence cannot be sourced, declare the blocked gate beside this interim read predicate; **MUST NOT** reuse a SYSTEM code to avoid translation. Notification-selection provenance is cross-file information, so a single-file check cannot cover that boundary. |
| **PAY-F2** | PAY-M1 requires `expectedTotalForStatus` but the transform has PAY-D6 data available and omits the argument. | STOP critical flow; must not ship; classify bug until transform supplies the parameter. |
| **PAY-F3** | `totalAmountFieldPresent` omitted on a mapper call (undefined). | Mapper **MUST** treat as `false` (PAY-M2); downstream must not "fix" by guessing true (reject if bypassed). |
| **PAY-F4** | Concurrent writes to the same record's payment entries / payment totals without serialization or transactional integrity cause inconsistent paidAmount relative to persisted rows. | **MUST** be prevented by [transactions/transaction-policy.md](../transactions/transaction-policy.md) (session / atomic update) or optimistic concurrency or surfaced as reconciliation ERROR — must not silently last-write-wins money (bug / reject). |

---

## Outputs (normative) — PAY-O

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PAY-O1** | Any financial-record payload exposed to payment UI (list, detail and every other view) **MUST** include `paidAmount` and `remainingAmount` from PAY-D4; `paymentStatus` is included only for payment-expecting rows under [PAY-M23](status-economics.md), and omitted otherwise, on the backend transform path (PAY-M8 — exactly one writer). | Bug if missing or locally recomputed (PAY-N1). | Static: inspect the UI for `paymentStatus` derivation; it must read API fields only. |
| **PAY-O2** | API contracts **MUST NOT** emit a numeric `totalAmount` for PAY-D1 documents (field absent in persistence); must not substitute `0` to mean absent (PAY-N3). | Bug — reject until contract aligns with repository / error-policy minima. | Static: response shaping and OpenAPI/types show omit vs present. |

---

## MUST and MUST NOT — moved

The rows PAY-M1–PAY-M14, PAY-M18, PAY-M20, PAY-M27–PAY-M30 and PAY-N1–PAY-N10 are defined in [payment-must-and-must-not.md](payment-must-and-must-not.md); PAY-M15, PAY-M16 and PAY-M17 in [payment-retention-and-migration.md](payment-retention-and-migration.md).

---

## Agent execution contract — PAY-C

| ID | Rule |
|----|------|
| **PAY-C1** | Compliance is only from PAY- rows in this folder plus linked parts; technical ambiguity → [agent contract C2](../_meta/agent-contract.md); product or authority uncertainty → [gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md). |
| **PAY-C2** | PAY-N breaches block merge/deploy until removed; PAY-M breaches are bugs (must fix). |
| **PAY-C3** | SSoT breach (second writer for PAY-D4 outputs per PAY-M8, or PAY-N1) on critical payment flows → STOP until resolved. |
| **PAY-C4** | Precedence: Domain error / logging / transactions standards win on how failures and side effects are expressed; this topic wins on what payment fields mean and where they are computed. |
| **PAY-C5** | Change impact: If mapper signatures or PAY-D definitions change, update [decision-gates-and-verification.md](decision-gates-and-verification.md) Decision gates and [derivation.md](derivation.md) tables in the same change set. |

---

## Enforcement (normative summary)

| Violation | Outcome |
|-----------|---------|
| PAY-M breach | Bug — must fix; not shippable if it falsifies money/border state. |
| PAY-N breach | Reject (merge/deploy blocked) until removed. |
| PAY-F2, PAY-C3, SSoT double-writer | STOP on critical flow until resolved. |
| **PAY-F1** | ERROR response / validation failure — reject invalid data. |
| **PAY-F4** | Concurrent payment corruption risk — reject until transactional / concurrency pattern applied (transactions SSOT). |

---

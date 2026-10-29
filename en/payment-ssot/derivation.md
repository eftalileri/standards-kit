# Payment SSOT — derivation and mapper (normative)

```kit-cover
type: normative
part-of: README.md
binds: DV1 to DV7 -- the derivation truth table of the PAY-D4 mapper: precedence between expectedTotalForStatus and totalAmount, and the exact paidAmount / remainingAmount / paymentStatus outcome for each input shape
open-when: shape:backend-heavy, signal:payment-field, signal:payment-status, signal:money-derivation
skip-when: signal:no-payment-surface, signal:ui-only
owns: DV1, DV2, DV3, DV4, DV5, DV6, DV7
```

Scope: Algorithms for the single payment derivation authority (PAY-D4), precedence between an expected total and a stored total, and numeric outcomes. Caller obligations stay in [rules.md](rules.md).

Implementation: the adopting system names its canonical derivation module and the call sites that consume it.

---

## Decision routing (normative)

Use [README.md](README.md) Decision gates GPAY1–GPAY4 before implementing branches.

---

## paidAmount (normative)

| Step | Rule |
|------|------|
| 1 | Input `payments` **MUST** be an array at the derivation boundary (PAY-M9, PAY-D7). A query-engine aggregate may reach step 2 only from the canonical persisted-shape adapter's validated entries; its invalid marker reaches the owning service and becomes the registered invalid-payment-item error before any list/total output. |
| 2 | paidAmount = completed sum minus server-owned refund sum ([PAY-M25](status-economics.md)), per PAY-D8. Each ledger has its fail-loud shape gate; over-refund is invalid, not clamped. |
| 3 | Before any >= / < branch in the tables below, operands **MUST** be comparable per PAY-D8 (no raw float boundary flips). |

---

## paymentStatus precedence (normative)

Evaluate in order: if [PAY-D11](status-economics.md) says payment is not expected, apply [PAY-M23](status-economics.md) and stop; otherwise use these tables:

1. If finite `expectedTotalForStatus` was passed (GPAY1 = YES):

| Condition | paymentStatus |
|-----------|----------------|
| `paidAmount >= expectedTotalForStatus` | `paid` |
| `0 < paidAmount < expectedTotalForStatus` | `partial` |
| `paidAmount === 0` | `unpaid` |

2. Else (GPAY1 = NO) — use `totalAmount` and `totalAmountFieldPresent`:

| Condition | paymentStatus |
|-----------|----------------|
| `totalAmountFieldPresent !== true` | `unpaid` |
| `totalAmountFieldPresent === true` and `totalAmount === 0` | `paid` |
| `totalAmountFieldPresent === true` and `totalAmount > 0` and `paidAmount >= totalAmount` | `paid` |
| `totalAmountFieldPresent === true` and `totalAmount > 0` and `0 < paidAmount < totalAmount` | `partial` |
| `totalAmountFieldPresent === true` and `totalAmount > 0` and `paidAmount === 0` | `unpaid` |

Determinism note: `payments === []` and omitted `payments` (normalized to [] per PAY-D7) yield the same paidAmount (0) and the same row in the tables above.

---

## remainingAmount (normative)

When expected branch applies (GPAY1 YES):  
`remainingAmount = max(0, expectedTotalForStatus - paidAmount)`.

When totalAmount branch applies (GPAY1 NO) and `totalAmountFieldPresent === true` and `totalAmount > 0`:  
`remainingAmount = max(0, totalAmount - paidAmount)`.

When PAY-D1 holds (`totalAmountFieldPresent !== true`), remainingAmount **MUST** be `0` in API outputs or omitted per repository contract — must not invent a positive shortfall from guessed totals (PAY-N3, PAY-N5).

---

## Expected totals by transaction type (normative)

| Transaction type | Source of expectedTotalForStatus |
|------------------|----------------------------------------|
| Item-priced transaction | Stored `totalAmount`, then a custom price, then the frozen item-snapshot sum through the one expected-total authority (PAY-D6); no live catalogue fallback. |
| Bundled or prepaid transaction | Populated bundle total price on the linked owning record, then the frozen bundle-snapshot total, then the same record's stored `totalAmount`, then a custom price, through the same expected-total resolver. Stored alternatives retain PAY-R-D7's birth/explicit re-selection boundary; no live catalogue, default or neighbouring-record fallback. |

Read completeness: every list/detail query that drives paymentStatus for a bundled or prepaid transaction **MUST** load at least the total price on the linked owning record (bug if the status uses a stale or missing price); a missing input must not silently produce a stale or partial result.

---

## Rendering a money decision inside a query engine (normative)

A money decision rendered inside a query engine **MUST** have one exported declarative definition. Its required fields, checks and accepted values feed both the in-memory predicate and query builder; value sets come from their vocabulary authority ([SSG-M8](../ssot/ssot-principles-and-precedence.md)). Presence alone **MUST NOT** replace validity: missing, null, wrong-type, whitespace-only and out-of-vocabulary values can disagree between engines.

Parity **MUST** be measured by both renderings over the same real-engine inputs, including each malformed shape, with zero disagreements; reading the expressions is not parity proof. A static check may catch an operator object or null query value on the decision field outside its builder, but a predicate assigned to a local and then spread into the query, and cross-file construction, remain review obligations.

---

## An adapter MUST NOT sanitize an input before a fail-loud authority (normative)

An adapter **MUST NOT** coerce, default or clamp an authority's inputs before its fail-loud gate. Substituting a valid-looking `0` prevents the authority from rejecting corrupt money.

(a) If the adapter then only forwards the same arguments, callers **MUST** move to the authority and the adapter **MUST** be deleted in the same change ([SSG-M8](../ssot/ssot-principles-and-precedence.md), [DCD-M2](../dead-code/dead-code-rules.md)).

(b) Before removing a substitution, enumerate every consumer and trace the raised error through user requests, background calls and retrying workers. A categorized log or registered terminal failure is valid; a swallowing catch **MUST** be fixed first.

(c) Corrupt-data failures in retrying workers **MUST** be registered as non-retryable; otherwise a fail-loud repair creates endless retries.

(d) Pre-conditioning the operands is a second decision about invalidity even when the formula delegates correctly.

Stated enforcement limit: a single-file check can detect some direct duplicate arithmetic (including a base rebound to a local), but may not establish which authority a value flows into after aliases, helpers, function results or cross-file transformations. A syntax fence on the substitution itself is not admissible when the same default is legitimate for another consumer and its destination is whole-graph information ([FP-M18](../false-positive/check-design-rules.md)). Review values between persistence and the canonical authority; do not treat an absence of findings as complete coverage.

---

## One zero branch MUST NOT answer two different questions (normative)

A conditional mixing presence/type and numeric-range predicates **MUST NOT** send both failures to `0`. For example, `typeof p === 'number' && Number.isFinite(p) && p > 0 ? p : 0` hides missing money behind a legitimate floor.

(a) Presence/type validation **MUST** use the existing registered money gate, or one new shared gate when none exists, never a local copy ([SSG-M8](../ssot/ssot-principles-and-precedence.md)).

(b) The numeric floor **MUST** operate on the validated value as `Math.max(0, x)`, making its clamp intent explicit.

(c) A downstream all-zero rejection does not justify zeroing one malformed row: it still misattributes that row's share to its siblings.

Enforcement note: a single-file syntax check can decide the collapsed shape — a money-named target assigned a conditional whose test carries a presence or type predicate and whose branch is a `0` literal — and fences it. It deliberately does not fire on a test carrying only a numeric comparison, because that is the legitimate clamp in (b); a mixed predicate is split, never suppressed.

---

## Legacy assumptions (MUST NOT)

| Removed assumption | Replacement |
|--------------------|-------------|
| `completed` ⇒ paid | PAY-N2 |
| Bundled sale ⇒ every later transaction is paid | PAY-N2; sale revenue and later collection/accrual remain distinct ([reporting.md](reporting.md)). |
| `totalAmount` missing ⇒ treat as 0 for status | PAY-N3, PAY-N5 |

---

## Verification (derivation)

| # | Input shape | Expected |
|---|-------------|----------|
| **DV1** | `payments` empty, `totalAmountFieldPresent: false` | `paymentStatus === 'unpaid'`, `paidAmount === 0` |
| **DV2** | `expectedTotalForStatus: 100`, `paidAmount: 100` | `paymentStatus === 'paid'` |
| **DV3** | `expectedTotalForStatus: 100`, `paidAmount: 40` | `paymentStatus === 'partial'` |
| **DV4** | `totalAmountFieldPresent: true`, `totalAmount: 0` | `paymentStatus === 'paid'` |
| **DV5** | `totalAmountFieldPresent: true`, `totalAmount: 200`, `paidAmount: 200` | `paymentStatus === 'paid'` |
| **DV6** | `totalAmountFieldPresent: true`, `totalAmount: 200`, `paidAmount: 0` | `paymentStatus === 'unpaid'` |
| **DV7** | Same totals as DV2 but represented as floats with representational noise | After PAY-D8 normalize — same `paymentStatus` as DV2 (no flip to partial). |

---

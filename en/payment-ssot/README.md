# Payment data SSOT and explicit policy

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Short name: PAYMENT / financial data SSOT

**Keywords:** payment, paidAmount, paymentStatus, mapper, revenue

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) — P1–P8 when this topic is in scope (P8 verification when implementation-bound); cite in deliverables per [markdown-authoring M16](../authoring/markdown-authoring.md).

Scope

- Included: One writer (PAY-M8) for derived payment totals and status; normalized payment inputs (PAY-M9); precise monetary comparisons (PAY-D8); lifecycle status economics and the cancel-with-money decision (PAY-D11, PAY-M22–PAY-M24); concurrent-write safeguards (PAY-F4); explicit distinction between an absent total and a deliberately recorded zero; the single validity gate a stored money field is judged at and the ban on representing invalidity as `0` or any other in-range placeholder (PAY-M20, PAY-N9); status-dependent payment expectations for item-priced and bundled transactions; transform-layer-only derivation; exact multi-row financial settlement selection and server-owned amount derivation (PAY-D10, PAY-M14, PAY-N6); retained financial-subject/snapshot lifecycle and response-boundary isolation (PAY-M15, PAY-N7); live financial migration/settlement transactional fencing (PAY-M16, PAY-N8); ordered transactional teardown when a subject entity that owns retained financial history is deleted (PAY-M17); UI consumption, cache sync, and financial row/aggregate/action integrity (PAY-UI-M5, PAY-UI-M6, PAY-UI-N2); reporting separation (accrual vs collection) and time basis (PAY-R-D4); validation for completed payments; risk table.
- Excluded: Product-specific pricing rules; tax or invoicing law; PDF/Excel layout detail (see [report-pdf](../report-pdf/README.md) and [report-excel](../report-excel/README.md)).

Environment: Applies wherever an application records, derives, displays, settles, or reports money. See [logging policy](../logging-policy/logging-policy.md) for logging requirements on payment paths.

Binding principle: Violation of PAY-M / PAY-N / PAY-F / PAY-O / PAY-UI-\* / PAY-R-\* rows yields bug, reject, or STOP as stated in [rules.md](rules.md) Enforcement and PAY-C contract.

Normative parts (read all that apply to the task):

| Part | Role |
|------|------|
| [rules.md](rules.md) | Rule engine: PAY-C, PAY-D, PAY-F, PAY-O, Enforcement |
| [payment-must-and-must-not.md](payment-must-and-must-not.md) | PAY-M1–PAY-M9, PAY-M14, PAY-M18, PAY-M20, PAY-M27, PAY-M28, PAY-M29, PAY-M30 and PAY-N1–PAY-N10 — who derives and writes a payment figure, how a paid outbound channel's balance is granted and debited once and degrades to the free path when spent, how a destination-priced consumable records its cost tier and debits weighted units, the single validity gate a stored money field is judged at, why an invalid amount is represented by absence and never by `0`, how a single-record partial collection is bounded by the remaining, why a tenant holds one currency and rounds new fractions to its minor units, and why editing an existing record never re-prices it from the catalogue |
| [money-owning-record-teardown.md](money-owning-record-teardown.md) | PAY-M10–PAY-M13, PAY-M19, PAY-M21, PAY-M26 — what must happen before a record that already owns collected money is torn down: the disposability authority, relationship-vs-destruction, close and delete as two named authorities, no owner-link severing, per-model irreversible-delete exemptions, owner-keyed collection classification, and the preview-bound, user-confirmed erasure of a history-bearing child that retains settled lines |
| [payment-retention-and-migration.md](payment-retention-and-migration.md) | PAY-M15, PAY-M16, PAY-M17 — retained history, subject teardown, live migration fence |
| [decision-gates-and-verification.md](decision-gates-and-verification.md) | GPAY1–GPAY4, enforcement summary, PV1–PV18 acceptance checklist |
| [derivation.md](derivation.md) | Mapper precedence, paidAmount, paymentStatus tables, remainingAmount, populate rules |
| [status-economics.md](status-economics.md) | PAY-D11, PAY-M22–PAY-M24 — lifecycle money/entitlement/schedule meaning, not-expected writes and cancel-with-money routing |
| [ui-binding.md](ui-binding.md) | Client binding, financial list integrity, i18n keys, cancel flow, border |
| [reporting.md](reporting.md) | Accrual vs collection, dashboard and report pipelines |
| [risks.md](risks.md) | Capped risk register (10 rows) |

References: this hub is self-contained for payment-specific rules and links to related standards where relevant.

---

## Rule identifiers (normative)

| Prefix | Meaning |
|--------|---------|
| PAY-C\* | Agent execution contract ([rules.md](rules.md)). |
| PAY-M\* | **MUST** — payment SSOT and pipelines. |
| PAY-N\* | **MUST NOT** — forbidden derivation and defaults. |
| PAY-F\* | Failure path — ERROR / STOP. |
| PAY-D\* | Definition — removes ambiguity. |
| PAY-O\* | Output — API / DTO shape minima. |
| PAY-UI-\* | UI **MUST** / **MUST NOT** ([ui-binding.md](ui-binding.md)). |
| PAY-R-\* | Reporting and revenue ([reporting.md](reporting.md)). |
| PAY-RISK-\* | Risk row ids ([risks.md](risks.md)). |
| GPAY\* | Decision gate — binary routing. |

---

## Decision gates, enforcement and verification — moved

The gate index GPAY1–GPAY4, the enforcement summary and the acceptance checklist PV1–PV18 are defined in [decision-gates-and-verification.md](decision-gates-and-verification.md).

---

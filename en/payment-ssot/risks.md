# Payment SSOT — implementation risks (normative table)

```kit-cover
type: normative
part-of: README.md
binds: PAY-RISK-1 to PAY-RISK-10 -- the capped register naming each known way a payment implementation goes wrong and the PAY- row that mitigates it
open-when: shape:backend-heavy, signal:payment-field, signal:payment-risk-review
skip-when: signal:no-payment-surface
owns: PAY-RISK-1, PAY-RISK-2, PAY-RISK-3, PAY-RISK-4, PAY-RISK-5, PAY-RISK-6, PAY-RISK-7, PAY-RISK-8, PAY-RISK-9, PAY-RISK-10
```

Scope: Capped risk register (risk scope; 10 rows). Full mitigations are binding PAY- rows in [rules.md](rules.md), [derivation.md](derivation.md), [ui-binding.md](ui-binding.md), [reporting.md](reporting.md).

Format: Exactly the columns below; no extra prose sections.

| Risk ID | Failure mode | Root cause | Binding rule IDs | Verify |
|---------|--------------|------------|-------------------|--------|
| **PAY-RISK-1** | A missing total is displayed or treated as a zero balance. | Derivation collapses absent and consciously recorded zero. | PAY-M2, PAY-N5, derivation branch 2 | DV1, PAY-O2 |
| **PAY-RISK-2** | A relationship or status change silently changes collection or entitlement meaning. | A status writer derives a different target, or a gate reads a parent ledger instead of the target record's own financial state. | PAY-M4, PAY-M24 | Review the explicit policy and pre-write refusal path, a source-wide status-writer inventory and the expected-error signal. |
| **PAY-RISK-3** | Summary collection wrong. | Stats bypass transform. | PAY-M6, PAY-R-M1 | RV1 |
| **PAY-RISK-4** | Reports show empty payment columns. | Raw stored documents without PAY-D4. | PAY-M6, PAY-R-M3 | RV2 |
| **PAY-RISK-5** | Expected balance is stale or absent. | Required expected-total inputs were not loaded or passed into the derivation. | PAY-M1, PAY-F2, derivation | Read-path review |
| **PAY-RISK-6** | Client recomputes status. | Duplicate SSOT. | PAY-N1, PAY-M8, PAY-C3 | UV1 |
| **PAY-RISK-7** | Empty i18n keys in prod. | Missing translations. | PAY-M7, PAY-N4 | Inspect all required locale keys |
| **PAY-RISK-8** | A completed payment entry is missing its effective date. | The write boundary did not validate required payment fields. | PAY-M5, PAY-F1 | Inspect backend input normalization and persisted-row validation. |
| **PAY-RISK-9** | paid vs partial flips randomly. | Float compare without PAY-D8. | PAY-D8, derivation step 3 | DV7 |
| **PAY-RISK-10** | UI shows old paymentStatus after pay. | Cache not invalidated. | PAY-UI-M5 | UV4 |

---

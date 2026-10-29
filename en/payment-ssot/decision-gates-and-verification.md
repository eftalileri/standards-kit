# Payment SSOT — decision gates (GPAY) and the verification checklist (PV)

```kit-cover
type: normative
part-of: README.md
binds: GPAY1 to GPAY4 and PV1 to PV18 -- the binary routing between the expected-total and stored-total branches, the single-writer gate, the conscious-zero exemption gate on request-boundary rejections, the topic-wide enforcement outcomes, and the binary pre-flight checklist that closes payment work
open-when: shape:backend-heavy, shape:full-stack, signal:payment-field, signal:payment-status, signal:financial-settlement
skip-when: signal:no-payment-surface
owns: GPAY1, GPAY2, GPAY3, GPAY4, PV1, PV2, PV3, PV4, PV5, PV6, PV7, PV8, PV9, PV10, PV11, PV12, PV13, PV14, PV15, PV16, PV17, PV18
```

Scope: The decision-gate index of the payment topic, the enforcement summary that maps a breach class to an outcome, and the acceptance checklist an agent must satisfy before calling payment work done.

Document type: Normative part — GPAY1–GPAY4, PV1–PV18.

References: [README.md](README.md); [rules.md](rules.md) (PAY-C\*, PAY-D\*, PAY-F\*, PAY-O\*); [payment-must-and-must-not.md](payment-must-and-must-not.md) (PAY-M1–PAY-M14, PAY-M18, PAY-M20, PAY-M27–PAY-M30, PAY-N\*); [payment-retention-and-migration.md](payment-retention-and-migration.md) (PAY-M15–PAY-M17); [derivation.md](derivation.md); [ui-binding.md](ui-binding.md); [reporting.md](reporting.md).

---

## Decision gates (normative)

| Gate | Question (proceed only if YES) | Binding rule IDs | If NO |
|------|------------------------------------------|------------------|-----------|
| **GPAY1** | Is finite `expectedTotalForStatus` passed into PAY-D4 for this call? | [derivation.md](derivation.md) branch 1 vs 2, PAY-M1, PAY-F2 | Use totalAmount + totalAmountFieldPresent branch per [derivation.md](derivation.md); if PAY-D6 data was available and param missing → STOP (PAY-F2). |
| **GPAY2** | For this financial response, is PAY-D6 either false (no expected total is derivable) or true and satisfied by PAY-M1? | PAY-M1, PAY-F2 | STOP until the required expected-total input is supplied. |
| **GPAY3** | Are `paymentStatus`, `paidAmount` and `remainingAmount` attached only by the canonical response authority using PAY-D4, with [PAY-M25](status-economics.md) netting the server-owned refund ledger and [PAY-M23](status-economics.md)'s not-expected arm omitting `paymentStatus` and keeping real net `paidAmount` + zero remaining? | PAY-M3, PAY-M8, PAY-M9, PAY-M23, PAY-M25, PAY-N1, PAY-O1 | Reject duplicate writers, an omitted refund input or a fabricated closed-enum value; STOP on critical flows (PAY-C3). |
| **GPAY4** | Does every zero-received-amount rejection, at request and domain boundaries, call the single conscious-zero exemption? Conscious total zero is fully paid, including a zero collection with method. Unknown/absent/non-finite/catalogue-deferred totals fail closed and retain rejection. | PAY-D2, DV4, [SSG-M1](../ssot/ssot-must-authority-and-derivation.md), [SSG-M8](../ssot/ssot-principles-and-precedence.md) | Route every rejection through the exemption. A syntax check may admit the rejection only inside a branch whose condition calls that authority; early-return dominance needs cross-statement data flow and remains a declared review obligation. |

---

## Enforcement (normative summary)

| Outcome | When |
|---------|------|
| Bug (must fix) | Any PAY-M breach; PAY-O breach; PAY-UI-M / PAY-R-M breach. |
| Reject (merge/deploy blocked) | PAY-N / PAY-UI-N / PAY-R-N breach; PAY-F1 invalid data shipped without validation; PAY-F4 pattern missing on concurrent payment writes (transactions SSOT). |
| STOP | PAY-F2; PAY-C3; GPAY2 fail when expected total is derivable but missing. |

---

## Verification (acceptance checklist)

Binary pre-flight before claiming payment work is done:

| # | Check |
|---|--------|
| **PV1** | payments empty and PAY-D1 → `paymentStatus === 'unpaid'` (DV1). |
| **PV2** | `paidAmount >= expectedTotalForStatus` → `paid` (DV2). |
| **PV3** | Partial payment → `paymentStatus === 'partial'` (DV3). |
| **PV4** | Conscious zero → `paid` (DV4). |
| **PV5** | No client-side `paymentStatus` computation (UV1, PAY-N1). |
| **PV6** | A cancellation follows PAY-M24: money owned by a parent record does not silently alter the child record's requested state; a record carrying its own collected money requires an explicit choice, and a plain-cancel command is refused by the pure registered pre-write gate without deriving another status. |
| **PV7** | Dashboard collection uses PAY-D3 sum (RV1, PAY-R-M1). |
| **PV8** | PAY-M7 locales present for PAY-UI-M4 keys. |
| **PV9** | PAY-M8 / PAY-M23 — only the one response authority writes paymentStatus / paidAmount / remainingAmount on API models; a not-expected status keeps real `paidAmount`, returns zero remaining and omits `paymentStatus`. |
| **PV10** | PAY-M9 + PAY-D8 — `payments` → array before mapper; a query-engine aggregate sums only canonical shape-adapter validated entries and its owner turns any invalid marker into the registered invalid-payment-item error; money compares use minor units or one rounding policy. |
| **PV11** | PAY-UI-M5 / UV4 — payment mutation invalidates or refetches the affected financial queries. |
| **PV12** | PAY-R-D4 / PAY-R-M4 / RV4 — each report metric has explicit time basis. |
| **PV13** | PAY-D10 / PAY-M14 / PAY-N6 — a multi-row financial settlement receives explicit item IDs, verifies each ID's declared kind against the authoritative stored row before any write, derives amounts from that row, and commits all selected rows or none. A kind mismatch is a registered input-validation refusal, never a silent reroute to another ledger; a scope named "All" does not select rows. The re-read inside the owning transaction covers every row kind (a plan sealed outside the unit is intent only, and a version/length compare-and-set alone misses edits that leave the ledger length unchanged), and a rejection names each refused row with its registered code and display name (never money, never a bare count). |
| **PV14** | PAY-M15 / PAY-N7 — retained person-attributed rows survive membership deletion, all-scope/exact settlement does not require current roster membership, snapshot reads are strict, and generic DTOs omit the internal name snapshot. |
| **PV15** | PAY-M16 / PAY-N8 — bootstrap insert-only provisions the unproven durable database fence as locked and validates every existing state; deployment proof excludes any predecessor instance that lacks the fence-aware writer; every live financial identity migration and settlement writer touches that pre-existing record in its own transaction without upsert. When strict readers depend on the migration, the exact sequence is apply-acquire → readiness → bounded repairs → zero-proof while locked → final dry-run → strict-reader deployment proof → newer-fence zero recheck → explicit release. Failure remains fail-closed, and missing/malformed authority is a system error rather than maintenance. |
| **PV16** | PAY-UI-M6 / PAY-UI-N2 / UV5 — failure to validate or transform any financial row supplied for the current result blocks the contained rows, aggregate/count, selection, and actions until retry; it is never skipped into partial success. A valid cursor/page subset may still render with its server-authoritative full-scope total when no supplied row is omitted. |
| **PV17** | PAY-M17 — deleting a subject entity runs guards → stop future production (flags cleared, owning rows enumerated inside the transaction, no liveness gate the background engines do not apply) → delete only pending future rows → freeze absent event-time labels from the single derivation → clear membership references through their single writer → tenant-scoped session-bound delete with a fail-loud zero count → re-assert no future-producing flag survives, all in one transaction; post-commit cache invalidation uses the observable surface and never fails a committed deletion; subjects deleted before the teardown existed are repaired by a bounded migration that writes only through the same single flag writer and proves zero remaining absent-subject flags. |
| **PV18** | GPAY4 — every rejection keyed on a zero received amount, at the request boundary and in the domain guard alike, consults the single conscious-zero exemption authority; no site carries its own copy of the condition; an unknown total keeps the rejection (fail-closed); any check covers only the raise shapes it observes, and the early-return shape is declared as a review obligation. |

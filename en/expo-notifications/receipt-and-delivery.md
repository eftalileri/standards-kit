# Receipt and delivery — NOTIF-RCP-*

```kit-cover
type: normative
part-of: README.md
binds: NOTIF-RCP-M1 to NOTIF-RCP-M7, NOTIF-RCP-M11 to NOTIF-RCP-M13, NOTIF-RCP-N1 to NOTIF-RCP-N3 and the notification status model -- the ticket-versus-receipt distinction, the single receipt-checker module, receipt timing, what "delivered" is allowed to mean, and the delivery-derived inactivity/suppression projection
open-when: shape:backend-heavy, signal:notification, signal:push-notification, signal:push-receipt, signal:delivery-status, signal:notification-suppression, signal:engagement-inactivity, signal:audience-eligibility
skip-when: signal:client-only-notification-change, signal:no-receipt-path-change
owns: NOTIF-RCP-M1, NOTIF-RCP-M2, NOTIF-RCP-M3, NOTIF-RCP-M4, NOTIF-RCP-M5, NOTIF-RCP-M6, NOTIF-RCP-M7, NOTIF-RCP-M11, NOTIF-RCP-M12, NOTIF-RCP-M13, NOTIF-RCP-N1, NOTIF-RCP-N2, NOTIF-RCP-N3
```

Normative parts (the NOTIF-RCP-M family, banded): [push credential binding and stale-token cleanup](push-credential-binding.md) (NOTIF-RCP-M8–NOTIF-RCP-M10).

Scope: Expo ticket vs receipt, notification status model, receipt checker service, `pushTicketId` persistence, and `DeviceNotRegistered` handling.

Document type: Normative — part of [README.md](README.md).

References: [expo-notifications-core.md](expo-notifications-core.md) (NOTIF-T-RECEIPT-FIRST-MIN, NOTIF-T-RECEIPT-WORKER-MAX-MIN); [decision-gates.md](decision-gates.md) (GNOTIF1, GNOTIF2, GNOTIF5, GNOTIF10).

---

## **MUST** — NOTIF-RCP-M

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **NOTIF-RCP-M1** | Distinguish the provider-acceptance stage from provider-receipt confirmation. An accepted Expo ticket means the Expo service accepted the message; a successful receipt means the downstream push service accepted the handoff. Product copy and analytics **MUST** preserve this distinction. | Misleading delivery claims. | Review user-visible and analytics mappings against the status model below and document the distinction in the application’s notification operations record. |
| **NOTIF-RCP-M2** | Do not use user-visible or business “delivered/confirmed” semantics until a successful receipt updates the record to `DELIVERED_CONFIRMED`. | Bug — **must not** ship. | Review status transitions and ensure ticket-only acceptance cannot produce a delivered claim. |
| **NOTIF-RCP-M3** | All receipt-fetch calls **MUST** be owned by one named module or adapter so scheduling, retry, and state updates share one authority. | Scattered receipt polling and inconsistent lifecycle. | Review the call graph and confirm one module owns receipt fetching. |
| **NOTIF-RCP-M4** | Persist the provider ticket identifier returned for an accepted notification so its receipt can be queried. The stored field name is selected by the application schema. | Cannot correlate receipts. | Review the notification record and confirm it stores the provider-issued identifier. |
| **NOTIF-RCP-M5** | For Expo Push Service, do not fetch a receipt before the provider-recommended wait after ticket acceptance (currently 15 minutes). If using another provider, follow that provider’s published receipt timing. | Unavailable receipt or unnecessary polling. | Review the worker delay against the selected provider’s current receipt guidance. |
| **NOTIF-RCP-M6** | While notifications remain `SENT`, the receipt worker **MUST** run within the application-selected NOTIF-T-RECEIPT-WORKER-MAX-MIN bound. Choose a finite bound that meets the product’s delivery visibility and support needs. | Stale `SENT` state. | Review the durable worker schedule and its maximum lag against the application’s recorded operational value. |
| **NOTIF-RCP-M7** | On `receipt.status` `error`, persist `DELIVERY_FAILED` and log with `logger.error` (or project equivalent) including Expo / provider error code string — not `logger.info` alone ([logging-policy](../logging-policy/logging-policy.md)). Retry eligibility is orthogonal to delivery stage: a retryable receipt error remains `DELIVERY_FAILED` and carries the separate canonical retryability field; it **MUST NOT** be rewritten as pre-ticket `FAILED`. Every consumer that reclaims retryable terminal failures **MUST** read one shared closed failure-status authority rather than duplicating stage literals. | Bug — silent failure or false delivery-stage evidence. | Pass: Receipt handler file contains an exact `DELIVERY_FAILED` write inside the `error` branch and the idempotency/reclaim/content-dedupe consumers use one shared retryable-failure status authority; `logger.error` or project-equivalent terminal logging includes the structural provider code. |

UI count clarification (NOTIF-RCP-M1/M2/N3): A preview count derived from stored push capability describes eligibility only and **MUST NOT** imply future or completed device delivery. A send-result count derived from provider acceptance is labeled as provider/service acceptance, never as receipt-confirmed delivery. A failed or outcome-unknown attempt is labeled as a sending failure, not as proof of device non-delivery. An in-app-only counter proves creation of an application record, not that its recipient read it. A pending or retryable checkpoint describes unfinished/resumable work; UI copy **MUST NOT** promise active sending or automatic replay without its canonical worker/command contract. A backend summary's combined provider-accepted/in-app-record count describes those two existing stages, not receipt/read confirmation; fresh completion and completed replay both use the same canonical formatter. The consumer renders the existing counters without deriving a second delivery metric. Enforcement limit: stage/counter semantics are produced in backend domain code while their natural-language meaning is rendered across backend and client surfaces, so equivalence requires source, contract and copy review; a closed outcome/formatter API is the stronger mechanism, and a lexical wording check cannot prove this cross-file stage.

Credential band: NOTIF-RCP-M8–NOTIF-RCP-M10 are defined in [push-credential-binding.md](push-credential-binding.md).

| **NOTIF-RCP-M11** | A periodic-notification inactivity window **MUST** start only from the first post-reset `DELIVERED_CONFIRMED` record, using that notification's canonical recipient-scoped local-calendar identity. The suppression threshold **MUST** be elapsed full local calendar days, not receipt count, attempt count, UTC-hour duration, or consecutive-send count. Later successful deliveries, failed/terminal attempts, and no-send days **MUST** neither restart nor extend the active window. If notification retention can expire before a late engagement, keep only the minimal bounded durable recipient/notification evidence needed to bind that engagement; evidence cardinality **MUST NOT** become the suppression predicate. | Bug — failed attempts advance the threshold, missed days postpone it, DST changes the deadline, or TTL creates a false negative. | Pass: receipt-confirmation starts the projection once; dispatch compares canonical local dates; attempts/counts are absent from the predicate; bounded evidence exists only for dedupe/late engagement. |
| **NOTIF-RCP-M12** | A business suppression derived from delivery and engagement **MUST** be separate from the user's explicit notification preference. Receipt status + inactivity projection, canonical read/click/action + reset epoch, authenticated resume activity, and the final pre-dispatch authorized/suppressed decision **MUST** use one durable authority and transaction/CAS ordering across instances. Once system suppression exists, the final dispatch decision **MUST** remain suppressed until that same authority commits a canonical reset; a previously fetched scheduler candidate is not authorization. A reset **MUST** fence late receipts and old engagements with immutable ticket-issued time and/or exact durable notification evidence; duplicate receipt, local-day, interaction, foreground-session, provider retry, or token rotation **MUST** be idempotent. If a committed interaction clears the binding evidence that authorized it, outcome-unknown replay **MUST** first recognize that exact durable interaction identity and return the committed result; only a new interaction may require the current notification/evidence binding again. A reset epoch **MUST** be monotonic: an engagement timestamp at or before the current reset epoch is stale and **MUST NOT** move that epoch backward or clear a later window, even if delayed ticket persistence appears newer. A late successful receipt from the still-current reset epoch **MUST** retain any bounded recipient-binding evidence needed beyond notification retention even when suppression already exists, but **MUST NOT** restart the inactivity window, remove suppression, or cross a later reset epoch. When a receipt batch can expose more than one first-window candidate, ordering **MUST** use canonical persisted provider-acceptance time plus a stable tie-breaker, never response-map/property enumeration. Sampled, lossy, or fire-and-forget product analytics **MUST NOT** be an eligibility authority. | Bug — explicit user intent is overwritten, an old event clears a new window, a late delivered notification loses its exact engagement binding at retention, a committed interaction rejects its own retry after clearing evidence, a stale candidate bypasses committed suppression, provider serialization order changes the deadline, or multi-instance races send the suppressed notification. | Pass: explicit preference is unchanged by system resets; all decision writers share one durable transaction authority; final dispatch keeps existing suppression sticky until canonical reset; exact committed interaction replay is recognized before requiring reset-cleared evidence; same-epoch late receipt evidence survives suppression without changing the window, while reset epochs reject pre-reset tickets and non-newer engagement times without regressing; batched confirmations are canonically ordered; operational activity is server-confirmed and analytics-independent. |
| **NOTIF-RCP-M13** | A permanent invalid-token/device-not-registered provider result is credential invalidation evidence, not by itself proof that the application was uninstalled. Preserve the canonical exact-version invalidation flow, count the row as a delivery failure, and add no uninstall fallback or heuristic unless the provider/device authority exposes a separate definitive uninstall signal. | Bug — permission revocation, token rotation, or provider failure is mislabeled as uninstall and drives unrelated product state. | Pass: invalid-token handling changes only the exact credential binding/terminal delivery state; no new uninstall field/event is written from that result. |

Verification boundary for NOTIF-RCP-M11–M13: Local-calendar timing, persisted receipt/engagement ordering, and transaction races span multiple records and events. Verify them through the canonical derivation, transaction/CAS behavior, and durable state transitions; static source inspection alone cannot prove runtime ordering.

---

## **MUST NOT** — NOTIF-RCP-N

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **NOTIF-RCP-N1** | Must not mark a notification `DELIVERED_CONFIRMED` without a successful receipt for that ticket (unless the product explicitly documents a non-push channel only — out of scope for Expo push). | Bug — **must not** ship. | Pass: same as NOTIF-RCP-M2 Verify. |
| **NOTIF-RCP-N2** | Must not skip receipt processing for production Expo push when `ticket.status` `ok` (GNOTIF1). | Bug — **must not** ship. | Pass: NOTIF-RCP-M3 + NOTIF-RCP-M6 Verify both pass. |

| **NOTIF-RCP-N3** | **MUST NOT** infer notification engagement from a delivery receipt: receipt confirmation proves device delivery only; read/open/click/in-app action requires its canonical user-interaction authority. | Bug — delivery is mistaken for attention and inactivity suppression never activates. | Pass: receipt paths do not write read/click/action fields or invoke engagement reset without an independently persisted canonical interaction. |

---

## Notification status model (normative)

| Status | Meaning | Set when |
|--------|---------|----------|
| `PENDING` | Durable intent is not terminal; separate provider-attempt phase says `NOT_STARTED` or `STARTED` | Creation through ticket/failure CAS |
| `SENT` | Expo accepted (`ticket` ok) | After Expo push API success |
| `DELIVERED_CONFIRMED` | Receipt `ok` | Receipt checker |
| `DELIVERY_FAILED` | Receipt `error` | Receipt checker |
| `FAILED` | Expo rejected before / without valid ticket | Push send path |

For stuck `PENDING`, a valid `pushTicketId` is acceptance evidence and is handed to `SENT`/receipt processing first. Without a ticket, only durable `pushProviderAttemptPhase=NOT_STARTED` may be released for retry; `STARTED` is outcome-unknown and must not resend. Missing/invalid historical phase is neither state and must be terminalized under a distinct legacy-unknown code rather than inferred from token correlation.
| `CANCELLED` | Business cancel | Domain action |

Implementations **MUST** use these status names or define a one-to-one mapping in the application’s notification contract.

NOTIF-RCP-M1 dispatch-outcome clarification: A notification skipped before provider submission (for example, no eligible recipient credential) is not a successful send and is not necessarily a transport failure. Consumers that translate dispatcher results **MUST** use one closed outcome classifier covering sent, skipped, failed, and unresolved results. Unknown terminal states or failures without retry evidence **MUST** fail visibly; never infer success from an unclassified result. Product-specific consumers may map a skip to their domain outcome, but the mapping must be explicit. Verify the classifier and its consumers across the dispatch flow; static source inspection cannot prove that every runtime outcome reaches the correct channel.

# Operations and observability — NOTIF-OPS

```kit-cover
type: normative
part-of: README.md
binds: receipt retry bounds, provider batching and rate limits, and operational metrics
open-when: shape:backend-heavy, signal:push-notification, signal:receipt-worker, signal:rate-limit-429, signal:notification-metrics
skip-when: signal:client-only-notification-change, signal:no-ops-surface-change
owns: NOTIF-OPS-M1, NOTIF-OPS-M2, NOTIF-OPS-M3, NOTIF-OPS-M4, NOTIF-OPS-M5, NOTIF-OPS-N1, NOTIF-OPS-N2
```

Scope: Operational limits for a notification provider, receipt retrieval, transient retries, batching, and monitoring. This file does not prescribe numeric limits; choose them from the selected provider’s current contract and the application’s delivery requirements. Keep chosen values in one named configuration authority.

References: [Receipt and delivery](receipt-and-delivery.md); [Backend dispatcher](backend-dispatcher.md); [Notification core](expo-notifications-core.md); [Expo Push Service API](https://docs.expo.dev/push-notifications/sending-notifications/). Review the selected provider’s current documentation and SDK source when upgrading.

## Named operational values

| ID | Value authority | Meaning |
|----|-----------------|---------|
| **NOTIF-T-OPS-RETRY-MAX** | One finite cap chosen by the application | Maximum attempts for one receipt fetch operation. |
| **NOTIF-T-OPS-BACKOFF-MAX-MS** | One finite duration chosen by the application | Maximum delay between transient retry attempts. |
| **NOTIF-T-OPS-BATCH-MAX** | Current provider limit | For Expo Push Service, use no more than 100 messages per send request; recheck the current provider documentation when upgrading or changing providers. |
| **NOTIF-T-OPS-RECEIPT-IDS-MAX** | Current provider limit | For Expo Push Service, use no more than 1,000 receipt IDs per receipt request; recheck provider documentation when upgrading. |
| **NOTIF-T-OPS-RECEIPT-RETENTION-H** | Current provider limit | Hours after which the provider no longer returns a receipt (Expo Push Service currently documents 24); recheck provider documentation when upgrading. |

Provider limits in one place (NOTIF-OPS-M2/N2): the provider's documented limits (messages per send request, receipt ids per request, project rate, receipt retention, first-fetch delay) **MUST** be named constants in the canonical adapter, cited to the provider documentation, and every chunker, drain and window **MUST** read them — a second literal drifts silently when the provider changes.

Receipt drain (NOTIF-RCP-M6, NOTIF-OPS-M2): the receipt worker **MUST** drain every due ticket inside the provider's retention window in passes of the receipt-id limit, within a run time budget, re-checking its lease between passes and advancing a keyset cursor so receipts the provider still reports pending are not re-read in the same run. A fixed per-run cap below the arrival rate never drains and lets the oldest tickets block the queue until they expire. Rows older than the retention window **MUST** get a closed terminal receipt-stage outcome (accepted, delivery unknown) in one indexed write, never a delivery claim. One row's failure (malformed receipt, side-effect error, a rolled-back persistence unit) **MUST** be isolated and reported once per run, never abort the run; a lost lease still stops it. The run **MUST** publish the remaining backlog count and oldest age.

Fleet-wide provider circuit (NOTIF-OPS-M4): a project-level provider refusal — HTTP 429 still returned after the SDK's own retries, or invalid push credentials for a platform — **MUST** open a cross-instance circuit with a short TTL that backs off exponentially across consecutive trips (up to NOTIF-T-OPS-BACKOFF-MAX-MS). While open, unstarted intents in that scope **MUST** be released as retryable failures before any provider call and reported once per call, so an outage costs no wasted HTTP calls and no per-send error event. An HTTP 429 whose every attempt was refused is a known rejection (retryable), not an unknown send outcome. A per-device rate error **MUST NOT** trip the fleet circuit, because it says nothing about other devices. The circuit is an optimization over the provider authority: when its store cannot answer, sends proceed and the degradation is counted.

The retry and backoff values are operational choices, not universal defaults. Record each once and have the dispatcher and receipt worker consume the same authority. Expo currently documents limits of 100 messages per send request and 1,000 receipt IDs per receipt request.

## Operational decision record

The adopting project records its receipt schedule, finite retry-attempt cap, backoff ceiling, provider batch limit, rate-limit behavior, and delivery metrics in its own operations documentation or deployment configuration. If a capability is intentionally disabled, state that explicitly. A source-tree check must not assume a specific documentation path.

## **MUST**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **NOTIF-OPS-M1** | Receipt retries **MUST** be finite and **MUST** use one caller-owned retry policy. Record the attempt cap and bounded backoff chosen for the selected provider. A no-retry policy is valid when each scheduled worker run makes one bounded attempt and leaves recovery to the next run. | Unbounded load or stale receipt state. | Review the worker’s retry policy and its operational record. Confirm no second transport retry budget is active. |
| **NOTIF-OPS-M2** | A provider request **MUST NOT** exceed its current documented batch limit. Resolve the limit from the selected provider’s documentation and keep the value in one configuration authority. | Rejected, split, or truncated sends. | Compare the request builder’s batch size with the provider’s current documented limit. |
| **NOTIF-OPS-M3** | Production notification delivery **MUST** expose enough operational signals to distinguish attempted sends, accepted tickets, receipt outcomes, and failures. If the application intentionally has no delivery metrics, state that decision explicitly. | Delivery failures remain invisible or untriageable. | Review the production metrics and alerting surface or the explicit no-metrics decision. |
| **NOTIF-OPS-M4** | A provider rate-limit response such as HTTP 429 **MUST** honor `Retry-After` when supplied, or apply bounded backoff before retrying. Retries **MUST** remain finite and **must not** create a synchronized retry storm. | Provider throttling or retry storm. | Review the transport policy and simulate or inspect the documented 429 response path. |
| **NOTIF-OPS-M5** | Send and receipt operations **MUST** share one configured provider client when the provider SDK requires shared configuration or rate-limit coordination. At SDK upgrades, inspect published source and declarations for internal retries, timeouts, and partial receipt results. Treat response payloads as untrusted until runtime-validated. | Divergent timeouts, duplicate rate limits, or silent delivery-state regression. | Review client construction ownership, provider call flow, and runtime response validation. Static syntax checks cannot prove runtime timeout or retry behavior. |

## **MUST NOT**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **NOTIF-OPS-N1** | Do not configure receipt retries or backoff beyond the selected provider’s limits or the application’s documented bounded policy. | Unbounded load or excessive delivery delay. | Review the resolved retry configuration and worker schedule. |
| **NOTIF-OPS-N2** | Do not send more messages in one request than the provider permits unless its documented API explicitly supports the selected batching behavior. | Provider rejection or message loss. | Compare the implementation with the provider’s current request contract. |

## Verification limits

Provider limits, SDK-internal retry behavior, and transport cancellation semantics change independently of application code. Re-check them at dependency upgrades. Build logs and source inspection cannot prove that a provider accepted, processed, or delivered a message; use tickets, receipts, and operational telemetry for those facts.

Part of: [README.md](README.md) — Expo notifications hub.

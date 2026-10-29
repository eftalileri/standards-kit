# Backend dispatcher — NOTIF-BE

```kit-cover
type: normative
part-of: README.md
binds: one backend notification boundary, validated audience/payload, durable provider handoff, and logging requirements
open-when: shape:backend-heavy, signal:notification-dispatch, signal:push-notification, signal:provider-payload
skip-when: signal:client-only-notification-change, signal:no-backend-dispatch
owns: NOTIF-BE-M1, NOTIF-BE-M2, NOTIF-BE-M3, NOTIF-BE-M4, NOTIF-BE-M5, NOTIF-BE-M6, NOTIF-BE-M7, NOTIF-BE-N1, NOTIF-BE-N2, NOTIF-BE-N3
```

Scope: Backend dispatch and persistence rules for applications that send Expo Push Service notifications. The application chooses its dispatcher module, data model, database, and logging authority. This standard does not prescribe a framework or ORM.

References: [Decision gates](decision-gates.md); [Audience and egress](backend-dispatcher-audience-and-egress.md); [Receipt and delivery](receipt-and-delivery.md); [Error policy](../error-policy/error-policy.md); [Logging policy](../logging-policy/logging-policy.md).

## **MUST**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **NOTIF-BE-M1** | All provider sends and related notification-state writes **MUST** pass through one backend dispatcher authority. Token-shape validation used by registration or migration may live in a pure validator that cannot send. | Architecture bug — **must not** ship. | Trace production send call sites and notification-state writers; confirm there is one dispatcher authority. |
| **NOTIF-BE-M2** | The dispatch request **MUST** carry a runtime-validated recipient, notification type, content, and any scope required by the application. In a multi-tenant application, audience scope **MUST** be explicit and validated; tenant-independent audiences use a distinct validated variant rather than an omitted field that could be ambiguous. | Incomplete records or cross-scope delivery. | Review the request schema, audience variants, and authorization path. |
| **NOTIF-BE-M3** | The persisted notification record **MUST** validate its type, recipient, and audience scope before save. Enforce both required scope and prohibited scope fields for each audience variant. | Invalid or ambiguously scoped records. | Review schema/runtime validation for each audience variant. |
| **NOTIF-BE-M4** | For durable provider delivery, persist the notification intent before any provider side effect. Use an explicit state machine, an idempotency identity, and compare-and-set transitions so duplicate workers cannot overwrite terminal state. A failed intent write **MUST** prevent the provider call. | Orphan sends, duplicate effects, or false delivery state. | Review transaction order and concurrent claim/finalization behavior. |
| **NOTIF-BE-M5** | Treat provider acceptance, provider receipt, and device delivery as distinct stages. A provider-started request with an unknown outcome **MUST NOT** be blindly resent unless the provider contract proves idempotency. Persist failure classification separately from delivery stage so retries cannot rewrite an unaccepted or receipt-failed message as delivered. | Duplicate notifications or false delivery claims. | Review send, timeout, retry, and receipt transitions, including outcome-unknown recovery. |
| **NOTIF-BE-M6** | Build provider payloads through one validated mapping from the application notification contract to the provider contract. Include only fields required by the client and provider, and validate provider limits before sending. | Rejected or malformed payloads. | Review the payload builder and compare it with the selected provider’s current API contract. |
| **NOTIF-BE-M7** | The notification read/list path **MUST** be able to find every audience variant the dispatcher persists, and **MUST** enforce the same recipient/scope boundary. | Invisible notifications or cross-scope reads. | Compare persisted audience variants with list/read predicates and verify authorization. |

## Durable asynchronous handoff

When a domain request must not wait for the provider, write an immutable notification intent in the same durable unit as the domain command or use an equivalent transactional outbox. A leased worker revalidates current authorization immediately before the external effect. It preserves event-time audience and content for retries; a mutable recipient list **MUST NOT** silently change the meaning of an already-created intent. Unknown provider outcomes remain non-replayable unless the provider supplies a proven idempotency mechanism.

For multi-recipient work, a domain-level completion marker means all required eligible recipients reached the contractually defined terminal state. A failed, skipped, cancelled, or unresolved recipient is not success. Reconciliation and cross-record transaction ordering require runtime evidence beyond source syntax; verify them against the durable store and worker behavior.

## Provider phase, batching and secondary channels (conditional)

These clarifications apply to NOTIF-BE-M4/M5 where the application persists provider-handoff state or fans a notification out to many recipients.

- **Provider phase.** Token correlation is credential evidence, not proof that the provider mutation started. A new or reclaimed intent **MUST** persist a separate closed phase (for example `NOT_STARTED`). The exact external-effect lease or fence **MUST** be checked before the phase transition; a rejected fence terminalizes or releases only the exact pending, not-started row (retryable, or cancelled only when durable domain cancellation is proven) and **MUST NOT** call the provider. The dispatcher then moves the exact row (identity, pending status, not-started phase, credential snapshot) to `STARTED` by compare-and-set and invokes the provider with no intervening awaited operation. Correlation may be written by that same compare-and-set. A not-started row is not a successful duplicate and keeps its owning durable job retryable unless cancelled; only a `STARTED` row can enter no-resend outcome-unknown reconciliation. A historical missing or invalid phase is not evidence of `STARTED` and uses a distinct, honest, non-retryable legacy-unknown terminal unless a provider ticket independently proves acceptance. Stuck age is measured from the most recent claim or phase update, not record creation time.
- **Terminal state precedes phase.** A phase describes the last attempt; it cannot turn a terminal failed or delivery-failed row back into unresolved pending. Retry, duplicate settlement and domain cancellation use one recorded-intent reader: exact intent first, pending phase versus canonical terminal outcome second, genuine ticket or acceptance-time proof for sent. A genuinely pending, started row remains unresolved and never authorizes resend.
- **Blocked duplicates are counted.** A send attempt the durable natural key refuses as an exact duplicate **MUST** be counted exactly once, at the seam that produces the refusal (the prepared-intent decision and the duplicate-key race), on a fixed action carrying the notification type; it **MUST NOT** be dropped silently or counted again by the caller. A caller that reads the decision as an ordinary "already recorded" filter declares that use at the seam so its normal answer is not counted as a repeated send. A guard working is invisible unless counted, and a rising count of refused repeats is the signal that a producer fires one event twice.
- **Batched dispatch.** A fan-out **MUST** reach the provider through the dispatcher's batch entry (one request carries up to the provider's per-request message limit), not one request per recipient. The batch keeps every per-intent guarantee of the single path (durable natural key and fingerprint, not-started record before any provider effect, exact phase compare-and-set, terminal compare-and-set from the exact started row) and turns only reads and phase or terminal writes into set operations. A partial or failed set transition is resolved from the durable phase; a row whose started phase cannot be proven **MUST NOT** be sent. A set read returns one recipient's own verdict failure as that recipient's result and **MUST NOT** fail the other intents of the set. A command that needs a per-row domain reservation in the same transaction as its phase transition stays on the single path. A fence shared by the whole set (for example a run lease) commits once in the same transaction as the set transition, so a lost lease starts no row. Every dispatch command **MUST** carry a durable natural key, enforced by its type, because a keyless intent has no duplicate fence.
- **Additional delivery channels.** A second delivery channel for the same notification (for example browser push beside the mobile provider) **MUST** be fed only by the dispatcher, from the row the dispatcher returned (same content and the same upstream preference and limit decisions), **MUST** run detached after that row's terminal write without being awaited on the primary path or writing the row, and **MUST** send at most once per notification across instances (shared-store claim; claim failure means no send). A channel with its own decision path or its own write on the row forks the one notification authority.

Stated enforcement limit: set compare-and-set and read-back ordering, the shared recorded-intent reader and the internal statement order of the dispatcher are review-held within the single dispatcher authority; pinning one authority's internal shape in a mechanical check is not recommended. Use the enforcement mechanism the adopting project documents, and record its actual scope.

## **MUST NOT**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **NOTIF-BE-N1** | Do not call the provider directly outside the dispatcher authority. | Bug — **must not** ship. | Review production call sites and provider-client ownership. |
| **NOTIF-BE-N2** | Do not write notification records through a second persistence path that bypasses dispatcher validation and state transitions. | Bug — **must not** ship. | Review all notification record writers and their validation boundary. |
| **NOTIF-BE-N3** | Do not use unstructured console output as the only production record for dispatch or receipt failures. Use the application’s established structured logging and error-classification authorities; never log raw push credentials. | Operational and privacy bug. | Review terminal error reporting, log structure, and credential redaction. |

Part of: [README.md](README.md) — Expo notifications hub.

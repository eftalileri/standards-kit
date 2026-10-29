# Email delivery pipeline — outbox, worker, retry, deliverability (EDP-*)

```kit-cover
type: normative
part-of: README.md
binds: EDP-C1 to EDP-C3, EDP-N1 to EDP-N6 and GEDP1 to GEDP5 -- the delivery contract, the consistency-model choice, the never-rules that keep a blocking provider call off the request path, and the decision gates
open-when: shape:backend-heavy, signal:transactional-email, signal:email-outbox, signal:email-worker
skip-when: signal:no-email-surface, signal:client-only
owns: EDP-C1, EDP-C2, EDP-C3, EDP-N1, EDP-N2, EDP-N3, EDP-N4, EDP-N5, EDP-N6, GEDP1, GEDP2, GEDP3, GEDP4, GEDP5
```

Normative part split out of this file: [mandatory delivery rules](email-delivery-mandatory.md) (**EDP-M1**–**EDP-M10**).

**Keywords:** transactional outbox, email outbox, background worker, at-least-once, idempotent send, messageId correlation, exponential backoff, dead-letter, bounce, complaint, suppression authority, deliverability metrics, provider health metrics, render-at-enqueue snapshot, retention authority, single-region

Reads with: [email-provider-core.md](email-provider-core.md) (the port + facade + contract rules; **EMP-M**\* in [email-provider-mandatory.md](email-provider-mandatory.md)). This file governs what happens after the facade is called — how the message is actually delivered, retried, observed, and reconciled. It does not restate the port rules; it satisfies them.

Purpose: A facade call (`emailService.sendX(...)`) is the *intent*. This file is the *delivery contract*: when email must be consistent with a database change it goes through a transactional outbox + background worker (never a blocking provider call on the request's critical path); every send is idempotent on an app-generated `messageId`; failures retry with bounded backoff then dead-letter; and delivery is observable (bounce / complaint / delivery metrics + suppression). This closes the largest architectural gap in a naive `await emailService.send(...)` design: the *ambiguity* when a state change committed but the send timed out.

---

## The problem this file exists to solve (worked example)

A naive inline send is ambiguous under failure:

```
forgot-password request
  → write recovery token (DB)          ✔ committed
  → await emailService.send(...)        ✗ provider timeout
  → API returns 500
user retries
  → new token? old token still valid? did one / two / zero emails actually go out?   ← undefined
```

The fix is two decisions made explicitly, not left to chance:

1. Decouple the send from the request (transactional outbox + worker) so a provider timeout can never desynchronize "DB state" from "email queued". The request commits the state change *and* the intent-to-send atomically, then returns; the worker delivers.
2. Make the send idempotent on an app-owned `messageId` (**EMP-M11**) so any retry — by the worker or the user — collapses to *exactly one* delivered message.

The token itself is single-use and owned by the verify/OTP authority (**EMP-M12**), not by this layer — so "old token vs new token" is also not this file's ambiguity to resolve. Together these remove every "?" above.

---

## **EDP-C** — Agent contract

| ID | Contract |
|----|----------|
| **EDP-C1** | Before sending transactional email tied to a DB write, read this file. Decide GEDP1 (outbox vs direct) explicitly and record the choice; do not default to a blocking inline `await`. |
| **EDP-C2** | Prefer an existing durable job or queue mechanism that meets the product's reliability needs. Do not use fire-and-forget messaging for work that must not be lost. Evaluate queue durability and cross-instance behavior against the system's data-store and infrastructure standards. |
| **EDP-C3** | This file governs *delivery mechanics + operations*; error-code mapping still defers to [error-policy](../error-policy/error-policy.md), rate-limit / idempotency state to [idempotency](../idempotency/idempotency.md) + [redis](../redis/redis.md), atomic enqueue to [transactions](../transactions/transaction-policy.md), PII in logs to [logging-policy](../logging-policy/logging-policy.md). |

---

## Consistency model — pick one, on purpose (GEDP1)

Two delivery shapes, chosen by whether the email's existence must match committed state:

| Shape | When | Rule |
|-------|------|------|
| Transactional outbox + worker (default for state-coupled email) | The email *must* correspond to a committed DB change — recovery code, verification, "your X changed" — i.e. if the change commits the email must eventually go, and if the change rolls back it must not. | **EDP-M1**. Enqueue an outbox row in the same transaction as the state change; a worker delivers after commit. |
| Direct facade send with retry discipline | A standalone notice with no DB-state coupling whose loss is tolerable and which carries its own safety net. | Allowed, but still idempotent (**EDP-M2**) and bounded (**EDP-M4**); never a silent swallow (**EMP-N4**). |

> If unsure, choose the outbox. The cost is one collection + one cron; the benefit is that no provider hiccup can ever leave state and email disagreeing.

Applying **EDP-M1** when the enqueue seam predates the transaction. A seam written only for session-less callers silently pushes every state-coupled caller to enqueue *after* commit: a process death between commit and enqueue loses the notice, and an enqueue failure can no longer undo the change, so it is merely logged. The seam therefore takes a mandatory write context — the unit's session, or a named no-transaction token for a send that is genuinely uncoupled (a code held in a cache, a "started" notice). The coupled caller enqueues inside its unit, so an enqueue failure aborts the change; whatever the render needs that cannot enter a transaction (e.g. a cache-backed language chain) is resolved before the unit. A security notice about an irreversible account change is always state-coupled. Stated limit: the type system closes omission (the parameter is required); whether a caller *is* state-coupled depends on whether the same request commits a write elsewhere, which no single file shows — review-only.

---

## **EDP-M** — Mandatory (moved)

The rows **EDP-M1**–**EDP-M10** are defined in [email-delivery-mandatory.md](email-delivery-mandatory.md).

---

## **EDP-N** — Never

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **EDP-N1** | Never make a blocking provider send the sole delivery guarantee for state-coupled email (no `await emailService.send(...)` on the request critical path whose failure desyncs committed state). Use the outbox (**EDP-M1**). | The worked-example ambiguity returns. | No synchronous provider call gating a committed state-change response. |
| **EDP-N2** | Never retry a send without an idempotency key — at-least-once delivery + non-idempotent send = duplicate mail. | User receives N copies. | Retry path keys on `messageId` (**EDP-M2**). |
| **EDP-N3** | Never resend to a suppressed (hard-bounced / complained) recipient, and never ignore bounce/complaint feedback. | Reputation damage; all mail degrades. | Suppression authority checked pre-send (**EDP-M9**). |
| **EDP-N4** | Never unbounded retry / tight-loop on a permanent (4xx-class) failure, and never silently drop a send after exhaustion. | Throttle storms; or invisible mail loss. | Bounded attempts + category-routed dead-letter (**EDP-M4**). |
| **EDP-N5** | Never run a silent multi-region or multi-provider runtime fallback for the same send. | Parallel SSoT + hidden failure (**EMP-N2**/**N4**, **SWAP-M5**). | Single configured region/provider; failover only if explicitly designed (**EDP-M6**). |
| **EDP-N6** | Never re-render the body at send time or keep template content in a second place — the outbox row's rendered content is the snapshot (**EDP-M7**). | Queued-vs-sent drift; parallel content source. | Worker sends the stored rendered body; no second render. |

---

## GEDP — Decision gates

| Gate | Question | Pass condition |
|------|----------|----------------|
| GEDP1 | Must the email's existence match a committed DB change? | If yes → transactional outbox + worker (**EDP-M1**). If no → direct send is allowed but still idempotent (**EDP-M2**) + bounded (**EDP-M4**). The choice is recorded, not implicit. |
| GEDP2 | Is the send idempotent on the app-generated `messageId`? | Yes — a retry (worker or user) collapses to exactly one delivery (**EDP-M2**). |
| GEDP3 | Is retry bounded with backoff, and is there a dead-letter + alarm on exhaustion? | Yes — finite attempts, exponential backoff, terminal `permanently_failed` + category-routed observation, TTL cleanup (**EDP-M4**). |
| GEDP4 | Are deliverability metrics + thresholds in place and is the suppression authority honored? | Yes — delivery/bounce/complaint metrics with alarms; bounce/complaint reconcile by `messageId` (**EDP-M5**); suppression authority checked before send (**EDP-M9**). |
| GEDP5 | Are content, retention, and suppression each a single authority, and is provider operational health observed? | Yes — rendered-at-enqueue snapshot (**EDP-M7**); one retention constant (**EDP-M8**); one suppression store (**EDP-M9**); provider success-rate / latency / error-rate metrics (**EDP-M10**). |

---

## Shape (illustrative — not the only valid form)

```
POST /forgot-password (or recovery-start)
  └─ service.withTransaction:
       ├─ verify authority issues + stores single-use code/token (EMP-M12 — NOT this layer)
       └─ insert email-outbox row { messageId, type, to, renderedHtml/text, status:'pending', nextAttemptAt:now }  ← atomic enqueue, content rendered ONCE here (EDP-M1 / EDP-M7)
  COMMIT  →  return 200 (does NOT block on the provider)

email-outbox worker (single-runner cron + lock + heartbeat — EDP-M3):
  find { status:'pending', nextAttemptAt<=now, attempts<MAX }  (batch)
  for each:
    if suppressionAuthority.has(to) → mark skipped (EDP-M9)
    result = emailService.send(stored rendered body)   // no re-render (EDP-N6); idempotent on messageId (EDP-M2)
    emit success/latency/error metric (EDP-M10)
    delivered      → delete row immediately (EDP-M7)
    transient fail → attempts++, nextAttemptAt = now + backoff(attempts)   (EDP-M4)
    permanent fail → status='permanently_failed' + category-routed signal  (EDP-M4 / EDP-N4)
  (failed/dead-letter rows auto-expire on the single retention TTL — EDP-M8)

bounce/complaint webhook (SNS, etc.):
  reconcile by messageId (+ providerMessageId) → deliverability metric (EDP-M5) + suppression-authority add (EDP-M9)
```

> Bring-up ordering for a fail-closed feedback endpoint — the verifier's configuration is deployed BEFORE the provider-side subscription is created. A webhook receiver that verifies its sender (signature, topic identity, audience) is normally written fail-closed: with its configuration absent it rejects *everything*. That correctly includes the provider's own subscription-confirmation message, which is delivered to the same endpoint and through the same verifier — so a subscription created while the configuration is still missing fails at the handshake, and it fails in the shape that is hardest to read: the provider's console shows a pending subscription, the operator sees no error, and the endpoint is quietly never activated. The order is therefore binding and is not a preference: (1) set the verifier's configuration in the target environment and let the deploy finish, (2) create the provider-side subscription, (3) prove activation from the receiver's own logs (the confirmation line plus its 2xx), never from the console page, which is a snapshot of creation time and does not refresh itself. Two corollaries. (a) An operator-facing runbook that lists these steps in any other order is a defect in the runbook, not a note for later — it will produce the silent failure on first use. (b) The same ordering binds any fail-closed receiver whose activation handshake arrives over the channel it guards: payment and store webhooks, pub/sub push endpoints, inbound-mail hooks. [Stated enforcement limit: not mechanically checkable here. A check would need to know, for a specific deploy target, whether the verifier's configuration key was present *at the moment* the provider-side subscription was created — one value lives in a deploy environment and the other in a provider console, and neither appears in the source tree, so no AST or cross-file rule can read either side, let alone their order in time.]
>
> The outbox row stores the rendered `html`/`text` (rendered once, app-side — **EMP-M10** / **EDP-M7**), the required `type` (**EMP-M9**), and the app `messageId` (**EMP-M11**). The row is sensitive at rest: delivered rows are pruned immediately, failed rows expire on the single retention authority (**EDP-M8**), and no raw OTP/recovery code or full PII is logged (**EMP-N5**).

---

## Mechanical enforcement (land with the implementing code)

When the outbox + worker land, each candidate is put to [**ENA-A1**](../enforcement-architecture/enforcement-admission.md) and, if admitted, takes the highest [**ENA-P1**](../enforcement-architecture/enforcement-admission.md) rung:

- State-coupled send must not block the request path — a guard that flags a provider send (or `emailService.send`) reachable synchronously from a controller that also performs a DB write of a coupled token, instead of via the outbox worker (**EDP-M1** / **EDP-N1**).
- Worker is lock-wrapped + monitored — the email-outbox drainer is registered through the cron-lock helper with a monitor slug (**EDP-M3**).
- Bounded retry shape — the outbox model carries `attempts`, `nextAttemptAt`, a terminal `permanently_failed` state, and a TTL index reading the single retention constant (**EDP-M4** / **EDP-M8**).
- Single suppression authority consulted pre-send — every send path reads the one suppression store; no inline per-call allowlist (**EDP-M9**).
- No re-render in the worker — the drainer sends the stored rendered body, never re-rendering a template (**EDP-M7** / **EDP-N6**).

Until then these are review-enforced (this file). The implementing PR also registers the email-outbox + worker + suppression store + retention-constant authorities in the [SSoT registry](../ssot/ssot-registry-rules-and-protocol.md) (**SSG-R2**) — they are deliberately not pre-registered here (no phantom paths).

---

## Precedence and failure path

- Precedence: this file governs *delivery mechanics, retry, and deliverability operations*; on conflict it wins over generic wording for those, but defers error mapping to [error-policy](../error-policy/error-policy.md), atomic enqueue to [transactions](../transactions/transaction-policy.md), durable-mechanism choice to [redis **RDS-M15**](../redis/redis-degraded-mode-and-invalidation-ordering.md), idempotency/rate-limit to [idempotency](../idempotency/idempotency.md), token/code ownership to the verify authority (**EMP-M12**).
- Failure path: provider error at send time → worker classifies transient vs permanent → backoff-retry or dead-letter (**EDP-M4**) → never a silent success (**EMP-N4**) and never a state/email desync (**EDP-M1**). Bounce/complaint after delivery → reconcile by `messageId` → deliverability metric (**EDP-M5**) + suppression authority (**EDP-M9**).

Expiring credential application (**EDP-M4**/**EMP-M12**): A queued OTP/code carries the issuing authority's expiry as an immutable outbox fact. The worker checks it immediately before provider access and refuses a missing or elapsed expiry, including legacy rows without proof. Retry budget never extends credential validity; sending an expired code is a false recovery path. The deadline is conservatively captured before the credential store's TTL starts. Enforce the required expiry by the enqueue input type; runtime still checks persisted rows because older or external writes bypass that type. The recipient and code stay out of failure logs.

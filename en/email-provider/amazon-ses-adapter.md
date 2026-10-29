# Optional Amazon SES adapter example

```kit-cover
type: normative
part-of: README.md
binds: SES-M1 to SES-M8 -- what the Amazon SES adapter must do to satisfy the provider-agnostic port: identity and region configuration, credentials, sandbox exit, bounce and complaint wiring, and the SDK boundary
open-when: shape:backend-heavy, signal:transactional-email, signal:amazon-ses, signal:email-provider-adapter
skip-when: signal:no-email-surface, signal:non-ses-provider
owns: SES-M1, SES-M2, SES-M3, SES-M4, SES-M5, SES-M6, SES-M7, SES-M8
```

**Keywords:** Amazon SES, @aws-sdk/client-ses, IAM least privilege, DKIM, SPF, DMARC, sandbox, bounce, complaint, SNS, sending quota

Reads with: [email-provider-core.md](email-provider-core.md) (the port + mandatory rules). This file is the SES-specific adapter; it does not restate the core rules, it satisfies them.

Purpose: An optional example of implementing `SesProvider implements EmailProvider`, covering the SDK boundary, least-privilege credentials, region, deliverability setup, sandbox status, bounce/complaint handling, and quota behavior. This example does not select a default provider; make that choice against the adopting product's requirements.

---

## **SES-M** — SES adapter rules

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **SES-M1** | Use the official AWS SDK v3 `@aws-sdk/client-ses` (`SESv2Client` / `SendEmailCommand`). No unofficial wrapper. Import only inside the SES adapter file (**EMP-N1**). | Supply-chain / lock-in — bug. | Dependency is the official package; import boundary clean. |
| **SES-M2** | Credentials via IAM role (preferred) or env secret, least privilege: only `ses:SendEmail` (+ `ses:SendRawEmail` if raw MIME needed). No broad `ses:*`, no account-wide keys in repo (**EMP-M8**, [security](../security/README.md)). | Over-privileged / leaked creds — bug. | IAM policy is send-only; secret scan clean. |
| **SES-M3** | Region is explicit config (`AWS_REGION`); SES identities/quota are per-region. The adapter does not hardcode a region. Single-region is the recorded authority — no silent cross-region fallback ([**EDP-M6**](email-delivery-mandatory.md)). | Wrong-region send failure. | Region from env; documented. |
| **SES-M4** | Deliverability (mandatory before production): verify the sender domain (not just an address), enable Easy DKIM, publish SPF (`include:amazonses.com`) and a DMARC record. (Satisfies **EMP-M7**.) | Mail to spam / rejected — silent lockout, bug. | DKIM CNAMEs live; SPF + DMARC present; SES shows domain verified. |
| **SES-M5** | Sandbox is not production. Confirm the account's sending status, recipient restrictions, and quota before relying on the service for production traffic. | Messages may be undeliverable. | Production access and adequate quota are confirmed. |
| **SES-M6** | Handle bounces + complaints: subscribe an SNS topic (or SES event destination) and honor suppression through the single app authority (below). Reconcile each event back to the original send via the app `messageId` (**EMP-M11**) — stamp it as a message tag / custom header (e.g. a `SES` message tag or an `X-` header) so the async SNS event matches our record, then feed the deliverability metrics ([**EDP-M5**](email-delivery-mandatory.md)) and write the address into the single suppression authority ([**EDP-M9**](email-delivery-mandatory.md)). SES's own account-level suppression is a secondary safety net that reconciles into that one authority, not a competing source. Repeated hard bounces / complaints hurt the whole account's reputation. | Reputation damage → all mail degrades; unmatchable bounces; rival suppression sources. | Bounce/complaint sink reconciles by `messageId`; suppression authority updated; metrics emitted. |
| **SES-M7** | Respect sending quota / rate (`Throttling` / `LimitExceeded` from SES). Map to a retryable registered error (**EMP-M5**); do not tight-loop — the outbox worker applies bounded backoff ([**EDP-M4**](email-delivery-mandatory.md)), not the adapter. State-coupled email is delivered off the request critical path via the outbox ([**EDP-M1**](email-delivery-mandatory.md)), never blocking the HTTP response on a slow send. | Throttle storms / blocked handler. | Quota errors retryable; throttling handled by the worker's backoff; send not on the critical sync path. |
| **SES-M8** | Required env config asserted at startup (`AWS_REGION`, sender identity, creds source). Missing → fail fast (**EMP-M8**), never silently no-send. | Silent disable — bug. | Startup assertion present. |

**SES-M7** rejection evidence: `MessageRejected` with HTTP 400 proves SES refused a send, not whether the recipient, sandbox, sender identity, or account setting caused it. Classify only from structured, cause-specific evidence. An ambiguous rejection stays terminal to prevent blind re-sends, but retains a distinct `SYSTEM` identity and safe provider class/status for diagnosis; do not name it a configuration fault or an invalid recipient. An explicitly proven invalid recipient uses the expected (`BUSINESS`/metric) path under **EDP-M4**; a proven configuration or permission fault uses `SYSTEM` and routes through the project's selected incident-reporting channel. A successful SDK response without its required provider message ID has an unknown delivery outcome: fail loud outside the SDK catch and do not retry it automatically. Stated enforcement limit: the SES v1 `MessageRejected` exception supplies no structured recipient-versus-configuration cause; a static check cannot recover one from its class/status, and parsing free-text provider messages would leak or misclassify private data. The boundary and its classification require review against the provider's actual structured evidence.

**SES-M7** acceptance ambiguity: A socket timeout, abort, or SDK exception without a provider rejection response does not prove SES declined the request; it may have accepted it before the client lost the reply. Keep that outcome terminal and distinct from a confirmed 429/5xx rejection. Never infer idempotency from a message tag: the tag correlates feedback but SES does not deduplicate `SendEmail` on it.

---

## Adapter shape (illustrative — not the only valid form)

```ts
// .../services/email/adapters/SesProvider.ts  — provider SDK import ONLY here (EMP-N1)
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-ses';
import type { EmailProvider, SendEmailParams, SendEmailResult } from '<shared>/email';

export class SesProvider implements EmailProvider {
  // client built from env (region + creds via IAM role / secret) — EMP-M8 / SES-M2 / SES-M3
  async send(params: SendEmailParams): Promise<SendEmailResult> {
    // build SendEmailCommand from provider-neutral params (subject/html/text/replyTo)
    // stamp params.messageId as a SES message tag / X- header for bounce reconciliation (SES-M6 / EMP-M11)
    // catch SES errors -> throwError(<registered code>) with retryable from category (SES-M7 / EMP-M5)
    // return { messageId: params.messageId, providerMessageId } (SES MessageId) — no PII in logs (EMP-N5)
  }
}
```

> The adapter is the only place that knows about `SendEmailCommand`, SES MessageId, `ConfigurationSetName`, etc. None of that crosses back into the port or the app (**EMP-M4**).

---

## Env / config (project-isolated)

| Key | Meaning |
|-----|---------|
| `EMAIL_PROVIDER` | active provider selector read by the factory (`ses` for this adapter) — **EMP-M3** |
| `AWS_REGION` | SES region (identities + quota are per-region) — **SES-M3** |
| `EMAIL_FROM` | verified sender (domain-verified) — **SES-M4** |
| creds | IAM role (preferred) or `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` secret — **SES-M2** |

Supply these through the deployment environment's secret-management mechanism; never commit credentials ([build-environment](../build-environment/README.md)).

Provider prices, quotas, and terms can change; compare current provider information before choosing an adapter.

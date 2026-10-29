# Email provider — provider-agnostic transactional email (core)

```kit-cover
type: normative
part-of: README.md
binds: EMP-C1 to EMP-C3, EMP-N1 to EMP-N7 and GEMP1 to GEMP6 -- the agent contract, the port-adapter-factory-facade seam every rule is written against, the never-rules that keep a provider out of the domain, and the decision gates
open-when: shape:backend-heavy, signal:transactional-email, signal:email-provider, signal:provider-abstraction
skip-when: signal:no-email-surface, signal:client-only
owns: EMP-C1, EMP-C2, EMP-C3, EMP-N1, EMP-N2, EMP-N3, EMP-N4, EMP-N5, EMP-N6, EMP-N7, GEMP1, GEMP2, GEMP3, GEMP4, GEMP5, GEMP6
```

Normative part split out of this file: [mandatory rules](email-provider-mandatory.md) (**EMP-M1**–**EMP-M13**).

**Keywords:** transactional email, provider abstraction, port and adapter, EmailProvider, swappable provider, SES, Resend, deliverability, no vendor lock-in

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) — **P1-P8** when this topic is in scope (P8 verification when implementation-bound); cite in deliverables per [markdown-authoring **M16**](../authoring/markdown-authoring.md).

Purpose: Normative guidance for sending transactional email through one provider-agnostic seam so the concrete provider can be selected or changed without spreading vendor dependencies through application code. An application may expose a semantic facade such as `emailService.sendX(...)`.

---

## Scope

In scope: the port (`EmailProvider` interface), the adapters (one per provider), the factory / composition root that selects the active provider from config, the application facade the rest of the code calls, the message contract (required `EmailType`, app-side template authority, app-generated `messageId` correlation), the SSoT boundary (the email layer transports — it never owns tokens), and how email send errors / idempotency / secrets plug into the existing kit hubs. The delivery pipeline — outbox vs direct, worker, retry / dead-letter, deliverability metrics, region — is split into [email-delivery-pipeline.md](email-delivery-pipeline.md) (EDP-\*).

Out of scope: push notifications (see [expo-notifications](../expo-notifications/README.md)), SMS transport (see [phone](../phone/README.md)), and email content or marketing campaigns (this hub covers transactional email only).

---

## **EMP-C** — Agent contract

| ID | Contract |
|----|----------|
| **EMP-C1** | Before adding email sending, read this file + the chosen adapter part ([amazon-ses-adapter.md](amazon-ses-adapter.md)) + [provider-swap-and-alternatives.md](provider-swap-and-alternatives.md). Do not call a provider SDK directly from a controller / domain service. |
| **EMP-C2** | Adding a provider SDK is a dependency change. Follow the adopting repository's dependency review and approval policy before installation. |
| **EMP-C3** | Email pipeline rules in this topic win over generic wording elsewhere when they conflict on how email is sent / which provider; error-code mapping still follows [error-policy](../error-policy/error-policy.md), secrets follow [security](../security/README.md). |

---

## The seam (port → adapter → factory → facade)

Four layers, each with exactly one job. This is the whole point of the hub: the app depends on the port, never on a provider.

1. Port (provider-agnostic interface) — the single contract every provider satisfies. Provider-neutral DTOs only (no SES/Resend-specific fields leak in):

   ```ts
   // shared types (cross-boundary): provider-neutral

   // Single catalog of transactional email kinds (EMP-M9) — audit / analytics /
   // suppression / per-type rate-limit + idempotency all key off this.
   export type EmailType =
     | 'password_reset'
     | 'account_recovery'      // phone-recovery code, etc.
     | 'email_verification'
     | 'account_notification'; // extend in the single catalog, never ad hoc

   export interface SendEmailParams {
     messageId: string;          // app-generated correlation id (EMP-M11) — set by the facade BEFORE dispatch
     type: EmailType;            // required taxonomy (EMP-M9)
     to: string;                 // single recipient (transactional)
     subject: string;
     // body is ALREADY RENDERED app-side (EMP-M10): the port carries final html/text,
     // not a provider template id. At least one representation required; both allowed.
     html?: string;
     text?: string;
     replyTo?: string;
   }
   export interface SendEmailResult {
     messageId: string;          // echo of the app id — the primary correlation key
     providerMessageId: string;  // provider's id, stored alongside for reconciliation (not PII)
   }
   export interface EmailProvider {
     send(params: SendEmailParams): Promise<SendEmailResult>;
   }
   ```

   > No `templateId` / `templateData` in the port. A provider-rendered template (e.g. an SES template) is a vendor-lock-in leak: switching providers would lose every template, breaking the core promise (**EMP-M3**). Templates are owned + rendered app-side (**EMP-M10**); the facade turns a semantic intent + data into final `html`/`text` *before* the adapter, so the port stays provider-neutral (**EMP-M4**).

2. Adapters (one per provider) — implement the port; the provider SDK import lives only here:

   ```ts
   class SesProvider implements EmailProvider { /* @aws-sdk/client-ses only here */ }
   class ResendProvider implements EmailProvider { /* resend only here */ }
   class PostmarkProvider implements EmailProvider { /* postmark only here */ }
   ```

3. Factory / composition root — selects the active adapter from config in one place:

   ```ts
   // resolveEmailProvider(): EmailProvider  — switch on EMAIL_PROVIDER env, single seam
   ```

4. Application facade — the only thing the rest of the app calls; exposes semantic methods, not raw `send`:

   ```ts
   // emailService.sendPhoneRecoveryCode(to, code) / sendPasswordReset(...) / ...
   // the facade: (1) maps the intent to an EmailType (EMP-M9), (2) generates the
   // messageId (EMP-M11), (3) renders the app-side template -> final html/text (EMP-M10),
   // then EITHER enqueues to the outbox (state-coupled) OR delegates to the resolved provider.
   await emailService.sendPhoneRecoveryCode({ to, code, language });
   ```

> Why: the app speaks in intents (`sendPhoneRecoveryCode`), the facade owns the message (type + subject/body/i18n + `messageId`), the adapter owns the transport (provider SDK), and the factory owns the choice. A provider change touches only the factory config + one adapter file. *Delivery* (outbox vs direct, retry, deliverability) is owned by [email-delivery-pipeline.md](email-delivery-pipeline.md) (EDP-\*).

---

## **EMP-M** — Mandatory (moved)

The rows **EMP-M1**–**EMP-M13** are defined in [email-provider-mandatory.md](email-provider-mandatory.md).

---

## **EMP-N** — Never

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **EMP-N1** | Never import a provider SDK (`@aws-sdk/client-ses`, `@sendgrid/mail`, `resend`, `nodemailer`, `postmark`, ...) outside its adapter file. | Vendor lock-in spread across the codebase. | Static import inspection (GEMP1). |
| **EMP-N2** | Never build a second / parallel email-sending path (an inline `nodemailer`, a one-off SES call, a controller that sends directly) bypassing the facade. | Parallel SSoT — bug (**SSG-M8**). | Single facade is the only sender. |
| **EMP-N3** | Never hardcode the provider choice in domain / application code (`if (provider === 'ses')` branches outside the factory). | Defeats config-driven swap (**EMP-M3**). | Provider branching only in the factory. |
| **EMP-N4** | Never silently swallow a send failure or report a send as successful when it was not. Route failures through the application's error policy. | Hidden lockout / data lie — bug. | Failure is observable; no silent catch. |
| **EMP-N5** | Never log raw OTP / recovery codes, full email bodies, or treat the recipient address as free log data. PII minimization per [logging-policy](../logging-policy/logging-policy.md). | PII / secret leak — bug. | Logs carry action + `messageId` + `providerMessageId` + counts, not codes/bodies. Sink fence: the adopting project's credential scrubber should mask the one-time code and the rendered body by carrier key name (log meta, crash-report extra/contexts, breadcrumbs, `key=value` free text), so every in-app carrier of either uses those names; a generic name (`code`, `html`, `text`, `body`) or a provider SDK input shape escapes that decision and is review-held, because a bare numeric code has no value shape a scanner can tell from a count or price (stated limit, [**ENA-GV3**](../enforcement-architecture/enforcement-admission.md)). |
| **EMP-N6** | Never use a provider-rendered / server-side template (SES template, etc.) as the message body. Render app-side; the port carries only final `html`/`text` (**EMP-M10**). | Vendor lock-in via templates; swap breaks. | No provider-template API in adapters; one app-side template source. |
| **EMP-N7** | Never create, validate, store, or expire a token / OTP / recovery code inside the email layer. The email layer only delivers a code the verify authority already issued (**EMP-M12**). | Parallel token SSoT — bug. | No token logic under `email/`; verify authority is the sole owner. |

---

## GEMP — Decision gates

| Gate | Question | Pass condition |
|------|----------|----------------|
| GEMP1 | Does any file outside an email adapter import a provider SDK? | No. Provider SDK import only in `adapters/`; everything else uses `emailService`. |
| GEMP2 | Is the active provider chosen by config in one factory? | Yes. `resolveEmailProvider` reads `EMAIL_PROVIDER`; switching is config + adapter only. |
| GEMP3 | Are the port + DTOs provider-neutral and in shared types? | Yes. No vendor field in the port; types cross-boundary (MRP-*). |
| GEMP4 | Do send errors follow the application's error policy, and do credential emails reuse the designated verification authority and appropriate shared rate limiting? | Yes. Provider details are not exposed raw; no parallel credential system is introduced. |
| GEMP5 | Does the email layer own any token, or render a provider-side template? | No to both. Tokens belong to the verify authority (**EMP-M12**); templates render app-side (**EMP-M10**). The email layer transports a typed (**EMP-M9**), correlated (**EMP-M11**), already-rendered message only. |
| GEMP6 | For delivery mechanics (outbox vs direct, retry, deliverability), has [email-delivery-pipeline.md](email-delivery-pipeline.md) (EDP-\*) been applied? | Yes — state-coupled email uses the outbox; sends are idempotent on `messageId`; retry is bounded with dead-letter; bounce/complaint observed + suppressed. |

---

<a id="mechanical-enforcement-land-with-the-implementing-code"></a>

## Enforcement admission

Enforcement guidance: The provider SDK import boundary and required message type may be checked mechanically when the implementation and toolchain make that practical. Evaluate candidate checks against the repository's enforcement policy ([**ENA-A1**](../enforcement-architecture/enforcement-admission.md)); do not assume a guard or lint rule exists. Review cross-file ownership, catalog scope, and delivery behavior where static analysis cannot establish them.

---

## Precedence and failure path

- Precedence: this hub governs provider abstraction and email transport; error mapping defers to [error policy](../error-policy/error-policy.md), secrets to [security](../security/README.md), idempotency and rate limiting to the corresponding application standards, cross-tier types to [monorepo](../monorepo/monorepo-architecture.md), credential ownership to the designated verification authority (**EMP-M12**), and delivery mechanics to [email-delivery-pipeline.md](email-delivery-pipeline.md) (EDP-*).
- Failure path: provider errors pass through the adapter and application's error boundary with their cause and retryability preserved. Do not return raw provider errors or report silent success (**EMP-N4**). Use durable delivery where required by the product's state-coupling contract (**EDP-M1**).

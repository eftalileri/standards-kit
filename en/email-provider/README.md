# Email provider (transactional email — provider-agnostic seam + adapters)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** transactional email, EmailProvider port, adapter, swappable provider, no vendor lock-in, Amazon SES, Resend, deliverability, transactional outbox, background worker, messageId correlation, EmailType, idempotent send, dead-letter, suppression authority, retention authority, provider health, token authority

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) — **P1-P8** when this topic is in scope (P8 verification when implementation-bound); cite in deliverables per [markdown-authoring **M16**](../authoring/markdown-authoring.md).

Purpose: Normative rules for sending transactional email (OTP / account-recovery codes / account notifications) through one provider-agnostic seam: the app calls a single semantic facade (`emailService.sendX(...)`); the concrete provider is a swappable adapter chosen by configuration. Switching providers is a config + one-adapter change (hours), not a refactor — no vendor lock-in.

## Agent TL;DR

- The app depends on the port (`EmailProvider.send`) and one facade (`emailService`), never on a provider SDK (**EMP-M1**).
- Each provider is an adapter (`SesProvider`, `ResendProvider`, ...); the SDK import lives only in the adapter (**EMP-M2** / **EMP-N1**).
- The active provider is chosen by config in one factory (`EMAIL_PROVIDER`) — swap = config + adapter, no app-code change (**EMP-M3**).
- Email DTOs are provider-neutral and belong in the narrowest tier that serves their consumers (**EMP-M4**). Route send errors through the application's error and logging policies (**EMP-M5**). Verification credentials remain owned by the designated verification authority (**EMP-M6**/**M12**). Deliverability setup and secret management are prerequisites (**EMP-M7**/**M8**). Never report a silent success or log sensitive message content (**EMP-N4**/**N5**).
- Message contract: every send carries a required `EmailType` from one catalog (**EMP-M9**); templates are app-rendered (no provider-side templates — **EMP-M10**/**N6**); a single app-generated `messageId` is the correlation key (**EMP-M11**).
- Purpose catalog: if a product uses a closed set of transactional email purposes, define its catalog and approval process (**EMP-M13**).
- SSoT boundary: the email layer transports — it never creates/validates/stores tokens; that is the verify authority's job (**EMP-M12** / **EMP-N7**).
- Delivery (EDP-\*): when email delivery is coupled to application state, use a durable delivery mechanism such as an outbox and worker. Define idempotency, bounded retry, content snapshotting, retention, suppression, and provider-health observation according to the product's requirements (**EDP-M1**–**M10**).
- Adapters: Amazon SES (**SES-M**\*) and Resend (**RSD-M**\*) are optional examples, not defaults; select a provider against current requirements and verify operational details before adoption. Confirm production sending access before relying on a provider (**SES-M5**).
- Adding a provider SDK is a new dependency → explicit approval first (**EMP-C2** + [security governance **SEC-GC-11**](../security/security-governance.md)).
- Decision gates: **GEMP1-GEMP6** (email-provider-core.md) + **GEDP1-GEDP5** (email-delivery-pipeline.md).

## Reading order (normative)

1. [email-provider-core.md](email-provider-core.md) — the port → adapter → factory → facade seam, the message contract (`EmailType` / app-side templates / `messageId`), the transport-≠-authority SSoT boundary, agent contract (**EMP-C**\*), prohibitions (**EMP-N**\*), decision gates (**GEMP1-GEMP6**), mechanical-enforcement plan, precedence.
1b. [email-provider-mandatory.md](email-provider-mandatory.md) — the mandatory rules **EMP-M1**–**EMP-M13**.
2. [email-delivery-pipeline.md](email-delivery-pipeline.md) — what happens after the facade call: the transactional outbox + worker consistency model, the agent contract (**EDP-C**\*), prohibitions (**EDP-N**\*), decision gates **GEDP1-GEDP5**, the illustrative shape, precedence.
2b. [email-delivery-mandatory.md](email-delivery-mandatory.md) — the mandatory delivery rules **EDP-M1**–**EDP-M10**: idempotent send on `messageId`, bounded retry → dead-letter, render-at-enqueue snapshot, single retention + suppression authorities, recipient deliverability + provider-health metrics, single-region decision.
3. [amazon-ses-adapter.md](amazon-ses-adapter.md) — optional `SesProvider` example: official SDK, IAM least-privilege, region, DKIM/SPF/DMARC, sandbox status, bounce/complaint (reconciled by `messageId`), quota (**SES-M**\*).
3b. [resend-adapter.md](resend-adapter.md) — optional `ResendProvider` example: REST via `fetch` (no SDK), `User-Agent`, `Idempotency-Key` + tags from `messageId`, error classification, the Svix-signed bounce/complaint webhook over raw bytes and its feedback mapping (**RSD-M**\*).
4. [provider-swap-and-alternatives.md](provider-swap-and-alternatives.md) — provider-change guidance and an adapter checklist (**SWAP-M**\*).

## Cross-links

- [Error policy (registered errors and reporting)](../error-policy/error-policy.md)
- [Logging policy (PII minimization)](../logging-policy/logging-policy.md)
- [Idempotency (OTP single-use, replay; idempotent send on messageId)](../idempotency/idempotency.md)
- [Redis (cross-instance rate-limit state, durable-mechanism **RDS-M15**, no in-process counter)](../redis/redis-degraded-mode-and-invalidation-ordering.md)
- [Transactions (atomic outbox enqueue with the state change)](../transactions/transaction-policy.md)
- [Security (secrets, least privilege)](../security/README.md)
- [Build and environment (env vars, secrets)](../build-environment/README.md)
- [Monorepo (shared cross-boundary types)](../monorepo/monorepo-architecture.md)
- [Phone (E.164 SSOT — SMS OTP counterpart)](../phone/README.md)
- [Expo notifications (push — separate channel)](../expo-notifications/README.md)

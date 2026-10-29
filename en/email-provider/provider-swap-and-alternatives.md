# Provider swap guide + alternatives

```kit-cover
type: normative
part-of: README.md
binds: SWAP-M1 to SWAP-M5 -- what a provider swap is allowed to touch, what must not change when the vendor changes, and the ban on a silent runtime failover between providers or regions
open-when: shape:backend-heavy, signal:transactional-email, signal:email-provider-swap, signal:vendor-migration
skip-when: signal:no-email-surface
owns: SWAP-M1, SWAP-M2, SWAP-M3, SWAP-M4, SWAP-M5
```

**Keywords:** swap provider, vendor change, EmailProvider adapter checklist, Resend, Postmark, SendGrid, Twilio Verify email, migration in hours

Reads with: [email-provider-core.md](email-provider-core.md). This file describes how an abstraction can limit the impact of a provider change.

---

## Why the abstraction exists (the swap is the feature)

An application may need to change providers because of quota, deliverability, pricing, compliance, or product requirements. If it depends on a provider-neutral port (`EmailProvider`) and one facade (`emailService`), the change can often be contained to:

1. config (`EMAIL_PROVIDER=...`), and
2. one adapter file (already exists, or add it).

No controller, no domain service, no screen changes. That is the entire point.

---

## **SWAP-M** — Swap rules

| ID | Rule |
|----|------|
| **SWAP-M1** | To switch to an already-implemented provider: change `EMAIL_PROVIDER` config + set that provider's secrets/deliverability. No code change (**EMP-M3**). |
| **SWAP-M2** | To add a new provider: create `XProvider implements EmailProvider` in `email/adapters/`, map provider errors to registered codes (**EMP-M5**), register it in the factory's switch, add its env/deliverability. Nothing else changes (**EMP-M1**/**M2**/**M4**). |
| **SWAP-M3** | The new adapter **MUST** satisfy the provider-neutral port unchanged — if a provider needs something the port lacks, extend the port provider-neutrally (e.g. a generic `tags?: Record<string,string>`), never with a vendor-named field (**EMP-M4**). Templates stay app-rendered (final `html`/`text` only); never adopt a provider-side template feature into the port (**EMP-M10** / **EMP-N6**) — that is the lock-in the swap exists to avoid. |
| **SWAP-M4** | Keep deliverability (SPF/DKIM/DMARC) and bounce handling per-provider before sending real mail (**EMP-M7**). Switching provider = redo domain auth for that provider. |
| **SWAP-M5** | Do not run two providers as a silent runtime fallback for the same send (no "try SES, on error try Resend" hidden chain) — that is a parallel SSoT + hidden failure (**EMP-N2**/**N4**, [**EDP-M6**](email-delivery-mandatory.md) / [**EDP-N5**](email-delivery-pipeline.md)). A deliberate, observable failover is a separate, explicitly-designed feature, not a default; transient errors are absorbed by the single provider's outbox-worker backoff ([**EDP-M4**](email-delivery-mandatory.md)), not by silently swapping providers. |

## Add-a-provider checklist (the "few hours" path)

1. Approve + install the official SDK (dependency approval rule, **EMP-C2**).
2. `email/adapters/XProvider.ts` → `implements EmailProvider` (SDK import only here).
3. Map provider errors through the application's error policy, preserving retryability and cause.
4. Register in `resolveEmailProvider` factory switch (the one place provider choice lives).
5. Configure deliverability (domain verify + DKIM/SPF/DMARC) + secrets (env).
6. Flip `EMAIL_PROVIDER` in the target environment.
7. (When adapters exist) the GEMP1 import-boundary guard keeps everyone honest.

---

## Alternatives mapped to the same port

All of these implement the same `EmailProvider.send(params)` — the choice is operational, not architectural. (Pricing/popularity are decision inputs as of 2026; verify current figures before committing.)

| Provider | Evaluation criteria |
|----------|---------------------|
| Any candidate | Compare current pricing, deliverability, regional availability, data handling, support, quota, SDK maturity, and migration effort against the product's requirements. |

> A provider-neutral port can keep the choice operational, provided each adapter satisfies the same contract.

---

## Integration note — Twilio Verify email channel (different problem class, not an `EmailProvider`)

Twilio Verify's email channel is not a drop-in `EmailProvider`. A general email sender (SES / Resend / …) transports arbitrary content; Twilio Verify is a verification service that bundles the token/code authority (it issues *and* checks the code) with the email transport. Under this kit those are two different roles: the verify/OTP authority owns the code (**EMP-M12**), and the `EmailProvider` only transports — Twilio Verify occupies both at once.

So it does not slot behind the generic `EmailProvider.send(html/text)` port the same way a general email provider does; it is chosen as a unit (verification authority + email channel together) for an OTP-only need. Implications if picked:

- It is selected for the verify authority role, not as a generic transactional-email sender; non-code emails (notifications, receipts) still need a real `EmailProvider`.
- It must not become a *second* OTP engine alongside the SMS one — it would be the one verify authority for that channel (**EMP-M6** / **EMP-M12**), not a parallel path.
- Pricing/operational config is Twilio-side (uses SendGrid under the hood); it is a paid Verify feature.

Treat it as the zero-new-dependency OTP-only route, evaluated as a verify-service decision — not as one more row in the provider-swap table above.

---

## Selection guidance

Choose a provider or verification service using current product requirements and operational evidence. An OTP-only service that bundles code issuance and delivery is a different architecture decision from selecting a general transactional-email transport; do not introduce a second verification authority inadvertently.

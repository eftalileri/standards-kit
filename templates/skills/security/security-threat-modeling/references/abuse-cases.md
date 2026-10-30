# SaaS abuse-case catalogue

Pick the cases that match the product; dismiss the rest with one line of reason. Each kept case becomes an abuse path (actor → entry → steps → gain) in the threat model.

## Tenant and role boundaries

- Staff of tenant A changes an id, slug or filter to read or write tenant B's records.
- Restricted staff reaches data or totals their role should not see (aggregates, exports, reports, search, notifications, cached responses).
- A user removed from a tenant keeps access through an old token, cached session, invite link or device.
- A tenant id or role is accepted from the request body, query, header or client state.
- Cross-tenant leakage through shared caches, search/vector indexes, background job payloads, file paths or generated documents.
- Support/admin impersonation without audit trail or without scope limits.

## Identity and account

- Account takeover through password reset, email/phone change, OTP replay or brute force, recycled phone numbers, or social sign-in linking.
- Session survives password change, logout or role removal.
- Invitation acceptance by the wrong person; invite tokens without expiry or single use.
- Enumeration of accounts or customers through different responses or timings.

## Money, entitlement and quotas

- Client-supplied price, discount, plan, quantity or currency trusted by the server.
- Subscription state claimed by the client instead of verified with the store/payment provider; receipt replay; refunds or chargebacks not revoking access.
- Credits, quotas or message allowances decremented non-atomically (double spend under concurrency).
- Webhook from the payment/store provider forged (no signature), replayed (no timestamp window) or processed twice (no idempotency key).
- Free-tier limits enforced only in the client or in a per-instance counter.

## Messaging and cost

- Attacker triggers paid outbound messages (SMS, WhatsApp, email, push) to arbitrary numbers or in bulk ("toll fraud", spam through the product).
- Verification-code endpoints used as a message cannon.
- Expensive operations (exports, report generation, LLM calls, image processing) triggered without per-tenant limits.

## Bookings, scheduling and inventory

- Double booking or slot hoarding through races or missing holds expiry.
- Public booking pages leaking other customers' names, phones or appointment details.
- Cancellation/rescheduling links that are guessable or never expire.

## Files and content

- Upload of active content (HTML, SVG, scripts) served from the app's origin.
- Signed URLs with long lifetimes or without tenant scope.
- User-provided content later rendered in admin tools, emails, PDFs or LLM prompts.

## Integrations and delivery channels

- Inbound webhooks from messaging, store or payment providers trusted by IP or URL secrecy.
- OAuth tokens to third parties stored unencrypted or shared across tenants.
- OTA/app update channel serving unsigned bundles; a compromised build machine pushing code to all devices.
- Error tracker, analytics or logs receiving tokens, OTPs or full request bodies.

## Platform and operations

- Admin panel or internal tool reachable from the internet with single-factor login.
- Production data copied into staging or local environments.
- Backups or exports downloadable by more people than the database itself.
- A compromised dependency or CI step reading production secrets.
- Developer AI agents with production credentials or permission-bypass flags.

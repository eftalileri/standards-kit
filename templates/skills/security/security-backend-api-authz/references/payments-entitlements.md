# Payments, subscriptions, credits and entitlements

Money and entitlement bugs are usually logic, not injection. Walk each flow end to end and answer every question with a file:line or a console fact. An app that only uses app-store billing or a hosted checkout is mostly outside card-data (PCI) scope, but entitlement integrity stays fully in scope.

Kit: the requirements behind these questions are SSG-M8 (one authority), SEC-M-ZT-2 (provider evidence), SSG-M13 and SSG-M21 (effective access versus provider events), SEC-M-WH-1 and SEC-M-WH-3 (webhook trust), IDEMP-M5 and IDEMP-M14 (idempotent effects), SEC-M-RESOURCE-MONEY-1 and the payment topic (`<KIT_ROOT>/en/payment-ssot/`). Where a question below and a kit row differ, the kit row decides; the questions are the walk, not the rule.

## 1. Single authority

- Is there exactly one server-side authority that decides "does account X have entitlement Y now"? List every reader. Any second copy (client flag, cached boolean on the user document written from several places, per-feature checks with their own logic) is a finding candidate: two writers drift and one of them will grant.
- Derived values (remaining credits, plan limits, feature flags per plan) are read from the authority and never written back by consumers.

## 2. Price and amount

- Price, currency, quantity limits, discounts and durations come from a server-side catalog keyed by an id, never from the request body.
- Hosted-checkout sessions are created server-side with catalog price ids; the success redirect is not proof of payment — only the verified provider event or an API re-fetch is.
- Negative, zero, fractional and very large quantities are rejected; rounding and currency conversion happen in one place.

## 3. Store purchases (iOS / Android)

- Purchases are verified server-side with the store's server API or signed payloads, not accepted from the client as a boolean or a raw receipt that is merely stored.
- iOS: App Store Server Notifications v2 and transaction data are signed (JWS); verify the certificate chain to Apple's root and check bundle id and environment. Bind purchases to your account with the app account token set at purchase time.
- Android: verify purchase tokens with the Google Play Developer API; acknowledge purchases; Real-time Developer Notifications arrive via Pub/Sub — authenticate the push (verify the push request's token audience/issuer, or pull with service credentials) and re-fetch the purchase state rather than trusting the message body. Bind with the obfuscated account id set at purchase time.
- Reject sandbox/test environment purchases in production.
- Receipt replay: the same original transaction or purchase token must not unlock a second account unless family sharing is an explicit product decision.
- "Restore purchases" re-verifies server-side and re-binds according to a written rule; it never trusts the client's list.
- Billing intermediaries (subscription platforms): authenticate their webhooks (shared secret header or signature) and treat their API, not the webhook body, as the source of state.

## 4. Lifecycle

- Expiration, grace period, billing retry, pause, refund, chargeback and revocation each map to an explicit state transition that removes access. Search for every event type the provider sends and confirm each is handled or deliberately ignored.
- Downgrades take effect at the right time and remove over-limit capabilities (seats, storage, scheduled jobs).
- Trials and introductory offers: eligibility checked server-side per real identity, not per new account or email alias.

## 5. Credits, balances and quotas

- Debit with one atomic conditional update (`balance >= amount` in the filter, decrement in the same operation) or inside a transaction; never read, compare in code, then save.
- Keep an append-only ledger with a unique idempotency key per business event; the balance is derivable from the ledger.
- Debit happens before or atomically with the costly effect (sending a message, calling a paid API); a failure path refunds through the same ledger, not by direct balance edits.
- Monthly or per-period quotas: period boundaries computed server-side in one timezone rule; counters stored in a shared store, keyed by tenant and period.

## 6. Webhooks feeding money state

- Signature verified over the raw body with a constant-time compare; timestamp tolerance enforced; event id stored with a unique index before side effects; out-of-order events handled by comparing provider timestamps/versions, not arrival order.
- A handler error returns a status that makes the provider retry, and the retry is idempotent.

## 7. Confirmation steps (no test artifacts)

For each candidate write the reproduction as a numbered request sequence an owner could run on a non-production environment they name, for example:

1. Account A (tenant 1) buys plan P; note the purchase token.
2. Account B (tenant 2) calls the verify/restore endpoint with A's token.
3. Expected: rejected. Code path that would allow it: `path:line` (no binding check), `path:line` (entitlement write).

Pair it with the static trace. Never run it yourself against production.

## 8. Severity floor

Manipulating price, granting paid entitlements without payment, double-spending credits, or keeping access after refund is at least High unless a cited control limits it (see `security-finding-verification`).

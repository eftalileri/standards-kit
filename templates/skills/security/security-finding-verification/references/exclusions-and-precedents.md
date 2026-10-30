# Exclusions and precedents (multi-tenant SaaS edition)

Generic AI review prompts exclude whole classes to stay quiet. Several of those classes are where multi-tenant SaaS products actually lose money and data, so this list keeps them in scope through explicit carve-outs. A carve-out always wins over an exclusion.

Kit precedence: an exclusion or precedent here never overrides a kit rule (`<KIT_ROOT>/en/`). Where a kit row makes a control mandatory, its absence is a finding even if this list calls the class hardening; where a kit row deliberately permits a behaviour (a rate limiter failing open with an alert where the action may safely proceed, kit RDS-M8), that behaviour is not a finding.

## Never excluded (carve-outs)

- **Tenant isolation**: any path where one tenant's user, staff member or integration can read, change or infer another tenant's data, including through caches, search/vector stores, exports, background jobs, notifications and aggregate counts.
- **Rate limiting and abuse on sensitive or expensive paths**: login, OTP/verification codes, password reset, invitations, outbound messages (SMS, WhatsApp, email, push), paid third-party API calls, LLM calls, exports/reports, file processing, search. Includes counters kept in process memory when the service runs on more than one instance.
- **Denial of service with amplification or cross-tenant effect**: one request that triggers unbounded work, unbounded queries, catastrophic regex on request input in a single-threaded runtime, queue flooding that delays other tenants, or spend that bills the operator.
- **Races on money, credit, quota, entitlement or uniqueness**: double spend, double booking, quota bypass, duplicate webhook processing without idempotency.
- **Missing audit trail for sensitive changes**: money movements, prices, refunds, role/permission changes, tenant membership, admin impersonation, data export and deletion. Reported when the change is not recorded with actor, target, before/after and time.
- **Fail-open error handling**: a caught error that grants access, skips a check or returns success (kit error-policy N24), other than a fail-open a kit row permits on purpose (RDS-M8).

## Hard exclusions (do not report; log in the triage file)

1. Volume-only DoS against ordinary endpoints with no amplification, no cost and no cross-tenant effect.
2. Outdated dependencies with no reachable vulnerable code path (hand to the supply-chain skill as hygiene).
3. Missing generic hardening (banners, version strings, SRI on first-party assets, headers beyond the kit baseline) with no demonstrated attacker gain — hardening appendix only. Headers the kit requires (SEC-M-WEB-HDR-1, SEC-M-HELMET-1) are not covered by this exclusion.
4. Log forging that only changes how logs look, unless logs feed an automated decision or are rendered as HTML.
5. Issues only in tests, docs, examples, fixtures or dev-only scripts that never ship or run against real data.
6. Missing authorization in client code when the server enforces it (if the server does not, report the server gap).
7. Memory-safety classes in managed runtimes.
8. Brute force of values with at least 122 bits of randomness (UUIDv4, 128-bit tokens) when attempts are also rate limited.
9. Self-inflicted issues needing the attacker to already hold equal or higher privilege over the same data (self-XSS, a tenant owner harming their own tenant) — unless the privilege crosses a tenant or role boundary.
10. Theoretical races on data with no money, quota, permission or uniqueness meaning.
11. Values from environment variables, deployment config and CLI flags, unless the trace shows an attacker can set them.
12. Lack of TLS or secure-cookie flags in local development configuration.

## Precedents (judgment + reason)

| Situation | Judgment | Reason |
|---|---|---|
| Object id is a UUIDv4 / random token | IDOR still reported; likelihood lowered | Ids leak through URLs, logs, exports, shared links and other endpoints. |
| Tenant id read from body, query or header | Finding unless checked against the session's membership | The client chooses it. |
| Secret URL used instead of webhook signature | Finding | URLs leak in logs, proxies and dashboards. |
| Rate limit counter in process memory, multi-instance deploy | Finding when it protects auth or cost | Each instance counts separately; restarts reset it. |
| Logging full URLs | Finding where kit SEC-N-LOG-4 / SEC-M-LOG-5 forbid raw URLs, request targets or query strings at that egress; otherwise not a finding unless the URL carries tokens or reset codes | The kit rows decide which egress may carry them. |
| Logging passwords, tokens, auth headers, cookies, OTPs, connection strings | Finding | Logs have wider access and longer retention than the data store. |
| PII in logs or error tracker | Finding, unless a documented project decision accepts it; then check access, region, retention and processor agreement | Owner decisions are respected but their controls are verified. With the kit the decision is the project's documented readership model under SEC-M-LOG-4. |
| React / React Native text rendering | Not XSS | Escaped by default; raw-HTML APIs, WebView HTML injection and `javascript:` URLs are the sinks. |
| ODM/schema casting on a filter built from the raw request object | Not a control unless it casts that exact field | Operator objects pass through un-cast positions. |
| Fallback secret in code used when the env var is missing | Finding | The app runs with a public default. |
| CORS `*` without credentials on public data | Not a finding | No ambient credentials are sent. |
| Reflected Origin with credentials allowed | Finding | Any site can read authenticated responses. |
| Bearer-token API (token in header) and CSRF | Not CSRF | Browsers do not attach it automatically. Cookie-session state changes without SameSite/CSRF token are findings. |
| Open redirect alone | Low | Raise when it feeds OAuth/token flows (chain check). |
| SSRF where the attacker controls only path or query of a fixed host | Usually not SSRF | Report if path reaches internal admin APIs or the host/protocol is influenceable. |
| Stack traces or internal error text in production responses | Finding (Low/Medium) | Leaks structure that aids other attacks; kit SEC-N-RESP-2 and error-policy N22. |
| Values shipped in a mobile/web bundle (public env prefixes, embedded config) | Public by design | A finding only when the value grants privileged access (service keys, admin tokens). Publishable keys and error-tracker DSNs are designed to be public; abuse is spam-level unless quotas bill the operator. |
| HSTS absent | Finding on a production HTTPS host covered by kit SEC-M-WEB-HDR-1 or SEC-M-HELMET-1; hardening note elsewhere | Do not recommend preload by default; it is hard to undo. |
| "Validated upstream" comment | Not evidence | Open the upstream code. |

## Adding to this list

Record every rejected candidate with a one-line reason. When the same reason recurs, add a precedent here (judgment + reason) rather than a blanket exclusion. Never add an exclusion that touches a carve-out.

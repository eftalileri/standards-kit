# Security — client transport, web headers, pinning, device sessions

```kit-cover
type: normative
part-of: README.md
binds: SEC-M-WEB-HDR-1, SEC-M-WEB-SINK-1, SEC-M-WEB-MSG-1, SEC-M-WEB-MAP-1, SEC-M-WEB-SRI-1, SEC-M-PIN-1, SEC-M-CLIENT-TOK-1, SEC-N-PAY-1 and SEC-M-HIJ-1 -- the web security headers a browser client must receive, URL and HTML sinks, cross-window messages, public source maps and third-party script, certificate pinning, how the client holds a token, the payment-data prohibition and the session-hijack countermeasure
open-when: shape:frontend-heavy, signal:client-transport, signal:web-headers, signal:certificate-pinning, signal:device-session, signal:source-map-upload
skip-when: signal:backend-only, signal:no-client-surface
owns: SEC-M-WEB-HDR-1, SEC-M-WEB-SINK-1, SEC-M-WEB-MSG-1, SEC-M-WEB-MAP-1, SEC-M-WEB-SRI-1, SEC-M-PIN-1, SEC-M-CLIENT-TOK-1, SEC-N-PAY-1, SEC-M-HIJ-1
```

Scope

- Included: Web static host security headers, web script sinks, cross-window messages, public source maps and third-party script (SEC-M-WEB-SINK-1, SEC-M-WEB-MSG-1, SEC-M-WEB-MAP-1, SEC-M-WEB-SRI-1), SEC-M-PIN-1 (mobile pinning), client token retry rules (reference SEC-D2), SEC-N-PAY-1 (payment data on client), SEC-S-DEVICE (SHOULD), SEC-M-HIJ-1 (SHOULD — cross-ref).

Document type: Normative — SEC-M- rows, SEC-N-PAY-1; SEC-S- / SEC-M-HIJ-1 as SHOULD.

Environment: Production web builds and mobile release builds; N/A paths per [SEC-NA-1](security-enforcement-and-na.md).

References: [Decision gates](security-decision-gates.md) (SEC-D1, SEC-D2); [Enforcement and N/A](security-enforcement-and-na.md) (SEC-NA-1); [Secrets and logging](security-secrets-and-logging.md); [Zero trust authority](security-zero-trust-authority.md) (SEC-M-ZT-1); [Governance](security-governance.md) (TM-1, TM-4, TM-7); [CI and monitoring](security-ci-and-monitoring.md) (SEC-C1-E).

Code samples: [`../_meta/examples/security-code-samples.md`](../_meta/examples/security-code-samples.md).

---

## Web — security headers on the static / frontend host

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-M-WEB-HDR-1** | Where a web app is shipped, the hosting layer (CDN, framework headers, reverse proxy) **must** set at least: CSP, HSTS (on HTTPS hosts), `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` — or SEC-NA-1 (e.g. mobile-only product). | Bug for web surface. | Build / CDN config real-run observation (SEC-C1-E). |

SEC-M-WEB-HDR-1 capability-URL corollary (binding): a host or page whose address carries a bearer capability in its path (a manage or magic-link token) **MUST** answer every response, redirects included, with `Referrer-Policy: no-referrer` from the host's single header authority — host-wide when the host serves only such public pages and its flow does not depend on `Referer` — never a second per-route writer. Reason: an outbound link, subresource or redirect hop would otherwise carry the capability, and a per-route override misses the paths that reach it another way. Verify: real-run response-header observation on the capability path, its redirect, and an ordinary path of the same host.

SEC-M-WEB-HDR-1 narrower-link corollary (binding): a link that hands out part of what a bearer capability opens (a calendar file, directions, a read-only view) — especially one sent into a chat or a synced calendar where it is forwarded and kept — **MUST** be its own token derived from the capability's stored record (record id plus a MAC under a purpose-bound subkey, checked in constant time before any read), whose verifier yields a type no write path accepts; it **MUST NOT** be the capability itself or a path under it. Reason: the narrower link is copied far more widely than the capability, and a path under the capability makes every copy a write credential. Verify: review that the write path's input type is produced only by the capability's own verifier.

SEC-M-WEB-HDR-1 nonce-CSP corollary (binding): a nonce-based CSP (`'strict-dynamic'`) **MUST** be applied only to surfaces rendered per request, and privileged (admin) and token-bearing surfaces **MUST** be on it; statically prerendered or CDN-served pages cannot carry a per-request nonce, so they **MUST** use a static policy that never contains `'unsafe-eval'`, and the request-time layer **MUST** decide which policy applies from the decoded path, never the raw one. Reason: a nonce cannot be baked into cached HTML, and a matcher on the raw path lets an encoded admin address fall through to the weaker policy.

SEC-M-WEB-HDR-1 service-worker corollary (binding): a web app's service worker **MUST** answer from its cache only same-origin GET requests for the static shell (the page as an offline fallback, content-hashed bundles and assets); it **MUST NOT** answer or store a cross-origin (API, error-reporting) or non-GET request, the deploy's version file, or an HTML fallback served for a missing file, and its cache **MUST** be named by the build identity and dropped on the next build's activation. Reason: a worker cache outlives sign-out and deploys, so anything signed-in or stale it holds is served to the next person or to an old tab.

---

## Web — script sinks, cross-window messages, source maps and third-party script

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-M-WEB-SINK-1** | A URL built from data the page did not author — a server field, a link or query parameter, a message — **MUST** pass a scheme-and-host allowlist (`https:` to known hosts, or an in-app route) before it reaches `href`, `src`, `window.location`, `window.open` or a navigation call; `javascript:`, `data:` and unknown schemes are rejected. A raw-HTML sink (`dangerouslySetInnerHTML`, `innerHTML`, `document.write`) **MUST** receive only the output of one sanitizer, or of an escaper over fixed markup. The native counterpart is [COB-RN-M5](../client-observability-rn/outbound-link-ownership-and-visibility.md). Reason: a `javascript:` address or unsanitized markup runs script inside the signed-in origin. | Security bug. | Review of every URL and HTML sink. |
| **SEC-M-WEB-MSG-1** | A cross-window message listener **MUST** compare the event's origin by equality with an expected origin and validate the payload with a schema before acting, and a sender **MUST** name the exact target origin, never `'*'`, when the message carries data. Same-origin channels (a broadcast channel, the page's own service worker) are not cross-window. Reason: any page that holds a window reference can post to the listener, and a wildcard target hands the data to whatever origin the window now shows. | Security bug. | Review of every message listener and sender. |
| **SEC-M-WEB-MAP-1** | A production source map **MUST** be uploaded to the error tracker and removed from, or never placed in, every publicly served output — the web export, a CDN path, an over-the-air update's published assets — in the same release step. Reason: a public map hands anyone the original source, its comments and internal routes. | Bug — information disclosure. | Review of each release script + the published asset list. |
| **SEC-M-WEB-SRI-1** | A page **MUST NOT** load script from a third-party origin unless the script is self-hosted or pinned with Subresource Integrity, and the CSP `script-src` **MUST** list only those origins. Reason: a third-party script runs with the page's full authority, so a compromise of its host becomes a compromise of every signed-in session. | Security bug. | Review of the CSP and the HTML shell. |

---

## Mobile — certificate pinning

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-M-PIN-1** | Production mobile **must** either: (a) enable pinning for API host with documented rotation runbook, or (b) SEC-NA-1 with accepted risk for TM-4 in project `SECURITY.md` (or equivalent). | STOP until (a) or (b) exists. | Security note + release checklist. |

---

## Client token retry and UX

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-M-CLIENT-TOK-1** | **Must not** repeatedly send requests with an expired access token; **must** follow SEC-D2 (single refresh attempt, then deterministic logout). **Must not** show protected user data on a known-expired token without successful refresh. | Security defect. | Review and runtime verification of the single token authority. |
| **SEC-N-PAY-1** | **Must not** persist full payment card numbers (PAN), CVV, or magnetic-stripe data on the client (mobile or web storage); use PCI-aligned flows (tokenization / hosted fields) per product architecture. | Compliance / breach class. | Storage audit + review. |

---

## SEC-S-DEVICE — Multi-device and sessions (SHOULD)

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-S-DEVICE** | SHOULD: session list for user; revoke one or all sessions; server-side device / client public id on session; anomaly signals (new country/device) tied to SEC-M-MON-1 / alerts. If N/A, SEC-NA-1 + TM-7 risk. | Risk acceptance if omitted. | Product security note. |

Fingerprinting: If collected, privacy / legal note required; client-only signals **must not** replace SEC-M-ZT-1.

---

## SEC-M-HIJ-1 — Session hijack hardening (SHOULD)

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-M-HIJ-1** | SHOULD: logout-all endpoint; revoke refresh on theft suspicion; step-up or re-auth for critical actions — product backlog item aligned with TM-7. | Roadmap. | Security roadmap doc. |

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|---------------------|
| Web app ships without SEC-M-WEB-HDR-1 minimums | STOP or SEC-NA-1. |
| SEC-M-PIN-1 neither pinned nor SEC-NA-1 | STOP — complete (a) or (b). |

---

Migration note: Map prior client transport and session guidance to these identifiers and remove duplicate definitions.

Part of: [README.md](README.md).

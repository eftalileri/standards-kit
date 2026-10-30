# Edge, DNS, TLS and email checklist

Each line is a question to answer with evidence. Record the evidence source (config file, read-only command output saved outside the repo, owner export) next to the answer.

## 1. DNS zone

1. Export the full record list for every zone (owner evidence or provider read-only API).
2. For each CNAME/ALIAS: does the target still exist and belong to you? Typical dangling targets: removed PaaS custom domains, deleted object-storage buckets, old static-site hosts, retired SaaS (help desks, status pages, landing-page builders).
3. For each A/AAAA: is the address still yours (released cloud IPs get reassigned)?
4. NS delegations for subdomains: does the delegated zone still exist at that provider?
5. MX: do all point to the current mail provider?
6. Wildcards: is a wildcard record needed? It turns every typo subdomain into your origin.
7. CAA records restrict which authorities may issue certificates; include the ones your edge and platform use.
8. DNSSEC enabled where the registrar and DNS host support it (hardening).
9. Registrar: transfer lock on, account MFA on, contact email on a domain you control and monitor, auto-renew on.
10. Proxied vs DNS-only: DNS-only records for hosts that share an origin with proxied hosts reveal the origin address.

Takeover verification (never claim): fingerprint the response of the target service; check the provider's rules on whether the name is claimable; note what trusts the subdomain (parent-domain cookies, CSP/CORS allowlists, OAuth redirect URIs, email links).

## 2. TLS and edge

1. Every public hostname redirects HTTP to HTTPS.
2. Protocols: TLS 1.2 and 1.3 only at the edge and at any origin reachable directly.
3. Certificates: automated renewal; expiry alerting; no wildcard certificates copied between unrelated services.
4. Edge-to-origin: encrypted and validated (full/strict mode or equivalent); never "encrypt browser to edge only".
5. Origin lock-down: origin accepts only edge traffic (allowlist of edge ranges, authenticated origin pulls, tunnel, or platform feature) whenever the edge carries WAF, bot or rate-limit rules the app relies on. If the platform cannot restrict this, keep those controls in the app.
6. HSTS on production HTML hosts with a sensible max-age; consider `includeSubDomains` only after inventorying subdomains; preload only as a deliberate, documented decision.
7. Cache rules: authenticated or personalized responses are not cached at the edge; cache keys include what varies the response; `Set-Cookie` responses are not cached.
8. Edge API tokens: scoped per zone and permission, with expiry; no global key in use.

## 3. Email authentication

For every domain that sends mail (including subdomains used by transactional providers):

1. SPF: one record; includes every legitimate sender; ends with a fail or softfail qualifier as policy dictates; stays under the 10 DNS-lookup limit (flattening or subdomain split if not).
2. DKIM: enabled for every sending service; 2048-bit keys where supported; selectors documented; rotation plan.
3. DMARC: published; policy moving from `none` to `quarantine` to `reject` on a plan; `rua` aggregate reports go to a monitored mailbox or service; subdomain policy (`sp`) set; alignment mode chosen deliberately.
4. Non-sending domains and subdomains: `v=spf1 -all`, DMARC `p=reject`, and a null MX if they never receive mail.
5. Optional transport hardening: MTA-STS and TLS-RPT for receiving domains.
6. Transactional email links: built from a configured base URL, never from the request `Host` header (ties to password-reset poisoning in `security-auth-session`).

## 4. Hosting/PaaS

1. Per service: public domain(s), private network name, TCP proxies, open ports; why each is public.
2. Per environment: which variables exist (names only), which are shared, which are sealed/write-only; preview/PR environments' data and keys.
3. Deploy sources: which branch deploys to production; who can trigger deploys; whether deploys from forks or PRs are possible.
4. Platform shell/exec access: who has it.
5. Health and metrics endpoints: public or private; what they reveal.
6. Volumes and backups: attached to which service; retained after service deletion?

## 5. Consoles and people

List each provider (code host, hosting, database, cache, DNS/registrar, CDN, app stores, mobile build/update service, error tracking, email provider, payment/subscription provider, messaging provider) with: members and roles, MFA enforced (yes/no), SSO, API tokens (name, scope, expiry, last used), owner of the account recovery email/phone, offboarding status of former members.

## 6. Optional tools (owner approval to install; low-rate, own hosts only)

| Tool | Use | Blind spot |
|---|---|---|
| `dig`/`host` (built-in) | record values, CAA, SPF/DMARC text | none for public records; private zones not visible |
| testssl.sh / sslyze | protocol, suite, certificate checks | origins only reachable by IP; app logic |
| subfinder/amass + takeover fingerprint templates | enumerate your own subdomains and match dangling fingerprints | fingerprint catalogues differ and go stale; NS/MX takeovers often missed |
| ssh-audit | SSH algorithms on hosts you run | not applicable to pure PaaS |
| hadolint, Trivy config, Checkov | Dockerfile/IaC misconfiguration | console-only settings |

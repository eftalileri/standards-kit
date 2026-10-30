---
name: security-infra-cloud-dns
description: Reviews hosting and infrastructure security outside application logic: PaaS service variables, exposure and private networking (e.g. Railway), containers and Dockerfiles, infrastructure-as-code, TLS configuration, security headers at the edge, CDN/DNS settings (e.g. Cloudflare) including dangling records and subdomain takeover, email authentication (SPF, DKIM, DMARC), backups, admin and SSH exposure, least-privilege cloud and console access, and infrastructure logging. Use it when auditing deployment configuration, DNS zones, edge settings, mail domains or console accounts, or when a change touches them.
---

# Infrastructure, cloud, DNS and email review

## Purpose

Most of what this skill checks lives in consoles and DNS, not in the repository, and no code scanner sees it. The job is to collect evidence for each item (config-as-code, read-only CLI/API output, owner-provided exports or screenshots), judge it, and say plainly what could not be observed.

## When to use / not use

- Use: platform/service configuration, config-as-code files, Dockerfiles and compose files, IaC, edge/CDN rules, DNS zones, mail domains, TLS endpoints, backup locations, console membership and tokens, infrastructure logs and alerts.
- Hand off: application CORS, headers set in code and middleware order → `security-backend-api-authz` / `security-web-frontend`; database and cache settings → `security-database-cache`; secrets in variables and rotation → `security-secrets-supply-chain-cicd`; CI/CD workflows and release signing → `security-secrets-supply-chain-cicd`; log content and retention → `security-privacy-logging`.

## Ground rules

- Read-only. Never change console settings, DNS records, firewall rules or certificates; never claim a dangling resource to "prove" a takeover.
- Active checks against the owner's own public hosts (TLS scan, header fetch, DNS lookups) only when the owner approves and names the hosts; never against third parties; keep them low-rate.
- No test artifacts in the repository; evidence is configuration, command output stored outside the repo, or owner-provided material.
- Never print variable values, tokens or keys; list names and scopes only. Platform "run with environment" commands copy every variable to a local process — avoid them for review; use names-only listings.
- Tools are optional and need owner approval to install; their output is a candidate list.
- A `Kit:` line names the kit rules that govern a check; the rule text in `<KIT_ROOT>/en/` is the requirement, the check is detection only (`security-audit-orchestrator/references/skill-set.md`).

## Procedure

1. **Inventory from evidence.** Services and their public hostnames, private network names, TCP proxies, regions; environments (production, staging, preview/PR); databases/caches and how they are reached; DNS zones and every record; mail-sending services; CDN/edge rules; buckets/object storage; backups; console accounts and API tokens per provider; registrar. Use the orchestrator's asset inventory if it exists.
2. **Mark the evidence source** for every item: config-as-code (file:line), read-only CLI/API output, owner screenshot/export, or "not observed".
3. **Run the checks below** and the detailed lists in `references/edge-dns-email-checklist.md`.
4. **Write candidates** with the attacker (internet, other tenant on the platform, holder of a leaked token, former staff), the precondition and the gain. Send to `security-finding-verification`.
5. **List gaps**: every item not observed goes into the coverage section as "needs owner evidence", never as "ok".

## Checks

### SK-INF-01 Service exposure and private networking (CWE-668 / CWE-284)
- Look for: internal services (databases, caches, admin APIs, workers, metrics) with public domains or TCP proxies; services reachable both via the edge and via the platform-generated public hostname (edge WAF, rate limits and IP rules bypassed); internal APIs relying on "private network only" without authentication; health/metrics/debug endpoints public.
- Confirm: platform config or owner evidence showing the public endpoint and what it serves.
- False positives: public endpoints intended for clients with app-level authentication — still note edge-bypass if the edge carries security controls.
- Kit: RDS-M11 (cache only on the private network), SEC-M-RL-1 (a token-guarded metrics endpoint and the documented health exemptions). General service exposure has no kit rule.

### SK-INF-02 Platform variables and environments (CWE-526 / CWE-668)
- Look for: production secrets copied into preview/PR or staging environments; preview environments reachable publicly with production data or production third-party keys; variables shared across services that do not need them; secrets that should be write-only/sealed but are readable by all project members; build-time variables that end up in images or client bundles.
- Confirm: variable names and scopes per environment (names only).
- Kit: SEC-M-SECRET-ACL-1 (production secrets only in the platform store; development values never equal production), SEC-M-ENV-1, SEC-M-KEY-1.

### SK-INF-03 Containers (CWE-250 / CWE-538)
- Look for: running as root; base images by mutable tag (`latest`) instead of digest or pinned version; large base images with unneeded tools; secrets passed as build args or copied into layers; `.dockerignore` missing `.env`, `.git`, keys; privileged mode, host networking or Docker socket mounts; no health check.
- Confirm: Dockerfile/compose lines. Optional tools: hadolint, Trivy config/image (blind spot: app logic and PaaS console settings).

### SK-INF-04 Infrastructure as code (CWE-732 / CWE-284)
- Look for: wildcard IAM policies; public buckets/ACLs; security groups open to the internet on admin ports; state files committed or stored unencrypted (they contain secrets); drift between IaC and console.
- Confirm: IaC file:line. Optional tools: Checkov, Trivy config (blind spot: anything configured only in consoles).

### SK-INF-05 TLS and certificates (CWE-319 / CWE-326)
- Look for: HTTP served without redirect; old protocol versions or weak suites enabled at the origin; certificates near expiry without automation; edge-to-origin traffic unencrypted or not verifying the origin certificate; no CAA records restricting issuers; HSTS missing on production HTML hosts (introduce with care; preload is a one-way door).
- Confirm: config or a low-rate scan of owner-named hosts (testssl.sh/sslyze; blind spot: origins reachable only by IP).
- Kit: SEC-M-CRYPTO-1 (TLS 1.2+ and documented cipher policy), SEC-M-WEB-HDR-1 and SEC-M-HELMET-1 (HSTS on HTTPS hosts). CAA and certificate automation have no kit rule.

### SK-INF-06 Security headers at the edge (CWE-693)
- Look for: headers set in both app and edge with conflicting values; edge rules stripping app headers; caching rules that cache authenticated responses or ignore `Vary`/`Cache-Control: private`; cache keys that omit auth-relevant headers.
- Confirm: rule export or captured responses from owner-named hosts. Header content itself is judged in `security-web-frontend`.
- Kit: SEC-M-WEB-HDR-1 (the hosting layer sets the header baseline), SEC-M-HELMET-1, RDS-M22 (a cached response never skips authorization). Edge caching rules as such have no kit rule.

### SK-INF-07 CDN/edge configuration (CWE-284 / CWE-319)
- Look for: edge TLS mode that encrypts only browser→edge (origin over HTTP) or does not validate the origin certificate; DNS-only (unproxied) records that reveal the origin address of a proxied service; origin accepting traffic from anywhere; WAF/rate rules that the app relies on but that can be bypassed via the origin; account API tokens with global scope instead of per-zone, per-permission tokens.
- Confirm: zone settings and token scopes (owner evidence).
- Kit: SEC-M-RL-5 (the proxy trust boundary behind every IP-keyed control is a measured decision), SEC-M-CRYPTO-1. Edge TLS mode, origin lock-down and API-token scope have no kit rule.

### SK-INF-08 Dangling DNS and subdomain takeover (signal → verify) (configuration; WSTG-CONF-10)
- Look for: CNAME, ALIAS or A records pointing to deprovisioned services (removed platform custom domains, deleted buckets, old static hosts, expired third-party SaaS), dangling NS delegations, MX to retired providers, wildcard records.
- Confirm: a dangling CNAME is a signal only. Confirm with the provider-specific fingerprint (the target says the resource does not exist and the service allows claiming it). Never claim the resource. Impact rises when parent-domain cookies, CSP/CORS allowlists or OAuth redirect URIs trust that subdomain.
- Optional tools: subdomain enumeration plus fingerprint checks against your own zone (blind spot: fingerprint catalogues differ and go stale; a flagged host is not automatically claimable).

### SK-INF-09 Email authentication (CWE-290 / CWE-345)
- Look for: no SPF or SPF ending in a permissive qualifier; SPF over the DNS-lookup limit; sending services not covered by SPF or DKIM; no DMARC, or DMARC stuck at `p=none` without a plan; no aggregate reports address; subdomain policy missing; non-sending domains without a null SPF and reject DMARC; DKIM keys short or never rotated.
- Confirm: DNS record values (public data). Details: `references/edge-dns-email-checklist.md` §3.
- Kit: EMP-M7 (verified sender domain with SPF, DKIM and DMARC before production sending). DMARC enforcement level, reporting and non-sending domains have no kit rule.

### SK-INF-10 Backups and snapshots (CWE-530)
- Look for: no backups for stateful services; backups never restored; retention longer than data policy allows; snapshot or export download rights held by many; dumps in buckets, CI artifacts or developer machines; volumes attached to deleted services.
- Confirm: provider console evidence; overlaps with `security-database-cache` SK-DB-10 — report once.

### SK-INF-11 Admin access, SSH and consoles (CWE-306 / CWE-308)
- Look for: SSH open to the internet with password auth; shared root keys; platform shell/exec access granted broadly; console accounts (code host, hosting, database, DNS/registrar, CDN, app stores, error tracking, email provider, payment provider) without MFA; shared logins; former members still present; long-lived personal API tokens with full scope; registrar without transfer lock or MFA.
- Confirm: owner-provided membership and MFA lists; token scope listings (names only).
- Kit: SEC-M-SECRET-ACL-1 (who may read and deploy production secrets is documented), SEC-M-SECRET-ACL-2 (break-glass access logged), SEC-M-SECRET-ACL-3 (vendor and contractor access). Console MFA and registrar lock have no kit rule.

### SK-INF-12 Least-privilege service identities (CWE-250 / CWE-269)
- Look for: one cloud credential used by every service; deploy tokens with organization-wide scope; service accounts with owner/admin roles; tokens without expiry; cross-environment credentials (staging can write production).
- Confirm: role and scope listings.
- Kit: SEC-M-SECRET-ACL-2 (least-privilege deploy tokens), SEC-M-SECRET-ACL-1 (no cross-environment secret reuse).

### SK-INF-13 Infrastructure logging and alerting (OWASP Top 10:2025 A09, CWE-778)
- Look for: no retention of platform/edge logs long enough to investigate; no audit trail of console changes (membership, variables, DNS, access lists); no alerts on deploys, variable changes, DNS changes, new admin members, certificate expiry, error-rate spikes; logs that capture secrets or full request bodies at the edge.
- Confirm: provider settings evidence; content questions go to `security-privacy-logging`.
- Kit: SEC-M-MON-1 (security-distinguishable events in the production log stream), SEC-M-MON-2 (per-key alerts), SEC-S-MON-2 (alerting — SHOULD), SEC-M-LOG-ACCESS-1 (access-log allowlist). Console-change audit trails have no kit rule.

## Stack notes (examples, optional)

- **Railway-like PaaS:** each service may have a generated public domain, custom domains, a private network name and optional TCP proxies; check each. Preview/PR environments can inherit variables; check what they receive. Config-as-code files declare build/start commands and health checks — read them for debug flags and exposed paths.
- **Cloudflare:** prefer full TLS with origin certificate validation; keep origins from accepting non-edge traffic when the edge enforces security rules (otherwise keep app-level controls); use scoped API tokens; enable registrar lock and DNSSEC where supported; review page/transform/cache rules for auth-bypassing caching.
- **Expo/EAS, app stores:** console accounts and API keys for build, update and store submission are production deploy credentials; include them in SK-INF-11.
- **MongoDB Atlas / managed Redis:** network access lists and users are infra evidence; judgments in `security-database-cache`.
- **Sentry:** organization membership, SSO/MFA, data scrubbing and retention are console items; membership here, content in `security-privacy-logging`.
## Output format

One record per candidate in the `security-finding-verification` schema; otherwise: id (check ID + slug) · title · severity estimate · confidence · standard (`A02:2025`, `ASVS 5.0 V12/V13`, CWE when one fits; configuration items may have none) · location (config file:line, console path, DNS record name) · evidence source (code / CLI / owner export / not observed) · attacker and gain · fix · false-positive notes. Coverage section: inventory with evidence source per item and a "not observed" list.

## Do not report

- A dangling CNAME as a takeover without a fingerprint match and claimability evidence (report as "verify" item).
- Missing HSTS preload, missing DNSSEC, or missing BIMI as High findings (hardening notes at most).
- Generic "add a WAF" or "use a VPC" advice without a concrete exposure.
- Settings on providers the project does not use.
- Values the owner has documented as accepted risk with compensating controls (list them under accepted risks).
- Scanner grades (letters or scores) without the concrete underlying weakness.

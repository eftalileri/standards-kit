# Asset inventory checklist

Fill each row from evidence (file:line, config file, owner-provided export). Unknown is a valid value; "assumed safe" is not. Every row gets a data class: `credentials`, `PII`, `money/entitlement`, `tenant-private`, `internal`, `public`.

## 1. Code and deployables

| Item | What to record |
|---|---|
| Repositories and workspaces | path, language, what it ships to (server, store app, web, admin, scripts) |
| Deployables | service name, start command, environment(s), public or private network |
| HTTP surface | route groups with file:line, auth requirement, tenant scope source |
| Inbound callbacks | webhooks (payment, store notifications, messaging, email, push), signature method |
| Async work | queues, consumers, cron/scheduled jobs, outbox processors, what triggers them |
| Scripts | migrations, backfills, admin CLIs; who can run them and against which environment |
| Admin surfaces | internal panels, support tools, feature-flag consoles, impersonation features |
| Client artifacts | web build, store binaries (iOS/Android), OTA/JS update bundles, source maps |

## 2. Data stores and caches

| Item | What to record |
|---|---|
| Databases | engine, hosting, network exposure, auth method, users/roles, TLS, encryption at rest, which services connect |
| Caches / key-value stores | hosting, auth/ACL, TLS, public reachability, key namespaces, what is cached (sessions, rate counters, tenant data) |
| Object/file storage | buckets, ACLs, signed-URL lifetimes, upload paths |
| Search / vector stores | tenant filter enforcement, what is embedded |
| Backups and exports | where snapshots live, who can restore/download, retention, old staging copies holding production data |

## 3. Hosting, network, DNS, email

| Item | What to record |
|---|---|
| Hosting/PaaS | projects, services, environments, variable scopes, private networking, public domains, deploy triggers |
| CDN/WAF/proxy | proxied hostnames, TLS mode between edge and origin, origin directly reachable or not |
| DNS | registrar (lock, MFA), zones, every record type, CNAMEs to third-party services (takeover candidates), CAA, DNSSEC |
| Email | sending domains, SPF/DKIM/DMARC policy, providers allowed to send |
| TLS | certificates, renewal, HSTS decisions |

## 4. Third parties and integrations

| Item | What to record |
|---|---|
| Processors | error tracking, analytics, push, SMS/messaging, email, payment/subscription, maps, AI/LLM providers |
| Per processor | data sent (fields), region, retention, credentials used and their scope, webhook back-channel |
| App stores and update services | accounts, signing keys/certificates, update-signing configuration |

## 5. CI/CD and release

| Item | What to record |
|---|---|
| Pipelines | where builds run (hosted CI, local machine, PaaS builder), who can trigger, secrets available to them |
| Release gates | what runs before deploy; branch protection; who can push to the release branch |
| AI agents in the pipeline | which agents run on untrusted input (issues, PR comments) and with which tools |

## 6. AI features

| Item | What to record |
|---|---|
| Model calls | provider, model, what user/tenant data enters prompts, output destinations |
| Tools/agents | tools exposed, credentials they use, irreversible actions, human approval points |
| Retrieval/memory | stores, tenant filters, who can write content that later enters a prompt |
| Developer agents | coding agents, MCP servers, skills/rules files in the repo or team config |

## 7. People and process

| Item | What to record |
|---|---|
| Accounts | code host, hosting, database, DNS/registrar, CDN, app stores, error tracker, email, payment, AI providers: owners, MFA state, shared logins |
| Offboarding | list of who has access; last review date |
| Secrets handling | where secrets live, who can read them, rotation procedure |
| Disclosure and incident | security contact, `security.txt` or equivalent, incident runbook, breach-notification owner |

## Tooling (optional; owner approval needed to install; output = candidates only)

| Layer | Free tools | Main blind spots |
|---|---|---|
| Secrets | gitleaks, TruffleHog | pattern-only matching (gitleaks) cannot tell live from dead; neither looks inside built mobile/OTA bundles unless pointed there; custom token formats need custom rules |
| Dependencies | npm audit, osv-scanner, Trivy (fs), Grype | no reachability; misses malicious packages not yet reported, typosquats, dependency confusion |
| SAST | Semgrep CE, CodeQL | Semgrep CE is per-file for taint; both are weak on authorization, tenant scoping and business logic |
| IaC / config | Checkov, Trivy config, hadolint, actionlint, zizmor | PaaS/console settings are not in code |
| Repo / CI hygiene | OpenSSF Scorecard | secrets in CI logs, third-party app grants |
| DAST (staging only) | OWASP ZAP, nuclei | IDOR and multi-step logic look like normal traffic; crawlers rarely reach deep authenticated flows |
| TLS | testssl.sh, sslyze | origin reachable around the CDN |
| DNS takeover | subfinder/amass with nuclei takeover templates or subzy | fingerprint catalogues differ; a flagged host is not proof it is claimable; NS/MX takeovers |
| Mobile | MobSF, apkleaks | server-side authz; Hermes/JS bundle logic; OTA channel trust |
| Containers | Trivy image, Grype, Syft | application logic |

Never run DAST, takeover probes or liveness checks against hosts the owner did not name. Never claim a dangling resource to "prove" a takeover.

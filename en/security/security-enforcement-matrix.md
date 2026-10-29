# Security — control family / enforcement type matrix (audit aid)

```kit-cover
type: reference
part-of: README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Scope: The audit aid that answers *automated vs manual* per control family. Every row cites SEC- anchors defined elsewhere in the topic and adds no obligation of its own.

Document type: Reference — carries no rule of its own. Every anchor named here is defined in the security part files, chiefly [security-enforcement-and-na.md](security-enforcement-and-na.md), [security-decision-gates.md](security-decision-gates.md), [security-authorization-decision-gates.md](security-authorization-decision-gates.md), [security-backend-controls.md](security-backend-controls.md), [security-zero-trust-authority.md](security-zero-trust-authority.md), [security-secrets-and-logging.md](security-secrets-and-logging.md), [security-logging-core.md](security-logging-core.md), [security-logging-correlation-and-fields.md](security-logging-correlation-and-fields.md), [security-cryptography.md](security-cryptography.md), [security-client-transport.md](security-client-transport.md), [security-ci-and-monitoring.md](security-ci-and-monitoring.md) and [security-governance.md](security-governance.md).

---

## Control family — enforcement type matrix (audit aid)

Purpose: High-level answer to *automated vs manual*. Detail remains in part-file tables.

| Control family | Primary SEC- anchors | Enforcement types |
|----------------|-------------------------|-------------------|
| Secret scan / dependency bots | SEC-C1-A, SEC-C1-F | static |
| High CVE / dep policy | SEC-C1-B, SEC-S-C1-G | static (+ review for exceptions) |
| Forbidden token storage pattern | SEC-C1-C, SEC-N-STORE-1 | static |
| Sensitive client query/state persistence boundary | SEC-M-STORE-2, SEC-N-STORE-2; MMKV MMR-M10-M11/N3-N4; TanStack UIP-M22/N7 | static (exact persist-policy + buster AST rule) + review (storage protection and dedicated-instance lifecycle classification) + runtime (cold-restore, foreground retry, physical-removal (file-level proof) device inspection) |
| Console / sensitive log lint | SEC-C1-D | static (if enabled) + review (rule tuning) |
| Web security headers in CI | SEC-C1-E, SEC-M-WEB-HDR-1 | static |
| Token validity / refresh / logout | SEC-D1, SEC-D2, SEC-M-CLIENT-TOK-1 | runtime + review |
| Server authz on resources | SEC-D3, SEC-M-ZT-1, SEC-M-SUBJ-1 | review + runtime (tests) |
| External provider-owned state changes (client intent, authenticated callback, environment and replay) | SEC-M-ZT-2, error-policy provider evidence rules | static (where source shapes are recognizable) + runtime + review |
| Production log redaction, including credential-bearing driver failures and all-level pre-transport structured-meta scrubbing | SEC-M-LOG-1–SEC-M-LOG-3, SEC-N-LOG-1–SEC-N-LOG-3 | static (wrapper wiring) + runtime + review (opaque error/message boundaries) |
| Correlation / request id in logs | SEC-M-LOG-CORR-1–SEC-M-LOG-CORR-2 | static (canonical boundary/middleware config) + runtime |
| Production request access/latency summary | SEC-M-LOG-ACCESS-1, SEC-N-LOG-4 | static (single-writer allowlist/raw-request-target AST rule) + runtime (hosted-log sample) |
| Outbound transfer of personal data to a third party (permission gate, replay re-authorisation, identifier minimisation) | SEC-M-XFER-1, SEC-M-XFER-2, SEC-M-LOG-2 | review (gate ordering and the single read authority) + static (raw caught-error text into a durable failure field, via the existing observability rule) |
| Security event codes / drain | SEC-M-MON-1 | runtime + review |
| TLS / cipher config | SEC-M-CRYPTO-1 | static + runtime (scan) |
| Password hash / KDF / AEAD | SEC-M-CRYPTO-2–4, SEC-N-CRYPTO-1 | review + static (deps, patterns) |
| JWT algorithm / lifetime / refresh / unknown-key JWKS amplification | SEC-M-JWT-1–SEC-M-JWT-4, SEC-N-JWT-2 | review + runtime |
| Helmet / CORS / CSRF | SEC-M-HELMET-1, SEC-M-CORS-1, SEC-M-CSRF-1 | static + review |
| Mongo / NoSQL injection | SEC-M-BE-NOSQL-1, SEC-M-NOSQL-1–SEC-M-NOSQL-4, SEC-N-NOSQL-1–SEC-N-NOSQL-4, GSEC-NOSQL1 | static (guard) + review |
| Certificate pinning | SEC-M-PIN-1 | review (+ static if pins in config) |
| Client credential secure-store provider and supported version | SEC-LIB-1, SEC-LIB-N1, SEC-M-STORE-1 | review (inspect the resolved dependency/version and actual platform configuration against the recorded decision; verify platform protection and threat-model fit) + static where project checks inspect those same facts |
| Secret lifecycle / ACL | SEC-M-LIFE-2, SEC-M-SECRET-ACL-1–SEC-M-SECRET-ACL-3 | review + runtime (break-glass logs) |
| Payment data on client | SEC-N-PAY-1 | review + static |
| Audit trail (SHOULD) | SEC-S-AUDIT-1 | review + runtime |
| SBOM / signed release (SHOULD) | SEC-S-SBOM-1 | review + static |
| CI workflow edits (gates) | GSEC6, SEC-C1-\* | static + review |

---

Part of: [README.md](README.md).

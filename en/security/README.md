# Security (hub)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** token, crypto, CSRF, CORS, Helmet, OWASP, secrets

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) — P1–P8 when this topic is in scope (P8 verification when implementation-bound); cite in deliverables per [markdown-authoring M16](../authoring/markdown-authoring.md).

Related: [Architecture core](../_meta/architecture-core.md) (non-normative: client stack map and topic index).

SSOT for the security obligations in this kit. If a consuming project has older security guidance, map and retire it through that project's own migration process.

Normative contract and scope: [security-governance.md](security-governance.md) (SEC-GC-1–SEC-GC-16, TM-1–TM-9, SEC-LIB-1, SEC-LIB-N1). N/A discipline: [security-enforcement-and-na.md](security-enforcement-and-na.md) (SEC-NA-1).

## Quick orientation

- Store replayable credentials only in an operating-system-backed secure store; classify any other persisted client data by its contents and threat model (SEC-M-STORE-1/2).
- Enforce authorization, tenant membership, and actor-class checks on the server. Treat client-supplied identifiers and provider claims as untrusted intent until the server validates them.
- Apply the relevant CSRF, rate-limit, security-header, input-validation, and outbound-request controls at each exposed backend surface.
- Keep credentials, raw continuation values, and unvalidated third-party payloads out of logs. Use a shared redaction authority, stable request correlation, and structured access fields.
- Use the cryptographic and session rules in this hub; route ambiguous cases through the decision gates and the project's documented risk register.

---

## Reading order (recommended)

1. [security-governance.md](security-governance.md) — review contract, pre-release review and finding triage, threat model, OWASP map, secure credential-store selection (SEC-LIB-1, SEC-LIB-N1)  
2. [security-enforcement-and-na.md](security-enforcement-and-na.md) — static / runtime / review, SEC-NA-1 record shape and SEC-NA-2 review window; the enforcement matrix audit aid is in [security-enforcement-matrix.md](security-enforcement-matrix.md)  
2a. [security-na-register.md](security-na-register.md) — blank SEC-NA-1 record template for a consuming project's register
3. [security-decision-gates.md](security-decision-gates.md) — SEC-D1, SEC-D2, GSEC1–GSEC6  
3a. [security-authorization-decision-gates.md](security-authorization-decision-gates.md) — SEC-D3, SEC-D3-M1–SEC-D3-M5 (server authz, proof before an irreversible identity act, ownership-gated retraction, a path labelled *delete* deleting the record, the scope resolver's verdict discriminant). SEC-D band set: these two files are the complete set; both carry the same `open-when` tokens, so a task that opens one opens both.  
4. [security-secrets-and-logging.md](security-secrets-and-logging.md) — tokens, sensitive client persistence (SEC-M-STORE-1–SEC-M-STORE-2, SEC-N-STORE-1–SEC-N-STORE-2), env, settings that must not silently remove a protection (SEC-M-CONFIG-1), transport validation bypasses (SEC-N-TLS-1), lifecycle, SEC-SECRET-ACL
4b. [security-logging-core.md](security-logging-core.md) — SEC-M-LOG-1–SEC-M-LOG-5 and the tag / breadcrumb corollaries
4c. [security-logging-correlation-and-fields.md](security-logging-correlation-and-fields.md) — SEC-M-LOG-CORR-1–SEC-M-LOG-CORR-2, SEC-M-LOG-ACCESS-1, SEC-N-LOG-1–SEC-N-LOG-4, field-area map
5. [security-cryptography.md](security-cryptography.md) — SEC-M-CRYPTO-1–SEC-M-CRYPTO-7, SEC-N-CRYPTO-1, SEC-M-JWT-1–SEC-M-JWT-7, SEC-N-JWT-1–SEC-N-JWT-3
6. [security-backend-controls.md](security-backend-controls.md) — CSRF, rate limit, Helmet, SEC-M-BE-NOSQL-1, webhooks, upload, CORS, request input shape and prototype keys (SEC-M-INPUT-1–SEC-M-INPUT-3), redirects (SEC-M-REDIRECT-1), code from text (SEC-N-EXEC-1), the production route set (SEC-N-ROUTE-1), SEC-N-RESP-2 (no raw caught-error text in a response body) ([nosql-query-safety](../nosql-query-safety/README.md) for Mongo filters)
6-1. [security-rate-limiting.md](security-rate-limiting.md) — SEC-M-RL-1–SEC-M-RL-4, SEC-S-RL-2 (limiter mounting, key choice, budgets, rejection path) and SEC-M-RL-5 (one client-address derivation behind a measured proxy trust boundary)
6a. [security-subject-owned-resource-access.md](security-subject-owned-resource-access.md) — SEC-M-SUBJ-1–SEC-M-SUBJ-4 (delegated access to subject-owned records, denial and audit behavior, evidence-based gate skipping, and a subject actor's own-record row scope)
6b. [security-zero-trust-authority.md](security-zero-trust-authority.md) — SEC-M-ZT-1 (server authority and provider-backed possession proof, with its store-review exception and the endpoint that consumes a proof before any identity exists) and SEC-M-ZT-2
6b-2. [security-server-authority-applications.md](security-server-authority-applications.md) — SEC-M-ZT-1's authorization-predicate applications (runtime capability provenance, deny-by-default scoped role, the scope-resolving helper as an entry allowlist, and the rule that a deployment-environment flag never gates an authorization predicate); it defines no identity of its own
6c. [security-tenant-scope-gates.md](security-tenant-scope-gates.md) — SEC-M-ZT-3, SEC-M-ZT-5, SEC-M-ZT-8 (the single membership-validation authority a caller-supplied tenant identifier passes through, the durable recovery anchor required before a dependent external side effect, and the refusal of a raw global role label as a decision input once a tenant-resolved actor exists — closed at the type level)
6c-3. [security-actor-class-gates.md](security-actor-class-gates.md) — SEC-M-ZT-6: resolving tenant scope is not authorization — the actor-class gate is a separate, mandatory question, and the sibling-endpoint trap is closed by class, not one endpoint at a time
6c-2. [security-global-identity-lookup.md](security-global-identity-lookup.md) — SEC-M-ZT-4 (the tenant proof required before a caller-supplied identifier reaches a globally keyed identity collection, on the read and the write side, and what a cross-subject ranking or feed surface may carry)
6d. [security-tenant-published-profile.md](security-tenant-published-profile.md) — SEC-M-ZT-7 (the tenant-published profile: the single bounded exception to SEC-M-ZT-4's cross-subject clause, resting on the subject tenant's own recorded, revocable opt-in; five conditions bind together and any one missing restores SEC-M-ZT-4 unchanged; its note bounds the unauthenticated single-subject public surface reached by the subject's own key)

Zero-trust band set (SEC-M-ZT-\*): the family is defined across the five files 6b, 6c, 6c-2, 6c-3 and 6d, with 6b-2 carrying SEC-M-ZT-1's applications; a task that opens one opens the family, because every band carries `shape:backend-heavy` and `signal:authorization`.
6e. [security-outbound-data-transfer.md](security-outbound-data-transfer.md) — SEC-M-XFER-1, SEC-M-XFER-2 (the outbound direction, a separate family from the zero-trust bands above: the permission a server **must** hold at the moment it sends a subject's personal data to a third-party receiver — including the replay from a durable queue — and the three boundaries, provider request, durable row and log line, across which a real-world identifier travels only as a deterministic digest)
6f. [security-model-provider-calls.md](security-model-provider-calls.md) — SEC-M-LLM-1–SEC-M-LLM-4 (a feature that calls a language model: what a steered model may reach, model output as untrusted input, per-request and fail-closed daily bounds on billed calls, and what crosses to the provider and to observability)
7. [security-client-transport.md](security-client-transport.md) — web headers, URL / HTML sinks, cross-window messages, public source maps and third-party script (SEC-M-WEB-SINK-1, SEC-M-WEB-MSG-1, SEC-M-WEB-MAP-1, SEC-M-WEB-SRI-1), pinning, SEC-S-DEVICE, SEC-M-HIJ-1 SHOULD  
8. [security-ci-and-monitoring.md](security-ci-and-monitoring.md) — applicable SEC-C1-A–SEC-C1-F gates by repository class and security surface (SEC-NA-1 for out-of-scope controls), SEC-S-C1-G, SEC-M-MON-1, SEC-M-MON-2  
8a. [security-supply-chain-admission.md](security-supply-chain-admission.md) — SEC-SUP-1–SEC-SUP-6 (release-age cool-down, dependency install scripts off, new-package vetting note, exact direct-dependency versions, agent extensions inventoried, pinned and read rather than executed)  
8b. [security-infrastructure-and-accounts.md](security-infrastructure-and-accounts.md) — SEC-INFRA-1–SEC-INFRA-9 (outside the code: service exposure and edge bypass, container images, dangling DNS, DMARC enforcement, backups and exercised restore, console MFA, registrar lock and token scope, database and cache principals, release signing key custody, signed over-the-air updates)  
9. [security-program.md](security-program.md) — ownership, vulnerability-reporting channel, IR minimums, periodic full audit, audit bridge (program layer)  
10. [security-client-mobile-surface.md](security-client-mobile-surface.md) — optional screenshot/recording hardening (SEC-M-MOB-\* ) when product requires sensitive screens; embedded web views (SEC-M-MOB-M3), attestation verdicts (SEC-M-MOB-M4) and OS permission scope (SEC-M-MOB-M5).

Non-normative code samples: [`../_meta/examples/security-code-samples.md`](../_meta/examples/security-code-samples.md).

---

## Related standards (outside this folder)

- [Error policy](../error-policy/error-policy.md) — error shape; do not leak secrets in messages.  
- [Logging policy](../logging-policy/logging-policy.md) — structured logging and safe transport configuration.  
- [Decision matrix](../decision-matrix/decision-matrix.md) — stack routing.  
- [Auth (client integration)](../auth/README.md) — where the selected client session/state stack uses Zustand/TanStack or a project-defined credential manager; SEC-D1–SEC-D3 and storage remain normative in this Security hub.
- [NoSQL query safety](../nosql-query-safety/README.md) — Zod-first Mongo filters, SEC-M-BE-NOSQL-1 bridge from [security-backend-controls.md](security-backend-controls.md).

---

This hub is not a standalone normative substitute — binding rows live in the part files listed above.

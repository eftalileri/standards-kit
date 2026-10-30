---
name: security-privacy-logging
description: Reviews how a project handles personal data and observability — PII inventory and flows to processors, leakage through logs, error trackers (scrubbing, source maps, breadcrumbs, replays) and analytics, retention and deletion, KVKK/GDPR engineering controls, security-event logging, alerting and incident readiness. Use it during a full audit or whenever logging, telemetry, a new processor or a personal-data field is added.
---

# Privacy, logging and incident readiness

## Purpose

Logs, telemetry and third-party processors usually hold more personal data, for longer, with wider access than the main database. This skill finds where personal data and secrets leak into those channels, checks that the controls privacy law expects exist in the code and configuration, and checks that the team would notice and handle an incident.

## When to use / not use

- Use: full audits; new logging, error-tracking, analytics, session replay or AI integration; new personal-data field; new processor or region; incident-readiness review.
- Not for: legal advice or document drafting (privacy notices, contracts). Legal points here are engineering orientation; confirm obligations with counsel.

## Procedure

1. **PII inventory.** Build the table in `references/pii-and-legal-controls.md` § Inventory from schemas, DTOs, forms and integrations: field, category (identity, contact, location, financial, health/special, children, credentials, device ids), store, purpose, who can read it (roles, tenants, operators), retention, processors that receive it.
2. **Egress map.** For each processor (error tracker, logging host, analytics, push, SMS/messaging, email, payment, maps, AI providers, support tools): which fields are sent, from which code (file:line), region, retention, whether a processor agreement exists (owner evidence).
3. **Log and telemetry sweep.** Search every logging call, error-tracker capture, breadcrumb, span attribute, analytics event and replay configuration. Trace what enters them: request bodies, headers, query strings, user objects, error objects that embed request data, database documents. Apply checks SK-PRV-01 to -05.
4. **Error-tracker configuration.** Review SDK init on every platform (server, web, mobile) and the server-side project settings (owner evidence): PII default flag, `beforeSend`/`beforeBreadcrumb` hooks, request body capture, server-side scrubbing rules, IP storage, replay masking, attachments, source-map handling, retention, member access, alert rules. Details: `references/error-tracker-checklist.md`.
5. **Retention and deletion.** For each store and processor: retention period, enforcement mechanism (TTL index, job, vendor setting), and whether account/tenant deletion cascades to caches, search indexes, files, backups (by expiry), logs and processors.
6. **Data-subject and tenant rights.** Access/export and deletion paths exist, are authorized (a user can only export their own data; a tenant only its own), complete, and logged.
7. **Security-event logging and alerting.** Check that the events in SK-PRV-07 are recorded with actor, tenant, target, result and correlation id, without secrets; that alerts exist for the high-signal ones; and that the error path fails closed.
8. **Incident readiness.** Check the items in SK-PRV-09: runbook, contacts, rotation procedures, evidence retention and breach-notification timing.
9. Send candidates to `security-finding-verification`. Evidence is a data-flow trace into the log/telemetry sink or a configuration export, never a copy of real personal data.

## Project decisions

If project documents record a deliberate decision (for example, sending full personal data to the error tracker for debugging), do not report the decision as a bug. Verify its compensating controls instead — processor agreement, region, retention, member access and MFA, scrubbing of credentials and secrets (which no such decision covers) — and list it under accepted risks.

With the kit, such a decision is the project's documented readership model under SEC-M-LOG-4 — credentials are never covered, and the same row says when the decision must be re-evaluated. Judge logs and crash events against SEC-M-LOG-3, SEC-M-LOG-4 and SEC-M-LOG-5, not against a generic "no PII in logs" rule.

A `Kit:` line names the kit rules that govern a check; the rule text in `<KIT_ROOT>/en/` is the requirement, the check is detection only (`security-audit-orchestrator/references/skill-set.md`).

## Checks

### SK-PRV-01 Credentials and secrets in logs or telemetry
- Look for: passwords, OTP/verification codes, session or refresh tokens, API keys, authorization headers, cookies, connection strings, reset links, webhook secrets reaching any log, error event, breadcrumb or span.
- Confirm: trace from the value to the sink with file:line; check that no redaction runs on that path.
- False positives: masked values; token prefixes/ids that cannot be used to authenticate. An unkeyed low-entropy hash is not a mask (kit SEC-M-LOG-4).
- Kit: SEC-M-LOG-1, SEC-M-LOG-3 (one wrapper scrubs every level), SEC-M-LOG-4 (masking criterion is live capability), SEC-N-LOG-1, SEC-N-LOG-3, SEC-N-KEY-1, SEC-M-CRYPTO-5 (a standing secret never reaches a log field), COB-RN-M3 and COB-RN-M8 (one shared credential predicate for client and server), SEC-M-SECRET-ACL-2 (CI logs).

### SK-PRV-02 Whole objects logged
- Look for: logging full request bodies, headers, user or customer documents, error objects that embed request config (HTTP client errors often carry headers and bodies).
- Confirm: the logged object's shape at that call site includes sensitive fields.
- False positives: objects passed through an allowlist serializer before logging.
- Kit: SEC-M-LOG-2 and SEC-N-LOG-2 (credential-bearing driver errors contained at their first boundary), SEC-M-LOG-3, SEC-M-LOG-5 and SEC-N-LOG-4 (no raw cursors, URLs or query strings), SEC-M-LOG-ACCESS-1 (access-log allowlist), logging-policy topic (`<KIT_ROOT>/en/logging-policy/`).

### SK-PRV-03 Error tracker leaks
- Look for: PII default flag enabled without decision; no `beforeSend`-style scrubbing of auth headers/tokens; request body capture on routes handling credentials or payment; breadcrumbs recording URLs with tokens, console output or network bodies; replays without input and text masking; user context carrying more than an id.
- Confirm: SDK init code per platform plus server-side settings evidence.
- False positives: covered by a documented decision with controls verified (see Project decisions) — still report credential leakage.
- Kit: COB-RN-M9 (client SDK default PII capture off unless a field-by-field review proves it safe), COB-RN-M2, COB-RN-M3, COB-RN-M4 (minimal non-PII global context), COB-RN-M8, SEC-M-LOG-4.

### SK-PRV-04 Source maps publicly served
- Look for: `.map` files deployed to the public web host or CDN, mobile bundles shipped with inline source maps, maps uploaded to the error tracker but not removed from build output.
- Confirm: build config and the deployed artifact listing (or a read-only request to a URL the owner named).
- False positives: maps uploaded privately to the error tracker and deleted from the public output.

### SK-PRV-05 Analytics and push payloads
- Look for: analytics events carrying names, phone numbers, emails, free text or precise location; push notification bodies containing appointment details, codes or PII visible on lock screens.
- Confirm: event/payload construction file:line.
- False positives: pseudonymous ids with no lookup available to the processor.
- Kit: SEC-M-XFER-1 (recorded permission at every transfer outside the trust boundary), SEC-M-XFER-2 (raw real-world identifiers never cross a provider, replay or log boundary), PAN-RN-M5 (analytics collection only after consent), NOTIF-BE-M9, NOTIF-BE-M11. Lock-screen visibility has no separate kit rule.

### SK-PRV-06 Retention and deletion gaps
- Look for: personal data with no retention rule; deletion that skips caches, search/vector indexes, file storage, processors or logs; soft-delete that keeps data queryable indefinitely; staging copies of production data.
- Confirm: deletion code path and store list; vendor retention settings (owner evidence).
- False positives: legal retention duties (invoices, tax) documented with purpose and period.
- Kit: PAY-M15 and PAY-M17 (subject deletion with retained financial history is an ordered teardown), SEC-M-NOSQL-6 (de-identify over delete), REP-M-27 (a retention window serves one class), RDS-M4 (every cache key expires). A general personal-data retention schedule has no kit rule.

### SK-PRV-07 Security events not recorded
- Look for: no record of login success/failure, MFA changes, password/email/phone changes, role and permission changes, tenant membership changes, admin impersonation, money/price/refund changes, data exports and deletions, webhook signature failures, rate-limit trips.
- Confirm: the code path for each event and whether it writes an append-only, tenant-scoped audit record or structured log with actor/target/result.
- False positives: events recorded by a managed identity provider with accessible logs.
- Kit: SEC-M-MON-1 (security-distinguishable codes in the production stream), SEC-S-AUDIT-1 (immutable audit trail for security and finance mutations — SHOULD), SEC-M-SUBJ-2 (a denied delegated access recorded for audit), SEC-M-SECRET-ACL-2 (break-glass access logged).

### SK-PRV-08 Alerting not wired
- Look for: errors and security events logged but no alert route; alert rules pointing to an unattended channel; error handler that swallows exceptions or returns success.
- Confirm: alert configuration evidence and error-handler code.
- False positives: none — "we would see it in the dashboard" is not alerting.
- Kit: SEC-M-MON-2 (per-key absolute-threshold alerts for the named classes), SEC-S-MON-2, error-policy N24 (no success envelope from a failure boundary), error-policy topic (which severity reaches which channel).

### SK-PRV-09 Incident readiness
- Look for: no runbook; no list of who to call; no secret-rotation procedure per credential; log retention shorter than detection time; no plan for regulator and user notification deadlines (72 hours under GDPR Art. 33 and KVKK Board guidance).
- Confirm: documents or owner statement; record absence as a finding with business impact.
- False positives: none.
- Kit: SEC-PROG-M-1 (named accountability path), SEC-PROG-M-2 (incident severity levels, first contact, tracking), SEC-PROG-S-1 and SEC-PROG-S-2 (SHOULD), SEC-M-LIFE-2 (per-credential rotation procedure). Notification deadlines have no kit rule.

### SK-PRV-10 Rights requests leak across users or tenants
- Look for: export/delete endpoints that accept a user or tenant id from the request; exports including other customers' data; deletion by one tenant removing shared records.
- Confirm: handler authorization and query scope with file:line.
- False positives: operator-only tools with audit and MFA.
- Kit: SEC-D3-M1, SEC-M-ZT-5, SEC-N-RESP-8 (own-account projection reaches only its own session), SEC-M-NOSQL-6.

## Stack notes (examples, optional)

- Node/Express: a single logger helper with structured `meta` makes redaction enforceable in one place (kit SEC-M-LOG-3); raw `console.*` calls bypass it. HTTP client errors (e.g. axios) carry request headers — log `code`/`status`, not the error object.- MongoDB: TTL indexes enforce retention for time-bound collections; deletion cascades need a list of every collection keyed by user or tenant.
- Redis: cached personal data needs expiry and must be evicted on deletion.
- React Native/Expo: the mobile error-tracker SDK can capture breadcrumbs from navigation, console and network; review its masking and the OTA bundle's source-map handling.
- Sentry: client DSNs are public by design; scrubbing, retention, IP storage and member access are project settings — evidence comes from the owner.
- Railway/Cloudflare: platform logs are another processor and retention point; edge logs may contain query strings.

## Output format

Finding records per `security-finding-verification/references/finding-schema.md`, plus the PII inventory and egress map as assessment appendices. Never paste real personal data into evidence; describe the field and cite the code.

## Do not report

- Logging of non-sensitive identifiers (internal ids, request ids, tenant ids) needed for debugging.
- Public-by-design values (client DSNs, publishable keys).
- Legal-text completeness (privacy notice wording) — outside engineering scope; mention once if obviously missing.

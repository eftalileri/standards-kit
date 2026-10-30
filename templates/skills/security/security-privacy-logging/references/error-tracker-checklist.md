# Error tracker and telemetry checklist

Written with Sentry names as the example; the same questions apply to any error tracker, APM or session-replay tool. Code items are verified from SDK init and capture calls; project-setting items need owner-provided evidence (export or screenshot with date).

Kit: the "expected" column is a reviewer's default; where the kit fixes the expectation, the kit row decides — COB-RN-M2, COB-RN-M3, COB-RN-M8, COB-RN-M9 (client SDK), SEC-M-LOG-3, SEC-M-LOG-4, SEC-M-LOG-5 (what may reach any observability egress), SEC-M-MON-2 (alerts).

## SDK configuration (each platform: server, web, mobile)

| Item | Look for | Good state |
|---|---|---|
| PII default flag (`sendDefaultPii` or equivalent) | Enabled? On which platforms? | Off, or on with a documented decision and the controls below |
| Event hook (`beforeSend`) | Present? What does it strip? | Removes auth headers, cookies, tokens, OTPs, passwords and query-string secrets on every platform |
| Breadcrumb hook (`beforeBreadcrumb`) | Console, navigation, HTTP and UI breadcrumbs | URLs with tokens scrubbed; network bodies not recorded; console breadcrumbs reviewed |
| Request data capture | Body, headers, cookies, query strings attached to server events | Bodies off for auth, payment and message routes; headers allowlisted |
| User context | What is attached as the user | Opaque id (and tenant id); no phone/email unless decided |
| Extra/context data | `extra`, tags, contexts, span attributes | No raw documents, request objects or error objects carrying request config |
| Session replay | Text masking, input masking, media blocking, network detail capture | Mask all text and inputs by default; network bodies off; unmask only reviewed, non-sensitive views |
| Attachments / screenshots | Automatic screenshots on mobile errors | Off on screens with personal or payment data |
| Sampling | Traces and replays sampled | Lower rates on sensitive flows reduce exposure |
| Release and environment | Release names and environments set | Lets incidents be scoped; staging not mixed with production |

## Source maps and debug files

| Item | Good state |
|---|---|
| Web | Maps uploaded to the tracker during build, then deleted from public output; host does not serve `*.map` |
| Mobile JS/Hermes bundles (store and OTA) | Maps uploaded per release/update; not shipped inside the public bundle |
| Native debug symbols | Uploaded privately |
| Upload credential | Auth token used for upload has only release/upload scope and lives in build secrets, not in the repo or the bundle |

## Project settings (owner evidence)

| Item | Good state |
|---|---|
| Server-side scrubbing | Default scrubber on; extra sensitive-field names added (token, otp, code, secret, password, authorization, cookie, phone if decided) |
| IP address storage | Off unless needed and recorded |
| Retention | Set to the shortest period that supports debugging; recorded in the retention table |
| Members and access | Least privilege; MFA enforced; former staff removed; no shared logins |
| Integrations / data forwarding | Each forward target is a processor in the register |
| Alert rules | New-issue and regression alerts for production; spike alerts; routed to a watched channel |
| Region | Data residency recorded in the processor register |

## Logging host (platform logs, log drains)

- Structured logger with a central redaction step; raw console calls bypass it.
- Retention and access recorded; log drains are processors.
- Query strings and headers in access logs reviewed for tokens.

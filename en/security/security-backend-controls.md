# Security — backend controls (CSRF, rate limit, headers, input, upload, CORS, zero trust)

```kit-cover
type: normative
part-of: README.md
binds: the backend control surface -- SEC-M-CSRF-1, SEC-M-HELMET-1, SEC-M-BE-NOSQL-1, SEC-M-WH, SEC-M-UP and SEC-S-UP-2, SEC-M-CORS-1, SEC-N-CORS-1, SEC-M-SSRF-1, SEC-M-INPUT, SEC-M-REDIRECT-1, SEC-N-EXEC-1, SEC-N-ROUTE-1, SEC-N-RESP, SEC-M-RESOURCE-MONEY-1 and the failure path
open-when: shape:backend-heavy, signal:api-endpoint, signal:rate-limit, signal:security-headers, signal:file-upload, signal:cors, signal:ssrf
skip-when: signal:client-only, signal:no-backend-surface
owns: SEC-M-CSRF-1, SEC-M-HELMET-1, SEC-M-BE-NOSQL-1, SEC-M-WH-1, SEC-M-WH-2, SEC-M-WH-3, SEC-M-UP-1, SEC-S-UP-2, SEC-M-UP-3, SEC-M-UP-N1, SEC-M-CORS-1, SEC-N-CORS-1, SEC-M-SSRF-1, SEC-M-INPUT-1, SEC-M-INPUT-2, SEC-M-INPUT-3, SEC-M-REDIRECT-1, SEC-N-EXEC-1, SEC-N-ROUTE-1, SEC-N-RESP-1, SEC-N-RESP-2, SEC-N-RESP-3, SEC-N-RESP-4, SEC-N-RESP-5, SEC-N-RESP-6, SEC-N-RESP-7, SEC-N-RESP-8, SEC-M-RESOURCE-MONEY-1
```

Normative parts split out of this file: [zero trust — server authority and provider evidence](security-zero-trust-authority.md) (SEC-M-ZT-1, SEC-M-ZT-2); [zero trust — tenant scope, membership gates and recovery anchors](security-tenant-scope-gates.md) (SEC-M-ZT-3, SEC-M-ZT-5, SEC-M-ZT-8); [zero trust — the actor-class gate](security-actor-class-gates.md) (SEC-M-ZT-6); [subject-owned resources and skippable gates](security-subject-owned-resource-access.md) (SEC-M-SUBJ-1, SEC-M-SUBJ-2, SEC-M-SUBJ-3, SEC-M-SUBJ-4); [rate limiting and the client-address authority](security-rate-limiting.md) (SEC-M-RL-1–SEC-M-RL-5, SEC-S-RL-2).

Scope

- Included: Conditional SEC-M-CSRF-1, rate limiting, Helmet / security headers, MongoDB / NoSQL bridge (SEC-M-BE-NOSQL-1), webhook exception, upload rules, CORS, SEC-M-ZT-1–SEC-M-ZT-3. SSRF minimum when surface exists (OWASP A10). Request input shape, redirects, server-side code execution and the production route set (SEC-M-INPUT-1–SEC-M-INPUT-3, SEC-M-REDIRECT-1, SEC-N-EXEC-1, SEC-N-ROUTE-1). NoSQL detail: [`nosql-query-safety`](../nosql-query-safety/README.md).

Document type: Normative — SEC-M- / SEC-N- rows below.

Environment: Backend API and web-facing origins; mobile apps do not require CORS (no browser origin).

References: [Authorization decision gate](security-authorization-decision-gates.md) (SEC-D3); [Enforcement and N/A](security-enforcement-and-na.md) (SEC-NA-1); [NoSQL query safety](../nosql-query-safety/nosql-zod-and-sanitizefilter.md) (SEC-M-NOSQL-*, GSEC-NOSQL1); [Cryptography](security-cryptography.md); [Client transport](security-client-transport.md) (web headers complement).

Code samples: [`../_meta/examples/security-code-samples.md`](../_meta/examples/security-code-samples.md).

---

## SEC-M-CSRF-1 — Web + HttpOnly cookie session (conditional)

Condition: Session carried by HttpOnly Secure cookie on web. SEC-M-CSRF-1 **must** apply: SameSite (prefer Strict or appropriate Lax) + Secure in production; state-changing requests **must** use CSRF token, double-submit cookie, or equivalent; GET **must not** change server state; CORS + credentials **must** match allowed origins. [Consequence: Merge blocked / bug] [Verify: Web auth static review and real-run observation]

Condition: API-only Bearer mobile clients (no browser cookie session). SEC-NA-1 — CSRF N/A for this surface. [Verify: Security register]

Condition: one backend serves both a bearer surface and a cookie surface. One carrier resolver **must** decide every request: the bearer header keeps its released semantics; the session cookie **must** be accepted only when `Origin` equals the web app's exact origin and **must not** be accepted on a request without `Origin` — a cookie admitted on the no-origin branch is CSRF-reachable from any non-browser caller and bypasses the origin check that stands in for SameSite between sibling subdomains. Each session token **must** carry a signed surface claim bound to its carrier (cookie-surface token only in the cookie, bearer-surface token only as bearer), so a token lifted from one carrier cannot be replayed through the other. A sign-in from the cookie surface **must not** return the token in the response body; the body carries only the CSRF token, which the client holds in memory. A public route that also identifies a signed-in caller **must** resolve that optional identity through the same resolver, never by reading one carrier's header itself — a route that checks only the bearer header silently treats every cookie-surface caller as anonymous; the cookie surface declares its session with the CSRF header, because the browser attaches a left-over cookie on its own and that must not turn an anonymous request into a refused one. [Consequence: Security bug — token readable by page script, or cookie accepted cross-origin] [Verify: Security review of the resolver, the CORS allowlist and the CSRF check together; real-run rejection of a foreign and a missing `Origin`]

---

## Rate limiting

The rate-limit family — [SEC-M-RL-1](security-rate-limiting.md), [SEC-S-RL-2](security-rate-limiting.md), [SEC-M-RL-3](security-rate-limiting.md), [SEC-M-RL-4](security-rate-limiting.md) and the client-address authority [SEC-M-RL-5](security-rate-limiting.md) — lives in [security-rate-limiting.md](security-rate-limiting.md).

---

## Security headers (Helmet)

SEC-M-HELMET-1: Backend **must** use Helmet (or equivalent documented stack) with CSP configured, HSTS in production HTTPS contexts, X-Content-Type-Options: nosniff, XSS-related protections per Helmet defaults unless documented exception. A route whose published, non-sensitive bytes another first-party origin embeds (e.g. a public image) **must** relax `Cross-Origin-Resource-Policy` to `cross-origin` on that route's response only, never globally — Helmet's `same-origin` default makes the browser drop the embed. [Consequence: Bug] [Verify: App bootstrap review]

---

## MongoDB / NoSQL input (SSOT bridge)

SEC-M-BE-NOSQL-1: HTTP handlers that execute MongoDB queries **must** comply with nosql-query-safety (SEC-M-NOSQL-1–SEC-M-NOSQL-4, SEC-M-NOSQL-8, SEC-N-NOSQL-1–SEC-N-NOSQL-4, GSEC-NOSQL1, SEC-M-NOSQL-WH-1 where applicable). [Consequence: STOP — merge blocked] [Verify: PR checklist + nosql audit]

2g local minimum: SEC-M-BE-NOSQL-1 **must** be read with the linked file — **must not** merge raw req.body/req.query Mongo filters or projections without GSEC-NOSQL1 satisfaction (SEC-N-NOSQL-4 included).

---

## Webhook exception (documented)

SEC-M-WH-1: Third-party webhooks may bypass body Zod at the raw edge only when all hold: payload validated in parent controller with typed shape; req.body used only for audit / raw storage and never as a MongoDB filter; HMAC or equivalent signature verified before trust. [Consequence: Bug if any condition fails] [Verify: Webhook handler review]

SEC-M-WH-2: CI / static checks **must** treat rawPayload: req.body (or documented equivalent pattern) as webhook storage — not a SEC-N-NOSQL-2 violation when SEC-M-WH-1 and SEC-M-NOSQL-WH-1 hold. [Consequence: Process bug] [Verify: CI rule doc]

SEC-M-WH-3: A webhook signature **MUST** be verified over exactly the input the provider signed, with a constant-time compare: where the provider signs the request URL together with the payload, against the endpoint's configured public URL (one config constant), never a URL rebuilt from the request (host, scheme or forwarded headers); where it signs the body, over the raw request bytes captured before any parser, never a re-serialized parsed body. Reason: behind a proxy the rebuilt URL differs from the one the provider signed, and a re-serialized body differs in whitespace, key order or escaping, so either every genuine callback fails or a caller-controlled header chooses what the signature is checked against. A missing signing secret fails closed. [Consequence: Bug — inbound provider evidence rejected or forgeable] [Verify: Webhook handler review]

---

## Upload and file validation

SEC-M-UP-1: If user file upload exists: allowlist MIME / extension; do not trust Content-Type alone — magic-byte or signature check preferred; max size and multipart limits documented; files **must not** be served from executable directories — prefer object storage + short-lived URLs; random safe filenames; path traversal (..) forbidden. [Consequence: Bug] [Verify: Upload pipeline review]

SEC-S-UP-2: SHOULD: malware scan — if omitted, risk note required. [Consequence: Risk acceptance note] [Verify: Security note]

SEC-M-UP-3: Each object-storage bucket and its access seam (config reader + credentials) **MUST** serve one data class with one visibility, retention and encryption policy; a new class (e.g. user-uploaded images) **MUST NOT** reuse another class's bucket or credentials (e.g. backups) — mixed policies leak or delete data and shared credentials widen the blast radius. [Consequence: Bug] [Verify: Review — each bucket's config reader is a registered single-purpose authority]

SEC-M-UP-N1: If product has no upload surface, SEC-NA-1 for SEC-M-UP-1. [Verify: Security register]

---

## CORS (browser clients only)

SEC-M-CORS-1: Production web origins **must** be allowlisted; no origin (typical mobile) may be allowed per policy without opening wildcard web abuse — documented behavior. Credentials with cookies **must** match SEC-M-CSRF-1 alignment. Every allowlist entry **must** be an exact origin compared by equality; a regex, prefix, suffix or wildcard match (e.g. a hosting provider's shared preview namespace, where anyone can claim a matching name) **must not** grant a credentialed origin, and preview-deployment origins are not allowlisted. Deployment-configured entries are parsed at boot as exact origins and fail startup otherwise. `allowedHeaders` **must** list every request header the shared API client can send, by the same shared constant the client uses (never a retyped string): a missing one fails the browser preflight of every request that carries it — mobile sends no preflight, so only the web app breaks. [Consequence: Bug] [Verify: CORS config review]

SEC-N-CORS-1: **Must not** rely on CORS for mobile security — mobile does not send browser CORS the same way. [Consequence: Design bug] [Verify: Architecture review]

---

## Zero trust — server authority (moved)

The rows SEC-M-ZT-1 (with its three notes) and SEC-M-ZT-2 are defined in [security-zero-trust-authority.md](security-zero-trust-authority.md); SEC-M-ZT-4 in [security-global-identity-lookup.md](security-global-identity-lookup.md); SEC-M-ZT-3 and SEC-M-ZT-5 in [security-tenant-scope-gates.md](security-tenant-scope-gates.md); SEC-M-ZT-6 in [security-actor-class-gates.md](security-actor-class-gates.md); SEC-M-ZT-7 in [security-tenant-published-profile.md](security-tenant-published-profile.md).

---

## SSRF (when surface exists)

SEC-M-SSRF-1: If the product fetches user-supplied URLs server-side: allowlist hosts/schemes + Zod URL schema; if no such surface, SEC-NA-1 (OWASP A10). [Consequence: Bug when surface exists] [Verify: Architecture + code search]

---

## Request input and server-side execution

SEC-M-INPUT-1: A key taken from request or stored user data **MUST NOT** be deep-merged, path-assigned or written as a computed key into an object that inherits from `Object.prototype`; a copy keyed by such keys **MUST** use a null-prototype accumulator or a `Map`, or admit only an allowlisted key set that excludes `__proto__`, `constructor` and `prototype`. A caller-controlled key that reads a plain-object table **MUST** first be narrowed to the table's closed key set by the boundary schema, or be checked as an own property. Reason: assigning `__proto__` replaces the target's prototype — the field vanishes from the copy, and a recursive merge reaches `Object.prototype` and changes every object in the process — while reading an inherited name returns a function where data was expected. [Consequence: Bug — security] [Verify: review of every loop that copies caller keys and every computed lookup keyed by input]

SEC-M-INPUT-2: A query-string or route-parameter value **MUST** be narrowed to its expected type by the boundary schema, or by an explicit type check that admits only that type, before any use; a raw value **MUST NOT** be coerced (`String()`, `Number()`, `parseInt`, template text, truthiness) or handed on unnarrowed. Reason: a repeated query key arrives as an array and an extended parser yields nested objects, so an unnarrowed value silently changes meaning (`String(['2','3'])` is `"2,3"`) or reaches a sink as an operator object; the database-filter half is [SEC-M-NOSQL-1](../nosql-query-safety/nosql-zod-and-sanitizefilter.md). [Consequence: Bug] [Verify: review — raw `query` / `params` member reads outside a parse gate]

SEC-M-INPUT-3: Untrusted structured input **MUST** be size-bounded where it is parsed, and every recursive walk over it (copy, redaction, scrub, normalization) **MUST** carry a depth bound and an entry bound. A regular expression applied to untrusted text **MUST NOT** allow catastrophic backtracking: no quantified group whose body can match the same text in more than one way, and no adjacent unbounded quantifiers over overlapping characters. A pattern built from input is [SEC-M-NOSQL-10](../nosql-query-safety/nosql-zod-and-sanitizefilter.md). Reason: one request with deep nesting or a crafted string holds the event loop, and with it every tenant on the instance. [Consequence: Bug — availability] [Verify: review; a star-height scan of the regex literals applied to input]

SEC-M-REDIRECT-1: A redirect target — a server `Location` header, an intent or fallback address, or a client navigation to an address that arrived in a link, query or message — **MUST** come from a closed server-side set: a route key mapped to a fixed or configured origin, or an address the server built and stored itself. A query or body parameter, path text, `Referer` or forwarded header **MUST NOT** choose it, and prefix, substring or regex validation **MUST NOT** stand in for the closed set. A self-address rebuilt from the request's own `Host` names only the origin the request reached and is allowed on a response no shared cache stores. Reason: an attacker-chosen target turns the product's trusted domain into a phishing hop and a token-leak path; a delegated-authorization return address is held to the same closed set, and a native link open is [COB-RN-M5](../client-observability-rn/outbound-link-ownership-and-visibility.md). [Consequence: Bug — security] [Verify: review of every redirect, `Location` and navigation sink]

SEC-N-EXEC-1: Text from a request, a stored record or another service **MUST NOT** become code or a command: no `eval`, `Function` constructor, string-bodied timer or `vm` evaluation of it, and a child process **MUST** start from an argument vector without a shell, never from an interpolated command string. Reason: either path hands the caller the server process. Enforced by the upstream lint rules `no-eval`, `no-implied-eval` and `no-new-func` over every linted tree; `vm`, an aliased global and child processes are review-held. [Consequence: Critical security bug] [Verify: the named lint rules + review]

SEC-N-ROUTE-1: A debug, test, seed, fixture or diagnostic route **MUST NOT** be registered in the code the production process starts — an environment flag around its mount is not an exclusion — and every route the process serves **MUST** be mounted where the boot-time route access-declaration check sees it ([missing sibling guard](security-enforcement-and-na.md)). Reason: a flag-gated mount opens in production on one misread or absent flag, and a mount outside the checked stack escapes the deny-by-default declaration. [Consequence: Bug — security] [Verify: review of the route registry and the start path]

---

## Sensitive data in responses

SEC-N-RESP-1: **Must not** return passwords, full payment card data, private keys, or raw secrets in API responses. [Consequence: Bug / compliance] [Verify: DTO review]

SEC-N-RESP-2: The response body is an egress surface, and raw caught-error text **must not** cross it — under any status, environment, or flag. The reasoning that bans unkeyed free text from logs applies unchanged here and is in fact stricter, because this surface reaches an untrusted client: `message` / `stack` / `cause` / stringified throwables cannot be *proven* free of credentials, connection strings, internal paths, or another tenant's data by any key-based filter (see [security logging](security-logging-core.md) SEC-M-LOG-2, SEC-M-LOG-4). Any operator-facing diagnostic that may legitimately appear on the wire is placed there only by the single error boundary, under the one condition that boundary owns — never by a handler that answered around it. Normative detail and the "the diagnosis is moved, not deleted" obligation: error policy [M30](../error-policy/transport-i18n-and-classification-rules.md) / [N22](../error-policy/error-policy-prohibitions.md). [Consequence: Security bug — internal diagnostics or embedded credentials disclosed to clients] [Verify: Scan every response-writing site for caught-error text reaching a body field; assert the diagnostic-presence condition exists only inside the boundary]

SEC-N-RESP-3: A surface that deliberately masks an identity **must not** also carry the raw one. The leak is one convenience field beside the masked label, and nothing looks missing: the mask is still there. Both halves: the exported contract **must not** declare the raw identifier, and the response literal **must not** set it; a module-private row may hold it, being the mask's input. [Consequence: Privacy bug — masking void while appearing present] [Verify: AST rule over exported contract members and response properties; query/projection forms exempt]

SEC-N-RESP-4: A multi-record response that can include another subject's data **MUST** apply the same record-level privacy and financial-visibility decision and omission projection used by its single-record sibling before serialization. Tenant access or list filtering alone does not authorize embedded payment, refund, price, balance, history, or snapshot price fields. A group total can disclose other members' amounts even on the viewer's own row, so its visibility needs the aggregate permission independently. Resolve one viewer's ownership facts once per request, then apply the single authority to every row; do not issue a roster read for each row. Preserve non-financial snapshot facts and counts where needed for operational use. Dashboard or owner-named routes carrying the same record DTOs obey the same rule when delegated actors can call them. [Consequence: P1 financial disclosure] [Verify: review list/detail egress builders, sibling routes and indirect helper paths; use the enforcement mechanism the adopting project documents (for example a single-file check on known egress builders, or a response-contract discriminant enforced by the type check), and record its actual scope and limits — a newly added endpoint or an indirect helper path is not enumerable from one file's syntax tree]

SEC-N-RESP-5: An organization-level dashboard that delegated actors can enter **MUST** derive revenue visibility from the actor's authorized financial scope before loading or serializing money. A general organization revenue total cannot be authorized by a delegate's permission to see their own revenue. Keep permitted operational counts available, but omit the revenue field entirely when the viewer lacks the organization-wide revenue scope; zero is a valid amount, not a concealment value. A sibling summary with a per-actor filter **must** use the same scope decision, so neither endpoint widens it through a different response shape. Released clients may still call the old endpoint; the server omits only the forbidden optional field and leaves the route intact. A report applies the same decision to every money read it makes: each read **MUST** derive its person/seller scope on the server from the viewer's resolved actor through that one decision — never take the client's person filter as the scope and never omit it — and a loader that accepts the scope as a parameter takes it as a required server-minted value, because one half read organization-wide beside a self-locked half discloses everyone else's revenue inside a report the viewer is allowed to open. [Consequence: P1 financial disclosure] [Verify: review the visibility decision, conditional money reads, the omission branch, sibling routes, old-client consumers, that every report half asks the same decision, and that a new report money read uses the scope; where the adopting project has an automated check on the dashboard decision or a type-level server-minted scope, record its actual scope and limits]

SEC-N-RESP-6: Where the product tiers delegated actors' money visibility, that tiering **MUST** be one decision with two answers, applied by every surface that carries money — record and list responses, write responses, deletion previews, payment lists, home summaries, notification bodies and reports. (1) A single record's own money (its price, catalogue/list price, collections, remaining receivable) is visible to every delegate tier that passes the record's read gate, including a restricted tier on another person's record; no surface withholds it. (2) An aggregated money figure — any sum or summary across records (summary-card totals, payment-list totals, group totals, deletion-preview summaries, spend summaries, reports) — is visible only to a tier with financial visibility; a restricted tier sees none, on any surface, with the single exception of its own commission, which its own commission decision serves. Reason: the restricted tier must work every record (price it, collect on it) but must not see computed totals of the business. A list scope (which records a payment list returns) is separate from visibility: a restricted tier's payment lists stay locked to its own work while each listed record shows its money. Where a released client's response contract requires an aggregate field, the server sends a neutral zero instead of the figure to a viewer without aggregate visibility — a released client may still draw the field, so the real figure would disclose it, while omitting it would fail the whole response's parse — and the current client does not draw it; an optional aggregate field is omitted, never zeroed. Seeing money grants no write. This decision is recorded by the product owner and **MUST NOT** be reopened without an explicit new owner decision. [Consequence: P1 disclosure of aggregate business figures, or record money hidden from delegates who must work the record] [Verify: a check on record egress that passes the common projection withholding group totals, where the adopting project has one; that every surface asks the one decision is review-held]

SEC-N-RESP-7: A response a subject actor can receive **MUST** pass, at final egress, its entity's single subject-surface projection, which omits delegate and owner account identifiers that are personal data (a phone-number user id on a creator, seller, assignee, canceller or admin field), delegate-internal notes, admin fields, the tenant's commercial or subscription metadata, and the tenant's own record of the subject — the name and contact it typed on its own subject record and every display name or snapshot derived from them, even when no screen shows them. Reason: the read gate admits the subject to its own record, but the record carries delegate data that gate never decided, and a tenant-entered subject name is the tenant's private label, not the subject's name ([NOTIF-BE-M11](../expo-notifications/backend-dispatcher-audience-and-egress.md)). A wide entity's subject view is an allow-list, so a field added later stays off the subject surface until it is named. A read-model whose purpose is delegate work (an edit context, an assignable-delegate list) gates the actor class instead of being projected. A field a released client validates as required stays on the subject surface until a replacement reference has shipped ([DCD-M8](../dead-code/dead-code-rules.md)). [Consequence: Privacy bug — delegate phone numbers, internal notes or the tenant's commercial data disclosed to subjects] [Verify: review — route gate kind, final egress builder, actor-role branch]

SEC-N-RESP-8: A user account's own-account projection — consents, preferences, legal-acceptance state, login and device stamps, role history, and similar account state — **MUST NOT** reach any viewer other than that account's own session; a response carrying another person's account **MUST** build it with the single peer-account projection, an allow-list of the fields its consumers read. Reason: the own view is built for the account holder, and its stamps (last login, a daily device report) disclose another person's private choices and app activity to whoever lists or removes them. A released client's read of a field keeps it on the peer view until that client is gone ([DCD-M8](../dead-code/dead-code-rules.md)). [Consequence: Privacy bug — another person's consent, preferences and activity disclosed] [Verify: review — viewer of every own-view call site]

SEC-M-RESOURCE-MONEY-1: Money visibility limits what an actor sees, never the record workflow (a decision recorded by the product owner). One decision authority **MUST** answer "may this actor write money on this record" for create, edit and collection commands alike, over a closed operation set: appending a collection, pricing a new record, re-selecting a catalogue item (the price then derives server-side from the catalogue) and a full refund whose amount the server derives are open to every delegate of the tenant. Overwriting an existing money value the actor cannot see — the stored custom price, a related bundle price, or a replacement of the payment ledger — **MUST** be rejected in every preflight and transactional write path before writing, because a blind overwrite silently destroys a value the actor never saw (a released client sending the hidden price as `null` is the typical case). The gate asks for the field's presence, never compares it with the hidden value (no equality oracle). A changed catalogue selection is detected through one canonical comparison with the stored selection so an old client resending unchanged IDs does not turn ordinary status/time/note edits into price work. Recheck the decision against the fresh record in every transaction attempt; once collection no longer depends on ownership, a stored success that carries money the current viewer may no longer see (SEC-N-RESP-6) is replayed only after that visibility is re-proved. When the transaction also writes a separately money-owning child record, the parent record's ownership is not permission for that child: read its current ownership in the same transaction and apply the child's own server authority before the first child write. A client hiding price fields or omitting them in a new build is not a server authorization gate. The current client **MUST** omit withheld payment and price fields from its form payload and skip price derivation on such records; an absent payment ledger is not an empty ledger. Released clients that still send an overwrite field receive an explicit denial, never silent acceptance. [Consequence: P1 unauthorized financial mutation, or a workflow blocked against the recorded owner decision] [Verify: review the named preflight and transaction writers, including child read-gate-write order; where the adopting project has a single-file check on those writers, record its scope; route-to-writer discovery and money-affecting field inventory remain cross-file review obligations]

---

## Failure path (normative)

New protected route without SEC-M-ZT-1 / SEC-D3 alignment -> STOP — implement server authz.

Handler that resolves tenant/company scope without a traceable actor-class gate in the same request, a claimed gate that only narrows the record set instead of rejecting the actor class (or a resolver/business rule presented as one), or a fix of that class shipped without a mechanical check that blocks the next ungated sibling (SEC-M-ZT-6) -> STOP.

Client-initiated external-provider projection route without SEC-M-ZT-2 fresh matching-item/environment gate, persisted provider reference without preserved environment provenance, later live provider operation without a current-runtime gate, provider webhook projection without authenticated known-event/environment evidence, or dependent provider side effect that can run before its required durable recovery/reference anchor (SEC-M-ZT-3) -> STOP.

Cookie web session without SEC-M-CSRF-1 -> STOP — add CSRF controls.

Global sanitizeFilter enabled -> STOP — SEC-N-NOSQL-1; per-query only per nosql SSOT.

---

Migration note: Map prior backend-control guidance to these identifiers and remove duplicate definitions. NoSQL / sanitizeFilter detail: [`nosql-query-safety`](../nosql-query-safety/README.md).

Part of: [README.md](README.md).

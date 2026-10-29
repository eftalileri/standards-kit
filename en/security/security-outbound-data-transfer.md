# Security — outbound transfer of personal data to a third party (SEC-M-XFER-1, SEC-M-XFER-2)

```kit-cover
type: normative
part-of: README.md
binds: SEC-M-XFER-1, SEC-M-XFER-2 -- the permission a server must hold at the moment it transfers a subject's personal data to a third-party receiver, and the identifiers such a transfer, its durable replay row and its log lines may carry
open-when: shape:backend-heavy, signal:analytics-attribution, signal:external-provider, signal:outbound-call, signal:publication-consent, signal:pii-masking
skip-when: signal:no-external-provider, signal:no-telemetry-change
owns: SEC-M-XFER-1, SEC-M-XFER-2
```

Scope: The outbound direction of the security subject — not who the server believes and not which rows a caller may read, but what the server itself may send out about a subject, and under whose permission. The zero-trust bands answer the inbound questions and are a different family: [security-zero-trust-authority.md](security-zero-trust-authority.md) (SEC-M-ZT-1, SEC-M-ZT-2 — the evidence the server accepts), [security-global-identity-lookup.md](security-global-identity-lookup.md) (SEC-M-ZT-4 — the tenant proof before a globally keyed lookup, and what a cross-subject surface may carry) and [security-tenant-published-profile.md](security-tenant-published-profile.md) (SEC-M-ZT-7 — the bounded case in which a tenant's own publication opt-in lets its attributes travel on such a surface). Those three govern a reader pulling data out of the system; this band governs the system pushing a subject's data to a receiver the subject cannot query, audit or delete from. The two families share vocabulary — consent, identifier, disclosure — and share no obligation, so neither substitutes for the other.

Document type: Normative part — SEC-M-XFER-1, SEC-M-XFER-2.

References: [README.md](README.md); [security-logging-core.md](security-logging-core.md) (SEC-M-LOG-2 — raw caught-error text as a disclosure channel); [security-logging-correlation-and-fields.md](security-logging-correlation-and-fields.md) (SEC-N-LOG-2); [security-global-identity-lookup.md](security-global-identity-lookup.md) (SEC-M-ZT-4 — why deriving a pseudonym from a subject identifier is not anonymisation); [logging-policy](../logging-policy/background-boundaries-and-sink-safety.md) (M25 — structural evidence instead of opaque text at a background boundary); [idempotency](../idempotency/key-scope-and-replay-contract.md) (the replay contract a queued transfer inherits); [SSoT](../ssot/ssot-principles-and-precedence.md) (SSG-M8 — one authority per question); [structural invariants](../authoring/kit-structural-invariants.md) (KIT-INV-8 — portability and naming the enforcing check).

---

## Outbound transfer — the permission, and when it is read

SEC-M-XFER-1: Every transfer of a subject's personal data outside the trust boundary **MUST** prove the subject's recorded permission at the transfer boundary.

- (a) Every dispatch path consumes one permission reader; only the subject's explicit consent write path writes its value. Startup/default effects **MUST NOT** fabricate a choice. A notice-only regime does not remove the requirement for a disclosed user act; until then no record exists.
- (b) Missing record/field, ambiguous lookup and read failure **MUST** return denied, not throw a third state the dispatcher might treat as permission.
- (c) The gate **MUST** precede both subject-data reads for payload construction and every one-shot resource consumption (dedupe/idempotency claim/sequence). A refused send must neither gather data nor burn a future permitted send's key.
- (d) Replay **MUST** re-read permission immediately before dispatch; enqueue-time consent or a row copy is not current authority. Non-granted permission, withdrawal, deleted/unresolved subject **MUST** remove the queued row, never retry/backoff. The row carries the re-checkable handle of SEC-M-XFER-2(c).

[Consequence: Critical irreversible privacy disclosure; **must not** ship]
[Verify: Dispatcher/replay call-graph and ordering review: one reader, deny-on-read-failure, gate-before-payload/key, fresh replay decision, denied-row removal.]

SEC-M-XFER-1(a) application — acceptance of published terms and privacy notice. The same evidence shape binds the record of what the subject agreed to: it is written only from the subject's own act (the sign-up or accept control next to the linked documents), and it **MUST** carry the version of each document as shown, the display language and a server-stamped time — a bare boolean cannot prove which text was accepted. The server **MUST** reject an acceptance naming a version other than the current one, and on sign-up before any irreversible step (one-time code consumption). Whether re-acceptance is due is derived on the server from the stored versions against the current ones and published as a flag; clients read the flag and never compare versions themselves. A released client that sends no acceptance is not rejected (DCD-M8); its account simply has no record and is asked on the next session.

SEC-M-XFER-1 application — commercial messages to an end recipient. A business-initiated promotional message **MUST** be sent only when that recipient's consent fact is granted and every consent registry the recipient's jurisdiction mandates confirms it, both read immediately before the provider call (d). The consent fact has one writer, every send reads it through the one permission reader (a), and the fact records state, source, time, the consent text version and the recorder; a stop request on any channel **MUST** revoke through that writer at once; consent **MUST NOT** be inferred from silence, a pre-ticked control or the commercial message itself. The fact **MUST** name the address it was given for: a grant is in force only while that address is the recipient's current one, a refusal survives an address change — consent is given for an address, and a corrected or reassigned number must not inherit it. A grant **MUST** store the text exactly as the recipient was shown it — version, language and the rendered wording with its variable parts (such as the sender's name) as of that moment — composed from one frozen text authority that both the capture surface and the server read; a version's wording **MUST NOT** change once grants cite it — a stored version number alone cannot prove which words were agreed to once a translation or a name changes. A grant captured beside another operation (an opt-in ticked while completing another operation) **MUST** be written only after that operation committed and **MUST NOT** fail it — a failed write is reported once and leaves consent absent — because consent for an operation that did not happen is not consent and the recipient's goal must not depend on it; a refusal path **MUST NOT** be gated by product availability checks (an open public page, an allowed-actions answer), only by proof of whose record it is. Reason: an unlawful commercial message cannot be recalled and is fined per message. Review-held ([ENA-GV3](../enforcement-architecture/enforcement-admission.md)): whether a send is promotional is a product classification no syntax carries.

---

## Outbound transfer — what may cross the boundary

SEC-M-XFER-2: Provider request, durable replay row and log are separate egress boundaries. A real-world phone/email/national-id/account key **MUST NOT** cross any in raw form; one normalization authority per identifier kind produces the deterministic digest all producers consume.

- (a) Upstream event/business/dedupe keys that embed a real-world identifier are personal data too. Digest at this boundary and reuse exactly that digest for the live attempt and queued dedupe identity.
- (b) A durable failure field **MUST** contain only a registered error code or pattern-validated class identity, never opaque provider/driver response text. Credential containment is [SEC-M-LOG-2](security-logging-core.md); this durable boundary additionally prevents raw third-party text surviving every replay.
- (c) The replay subject is one stable opaque server-minted handle resolvable only by the permission authority, never the raw identifier, an identifier-derived handle or cached consent. Zero/multiple resolutions are denied; re-consent does not break the stable handle.
- (d) Anonymous ingress **MUST NOT** accept or forward caller-supplied identity/digests whose subject the server has not resolved. Anonymous dispatcher input types carry `never` identity fields; digest rules apply only to server-resolved identities.
- (e) A plain hash of a phone, email or other enumerable identifier is reversible by enumeration. An identifier the receiver only needs as a stable pseudonymous key (an analytics `user_id`/`client_id`) **MUST** be a keyed digest (HMAC with a server-held secret under the standing-secret rules), with no fallback to the plain hash when the key is missing. A plain digest is allowed only where the receiver's matching protocol requires it (an ad platform's hashed phone/email match field).
- (f) A digest sent for receiver-side matching **MUST** hash the canonical stored value encoded exactly as the receiver's matching spec requires (for example phone: digits with country code, no `+`). The encoding works only on the canonical value; it never re-parses raw input. A digest the receiver cannot match is a silent measurement loss.

[Consequence: Critical disclosure, planted third-party identity or broken receiver deduplication; **must not** ship]
[Verify: Inspect provider, replay and logging separately; prove one normalization and exact live/replay key identity. Existing raw-caught-error metadata/response fences **MUST** cover the durable patch sink too where their predicate can decide it; confirm actual reach, not a duplicate checker (SSG-M8).]

Verification boundaries: writer uniqueness, a real user act, permission/key call semantics and identifier meaning require cross-file/runtime review. A name list cannot prove these relationships or detect a renamed future dispatcher. Single-function ordering and denied replay removal are locally inspectable; an admitted fence still needs the adopting project's admission and proof requirements.

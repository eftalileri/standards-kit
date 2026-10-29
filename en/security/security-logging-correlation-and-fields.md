# Security — logging: correlation, access logging, prohibitions and the field-area map

```kit-cover
type: normative
part-of: README.md
binds: SEC-M-LOG-CORR-1, SEC-M-LOG-CORR-2, SEC-M-LOG-ACCESS-1 and SEC-N-LOG-1 to SEC-N-LOG-4 -- the correlation id on every request-serving line, the untrusted inbound request-id contract, the single structured access-log authority, and the never-rules that close partial redaction
open-when: shape:backend-heavy, signal:log-write, signal:request-correlation, signal:access-logging
skip-when: signal:no-logging-change, signal:client-only
owns: SEC-M-LOG-CORR-1, SEC-M-LOG-CORR-2, SEC-M-LOG-ACCESS-1, SEC-N-LOG-1, SEC-N-LOG-2, SEC-N-LOG-3, SEC-N-LOG-4
```

Scope: The correlation and prohibition half of the security logging subject, plus the field-area map that tells an implementer what each log surface may and may not carry, and the local-development carve-out.

Document type: Normative part — SEC-M-LOG-CORR-1, SEC-M-LOG-CORR-2, SEC-M-LOG-ACCESS-1, SEC-N-LOG-1–SEC-N-LOG-4.

References: [README.md](README.md); [security-secrets-and-logging.md](security-secrets-and-logging.md) (storage and web token model, sensitive data categories, API keys and environment, secret lifecycle, SEC-SECRET-ACL, failure path); [security-logging-core.md](security-logging-core.md) (SEC-M-LOG-1–SEC-M-LOG-5 and the two corollaries); [logging policy](../logging-policy/logging-policy.md).

---

## Logging (SEC-LOG) — correlation, access logging and prohibitions

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-M-LOG-CORR-1** | Production logs on request-serving paths **must** include a correlation id or request id (field name per [logging policy](../logging-policy/logging-policy.md) if specified) on each structured line when middleware or edge provides or generates one — **must not** omit when the platform already assigns an id. | Cannot tie security events to requests. | Log sample + middleware review. |
| **SEC-M-LOG-CORR-2** | An inbound request-id header is untrusted input. The request correlation authority may accept it only when there is exactly one string value and it matches the documented canonical request-id format; otherwise it **must** generate a fresh server-owned request id with a cryptographically secure runtime primitive. The raw rejected value **must** never be logged, tagged, echoed, interpolated, or copied into an error/response. The one accepted/generated value is written once to request-local context and is the only source for log `requestId`, response `traceId`, and crash correlation. | Log/response injection, unbounded cardinality, cross-request correlation spoofing, or leakage of attacker-controlled header data. | Boundary schema/predicate + duplicate/array/malformed header inspection + source scan proving one request-local writer and no raw-header egress. |
| **SEC-M-LOG-ACCESS-1** | Production request access/latency logging **must** have one structured authority. Its structured allowlist is: normalized HTTP method; server-owned static route template (or a fixed unresolved sentinel); numeric status; bounded numeric duration; canonical request id; fixed-enum/fixed-literal `action` and slow tier; bounded numeric database-query count; and fixed credential/PII-free root-cause/solution literals. The message may interpolate only those already-allowlisted normalized/bounded values. It **must not** read or emit raw URL, `originalUrl`, client path/query strings, headers, body, route params, cursor values, user/tenant ids, or arbitrary client-controlled text. Route-template resolution **must** fail closed to the fixed sentinel and **must** never fall back to the client request target. | Broad request logs become a high-volume PII/token/query exfiltration sink, while removing bounded SLO diagnostics would blind performance operations. | Single-authority AST rule + exact field/literal allowlist + production log sample + negative scan for raw request-target access in the access logger. |
| **SEC-N-LOG-1** | **Must not** write secrets to Error.message, user-visible errors, or unstructured console in production for sensitive flows — use project logger with redaction. | Bug. | Review. |
| **SEC-N-LOG-2** | **Must not** let a live-credential persistence/driver failure cross its first credential-aware boundary; consume [SEC-M-LOG-2](security-logging-core.md), including its prohibition on forwarding raw Error/message/stack/cause, interpolation or stringification. Rewrapping raw text is disclosure. | Security bug; possible live-credential disclosure. | Boundary review + failure log / crash-event inspection. |
| **SEC-N-LOG-3** | **Must not** send unsanitized structured metadata directly to an underlying logger/transport, scrub only `error` events while leaving `warn`/`info`/`debug`/`http` raw, or maintain a transport-local credential-key list parallel to the shared predicate. **Must not** claim the wrapper scrubber sanitizes arbitrary text embedded in a message or stack. | Security bug; bypass or false assurance. | Static wrapper-wiring lint + transport/config review. |
| **SEC-N-LOG-4** | **Must not** log/attach raw cursor or continuation values; raw URL/request-target/query strings; or an unvalidated inbound request-id. **Must not** use stripping `?query`, truncation, hashing, Base64 detection, or “opaque” naming as a substitute for the explicit SEC-M-LOG-5 / SEC-M-LOG-CORR-2 / SEC-M-LOG-ACCESS-1 boundaries. | Privacy/security bug; partial redaction preserves sensitive values or attacker-controlled correlation. | AST/static negative probes + inspection of logs and crash events through the project's selected observability provider. |

| Field area | **MUST** / **MUST NOT** | Correct pattern (conceptual) |
|------------|-----------------|------------------------------|
| Auth | **MUST NOT** log raw token / session id | Log `hasAuth: true` or correlation id only |
| Personal data | **MUST NOT** include personal, tenant, account, or transaction identifiers in broadly accessible logs unless a documented operational need, access control, retention limit, and applicable privacy policy justify them; necessity is decided by the SEC-M-LOG-4 masking criterion, not by the field's label | Minimize at source; prefer omission or a purpose-bound keyed pseudonym; use canonical request/trace correlation (SEC-M-LOG-4) |
| Third-party identity / payload | **MUST NOT** log replayable purchase / transaction tokens, one-time codes, or an undefined provider bag (attribute map, raw callback payload). Provider account and transaction identifiers are identifiers, not credentials: they travel only where the adopting project's documented readership model allows it, and **MUST** be omitted once observability readership widens | Live credential omitted at source; full payload only in access-controlled durable inbox/audit with a defined purpose and retention; correlate with request/trace id (SEC-M-LOG-4) |
| Pagination / continuation | **MUST NOT** log any raw cursor/page-token value, whether vendor-owned, first-party, Base64/hex, encoded, tenant-reverified, or transport-authorized | Omit or emit explicit presence boolean only; authorization never grants observability permission (SEC-M-LOG-5) |
| Request correlation | **MUST NOT** trust or echo malformed or duplicate inbound request identifiers | Accept only the documented canonical format; otherwise generate a fresh server-owned identifier and use that single request-local value (SEC-M-LOG-CORR-2) |
| Access / latency summary | **MUST NOT** log raw URL, query, params, headers, body, identity, or client text | Structured allowlist: method + server route template/fixed sentinel + status + bounded duration + canonical request id; fixed action/slow tier/root-cause/solution literals and bounded numeric query count may preserve SLO diagnostics (SEC-M-LOG-ACCESS-1) |
| Request body | **MUST NOT** raw passwords, cards, biometrics | Schema-selected redacted fields |
| Persistence driver failure | **MUST NOT** propagate raw error text / stack from a live-credential write | Apply [SEC-M-LOG-2](security-logging-core.md) at the first credential-aware boundary |
| Structured log | **MUST** use one line-delimited structured record where required by the deployment platform; every level's metadata is scrubbed before every transport (SEC-M-LOG-3); secrets not in `extra` | Error code + correlation id |

Carve-out: Local dev and tests may use console per project carve-out documented in architecture — **must not** apply to production builds.

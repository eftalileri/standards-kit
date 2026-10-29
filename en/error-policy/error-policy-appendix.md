# Error policy — appendix (non-normative)

```kit-cover
type: reference
part-of: README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Part of [Error policy](error-policy.md). This file carries the reference response-shape table, the decision-vs-retrieval summary and the implementation checklist: it defines no rule ID, adds no obligation, and is not part of the reading path. Every row it names is defined in [error-policy.md](error-policy.md), [error-model-registry-and-boundary.md](error-model-registry-and-boundary.md), [provider-contract-and-webhook-errors.md](provider-contract-and-webhook-errors.md), [transport-i18n-and-classification-rules.md](transport-i18n-and-classification-rules.md) or [error-policy-prohibitions.md](error-policy-prohibitions.md).

---

## API error response shape (reference)

Minimal shape (adapt to shared types):

| Field | Role |
|-------|------|
| `success` | `false` |
| `error` | Semantic code (registry key) |
| `message` | User-safe message (from `messageKey` → i18n) |
| `traceId` | Correlation id — same id in log + crash report (**M17**) |
| `category` | Closed-set category hint for client UX classification |
| `retryable` | Whether the client may retry (from the registry) |
| `data` | Optional endpoint-specific recovery/conflict DTO — explicit single-boundary option only; shared-contract-backed, runtime-validated, client-safe (**M25**) |
| `rootCause` | Operator diagnostic — off the wire by default; expose only under the API contract’s explicit non-production condition (**M4**) |

- Envelope (`traceId` / `category` / `retryable`): these are cross-boundary fields the client consumes (support correlation, UX class, retry affordance — see [error handling](../error-handling/error-handling.md)). They are part of the shared contract, not ad-hoc per-endpoint keys.
- Operator diagnostics are gated: keep them off the wire by default; if the API contract explicitly exposes them, restrict exposure to non-production server failures and never include them on `4xx` or user-facing messages (**M4**).

Wire vs logs: The table above is the minimum logical content for API errors; exact key names and optional fields are defined only in the shared contract. Structured logs may carry extra keys per logging policy even when those keys are not on the HTTP body.

---

## Decision vs retrieval (summary)

| Kind | Null on "not found" | Failure signal |
|------|----------------------|----------------|
| Retrieval (`find*`, `get*`) | Allowed | Caller throws if required |
| Decision / validate | Not for failure | Error string or throw — [decision functions](../decision-function/decision-function.md) |

---

## Implementation checklist (backend)

- [ ] Every code is in the single error registry with its HTTP status, category, message key, and retryability (**M12**); where supported, the code type is derived from registry keys (**M14**).
- [ ] Throws use the project’s typed carrier or factory with code + structured context, never a parse-prefix message (**M13**, **N10**).
- [ ] Severity is derived from category by one total function and is never stored (**M15**, **N11**).
- [ ] One boundary handler resolves status / category / severity / retryable from the registry; unmapped code → `SYSTEM`/500 (**M16**); no per-domain status map (**N9**)
- [ ] Boundary attaches `traceId` (same id in log + crash report — **M17**) and never throws on i18n resolution (**M18**)
- [ ] Expected (`WARN`) errors go to the metric channel, not crash reporting (**N12**, logging policy **M18**)
- [ ] Upstream / third-party transient (retryable) failures classified `WARN` (not `SYSTEM`); only non-retryable / malformed provider responses are `SYSTEM` (**M19**, **N13**)
- [ ] A provider credential challenge MAY receive one fresh-credential retry only for an idempotent read and where the provider contract permits; a repeated challenge is classified after that retry, and writes or authorization denials are not retried ([security cryptography](../security/security-cryptography.md)).
- [ ] Client-initiated third-party projections use fresh runtime-validated matching-item evidence; authenticated provider webhooks use validated known-event evidence; both paths reject sandbox/ambiguous production evidence before reusable-reference writes and side effects; stored references are re-gated before later live provider calls (**M20**–**M22**, **N14**–**N15**)
- [ ] Authenticated push contract drift uses the single error boundary; any protocol-required `2xx` acknowledgement changes only wire status for an explicit non-retryable contract code, never semantic registry facts or retryable failures (**M23**, **N16**)
- [ ] Valid asynchronous provider callbacks are durably accepted under immutable event/message id before `2xx`; persistence failure stays non-`2xx`, and workers recover from the durable inbox (**M24**, **N18**, **IDEMP-M14**)
- [ ] Optional endpoint-specific error `data` is passed explicitly through the single boundary from a shared-contract-backed, runtime-validated client-safe DTO; carrier/log/request context is never copied automatically (**M25**, **N19**)
- [ ] Ambiguous post-write provider not-found stays retryable; ownership is decided only by successful structural provider evidence, never status alone (**M19**, **N17**)
- [ ] Throttling / transport middleware rejections raise a registered code into the single boundary (no hand-written envelope), classify as expected (`WARN` → metric), carry the wait-hint header, and log store/configuration failures through the project’s operational logger (**M28**, **N20**)
- [ ] Every registered `messageKey` resolves in every supported language, measured by a fail-closed gate whose key set / language set / catalog paths are all derived from their authorities — no hand-written list, no fallback-chain excuse (**M29**, **N21**)
- [ ] The diagnostic-field presence condition exists only inside the boundary; no bypassing handler writes one, raw caught-error text never reaches a body under any condition, and every removed diagnostic string was relocated to the observability channel in the same change (**M30**, **N22**)
- [ ] Every category was chosen from the provenance of the data its check reads, one code at a time: client-supplied input → expected (`WARN`); server-produced data → `SYSTEM`, even on a client-facing surface; no family-wide sweep, and the provenance finding is recorded beside the registry entry (**M33**, **N23**)
- [ ] Categories defined; semantic codes registered / reused consistently (no duplicate meaning — S3)
- [ ] API error bodies use only contract-defined keys (**M11**, **N8**); operator diagnostics follow the API contract’s non-production-only condition (**M4**); `validate*` callers enforce **M10**
- [ ] try/catch + log + rethrow or map on async boundaries; callers validate retrieval results before use
- [ ] Logger used; no raw console for ops paths

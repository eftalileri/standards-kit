# Idempotency — boundary validation, store topology and provider callbacks (IDEMP-M8–IDEMP-M15)

```kit-cover
type: normative
part-of: README.md
binds: boundary validation, durable stores and signals, provider inbox and released-client key rollout
open-when: shape:backend-heavy, signal:mutation-endpoint, signal:idempotency, signal:webhook, signal:provider-integration
skip-when: signal:client-only, signal:read-only-endpoint
owns: IDEMP-M8, IDEMP-M8b, IDEMP-M9, IDEMP-M10, IDEMP-M11, IDEMP-M12, IDEMP-M13, IDEMP-M14, IDEMP-M15
```

Part of [the topic index](README.md).

---

<a id="must-normative--idemp-m8-to-idemp-m15"></a>

## Boundary and provider inbox — [IDEMP-M8–15](boundary-stores-and-provider-callbacks.md)

**IDEMP-M8**: Boundary schema (a schema-validation library or project-approved explicit equivalent) **MUST** validate the key before business logic.

**IDEMP-M8b**: When the idempotency boundary consumes the key and removes it from the request body, a handler behind it that re-validates the body **MUST** use the schema's key-less view derived from the same authority (e.g. the same schema with the key field omitted), never the full key-bearing schema — the missing key rejects every request as invalid input and the endpoint never works. Use the enforcement mechanism the adopting project documents for this shape; a reference to a check is not evidence that it exists or covers the full rule, so record its actual scope and limits.

**IDEMP-M9**: Decision functions **MUST** throw or return structured invalid-input errors, never invalid-as-null/undefined.

**IDEMP-M10**: Key/scope/subject/conflict/lease faults **MUST** use the canonical registry error boundary, preserving status/category/retryability/message/trace. Lease contention is retryable. Only successful M6 replay may directly return its frozen status/body; no reduced hand-built error envelope. Every claim store answering a caller **MUST** answer each non-replay claim outcome — the same scoped key still in flight, the same key with a different intent — with the one registered code owned for that outcome through one shared outcome→code mapping, and a store-local or domain-prefixed variant **MUST NOT** be registered. Reason: per-store twins drift on category and retryability, so the same duplicate is auto-retried on one route and shown as a dead end on another (error-policy **N25**). Review-held — a store-local variant cannot return without a registry entry, and a store choosing a wrong registered code is a semantic judgement no single-file check decides (**IV-M13**).

**IDEMP-M11**: Document Redis/DB write order and primary replay source. On disagreement the database wins; emit one ERROR `idempotency_store_mismatch` with correlation id before response.

**IDEMP-M12**: One documented shared crypto/UUID issuer per client app **MUST** mint keys; payment/GIDEMP3 **MUST NOT** rely on `Math.random` alone.

**IDEMP-M13**: Replay/wait/expiry/mismatch **MUST** emit one structured policy signal with boundary correlation/trace, routeId and event `idempotency_replay`, `idempotency_lease_wait`, `idempotency_expired` or `idempotency_store_mismatch`; level is info/warn/error, with error for mismatch/unrecoverable fault. Keys and personal authorization subjects **MUST NOT** enter general logs. Needed key correlation uses a documented threat-appropriate pseudonym, not an assumed-anonymous low-entropy unkeyed digest. Target correlation uses internal non-PII tenant/event identity. The completed-replay signal **MUST** have one writer, called once at every store's replay decision, and **MUST** be a counted warn line with a fixed action tag and the route id as its unit dimension. Reason: an info-level replay is counted nowhere, so a client stuck re-sending a mutation or a store serving stale replays is invisible to the aggregate window ([**M18**](../logging-policy/failure-level-and-channel-routing.md)).

**IDEMP-M14**: An authenticated callback acknowledging before effects finish **MUST** persist its runtime-validated replay payload as durable pending under immutable provider event/message id before success wire ACK. Document that natural key where provider cannot supply application client keys; duplicates reuse the row.

Workers atomically claim only eligible pending/retryable-failed/stale-processing rows, writing unique owner, future expiry, processing start and incremented attempt count while returning canonical persisted payload. Every later decision uses that payload and exact-matches embedded event id to claimed id before effects. Complete only after all required effects; owner+unexpired lease qualifies final success/failure. Completed sub-effects skip only themselves, never remaining effects/reconciliation unless whole-operation authority proves done.

Long work periodically renews by owner+status+unexpired CAS with fail-closed checkpoints between effects; unverifiable/lost ownership stops later effects. Each duplication-sensitive nontransactional authoritative/billable effect additionally has durable event-key dedupe. Preserve attempt count/retry eligibility on failure; attempts count at claim, not observed failure. A positive maximum terminalizes explicit exhausted failure, never deletes/obscures it. Claim stale exhausted processing before terminalization so the old worker cannot race. Memory/fire-and-forget/provider redelivery cannot own recovery.

IDEMP-M14 subscription-liveness clarification (normative): Repository routes do not prove provider delivery. Read subscription/push configuration and expiration. If aggregator relays all required facts, delete an unsubscribed duplicate route under DCD-M2; its wire horizon is provider subscription. If a live consumer needs an unrelayed identifier (raw token/replacement chain), subscribe the feeder on the same topic without a second entitlement writer. Permanent feeders require never-expire policy (empty expiration setting); inactivity TTL can silently stop low traffic. Unclassified defects answer `5xx`/SYSTEM rather than auth rejection even when transport redelivers every non-success. Any status-shape check holds only that shape; delivery and expiration remain external evidence.

IDEMP-M14 external-provider phase clarification (normative): Durable recipient rows **MUST** distinguish provider-not-started from provider-started/outcome-unknown, not merely correlation metadata. Exact phase CAS follows the last lease fence and immediately dominates provider call. Pre-provider rejection releases retryable claims; a nonterminal pre-provider row cannot replay completed/duplicate. Partial replay skips only terminal/provider-started recipients; any pre-provider recipient keeps its job incomplete.

**IDEMP-M15**: Missing-key compatibility is temporary and restricted to released clients only when all hold:

1. Replay-safe reconciliation/projection, no irreversible external effect.
2. Current client schema requires stable keys; a separately named server rollout schema makes only key optional.
3. Exact route literal allowlist, never boolean/wildcard/prefix/caller scope; only `undefined` bypasses, supplied malformed keys reject.
4. Keyed requests retain M3–M7 claim/replay.
5. Fixed-cardinality per-route bypass metric excludes key/subject.
6. Registration comment or policy record names reason, server-first deployment, metric and removal gate.
7. Remove only when minimum supported client sends the field and metric is zero for a documented positive retained observation window.

An absent/disabled/reset metric cannot satisfy (7); replace its gate with durable evidence, never waive it. A supported-version floor may prove the first embedded store release carrying the field, live floor at/above it and current boundary comparison. An over-the-air addition alone does not cover first-launch embedded code. State the envelope prerequisite: headerless clients exempt from that gate need measured reachability, or an explicit accepted limit naming range/consequence when unmeasurable. Record replacement evidence at the same registration or policy-record authority. Server compatibility deploys before key-requiring clients; no permanent/general bypass.

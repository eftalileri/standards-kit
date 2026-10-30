# Redis (backend distributed cache and coordination — SSOT)

```kit-cover
type: normative
part-of: README.md
binds: the Redis thresholds, the Tier A / Tier B / degraded-mode definitions, the agent execution contract and the GRDS decision gates that route state into or out of Redis
open-when: shape:backend-heavy, signal:cross-instance-state, signal:distributed-lock, signal:rate-limit-store
skip-when: signal:single-instance-only, signal:client-side-only
owns: RDS-C*, RDS-D*, GRDS*
```

**MUST** / **MUST NOT** rows of this topic (the **RDS-M** family, banded): [redis-connection-keys-and-authority.md](redis-connection-keys-and-authority.md) (**RDS-M1**–**RDS-M13**); [redis-degraded-mode-and-invalidation-ordering.md](redis-degraded-mode-and-invalidation-ordering.md) (**RDS-M14**–**RDS-M19**); [redis-prohibitions.md](redis-prohibitions.md) (**RDS-M20**–**RDS-M23** and **RDS-N1**–**RDS-N15**). They are cited from here by ID, never restated. Non-binding tail: [redis-appendix.md](redis-appendix.md). The threshold identities **RDS-T-CONNECT-TIMEOUT-MS**, **RDS-T-SUSTAINED-DISCONNECT-ALERT-MS**, **RDS-T-DEFAULT-CACHE-TTL-SEC** and **RDS-T-LEASE-TTL** are defined in this file, in `## Normative constants`.

Scope

- Included: Backend use of Redis as a distributed cache and coordination layer: connection ownership and lifecycle; fail-fast behavior when Redis is the chosen vendor; the SSoT authority boundary between Redis and the durable database; key namespace and TTL governance; cache invalidation strategy; distributed locks; rate-limit store; the idempotency lease and its consistency with the durable record; pub/sub messaging; network and security posture (private network, TLS, AUTH); and Redis observability (connection state, errors, hit/miss).
- Excluded: Client-side server-state caches and client persistence, which should follow their own platform guidance. Database schema design. The full idempotency contract (key transport, replay, partial failure) — that is [idempotency](../idempotency/idempotency.md) SSOT; this file binds only the Redis side of it. Whether to adopt Redis is an architecture decision for the consuming project; these rules apply to the Redis paths it selects.

Document type: Normative — rule engine. **RDS-C2**, **RDS-C3** and **RDS-C4** are not defined; the gaps are never back-filled.

Decision gates: Apply the gates below to avoid using process-local state where cross-instance correctness is required or silently degrading when Redis is unavailable.

Environment: Applies to backend runtimes using Redis through a supported client. Prefer a private network where the hosting environment provides one. Logging follows the consuming project's [logging policy](../logging-policy/logging-policy.md).

Binding principle: Violations of **RDS-M** / **RDS-N** are bugs — must fix; must not ship a backend that silently falls back to in-process state for cross-instance concerns, or that treats Redis as a second source of truth for data the database owns ([agent contract **C4**](../_meta/agent-contract.md)).

References: [README.md](README.md); [idempotency.md](../idempotency/idempotency.md) ([**IDEMP-M5**](../idempotency/key-scope-and-replay-contract.md), [**IDEMP-M11**](../idempotency/boundary-stores-and-provider-callbacks.md), **IDEMP-T-LEASE-TTL-DEFAULT-SEC**); [SSOT principles and precedence](../ssot/ssot-principles-and-precedence.md); [backend HTTP efficiency](../backend-http-efficiency/backend-http-efficiency.md) (process-local cache, request-scoped memo); [security](../security/README.md); [logging policy](../logging-policy/logging-policy.md); [error policy](../error-policy/error-policy.md); [decision matrix](../decision-matrix/decision-matrix.md).

---

## Normative constants

**RDS-T-CONNECT-TIMEOUT-MS**: The adopting project **MUST** choose and document a finite startup deadline appropriate to its runtime, client retry behavior, and readiness policy. The caller races connection startup against that deadline; on expiry it follows the configured outage branch under **RDS-M2**, keeping background reconnect only if degraded startup is allowed. Missing or invalid connection configuration is detected separately and follows **RDS-M2**(a).

**RDS-T-SUSTAINED-DISCONNECT-ALERT-MS**: The adopting project **MUST** select a finite threshold for continuous not-ready time of a Redis client (from its creation, or from the first connection error while not ready) after which the outage stops being an expected reconnect and becomes an incident: exactly ONE `error`-level record per outage episode, carrying duration, error count and the last bounded error class (**RDS-M12**). Choose it from the client's reconnect behavior, the managed service's restart profile, service objectives, and the exposure of the controls that degrade meanwhile (**RDS-M8**, **RDS-M14**), and document the basis. The not-ready episode is the alert unit for every client error, not only for transport loss. A non-transient error while not ready (for example an authentication reply rejecting a rotated password) recurs on EVERY reconnect attempt, so paging per occurrence floods the crash channel with one fact. The episode raises exactly ONE `error`, from whichever source comes first: the first non-transient error, or the threshold timer; the timer does not raise a second one. Repeats inside an alerted episode keep the SAME action label at `warn` and increment the counter on every occurrence, so a query or metric on that label still sees the full count ([logging policy **M18**](../logging-policy/failure-level-and-channel-routing.md): the volume filter lives inside the authority and does not split the signal). `ready` closes the episode, so the next episode alerts again. A non-transient error on a ready client has no episode and stays `error` per occurrence. A server error reply carries a bounded identity: the protocol-defined reply prefix mapped onto a closed set (unknown prefix → one fixed value), gated on the client library's reply-error class; the rest of the reply text can echo keys or arguments and never becomes a field ([**M25**](../logging-policy/background-boundaries-and-sink-safety.md)).

**RDS-T-DEFAULT-CACHE-TTL-SEC**: The adopting project **MUST** define a positive default TTL for derived cache entries and document exceptions by key class; see **RDS-M4**. There is no universal duration suitable for every cache.

**RDS-T-LEASE-TTL**: For idempotency and lock leases, follow the consuming project's idempotency standard and document any lock-specific value and reason; see **RDS-M7** and **RDS-M9**.

---

## Rule identifiers (normative)

**RDS-C***: Agent execution contract.

**RDS-M***: **MUST**.

**RDS-N***: **MUST NOT**.

**RDS-D***: Definitions.

GRDS*: Decision gates (normative index).

RDS-T-*: Numeric thresholds (this file only).

---

## Definitions (normative) — **RDS-D**

**RDS-D1** (Tier A — critical coordination): A Redis use that protects correctness or a security/abuse control, such as an idempotency lease, distributed lock, rate-limit store, or a shared gate that limits outbound operations initiated by unauthenticated or untrusted input. Durability **MUST** rest on the durable authority where a domain record exists (**RDS-M9**, **RDS-M13**), not on Redis alone. On Redis unavailability a Tier A use **MUST** degrade observably (**RDS-D3**), never silently and never by taking the whole app down: a correctness operation uses its durable authority (**RDS-M9**); fail-open is allowed only for controls whose documented risk policy permits it (**RDS-M8**); a security-verification path whose untrusted cache miss would itself trigger outbound work fails that narrow path closed (**RDS-M16**); an ephemeral pre-commit flow state that Redis alone owns and no durable record backs (a pending verification proof, a temporary hold) **MUST** fail the flow that needs it closed with a registered retryable error, while a read that only subtracts that state continues without it, observably — a flow whose proof cannot be stored or read has nothing to verify against, and an invented substitute would be trusted.

**RDS-D2** (Tier B — derived cache): A Redis use that only accelerates reads of data owned by a durable authority, such as application records or external-service status. A Tier B miss is a normal path served from that authority.

**RDS-D3** (observable degraded mode): The required behavior when Redis is unreachable after successful startup depends on the use: read derived data from its durable authority, preserve correctness through durable claims, and fail closed for security-sensitive operations when their required evidence cannot be established. Any allowed fail-open behavior follows the consuming project's documented policy. Emit bounded logs and a degraded health or metric signal; do not serve prohibited stale data, silently perform gated work, or use an in-process cross-instance substitute. Severity and channel come from the consuming project's logging/error policy; Redis code **MUST NOT** maintain a parallel severity map. An infrastructure outage **MUST NOT** take down unrelated service paths unless the documented security or correctness boundary requires the affected operation to stop.

---

## Agent execution contract

The shared [agent execution contract](../_meta/agent-contract.md) applies; the rows below are this topic's own.

**RDS-C1**: This topic is mandatory for any implementation-bound work that adds or changes a Redis connection, a cross-instance cache, a distributed lock, a rate-limit store, an idempotency lease, a shared gate that limits outbound operations initiated by unauthenticated or untrusted input, or pub/sub. Read this file and cite it in the deliverable References.

**RDS-C5**: Precedence: [SSOT principles](../ssot/ssot-principles-and-precedence.md) win on which store is the authority; [idempotency](../idempotency/idempotency.md) wins on idempotency key transport and replay; [error policy](../error-policy/error-policy.md) wins on HTTP status and semantic codes; [security](../security/README.md) wins on secret handling. This file adds the Redis shape and the no-fallback rule only.

**RDS-C6**: Change impact: a change to the Redis adoption decision, key namespace or authority boundary names the standards it affects and updates the affected key-family rows of the project's key registry (or equivalent authority) in the same change.

Testability: Each rule is verifiable by static inspection (search / configuration / dependency manifest) or a runtime assert with a binary outcome (connection log present, key carries a TTL, two same-key requests yield at most one mutation). No unqualified "code review" as the sole verification.

---

## Technology

| Topic | Rule |
|-------|------|
| Redis client | Use a supported client version that provides the APIs required by the implementation; record the selected dependency in the project manifest. |
| Rate-limit store | When a multi-instance rate limiter is in scope, use a shared store supported by the consuming architecture; Redis is one option (**RDS-M8**). |
| Connection configuration | Supplied through the hosting environment's secret/configuration mechanism; never committed to source control (**RDS-M11**, **RDS-N7**). |

Version verification (Redis client): Confirm the dependency and supported version using the consuming project's dependency-management tooling.

---

## Decision gates (normative index) — GRDS

Use this table first when deciding whether a piece of state belongs in Redis. Gates cite existing **RDS-M** / **RDS-N** rows; they add no hidden requirements.

GRDS1: Proceed YES (use Redis) when: the state must be consistent or shared across more than one process / instance (rate-limit counter, idempotency lease, distributed lock, an untrusted-input outbound-operation gate, cross-instance cache or invalidation). [Rules: **RDS-M2**, **RDS-M5**, **RDS-M8**, **RDS-M16**, **RDS-N1**, **RDS-N8**] [If NO: state that lives only within one HTTP request lifecycle uses request-scoped memo per [backend HTTP efficiency **BHE-M2**](../backend-http-efficiency/backend-http-efficiency.md); do not add a Redis key for it.] Stated limit: whether a per-request read changes rarely enough to cache spans the caller's mount, the write cadence and the data itself; review with query-count measurement holds it.

GRDS2: Proceed YES (Redis is the authority for this datum) when: the datum is an ephemeral coordination primitive Redis owns (rate-limit counter) and is not a projection of database-owned domain data. Note: idempotency duplicate-suppression is NOT Redis-authority — its durability rests on the database (**RDS-M9**). [Rules: **RDS-M5**, **RDS-M9**, **RDS-M13**] [If NO: the database is the authority; Redis holds a derived cache with TTL (**RDS-M4**) and documented invalidation (**RDS-M6**); on disagreement the database wins.]

GRDS3: Proceed YES (durable mechanism, not plain pub/sub) when: a missed message would cause incorrect state, or the work is a job/event/retry that must survive consumer downtime (use a durable queue, stream, or database-backed mechanism supported by the selected stack). [Rules: **RDS-M10**, **RDS-M15**, **RDS-M13**] [If NO: plain pub/sub is acceptable for best-effort fan-out, such as invalidation that also has an independent expiry safety net.]

Ordering of evaluation: GRDS1 (cross-instance or not) → GRDS2 (authority vs derived) → GRDS3 (durable vs best-effort messaging).

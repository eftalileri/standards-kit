# Redis (backend distributed cache and coordination — SSOT)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** redis, distributed cache, coordination, no-fallback, key namespace, TTL, lease, lock, rate limit, pub/sub

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) — **P1-P8** when this topic is in scope (P8 verification when implementation-bound); cite in deliverables per [markdown-authoring **M16**](../authoring/markdown-authoring.md).

Purpose: Normative guidance for backend services that choose Redis as a distributed cache or coordination system — connection ownership, startup and outage behavior, the authority boundary with durable storage, key namespace, TTL, invalidation, distributed locks, rate-limit storage, idempotency integration, pub/sub, network and secrets, and observability. Select only the parts that match the adopting system's architecture and documented failure policy.

## Agent TL;DR

- Redis may hold derived cache values or coordination state, but each datum must have one declared authority. Database-owned domain data remains database-authoritative; on disagreement the database wins. An explicitly Redis-owned coordination primitive must not have a competing authority (**RDS-M5**).
- Redis outage behavior depends on the control and the consuming service's documented risk policy. Missing or invalid configuration is a startup/configuration defect and must be surfaced. A runtime outage must be observable and must not silently substitute process-local state. Use the authority-preserving fallback for derived reads and durable idempotency; permit fail-open only for controls whose policy explicitly allows it, and fail closed for security-sensitive work when a safe authority or verification cannot be established (**RDS-D1**–**D3**, **RDS-M2**, **RDS-M8**, **RDS-M9**, **RDS-M14**, **RDS-M16**, **RDS-N1**, **RDS-N8**).
- Every key has a namespace (**RDS-M3**) and an explicit TTL where expiry is appropriate (**RDS-M4**). Await event-driven invalidation before a fresh same-flow read or a success response that promises post-write visibility; it is never detached cleanup (**RDS-M17**/**N9**). Tenant data reads have no server response cache that answers before the handler; conditional requests come from a body-derived validator computed after the handler ran, and client freshness from the client query cache (**RDS-N14**). A server-side derived read cache is added only on a measured need, is consulted after authorization, and is invalidated structurally by the data-write layer rather than by per-handler calls (**RDS-M22**). When invalidation races with an in-flight fill, use an atomic generation/fence design so stale fills cannot win; delete-then-unconditional-set is forbidden. That generation governs cache acceptance and response freshness only: durable authorization and writes require durable authority, and cache TTL, eviction, or outage must never authorize them (**RDS-M19**/**RDS-M21**; **TX-M-12**). Preserve provenance and current checks for cached evidence (**RDS-M18**/**N10**). Use one coordination authority per concern (**RDS-N3**); choose durable queues/streams when delivery must survive consumer downtime (**RDS-M15**).
- Decision gates: **GRDS1-GRDS3** (in redis.md).

Reading order (routing). Each entry names the file that defines those rule IDs; the obligation is in that file, not in this list. This README routes; it defines no rule rows.

1. [redis.md](redis.md) — thresholds (RDS-T-\*), definitions (**RDS-D1**–**RDS-D3**), agent execution contract (**RDS-C1**, **RDS-C5**, **RDS-C6**) and decision gates (**GRDS1**–**GRDS3**).
2. [redis-connection-keys-and-authority.md](redis-connection-keys-and-authority.md) — **RDS-M1-RDS-M13**: client singleton and startup fail-fast, key namespace and TTL, the database-vs-Redis authority boundary, invalidation strategy, locks, rate-limit store, idempotency durability, pub/sub, network/secrets, observability, eviction.
3. [redis-degraded-mode-and-invalidation-ordering.md](redis-degraded-mode-and-invalidation-ordering.md) — **RDS-M14-RDS-M19**: Tier B degraded mode, durable messaging, the pre-auth amplification gate, awaited invalidation, provider-evidence provenance, generation-guarded invalidation.
4. [redis-prohibitions.md](redis-prohibitions.md) — **RDS-N1-RDS-N14**, **RDS-M20** (invalidation ownership and post-commit ordering; the `RDS-M` identity inside the **MUST NOT** section is inherited, not renumbered), **RDS-M21** (durable database epoch/transaction fence), **RDS-M22** (admission, authorization order and structural invalidation of a server-side derived read cache) and **RDS-M23** (a per-request stamp write behind a cross-instance TTL gate, skipped without Redis).
5. [redis-appendix.md](redis-appendix.md) — non-normative determinism note; defines no rule ID and is not part of the reading path.

Related standards: [idempotency](../idempotency/idempotency.md) ([**IDEMP-M5**](../idempotency/key-scope-and-replay-contract.md), [**IDEMP-M11**](../idempotency/boundary-stores-and-provider-callbacks.md) — lease and split-brain), [SSOT principles](../ssot/ssot-principles-and-precedence.md), [backend HTTP efficiency](../backend-http-efficiency/backend-http-efficiency.md) (process-local cache and request-scoped memo), [security](../security/README.md), [logging policy](../logging-policy/logging-policy.md), [error policy](../error-policy/error-policy.md).

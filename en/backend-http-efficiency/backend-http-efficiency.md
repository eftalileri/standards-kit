# Backend HTTP efficiency (server handlers and outbound calls)

```kit-cover
type: normative
part-of: README.md
binds: BHE obligations for server request handling — per-request deduplication, process-local cache coherence, synchronous fan-out sizing and the planning content they require
open-when: shape:backend-heavy, signal:http-handler, signal:outbound-call, signal:process-local-cache
skip-when: signal:client-only, signal:no-http-handler-change
owns: BHE-C1, BHE-C2, BHE-C3, BHE-M1, BHE-M2, BHE-M3, BHE-M4, BHE-M5, BHE-M6, BHE-M7, BHE-M8, BHE-M12, BHE-N1, BHE-N2, BHE-N3
```


Scope

- Included: Efficiency and coherence rules for HTTP request handling in server code: duplicate domain or integration reads within one request, process-local caches with TTL and invalidation, concurrent miss behavior on outbound HTTP APIs, and documentation obligations in implementation-bound deliverables.
- Excluded: Client data-fetching configuration (follow the consuming project’s adopted client-query standard); database schema design; security authentication/authorization policy (security standards); list-pagination contract (the [API list pagination](../api-list-pagination/README.md) standard); and the choice among Redis, Kafka, or another shared-state technology. Record that choice in the consuming project’s architecture decision record; this topic does not mandate a vendor.

Document type: Normative - backend-http-efficiency topic.

Binding principle: Shipping N redundant full pipeline executions per single HTTP request, or cache races that reintroduce stale data after invalidation, without a documented mitigation in the Technical plan and Risk rows, is a defect class bug for efficiency/correctness - remedy code or record a user exception per [gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md). An implementation-bound deliverable that claims BHE- obligations and omits required Technical plan/Risk/call budget content is invalid (BLOCKER) (aligned with [cross-impact-analysis **XIA-M4**](../authoring/cross-impact-analysis.md)).

References: [README.md](README.md); [markdown-authoring.md](../authoring/markdown-authoring.md) (M5, M6, M7); [cross-impact-analysis.md](../authoring/cross-impact-analysis.md) (XIA-\*); [error-policy.md](../error-policy/error-policy.md); [error-handling.md](../error-handling/error-handling.md); [logging-policy.md](../logging-policy/logging-policy.md); [code-modularity.md](../code-modularity/code-modularity.md); [monorepo-architecture.md](../monorepo/monorepo-architecture.md) when client/server workspaces are relevant.

---

## Agent execution contract

**BHE-C1**: For implementation-bound work that touches items in **BHE-M1** scope, the agent **MUST** read this file and cite it in the deliverable References.

**BHE-C2**: Interpretation of **BHE-M**/BHE-N to skip deduplication or coherence without a Decisions / facts row is forbidden (gray M15).

**BHE-C3**: BLOCKER: If a deliverable states obligations backed by **BHE-M1–BHE-M8** but omits the numbered Technical plan items, Risk rows (M7), or **BHE-M6** call budget where **BHE-M1** applies, it is invalid. **BHE-M2–BHE-M4** obligations must name a concrete verification method under **BHE-M8**. Stop until corrected. When XIA-M1 triggers, cross-impact **MUST** satisfy cross-impact-analysis XIA-M4.

---

## **MUST**

**BHE-M1**: Deliverable scope: Any plan that adds or changes (a) middleware chains that call the same expensive read function more than once per request for the same key (userId, tenantId, or another stable scope key), (b) process-local Map cache for outbound API results, or (c) webhook/event invalidation of that cache **MUST** include numbered Technical plan items per markdown-authoring M5 and Risk rows per M7.

**BHE-M2**: Per-request memo: When **BHE-M1**(a) applies, the Technical plan **MUST** state one approach: request-scoped deduplication (e.g. lazy Promise Map keyed by stable id attached only to the current request lifecycle) so each key loads at most once per HTTP request for that handler chain.

Where the memo goes, and the three properties its key must have. A request-scoped memo is only as good as its placement and its key, and three failures are measurable rather than theoretical. (a) Place the memo at the persistence seam, not at a call site. When one derivation authority is reached by two independent call paths, memoising inside one caller collapses only that path and becomes a second cache for the same datum ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md)); the seam that issues the read covers every path by construction. (b) The memo key **MUST** be the read's argument verbatim. Normalising the key (trim, lower-case, canonicalise) while leaving the query raw merges two reads the datastore keeps apart and serves the wrong record — a correctness fault, not a cache miss. Where an identifier cannot form a key, disable the memo for that call and perform the real read; never "repair" the key. A key that carries a tenant identifier is also the tenant boundary, so the same rule is what keeps one tenant's value out of another's request. (c) Namespace the key by projection, and never let a session-bound read share an entry with any other read. Two reads of the same document with different field projections are different answers; sharing one key lets a narrow projection be served to a caller expecting a wide one. A read bound to a session belongs to that session's snapshot: outside an open transaction it **MUST** bypass the memo; inside one it **MAY** be memoised only under a key unique to that transaction attempt (a retried transaction is a new attempt and **MUST NOT** see the aborted attempt's entries), only while the session is still in that transaction, dropped when a commit or abort starts, and subject to every write-driven drop below — the transaction's own writes included, so it never serves its own pre-write value. Reason: within one attempt the snapshot answers a repeated read identically until a write touches the namespace; across attempts, sessions or sessionless reads it does not. A memoised derivation whose input can change without a datastore write (a provider-side change acknowledged only by a cache invalidation) **MUST** drop its memo entry inside the authority's own invalidation boundary: the write-driven clear never sees that change, so a later read in the same scope would return the pre-change result. The write-driven clear **MAY** drop only the entries that read the written namespace, and only when each entry's read set is recorded mechanically from the datastore driver's command events issued for that entry's read (joined/union collections included, nested memo hits inherited); an entry whose read set is not provable — still in flight, touched another store, issued no observed read, or used an unrecognised pipeline stage — **MUST** be dropped on every write, a write whose target cannot be resolved **MUST** drop all entries, and a transaction's written namespaces **MUST** be dropped again at commit (a sessionless read during the open transaction memoises the pre-commit value), and every such drop **MUST** run both when the write or commit command starts and when it completes (a read issued while the write is in flight can be served before the write applies and settle with the pre-write value). Reason: a hand-declared dependency list goes stale silently; the driver's own commands cannot.

A per-request read cache **MUST NOT** be a parameter the caller supplies. Threading a cache map through call sites looks equivalent to memoising inside the authority and is not: the parameter is typically optional, so any caller that omits it silently restores the repeat read, and every caller that supplies one creates another parallel cache of the same derivation (**SSG-M8**). When each caller constructs its own optional map, two surfaces in one request can independently resolve the same record. The cache belongs inside the authority, where a caller cannot forget it.

A background job has no request, so its memo is off until it opens a scope. The fix is not a job-local cache: the job opens a fresh, empty scope of the same carrier around one request-like unit (one audience derivation, or one work item's pipeline); it ends with the unit, and a write inside still clears it. Measure the workload to choose the scope and verify the expected reduction in store calls. Which calls fan out is a call-graph fact no file records (stated limit).

**BHE-M3**: Singleflight: When **BHE-M1**(b) applies and concurrent requests can miss cache together, the Technical plan **MUST** require a shared in-flight Promise (or equivalent) per cache key until settle, then release in finally (or equivalent no leak discipline).

**BHE-M4**: Invalidation vs in-flight: When **BHE-M1**(c) applies, the Technical plan **MUST** require one documented coherence strategy so late writers cannot repopulate stale entries or return their rejected stale snapshot after invalidation (e.g. monotonic generation per key checked before cache set and before accepting the response). A generation mismatch requires a bounded current-generation/authority re-read; process-local singleflight is only an optimization and must be generation-scoped so a post-invalidation request cannot trust a pre-invalidation flight. A mutation/event whose success depends on that invalidation **MUST** consume a required/outcome-bearing invalidation surface and withhold success/durable completion on Redis uncertainty; awaiting an error-swallowing best-effort helper is not confirmation. Full cache flush **MUST** reset any paired generation/epoch state in the same module.

**BHE-M5**: Multi-instance: a cross-instance concern **MUST** use a shared store with shared invalidation, and the consuming project **MUST** record the choice in its architecture or decision record. A process-local cache is permitted only as a request-scoped memo whose lifetime ends with the request (**BHE-M2**, [GRDS1](../redis/redis.md)). A TTL is a staleness bound, not a consistency guarantee, and **MUST NOT** be recorded as one - there is no TTL-only exemption, and no silent assumption of a single process ([RDS-N1](../redis/redis-prohibitions.md)).

A read that feeds an AUTHORIZATION decision may be deduplicated within one request, and **MUST NOT** be cached across requests. The two scopes look interchangeable — both remove a repeat read of one key — but they differ on the property authorization depends on. A request-scoped memo (**BHE-M2**) observes a single instant: every consumer in that request sees the value as of the request, so "stale" has no meaning inside it, and deduplicating an ownership, role or tenant read is safe. A cross-request cache observes a TTL window, and an authority-changing event inside that window — an ownership transfer, a role revocation, a tenant move — leaves the cached value deciding what it is no longer entitled to decide, for the rest of the TTL and silently, because a stale identifier is a structurally valid identifier that raises nothing. That is why **BHE-M5**'s "a TTL is a staleness bound, not a consistency guarantee" is not merely a caution here: for an authorization input the bound is the exposure window. Four obligations follow. (a) Deduplicate an authorization read at request scope only; wanting the same value across requests is a separate decision that needs the invalidation contract of [**RDS-M6**](../redis/redis-connection-keys-and-authority.md) / [**RDS-M17**](../redis/redis-degraded-mode-and-invalidation-ordering.md) wired to every writer that can change the authority — never a TTL alone. (b) Where such a cross-request cache already exists, each mutation path is an invalidation site; a writer that changes the authority without invalidating is the defect, and the missing invalidation belongs at the write authority ([**RDS-M20**](../redis/redis-prohibitions.md)(a)), never copied into callers. (c) Deduplication never removes a check — the memo collapses the read while every consumer still evaluates the gate (**BHE-N2**). Litmus: *if this value changed one second ago, may a decision still be made on the old one?* For an authorization input the answer is no, and that answer picks the scope. (d) A provider integrity re-check that can only withhold access — the grant itself rests on separately invalidated evidence — **MAY** be cached across requests on that evidence's shared generation with a TTL bound when the change it detects has no provider event, but a cached observation **MUST** only confirm continuity: every denying or quarantining verdict **MUST** come from a fresh authority read. Reason: an uncached re-check on every decision consumes the provider's per-key rate limit, and the provider rejecting those calls fails closed for every paying user; a stale confirmation only delays an alarm by the TTL, while a stale denial would lock out a correct user.

**BHE-M6**: Call budget: Implementation-bound plans **MUST** include a table or numbered facts quantifying worst-case duplicate work before optimization (per request, per cold cache, and for parallel users) when **BHE-M1** applies. Anchor the budget to a named revision and define a re-measurement trigger for every authorization or middleware change along the path; adjacent edits can change call counts without modifying the measured path. Where a provider documents a per-key rate limit and reports usage in response headers, every runtime call on that key MUST go through one outbound HTTP seam (base URL, credential check, request building, status → registered-error mapping) that reads those headers and logs one `warn` per episode (cross-instance latch) once usage passes half the limit; otherwise the budget is first learned when the provider starts rejecting calls, and a second hand-built caller silently escapes the count.

**BHE-M7**: Semantic errors: If efficiency work changes HTTP status or error codes on gate middleware, the plan **MUST** align error-policy and error-handling and add cross-impact rows for clients per cross-impact-analysis **XIA-M1**.

**BHE-M8**: Verifiability: Every Technical plan obligation implementing **BHE-M2**, **BHE-M3**, or **BHE-M4** **MUST** name a concrete verification method: static inspection, runtime observation, or an explicit failure condition consistent with cross-impact-analysis XIA-M3.

**BHE-M12**: Synchronous bulk or fan-out work from request or persisted inputs **MUST** use one canonical shared budget authority for all multipliers, atomic record classes, replicated entries, terminal record count, and serialized bytes. HTTP schemas reject oversized, duplicate, or unsafe-integer inputs; domain entry points revalidate independently. The domain layer **MUST** reject over-limit work before mutation, prepare the actual documents or update payloads after bounded scope reads, and seal their aggregate size before the first business or materialization mutation. Only an established, rollback-bound authorization/epoch fence may precede the seal. Terminal writers reassert the aggregate before every durable write; count-only, one-record-class, body-size, or non-flushed estimates are insufficient. The domain aggregate-byte budget and the database single-document limit **MUST** be named separately. Limits come from product contracts or measured evidence, never guesses, truncation, or partial writes; excess fails loud with a registered non-retryable error. [Consequence: Availability/security bug — small input creates unbounded work.] [Verify: shared budget authority; overflow-safe product; prepare → exact seal → flush; aggregate record and replicated-entry count/bytes; static verification of schema, domain, and terminal-writer enforcement.]

---

## **MUST NOT**

**BHE-N1**: **MUST NOT** attach request-scoped state to module-level singletons shared across requests (memory leak / wrong tenant risk).

**BHE-N2**: **MUST NOT** deduplicate in a way that skips required authz checks or mutates SSoT without going through the documented domain entry point. A cross-request response cache that answers before the handler runs is such a skip ([**RDS-N14**](../redis/redis-prohibitions.md)).

**BHE-N3**: **MUST NOT** promise exact latency percentiles without project-specific measurements; normative guidance must not invent SLOs.

---

## Problem class note (decision matrix)

Server-side efficiency does not replace matrix rows for client data fetching (TanStack Query). BHE-\* applies when the task changes backend handler or domain call patterns listed in **BHE-M1**.

---

## Enforcement (mechanical)

The outbound time-budget enforcement guidance is in [outbound-call-time-budget.md](outbound-call-time-budget.md).

Where a project adds static enforcement for recurring materialization, the consumer set and the terminal writer's count, key, and serialized-size bounds should be checked against the shared authority. Keep that authority outside consumer-only checks so it remains the single numeric definition point.

## Workflow (minimal)

1: Confirm **BHE-M1** applies; open cross-impact-analysis.md if **XIA-M1** triggers.

2: Draft Technical plan items for **BHE-M2–BHE-M4** as needed; add the **BHE-M6** call budget and name verification methods consistent with XIA-M3 (static, runtime, or explicit failure).

3: Record **BHE-M5** when relevant; populate cross-impact rows from middleware chains, non-HTTP callers, client contracts, cache lifecycle, multi-instance behavior per cross-impact-analysis Workflow.

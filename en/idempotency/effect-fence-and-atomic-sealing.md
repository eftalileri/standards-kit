# Idempotency — effect-level fence classification and atomic sealing (GIDEMP10)

```kit-cover
type: normative
part-of: README.md
binds: per-effect duplicate fence classification and safe atomic-sealing conversion
open-when: shape:backend-heavy, signal:mutation-endpoint, signal:idempotency, signal:http-handler
skip-when: signal:client-only, signal:read-only-endpoint
owns: GIDEMP10
```

Part of [the topic index](README.md).

References: [Idempotency SSOT](idempotency.md); [idempotency-decision-gates.md](idempotency-decision-gates.md); [key-scope-and-replay-contract.md](key-scope-and-replay-contract.md); [partial-failure-and-sealing-contract.md](partial-failure-and-sealing-contract.md); [idempotency-prohibitions.md](idempotency-prohibitions.md); [transaction-policy.md](../transactions/transaction-policy.md); [redis.md](../redis/redis.md).

---

## GIDEMP10 — effect-level fence classification before atomic sealing

**GIDEMP10**: Before relying on a claim, answer per effect: if the claim were lost, which durable fence prevents duplication? Accept (a) request-determined natural/unique key, (b) version/count/status CAS, (c) one-shot external token, or (d) effect-owned anchor in its transaction. If none holds, the claim is the only fence: business writes and completion **MUST** seal in one owned unit. Exposure is the lease interval after an incomplete claim becomes reclaimable, not the completed-record TTL.

The conversion **MUST** account for these nine boundaries:

1. A partial unique index protects only requests satisfying its filter; classify the weakest branch.
2. Random/server-minted key components cannot identify retry merely because they are unique.
3. Read both sessionful/sessionless branches before threading a session. A fast path may omit gates because existing callers supply their result; make the new caller honor that contract rather than remove it and execute gates twice. Share the ordering authority.
4. An existing service-owned unit must become the same outer unit, never a nested independent session. Re-anchor post-commit verification, invalidation and irreversible emission, and prove retry-safe callbacks. Classify this separately from simple session threading.
5. Mark completion request-locally so a boundary hook does not settle twice. Absent marker retains the old fallback; a static promise of completion can strand a forgotten claim.
6. Trace every callee: provider/cache preflight before, database reads/writes inside, invalidation/emission after commit. Session threading can otherwise repeat outbound work under driver retry.
7. A verification moved inside **MUST** read on the same session, or remain after commit when it is not the unit's post-condition. Required parameters prevent omissions for unit-only helpers.
8. Response presenters/serializers carry the same snapshot obligation. Resolve with the session inside and pass values into a pure presenter when shared sessionless readers cannot require a session.
9. Inventory writes remaining outside by record AND field. Keep mutually overwriting writes on the same side of commit so reordering does not silently change the winner.

Record claim/terminal handling, replay equivalence and fail-closed behavior as stronger/equal/weaker; a weaker property cannot ship. Completion failure aborting the whole unit is stronger than a durable unprotected effect. Measure each route's saturated stored-response payload against the record-store document maximum, including all member caps/enrichment; request-body limit is no substitute.

Effect classification and boundaries 3/4/6/8/9 require cross-file semantic/provenance review. Route identity has one authority; Any project check on the completion marker/seam covers only that local shape, not every effect; record its actual scope and limits. Required session types hold omission where applicable.

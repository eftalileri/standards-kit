# Idempotency — durable fenced lease unit (IDEMP-M26)

```kit-cover
type: normative
part-of: README.md
binds: same-row generation ownership, exact CAS, renewal and transaction-coupled completion
open-when: shape:backend-heavy, signal:mutation-endpoint, signal:idempotency, signal:duplicate-suppression, signal:atomic-claim, signal:cross-instance-state, signal:db-transaction
skip-when: signal:client-only, signal:read-only-endpoint
owns: IDEMP-M26
```

Part of [the topic index](README.md).

---

<a id="must-normative--idemp-m26"></a>

## Same-row fenced ownership — [IDEMP-M26](durable-fenced-lease-unit.md)

**IDEMP-M26**: A durable claim permitting expiry takeover, release/reclaim or work longer than a lease **MUST** retain same-row fenced ownership:

1. The active/reclaimable natural-key row has one immutable identity, a positive safe-integer `generation`, unguessable CSPRNG owner token and durable absolute `leaseUntil`. Takeover/reclaim changes that row, installs a fresh owner/deadline and increments generation exactly once. **MUST NOT** delete/recreate, decrease/repeat/wrap generation or accept it from callers.

1a. A state recording an irreversible external effect in flight is never takeover-eligible merely because its lease expired. Its owner may seal success or outcome-unknown; otherwise retain the durable evidence. Declare this exclusion beside the active-state set.

2. Acquire/takeover/reclaim are single durable CAS operations. Takeover matches exact observed identity, status, generation, owner and deadline (or an enumerated recognized legacy state), and transfer eligibility. A miss re-reads durable state; memory, Redis, elapsed time or an expected response cannot prove ownership.

3. Bounded preflight/outbound work runs outside a transaction with durable heartbeat renewal. Renewal matches identity, active status, generation, owner and an unexpired lease; exactly one row changes. Ownership loss is sticky. Stop heartbeat and inspect its last result before the terminal unit so renewal cannot race completion. Memory/Redis may schedule work, never authorize it.

4. Same-store domain writes and completed replay **MUST** commit in one transaction/session. A genuinely write-free no-op or sealable pre-write refusal may seal outside a unit only with an explicit per-branch no-write declaration. Terminal completion matches identity, natural scope, active status, generation, owner and `leaseUntil > durable-operation-now`, stores canonical status/body/completed state and proves exactly one changed row. A miss/write conflict throws the registered retryable contention error inside the unit, aborting domain/ledger/outbox/notification writes. Return the stored body only after commit. Unknown commit reconciles durable claim/domain state; it never permits release or manufactured success. Different-store writes require IDEMP-M7 reconciliation and a named residual window.

   4a. A uniqueness collision aborts its unit. Reconcile the competitor's answer in a fresh unit and seal in that unit; never query an aborted session or defer completion to a response-lifecycle callback.

   4b. Moving work into a sealed unit **MUST** preserve registry-owned errors through every enclosing mapper; convert only the raw driver failures the mapper owns. Otherwise lease contention loses retryability.

   4c. Classify an unsealed-route inventory from code: an existing single owned transaction needs session ownership moved outward, seal joined and post-commit effects moved out; sessionless/sequential-unit work needs an atomic unit designed first. Do not assign both the same risk/order without evidence.

   4d. Prepare cache/provider/entitlement reads before the unit only when structurally disjoint from its writes (TX-M-12/TX-M-20). Same-store audit/analytics writes accepting its session join the unit rather than fire-and-forget after commit. Build the sealed body purely from resolved values; split presenters that re-read caches. Registered non-transient uniqueness mapping may remain; other driver failures leave the callback raw. Classify best-effort steps under TX-M-11.

5. Completed rows return validated stored status/body for exact scope/intent; malformed completion fails loud without defaults. Another unexpired owner yields canonical contention. Retryable/mutable rejection releases only the exact active lease on the same row; reclaim increments generation. A crashed worker becomes eligible only after durable expiry and subject to 1a. A release CAS miss records evidence and preserves the original failure. Decide claim fate once: read an explicit settled marker before choosing seal/release. Where sibling settlement can cause a release miss, distinguish settled-by-us from genuine ownership loss and signal only the latter. Terminal/released cleanup has a dedicated terminal timestamp and positive TTL, absent on active rows. Declare natural-key uniqueness, active `status + leaseUntil` lookup and terminal-timestamp TTL topology. TTL cleanup is never takeover/fencing authority; active retention additionally follows IDEMP-M29.

6. A complete recognized legacy shape may lazily upgrade in one same-row CAS installing active discriminator/generation/owner/deadline so the old completion predicate fails. Recognized released rows may reclaim likewise. Mixed missing fields, unknown statuses or malformed generation/token/deadline/body fail loud; **MUST NOT** coerce ownership, replay, deletion or success. Live-topology rollout is distinct from interpreting old documents; implementation **MUST NOT** write production databases or silently create indexes.

7. Contention/stale generation/owner loss use one registered retryable error through the canonical error/i18n boundary, which logs once. Helpers add only non-secret context; keys, tokens, stored bodies and personal subjects **MUST NOT** enter logs. Takeover, renewal failure, CAS loss and replay follow IDEMP-M13/M14 signals.

### Required interleaving proof

The durable predicates and unit boundary **MUST** establish all four orders:

- Successor takeover first: predecessor completion CAS misses and its unit aborts.
- Predecessor completion first: takeover cannot match; successor replays.
- Overlapping snapshots: write conflict/exact CAS admits one; loser aborts/re-reads.
- Expiry without takeover: unexpired-completion predicate rejects stale ownership; no domain-only commit.

A longer TTL cannot substitute. Use the enforcement mechanism the adopting project documents; a check on the delete or completion shape holds only that local shape, not the complete protocol, and a reference to a check is not evidence that it exists or covers the full rule. Record its actual scope and limits. Owner-token primitive, same-row generation, renewal/release/result counts and exact session/fence predicates must be traced in their authorities; inter-process behavior rests on the four proofs or an authorized non-production measurement without repository artifacts.

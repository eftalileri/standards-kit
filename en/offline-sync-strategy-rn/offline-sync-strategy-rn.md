# Offline sync strategy (React Native / Expo) -- normative

```kit-cover
type: normative
part-of: README.md
binds: offline mutation and cache persistence obligations - the layered model, the outbox and its conflict policy
open-when: shape:frontend-heavy, signal:offline-mutation-queue, signal:cache-persistence, signal:conflict-policy
skip-when: signal:backend-only, signal:online-only-flow
owns: OSS-RN-C*, OSS-RN-D*, OSS-RN-M*, OSS-RN-N*
```

References: [TanStack Query UI persist offline](../tanstack-query/ui-persist-offline.md); [Idempotency](../idempotency/idempotency.md).

---

## Definitions

| ID | Definition |
|----|------------|
| **OSS-RN-D1** | Layered model means TanStack Query cache + persist plugin for server state, MMKV backing per TanStack / MMKV hubs, optional Zustand persist for UI preferences. |
| **OSS-RN-D2** | Outbox means queued mutations with idempotency metadata when offline or flaky network per product requirements. |

---

## Agent execution contract

| ID | Rule |
|----|------|
| **OSS-RN-C1** | Must apply decision matrix Precedence: Server state rows TanStack Query first -- **OSS-RN** does not override them. |
| **OSS-RN-C2** | Must document conflict resolution (last-write-wins, server wins, manual merge) in Decisions / facts when offline edits exist. |

---

## **MUST**

| ID | Rule |
|----|------|
| **OSS-RN-M1** | **MUST** align **OSS-RN-D2** with backend idempotency keys where mutations replay ([idempotency](../idempotency/idempotency.md)). |
| **OSS-RN-M2** | **MUST** surface failed replay to user per [error handling](../error-handling/error-handling.md) -- no silent drop. |
| **OSS-RN-M3** | An irreversible provider/store result whose credential or receipt must still reach the backend **MUST** use one platform-protected local outbox authority. A non-null runtime-validated credential is persisted before the first network attempt, bound to the exact authenticated actor + tenant, and keeps one stable backend idempotency key for every replay through the established connectivity/focus authorities. A missing/null credential **MUST** become the distinct `token_unavailable` partial outcome; no queued/outbox claim may be fabricated. Revalidate a currently authenticated session with a non-empty request credential, that exact actor + tenant, and provider-identity readiness immediately before each network attempt; an effect-start check is insufficient because auth or scope may change while serialized work waits. Automatic replay follows TanStack **MUT-M24** with one finite owner: an existing HTTP envelope requires exact `retryable:true`; with no response, only canonical structural wire-error `kind === 'network'` is sufficient. The outbox caller disables lower transport retry. Delete only after the backend runtime-validates and confirms durable acceptance and local deletion succeeds, or after a separately proven terminal provider fact. If backend acceptance succeeds but local deletion fails, return `cleanup_pending` (a runtime discriminant may be `confirmed_cleanup_pending`), retain the record, and replay the same key only to complete/confirm cleanup; this is not rejection or support-terminal state. Canonical `retryable:false` or an absent retry fact **MUST** preserve the record in an explicit blocked/paused state together with its failure evidence and surface support/recovery UX; it is not itself permission to purge the credential. That blocked state is a delay, not a wall: it carries its own longer bounded backoff schedule and stays eligible for automatic replay until the retention bound of **OSS-RN-N3**, so a transient rejection that carries no retry fact — an envelope-less gateway failure, an intermediary answering with non-JSON — heals itself instead of latching permanently. A blocked state that no code path can leave is not a safety property; it is an outage the client inflicts on itself. If the blocked/paused transition itself cannot be durably proven, return a distinct `not_durable` partial result, stop replay for the current process, and never claim that a persisted block exists; do not fabricate a retry authorization for a local deferred/readiness result. The process-stop authority for `blocked`, `not_durable`, and `token_unavailable` **MUST** live outside hook/screen mount state so remount cannot reopen the store/replay path. That process-local authority does not prove survival across a full app restart; a restart/independent-provider-feeder gap **MUST** remain explicitly documented until a durable authority closes it. A store-confirmed operation whose outbox write fails remains an explicit partial outcome in the outcome carrier and observability; it **MUST NOT** be recorded as a full delivery, and whether the user sees it follows TanStack **MUT-M25** (only when the user must act). Raw credentials/tokens **MUST NOT** enter logs or crash-report context. The queue is a delivery path, never a decision authority (**SSG-M8**). Client-local persistent state — an outbox record, a blocked flag, a process-local stop — is a *derived* view of work still owed to the backend. It **MUST NOT** be an input to any authorization, entitlement, or "may this irreversible provider/store operation start" decision, because the authority for that decision lives on the server (a live provider read, a domain write path) and cannot be contradicted by a device. A pre-operation path over the queue is therefore best-effort drain plus structured telemetry, never a gate: it does not throw, and its outcome does not reach the operation's control flow. The measured defect this closes: an undeliverable receipt in a device-local queue permanently vetoed new purchases whose entitlement the server derived independently of that receipt — one failed HTTP call became an unrecoverable paywall, and the queue's own registry record already described it as a delivery outbox. Two corollaries follow. (a) Slot the queue by the operation's own credential, not by actor+tenant: a per-scope single slot forces a "pending operation conflict" rejection whose only purpose is to protect the slot, so keying each record by its credential removes the *need* for the veto rather than removing a protection. (b) An outcome is reported for the record the caller asked about: with several records queued, delivering the oldest and projecting its result onto the caller's operation is a false report, so the selection is a required argument of the delivery call, never a default ([**SSG-M17**](../ssot/ssot-principles-and-precedence.md)(a)). |

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **OSS-RN-N1** | Must not implement parallel HTTP cache that bypasses TanStack Query for server state covered by matrix rows. |
| **OSS-RN-N2** | Must not default to discarding local changes without logged root cause and user visibility when data loss risk exists. |
| **OSS-RN-N3** | An unresolved irreversible-operation outbox item **MUST NOT** be silently deleted by elapsed-time TTL, logout, account/tenant switching, retry exhaustion, timeout, or unknown network outcome. Scope changes pause replay; they do not erase the record. One bounded retention window is the sole permitted expiry, and only when all four hold: (a) the item does not itself carry the right the operation granted — the authority derives that independently, so discarding the client copy cannot remove anyone's entitlement; (b) the same information is independently reproducible at the authority (a provider notification/webhook feeder, a reconciliation job), so no fact is lost that the system cannot re-derive; (c) the window is a single named constant read by every path that consults it — a duration spelled at a call site is a second authority; (d) each discard is reported through the canonical failure-classification authority with the record's non-sensitive identifiers, so the drop is auditable and never silent. Retry exhaustion, timeout, logout, scope switch and unknown network outcome remain forbidden as deletion causes even inside that window, and a queue bounded by count evicts under the same reporting obligation. Without a retention bound the item is immortal instead of durable: it survives on the device forever, so its own record can never be pruned and the failure it represents never closes. Stated enforcement limit ([**KIT-INV-8**](../authoring/kit-structural-invariants.md)(b)): of the obligations in **OSS-RN-M3** and this row, only the required-selection argument is fenced — by the type system (a required field on the delivery options). The veto shape (an exported function of a device-local-persistence module throwing a field read out of local state) is review-held, because wrapping the field in a new error defeats a syntax-tree predicate; the per-credential slotting removes the *need* for a veto, and entitlement stays server-derived. The retention window's single-authority and the per-credential slotting stay review-only: deciding them needs a fact no single file declares — which duration constant is *the* retention authority for this queue, and which field of a record is the credential that identifies the operation. A hand-kept list of either would be a second authority for the question it audits ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md)) and is therefore not the answer. |

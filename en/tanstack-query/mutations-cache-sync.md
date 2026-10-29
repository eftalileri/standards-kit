# TanStack Query — mutations, cache sync, and orchestration

```kit-cover
type: normative
part-of: README.md
binds: MUT-N prohibitions, the G1 to G8 mutation decision gates and the mutation failure-path table - the entry point of the mutation domain
open-when: shape:frontend-heavy, signal:model-mutation, signal:cache-lifecycle, signal:cross-domain-write
skip-when: signal:backend-only, signal:no-mutation-path
owns: G1, G2, G3, G4, G5, G6, G7, G8, MUT-N1, MUT-N2, MUT-N3, MUT-N4, MUT-N5, MUT-N6, MUT-N7, MUT-N8, MUT-N9
```

Scope: Everything mutation-related for TanStack Query: `useMutation`, the post-write method (server-confirmed by default, UI-optimistic, cache-optimistic), optimistic updates, bridge injection, rollback, race handling, invalidation, refetch discipline, orchestrators, deduplication, conditional invalidation, setQueryData policy, pagination-safe cache updates. Single SSOT for this domain — do not duplicate mutation rules elsewhere.

Document type: Normative — entry file of the mutation domain: the decision gates **G1**–**G8** and **MUT-N1**–**MUT-N8**. The file-local identity **G1b** is not defined; the gap is never back-filled.

Domain part files:

- [mutations-invalidation-and-bridge.md](mutations-invalidation-and-bridge.md) — **MUT-M1**–**MUT-M22**
- [mutations-provider-and-post-write-sync.md](mutations-provider-and-post-write-sync.md) — **MUT-M23**–**MUT-M27**
- [mutations-optimistic-strategy.md](mutations-optimistic-strategy.md) — **MUT-M28**–**MUT-M31**: the three post-write methods and the known-outcome success path
- [tanstack-query-appendix.md](tanstack-query-appendix.md) — the non-binding implementation checklist (no rule of its own)

Rule prefix: **MUT-M**\* / **MUT-N**\* — rules in this domain's part files only; this file owns **MUT-N**\* and the G gates.

Environment: Applies where client mutation hooks issue network-dependent `mutationFn` calls through the application's query client.

Compliance: Violations of MUT- rules in this file are defects; stop dependent work until fixed and do not knowingly release them — [tanstack-query.md](tanstack-query.md) **TSQ-C4**, **TSQ-C11**.

Version compatibility: Confirm the installed `@tanstack/react-query` version supports the APIs in scope — [tanstack-query.md](tanstack-query.md) **TSQ-G1** / **TSQ-C10**.

References: [forms](../forms/forms.md) for Zod on mutation input; [error handling](../error-handling/error-handling.md) for `onError` UX; the adopting project's architecture documentation for cache orchestration.

---

## Decision gates (normative index)

Purpose: Single binary checklist for the highest-bug mutation/cache choices. Provide a binary routing checklist for mutation/cache choices without creating obligations beyond the cited rules. If a gate fails, stop or follow its If NO path.

| Gate | Proceed only if YES | Binding rule IDs | If NO |
|------|-------------------------|------------------|-----------|
| **G1** — Post-write method | The mutation is method B or C only when that method is declared and its conditions hold: not a **MUT-N3** flow, the caller does not block, and the change needs to be visible before the server answers — C additionally on more than one key family / consumer surface, on a surface that cannot read mutation state, or through a persisted / offline mutation queue | **MUT-M28**, **MUT-M29**, **MUT-M13**, **MUT-N3**, **MUT-N8**, [ui-persist **UIP-M21**](ui-startup-and-persistence-boundaries.md) | Method A (server-confirmed): no optimistic state, confirmed response bridged when sufficient (**G3**), awaited invalidation, UI intent closed only after it settles |
| **G2** — Invalidate | This query’s server data definitely changes after mutation | **MUT-M6**, **MUT-M8**, **MUT-M17** | Do not invalidate; rely on staleTime + refetchOnMount / reconnect |
| **G3** — Bridge | Mutation response is sufficient for target cache shape (incl. populated fields) | **MUT-M4**, **MUT-M3**, **MUT-M12** | Skip bridge; invalidate only; report an insufficient bridge response through the configured diagnostics path. |
| **G4** — `setQueryData` | Written value is temporary optimistic or mutation response bridge, then invalidate — never fabricated final truth | **MUT-M10** | STOP — no fake / stale merge as authority |
| **G5** — Refetch trigger | Refetch is not used as default focus / navigation spam | **QRY-N4**, [query-client **CLI-M1**](query-client-and-keys.md), **MUT-M16**, [ui-persist **UIP-M5**](ui-loading-and-persist-options.md) | Use staleTime, PTR, mutation path, prefetch (**UIP-M4** / **UIP-M14**) only |
| **G6** — Cross-entity impact | Mutation changes server data for an entity type other than its primary resource (nested payload, composite endpoint, side effect) | **MUT-M20**, **MUT-M21**, **MUT-M22**, [SSOT registry **SSG-R4**](../ssot/ssot-registry-rules-and-protocol.md) | Apply bridge + invalidation for each affected entity and each key family; invoke registered cache bridge if listed |
| **G7** — Irreversible partial result | Every provider/store success and backend projection success has a separate, truthful runtime outcome, exact-key fence, and recovery command | **MUT-M24**–**M26**, **MUT-N5**–**N6** | STOP unconditional success/failure UX; introduce discriminated outcome, install the exact-scope/action fence, and replay only the protected projection |
| **G8** — Required post-write sync completed | After awaited invalidation/refetch, every exact targeted active query is non-paused and any owned selection/action intent is cleared only after this proof | **MUT-M27**, **MUT-N7** | Fail loud with the query failure reason (or an explicit structural error); preserve any selection and same-intent idempotency key/fingerprint for retry |

Server vs UI-only (meta check): If server state changes → **G1**–**G6** strict and **G8** applies whenever post-write synchronization is correctness-required. If only transient UI (no cache lie) → **G1**–**G4** and **G8** are N/A; still obey QRY- / UIP- for reads.

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **MUT-N1** | `invalidateQueries()` with no filter — forbidden (refetch storm). |
| **MUT-N2** | Split optimistic / bridge / invalidation rules across other part files — forbidden (**TSQ-N2** in [tanstack-query.md](tanstack-query.md)). This row grants no exception of its own: the MUT- rows sit in more than one file only as a band that meets every condition of [**KIT-ADD-4**](../authoring/kit-rule-addition.md), and the Domain part files paragraph above is where this domain states that it does; a spread failing any of those conditions is a split this row forbids. A file grown hard to read is a reason to band under those conditions, never a reason to narrow this row. |
| **MUT-N3** | Optimistic state of any kind — a method B pending representation or a method C cache write — for a mutation that moves money (payment, payout, refund, charge), an irreversible command (one whose effect no later command can undo — a hard delete, a closure, a sent message or notification), a legal / compliance flow, or a provider / store command is forbidden. These flows are always method A (**MUT-M28**); a provider / store flow carries **G7** / **MUT-M25**–**MUT-M26** inside A. The one exception: deleting a low-stakes, per-user inbox item (a notification in the user's own list) may be method C, provided the rollback restores exactly the removed rows at their positions with their unread counters and the error is shown; every other irreversible flow stays A. |
| **MUT-N4** | Blanket or locally reclassified mutation retry — retrying every error; deriving retry from status/message/local code sets; replaying an HTTP response whose canonical envelope does not carry exact `retryable === true`; treating anything other than canonical structural `kind === 'network'` as the response-less exception; using an unbounded attempt policy; or automatically replaying a non-idempotent write without replay-safety proof — is forbidden (**MUT-M24**). |
| **MUT-N5** | After an irreversible provider/store success, swallowing the projection error, showing unconditional full success, reporting the charge as failed, or wiring “Retry” to the original store/payment command is forbidden (**MUT-M25**). |
| **MUT-N6** | Layered retry budgets, post-store activation-key generation, a screen-local/remount-reset reconciliation block, a different-key overwrite/clear, or a recovery promise without a terminal error boundary are forbidden (**MUT-M24**, **MUT-M26**). |
| **MUT-N7** | Treating a resolved invalidation/refetch promise or `throwOnError: true` as sufficient proof of a required active refetch, while a targeted query is paused, is forbidden. When the flow owns user selection/action intent or an idempotency key, clearing it before the **MUT-M27** paused-state inspection passes, storing an incomplete handle or the key/pending flag in a shorter-lived subtree than the selection, starting pending after a request-side await, regenerating the key inside `mutationFn`/retry, allowing any fingerprint-forming input to change while pending, letting a duplicate/rejected submit release a lock it did not acquire, omitting the exact pre/post-await terminal-state verification, converting a non-pending retry handle into a tombstone with no future releaser, or protecting opposite-direction action/scope races with only a check-then-request preflight instead of one exact-owned mutual-exclusion authority is also forbidden. |
| **MUT-N8** | Method misuse (**MUT-M28** / **MUT-M29**) is forbidden: (a) method C for a change visible on one surface only, or behind a caller that blocks — including "the neighbouring hook does it this way"; (b) method B or C left undeclared, or declared without the condition that admits it; (c) rendering a mutation's `variables` outside its `pending` status gate (ghost row after failure), copying pending variables into a store / second state as the pending authority (**SSG-M8**), or letting the pending representation vanish before the reconciling refetch settles (visibility gap); (d) treating any method as an exemption from invalidation or cross-entity duties (**MUT-M6**, **MUT-M20**–**MUT-M23**); (e) method A implemented as invalidate-only while the response is bridge-sufficient (**G3**), or closing / clearing the UI intent before its awaited reconciliation settles — a detached (`void`) orchestrator call included; (f) a snapshot or snapshot restore in a method A or B hook: nothing optimistic was written, so restoring an earlier cache state can only overwrite newer data another mutation or refetch wrote — A and B reconcile, they never roll back. |
| **MUT-N9** | Removing a record's detail query (`removeQueries`) while a mounted screen still observes that record with its read enabled is forbidden, and so is removing it before the delete is confirmed (`onMutate`). A removed query is rebuilt on the observer's next render and refetched (an active-refetch invalidation of the family does the same); for a deleted record that refetch returns not-found and the screen's load-error surface fires after a successful delete. The screen that issues the delete — directly or through a command that deletes the record with others (a bundle or series) — disables its own read of that record from the moment the delete starts and treats the missing record as its closing, not as a load error; the delete hook removes the detail only in its success phase. |

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|---------------------|
| Mutation HTTP / network error | **MUT-M19** — user-visible feedback or logger; see [error handling](../error-handling/error-handling.md). Method C also rolls back its own delta (**MUT-M11**); methods A and B have nothing to roll back (**MUT-N8**). |
| Outcome unknown (lost response, server failure after a possible commit) | **MUT-M28** confirmed-write boundary — reconcile every family that may have changed, including families cancelled in `onMutate`. |
| Reconciliation started on the error path | Start it and **MUST NOT** return or await it from `onError` / an error-reached `onSettled`; a promise that can reject starts inside the terminal no-throw boundary ([**COB-RN-M13**](../client-observability-rn/absorbed-defaults-and-global-nets.md)). TanStack awaits these callbacks before the caller sees the error, and after a lost connection the reconciling refetch pauses until reconnect — the **MUT-M19** feedback and the unlocked form would wait indefinitely. |
| Retryable post-write propagation | **MUT-M24** / **MUT-N4** / **MUT-N6** — replay-safe/idempotent mutation; exactly one finite owner; envelope exact-true when a response exists, otherwise only canonical structural network fact; same key; no layered transport retry. |
| Provider/store succeeded, projection unconfirmed | **MUT-M25**–**M26** / **MUT-N5**–**N6** — preserve provider success and subordinate delivery fact, install the exact actor/tenant/product/key fence, retain trace/retry facts, and replay only the same-key backend projection through a terminal error boundary. |
| Required active post-write query is paused or its UI subtree remounts | **MUT-M27** / **MUT-N7** — resolved invalidation/refetch is insufficient; inspect the exact active family, fail loud, retain original selection and same-intent idempotency key/fingerprint in an authority with matching lifetime, keep fingerprint inputs locked while pending, and retry only under the established replay-safe contract. |
| Bridge insufficient | **MUT-M4** — skip bridge, invalidate, and report through the configured diagnostics path. |
| Optimistic state on a **MUT-N3** flow | STOP — method A (**MUT-M28**), except the per-user inbox item deletion named in **MUT-N3**. |
| Method B mutation fails, or its pending row would vanish before the refetch lands | **MUT-M29** / **MUT-N8** — the pending representation disappears with the status change (no rollback) and user-visible feedback is still required (**MUT-M19**); on success the callback returns / awaits the invalidation so the pending row survives until the reconciling refetch settles. |
| Destructive mutation that is not idempotent, re-sent after an unknown-outcome failure (the first call may have committed) | The server's registered not-found code for the mutation's own target, read structurally (never message text), is SUCCESS — the target being gone is the outcome the user asked for: run the success-path cache convergence, open no error surface and no report. Every other failure keeps the carrier identity to one presentation flow shared by all consumers of the mutation (a modal with retry unless the envelope says `retryable: false`; **MUT-M19**, **EHX-M4**) that only renders text (the global net already owns the report — **COB-RN-M6**). |
---

Part of: [README.md](README.md) — TanStack Query SSOT.

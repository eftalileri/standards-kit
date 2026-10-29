# TanStack Query — implementation checklists and testability notes

```kit-cover
type: reference
part-of: README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Scope: The two non-binding tails of this topic: the mutation implementation checklist with its testability note, and the UI / persist implementation checklist with its testability note. Every line is a back-reference to a rule defined elsewhere in this folder.

Document type: Reference — carries no rule of its own. Every MUT-, UIP- or G identity named here is defined in [mutations-cache-sync.md](mutations-cache-sync.md), [mutations-invalidation-and-bridge.md](mutations-invalidation-and-bridge.md), [mutations-provider-and-post-write-sync.md](mutations-provider-and-post-write-sync.md), [mutations-optimistic-strategy.md](mutations-optimistic-strategy.md), [ui-persist-offline.md](ui-persist-offline.md), [ui-loading-and-persist-options.md](ui-loading-and-persist-options.md) or [ui-startup-and-persistence-boundaries.md](ui-startup-and-persistence-boundaries.md).

---

## Implementation checklist — mutations

- [ ] Decision gates **G1**–**G6** for each new mutation/cache write; **G7** for irreversible provider/store flows; **G8** when post-write synchronization is correctness-required
- [ ] **MUT-M28** method chosen in order; method A unless B / C is declared on the **MUT-M14** TSDoc line with the condition that admits it
- [ ] Method A: no cache write or snapshot before the response; confirmed response bridged through the orchestrator when sufficient; invalidation awaited / returned from the callback; UI intent closed only after it settles
- [ ] **MUT-M29** when method B: pending render gated on `pending` status, no cache write, no second-state copy, invalidation promise returned/awaited from the callback, all concurrent pending entries rendered
- [ ] **MUT-M20** / **MUT-M21** cross-entity + key-family coverage
- [ ] **MUT-M22** / **SSG-R4** registry bridge consumers when applicable
- [ ] **MUT-N3** money / irreversible / legal / provider flows are method A
- [ ] **MUT-M3** / **MUT-M4** / **MUT-M11** method C shape + bridge + rollback + invalidate
- [ ] **MUT-M6** / **MUT-M8** scope discipline
- [ ] **MUT-M9** / **MUT-M15** / **MUT-M16** orchestrator returns its promise + refetch policy
- [ ] **MUT-M13** caller blocks only under method A
- [ ] **MUT-M14** dependency map for complex mutations
- [ ] **MUT-M19** error path; logger/observability/UI work inside TanStack lifecycle callbacks is fail-contained and cannot throw from `onError`/`onSettled` (libraries may detach callback failures as unhandled rejections)
- [ ] **MUT-M24** one bounded retry owner; envelope exact-true or response-less canonical network fact; lower layer disabled
- [ ] **MUT-M25** discriminated provider-success / projection-success outcome and all subordinate delivery facts
- [ ] **MUT-M26** action key created before an irreversible provider command; exact subject/scope/resource/action fence; same-key state progression preserves previously proven trace and delivery facts; terminal recovery catch uses the configured no-throw observability and UI boundaries
- [ ] **MUT-M27** required post-write sync inspects the exact active family after await, fails loud on `fetchStatus === 'paused'`, keeps the exact scope/selection/fingerprint/key authority alive across shorter-lived subtree unmounts, verifies the terminal handle before and after awaited sync, locks fingerprint-forming controls while pending, and resets intent only after the proof passes

Verification guidance: Static review: a method B or C hook declares its **MUT-M28** method and condition in TSDoc; a method A or B hook writes no query cache and takes no snapshot in `onMutate`; a method B pending render is status-gated; orchestrator sync functions return a `Promise` that the callback awaits or returns; `onSuccess` calls only allowed orchestrators; TSDoc lists affected keys; correctness-required sync retains selection/action identity until the exact-family paused-state check passes; the intent authority's owner outlives every subtree that may unmount while its selection survives; terminal ownership is checked around awaited sync; and fingerprint-forming controls and handlers are locked while pending. Runtime: force a targeted active query into `fetchStatus === 'paused'`; awaited invalidation/refetch **must** fail loud, retain the same selection and intent key across remount, and **must not** show synchronized success. Exercise resets before sync, during sync, and after a retryable terminal error; only the exact in-flight handle may be released or tombstoned. Confirm old-scope cache work cannot repopulate cleared state and a quiescent retry handle cannot create a permanent lock. Failed mutations report through the configured diagnostics boundary, with rollback under method C. Method B removes the pending representation and shows an error on failure; on success it stays visible until the reconciling refetch settles (no empty frame in between). Enforcement note (no new obligation): a file-global symbol/call marker is not evidence for **MUT-M4**/**M10**. A static check for a cache bridge should bind the bridge (or its canonical helper) to the exact `useMutation` callback and reject dead, unreachable, overridden, or identity-changing markers.

---

## Implementation checklist — UI, persist, offline

- [ ] **UIP-M1** / **UIP-M2** / **UIP-M10** / **UIP-M16** loading and error union (feature MD when present)
- [ ] **UIP-M17** / **UIP-N3** render derivations gate on query status — no throw on `pending` / transient error
- [ ] **UIP-M18** / **UIP-N4** native-splash / cold-start gate on local readiness only — startup remote checks persisted (cache-first) + surfaced in-app, not on the splash
- [ ] **UIP-M19** focus/mount/interval store-refresh is idempotent (compare-before-write; no new reference on unchanged data)
- [ ] **UIP-N5** list slots (`ListFooter/Header/renderItem`) have stable identity (depend on primitives, no inline anonymous, no whole-object churn dep)
- [ ] **UIP-M20** / **UIP-N6** sync native calls in render/hooks/interceptors go through a guarded safe accessor
- [ ] **UIP-M3** persist options centralized
- [ ] **UIP-M21** canonical default tenant/account-scoped list variant is cache-first and persisted; only search/filter/alternate-context variants are excluded (no blanket infinite-query exclusion)
- [ ] **UIP-M22** / **UIP-N7** sensitive families are exact memory-only when at-rest protection is insufficient; previous blobs are buster-invalidated and full keys have no observability egress
- [ ] **UIP-M6** SSOT readiness alignment
- [ ] **UIP-M9** error retry
- [ ] **UIP-M11** / **UIP-M12** persist caps
- [ ] **UIP-M13** cap + eviction documented

Verification guidance: Static review covers the `shouldDehydrateQuery` source, exact sensitive-family exclusion/allowlist absence, and required buster marker (**UIP-M22**/**N7**). Runtime verification covers restoring → skeleton → content, absence of sensitive-family data after cold restore, and isError paths per **UIP-M1**. Follow the consuming project's verification policy.

---

Part of: [README.md](README.md) — TanStack Query SSOT.

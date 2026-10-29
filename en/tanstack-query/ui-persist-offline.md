# TanStack Query — UI, persist, and offline-first

```kit-cover
type: normative
part-of: README.md
binds: UIP-N prohibitions and the UI, persist and offline failure-path table - the entry point of the UI and persist domain
open-when: shape:frontend-heavy, signal:cache-lifecycle, signal:cache-persistence, signal:offline-ui, signal:retry-ux
skip-when: signal:backend-only, signal:no-client-persistence
owns: UIP-N1, UIP-N2, UIP-N3, UIP-N4, UIP-N5, UIP-N6, UIP-N7, UIP-N8
```

Scope: Only loading and error presentation tied to query state, prefetch, pull-to-refresh where applicable, persist plugin (maxAge, buster, `shouldDehydrateQuery`), hydration / restoring, and alignment with [SSOT readiness](../ssot-readiness/ssot-readiness-rules.md) **M9** for cache-first UX. Navigation-only refetch bans live under [queries-and-transforms **QRY-N4**](queries-and-transforms.md). Excluded: Mutation behavior ([mutations-cache-sync.md](mutations-cache-sync.md)); MMKV implementation detail ([mmkv](../mmkv/README.md) — MMI- / MMA- / MMR-\*).

Domain part files:

- [ui-loading-and-persist-options.md](ui-loading-and-persist-options.md) — **UIP-M1**–**UIP-M17** and the **UIP-M17** enforcement note
- [ui-startup-and-persistence-boundaries.md](ui-startup-and-persistence-boundaries.md) — **UIP-M18**–**UIP-M23**
- [tanstack-query-appendix.md](tanstack-query-appendix.md) — the non-binding implementation checklist (no rule of its own)

Rule prefix: **UIP-M**\* / **UIP-N**\* — rules in this domain's part files only; this file owns **UIP-N**\*.

Environment: Applies wherever the adopting application uses TanStack Query for UI state or persistence. UI lifecycle, selected persistence storage and cache-buster versioning, and network-dependent refetch/prefetch behavior are in scope where used.

Compliance: Violations of UIP- rules in this file are defects; stop dependent work until fixed and do not knowingly release them — see the cross-cutting [TanStack Query standard](tanstack-query.md) (**TSQ-C4**, **TSQ-C11**).

Version compatibility: Confirm the installed `@tanstack/react-query` version supports the persist and query APIs in scope — [tanstack-query.md](tanstack-query.md) **TSQ-G1**.

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **UIP-N1** | Pull-to-refresh on form, single-record detail, modal, or static content screens is forbidden where the product's current interaction specification disallows it. |
| **UIP-N2** | Persist large search results, unbounded history, or scratch queries — **must** `shouldDehydrateQuery` = false for those keys (retention / ghost data risk). A compose-time quote or price the server re-derives at the write is a scratch query: inside a persisted root it **must** be excluded by its exact key prefix in the persist policy data, not by a whole-root change (a restored quote paints a stale price beside the fresh one). |
| **UIP-N3** | Throw-on-not-ready in render: Throwing (or calling a helper that throws) from a render-path derivation while the underlying query is `pending` or transiently `error` — turning a normal loading window into an error-boundary crash — is forbidden (**UIP-M17**). Gate on query status; do not equate "not loaded yet" with "failed". |
| **UIP-N4** | Splash gated on network: Gating native-splash dismissal (or the first-meaningful-frame / blocking cold-start gate) on a remote query's `isLoading` / `isPending` / `isFetching` — forbidden (**UIP-M18**). The splash covers the local cold-start window only; a server round-trip **must not** be able to hold it. |
| **UIP-N5** | Unstable render-slot identity: A function-typed list slot (`ListFooterComponent` / `ListHeaderComponent` / `renderItem` / `ItemSeparatorComponent`) — or any `useCallback` / render-fn passed where identity change forces a remount — **must not** derive its identity from a whole object that churns by reference (e.g. a store `user` / `actor` object); depend on the specific primitives actually used (e.g. `user?.id`). Inline anonymous functions as a list slot (`ListFooterComponent={() => …}`) are forbidden — identity is new every render → the slot remounts every render, re-running its mount/focus effects (**UIP-M19** loop trigger). |
| **UIP-N6** | Unguarded throwing sync native call in render/interceptor: Calling a synchronous native function that can throw (context-lost, etc.) directly in a render path, hook body, or request/response interceptor — without a try/catch safe accessor (**UIP-M20**) — is forbidden (white-screen / request-pipeline break). |
| **UIP-N7** | Credential in persist, or an unowned relaxation: A query family carrying a replayable credential **must not** be persisted into any device cache or added to a persist allowlist, whatever its encryption. A family **must not** be classified by its name instead of its payload fields, relaxed to persistable silently (no named risk owner, no written threat model, no date), protected only by hashing its key, or moved between classes without same-rollout invalidation satisfying **UIP-M22**(c). Full query keys carrying identity or tenant scope segments **must not** be emitted to logs or the project's selected crash/observability provider as proof or diagnostics. |
| **UIP-N8** | Unproven or out-of-order persisted-cache purge: When a data scope is retired (sign-out, identity change, sign-in over a retired identity), deleting the persisted query blob **must not** be counted as done by a call that returns nothing, returns silently when the store cannot be opened, or skips a post-delete absence read; its result **must not** be discarded. It also **must not** run while the persister can still flush a snapshot taken before the in-memory clear: a throttled persister captures the dehydrated snapshot at the cache event and writes it later, so the first removal event of a bulk clear can land its pre-clear snapshot after the delete and restore the retired data on the next cold start. Required order: clear memory (which cancels in-flight fetches of removed queries) with no await between that and dropping the session credential, then settle every persister write started so far, then delete and read absence in one synchronous step, returning the shared purge-proof result; the unproven surface is named in the teardown authority's single fail-loud report ([**MMR-M8**](../mmkv/mmkv-cleanup-and-teardown.md)). If the persister library exposes no flush/cancel, wrap `persistClient` to track pending writes. A type-aware check may require callers to consume the proof result; actual operation ordering and absence verification require runtime or cross-module review. |

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|---------------------|
| First load error, no cache | **UIP-M1** / **UIP-M9** — retry path. |
| Background refetch error with data | **UIP-M1** — non-blocking. |
| Failed refetch of a persisted answer that draws a way-back entry (re-authorized at use) | **UIP-M23** — keep the last success in memory and in the snapshot (never the error); family-default `gcTime` outlives observer absence; changing commands invalidate; opt-in names exact keys in one list, never a shared prefix. |
| Render derivation reads `pending` / transient `error` | **UIP-M17** / **UIP-N3** — not-ready (skeleton / contained empty); no throw to error boundary. |
| Cold start, startup remote check (for example a maintenance gate) not yet answered | **UIP-M18** / **UIP-N4** — hide splash on local readiness; read persisted value cache-first; run the remote check in the in-app loading/blocking view, not by holding the native splash. |
| Focus/mount refresh recomputes identical state | **UIP-M19** — compare-before-write; skip the store write (no new reference) → no re-render/remount cascade. |
| List footer/header re-runs its mount/focus effect every render | **UIP-N5** — stabilize the slot identity (primitive deps, no inline anonymous); + **UIP-M19** at the refresh source. |
| Sync native call throws (context lost) in render / interceptor | **UIP-M20** / **UIP-N6** — safe accessor (try/catch) returns documented fallback; render does not white-screen, requests are not broken. |
| Persist budget / memory over cap | **UIP-M13** — STOP until fix. |
| Cold open of a primary list screen shows a full-screen spinner (no cache) while warm open is instant | **UIP-M21** / **UIP-M6** — persist the default list variant (cache-first); exclude only search/filter variants (**UIP-N2**); a blanket infinite-query exclusion is the bug. |
| A replayable credential field appears in a persisted blob | **UIP-M22**(a) / **UIP-N7** — reject the whole family in `shouldDehydrateQuery`, remove it from allowlists, invalidate disallowed legacy state under **UIP-M22**(c), and verify no legacy hydration or re-save; key hashing alone is not remediation. |
| A data scope is retired and the persisted query blob **must** go | **UIP-N8** — memory clear, settle pending persister writes, delete + absence read, proof result into the teardown authority's single report; a silent or discarded delete is not a purge. |
| A business-data family is proposed for persistence | **UIP-M22**(b) — allowed only on a named risk owner's dated acceptance of a written threat model, recorded beside the predicate; otherwise memory-only. Do not decide it as an agent. |

---

Part of: [README.md](README.md) — TanStack Query SSOT.

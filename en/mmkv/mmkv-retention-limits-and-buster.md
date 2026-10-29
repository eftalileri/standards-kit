# MMKV — capacity, retention, buster, orchestration

```kit-cover
type: normative
part-of: README.md
binds: MMR obligations - persist budgets, maxAge and buster alignment, the persist classification gate, and the orchestrator write boundary
open-when: shape:frontend-heavy, signal:key-value-storage-only, signal:cache-persistence, signal:persistence-invariant
skip-when: signal:backend-only, signal:no-client-persistence
owns: MMR-M1, MMR-M2, MMR-M3, MMR-M4, MMR-M5, MMR-M6, MMR-M7, MMR-M9, MMR-M10, MMR-N1, MMR-N2, MMR-N3
```

Scope

- Included: Per-query and total MMKV persist budgets; when MMKV backs TanStack persistence, alignment with the finite project `maxAge` upper bound selected under **UIP-M11** and with the cache `buster`; stale optimistic-shape/buster rules; orchestrator boundary (no direct MMKV writes); version/manual clear; retention-policy summary.
- Excluded: `shouldDehydrateQuery` predicate implementation (product code) — normative requirement is strict filtering (UIP-\*).

Document type: Normative — part of MMKV SSOT.

Binding principle: Unbounded persist or orchestrators writing MMKV directly is a bug.

---

## References

- [mmkv.md](mmkv.md) — GMM4
- [TanStack — UI persist](../tanstack-query/ui-loading-and-persist-options.md) — **UIP-M3**, **UIP-M11**, **UIP-M12**
- [TanStack — queries and transforms](../tanstack-query/queries-and-transforms.md) — **QRY-M2**
- [TanStack — mutations and cache sync](../tanstack-query/mutations-cache-sync.md)
- [Zustand — persist](../zustand/store-persist-and-module.md) — onRehydrate, `hasHydrated`
- The adopting project's architecture documentation — cache orchestration
- [SSOT — convention-driven categories](../ssot/ssot-categories-convention-driven.md) — stale optimistic risk (**KAT-6**, **SSG-K6-1**–**SSG-K6-6** )

---

## **MUST**

| ID | Rule |
|----|------|
| **MMR-M1** | A single persisted query's complete dehydrated logical cache entry **must not** exceed the finite per-entry maximum the adopting project sets and records, based on its target-device profile, storage/performance budget, and the data families it permits. Measure the exact serialized entry at the persistence write boundary in **UTF-8** bytes, including its key, metadata and state, not only the data payload and not JavaScript `string.length` (**UTF-16** code units); validate the cap on representative supported devices before enabling it. Keep an early data-only rejection under the same budget authority so a clearly oversized payload is not first copied into and parsed from the complete persisted blob; a **UTF-16** length above the cap proves rejection, never acceptance. Filter oversized complete entries before the aggregate budget; retain the remaining entries and apply [**MMR-M2**](mmkv-retention-limits-and-buster.md) oldest-first eviction. Large historical datasets **must not** be persisted. An entry that exceeds its cap is never silently truncated or partially written: exclude or reduce the family, keep it memory-only, or revise the documented policy, and report the failed persistence through the observable failure boundary. Restore snapshots pass through the same capacity authority without rewriting disk: preserve valid entries and their Unicode values, isolate entries failing the minimum hydrate shape, and let subsequent ordinary persister writes heal the retained disk snapshot. Parser, serialization and native-storage failures use the existing single [**MMA-M5**/**M8** boundary](mmkv-async-adapter.md); parser diagnostics **must not** disclose stored JSON fragments, and invalidity **must not** produce fabricated payloads or a parallel schema subsystem. Enforcement limit ([**ENA-A1**(c)/A2](../enforcement-architecture/enforcement-admission.md)): the runtime serialized-write/read authority enforces capacity; a separate static check would duplicate the stronger runtime mechanism. Complete writer/reader reachability and minimum-shape/domain-validation boundaries remain review obligations; a single-file check lacks the cross-module call graph. |
| **MMR-M2** | The adopting project must set and record a finite total application persistence budget based on representative device capacity, workload, storage/performance needs, and data-family sensitivity. Measure realistic aggregate persisted state and approach the cap by evicting the oldest or lowest-priority eligible entries first. If eviction cannot keep the store within budget, reject further persistence through the observable failure boundary and narrow or revise the policy; do not silently drop, truncate, or overrun data. |
| **MMR-M3** | When MMKV backs TanStack persistence, `persistOptions.maxAge` must not exceed the finite project upper bound selected under [UIP-M11](../tanstack-query/ui-loading-and-persist-options.md), and both configurations must stay aligned. A data family's effective retention may be shorter or memory-only. If the selected bound or a family's eligibility changes such that an older MMKV blob is no longer allowed, bump the `buster` to invalidate that blob. |
| **MMR-M4** | `buster` **must** include `appVersion` (or equivalent) for cache versioning ([**UIP-M11**](../tanstack-query/ui-loading-and-persist-options.md)), and that input **must** change with every release build: a fallback constant used when the build supplies no version leaves the buster inert, so entries of an old response shape survive the deploy. A release build without the version input fails loud. |
| **MMR-M5** | When a persisted client-cache shape changes (for example, renamed fields or changed nested records), bump the persist buster so old serialized data is invalidated. If a shared contract version appears in a persisted query key, bind that version to the buster so a version change cannot leave old rows on disk until normal expiry. A project's cross-file check may enforce that relationship; when no such check exists, document the verification path and review the key factory, version source, and buster together. |
| **MMR-M6** | UI / transforms **must** assume restored persist data may not match current API shape — per-item isolation per [**QRY-M2**](../tanstack-query/queries-and-transforms.md). |
| **MMR-M7** | Domain orchestrators **must not** write TanStack / Zustand persist payloads directly to MMKV; persistence goes only through TanStack persister and Zustand `persist` middleware — orchestrators invalidate / refetch via `QueryClient` only. |
| **MMR-M9** | When a record is removed from authoritative client state offline / online , persist **must** stay consistent — use `removeQueries` / `removeItem` so ghost entries do not reappear on next hydration. |
| **MMR-M10** | Persist classification gate (MMKV side of [**SEC-M-STORE-2**](../security/security-secrets-and-logging.md)). Which TanStack/Zustand families reach an MMKV persist instance is decided by payload function — read from the fields of the type the query returns — not by the instance's encryption and not by the family's name. A family whose payload carries a replayable credential (a value that grants access or authority when captured and replayed) **must** be memory-only whatever encryption that instance has. Generic TanStack mutation dehydration **must** be explicitly disabled because paused mutation variables bypass query-family classification and may carry OTPs, tokens, or command credentials; a durable offline command queue is a separate field-aware authority. Every other family is persistable only on a recorded, dated acceptance by the project's named risk owner against a written threat model; without that record it stays memory-only. Either way the single dehydration/partialization policy rejects the whole family explicitly, the allowlist stays closed so an unknown new root is never written, and hashing only the key is insufficient because the value remains. If any released version persisted a family whose class has since changed, the same rollout **must** invalidate disallowed state through the buster or the explicitly proven targeted classification-retirement migration defined by [**UIP-M22**(c)](../tanstack-query/ui-startup-and-persistence-boundaries.md). That row owns the complete alternative conditions; this does not relax **MMR-M5**/**N2** shape/version binding or **MMR-M11** dedicated-instance removal proof. |

**MMR-M3 review limit.** Compare the effective TanStack `maxAge` configuration with the project's **UIP-M11** decision. A static check can verify source-visible constants, but computed configuration and whether a buster actually prevents restoration of an older blob require review of the resolved runtime configuration and persistence lifecycle.

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **MMR-N1** | **Must not** persist "everything" — heavy reports , deep analytics , unbounded search results belong in memory only (`shouldDehydrateQuery` filters strict ). |
| **MMR-N2** | **Must not** ship a shape / bridge change that affects persisted optimistic data without bumping the buster suffix (**MMR-M5** ). |
| **MMR-N3** | **Must not** write a credential-bearing family to any MMKV instance, classify a family by its name instead of its payload fields, relax a family to persistable without a named risk owner and a dated written threat model, treat a stable hash of its key as payload protection, or change persistence eligibility without same-rollout invalidation under **MMR-M10** / [**UIP-M22**(c)](../tanstack-query/ui-startup-and-persistence-boundaries.md). |

---

## Buster bump — not required (normative)

These do not by themselves require **MMR-M5** suffix bump:

- New query key with no legacy dehydrated counterpart
- `staleTime` / `gcTime` only changes (no serialized shape change )
- New orchestrator / invalidation paths without changing dehydrated value shape

A classification change under **MMR-M10** always requires invalidation of already-written disallowed state, even when the API/query shape did not change. The buster is the default; only [**UIP-M22**(c)](../tanstack-query/ui-startup-and-persistence-boundaries.md)'s fully proven targeted classification-retirement migration may replace it. **MMR-M5**/**N2** still govern optimistic/bridge shape and version changes; logical filtering is not physical removal under **MMR-M11**.

---

## Failure paths (normative)

| Situation | Required behavior |
|-----------|-------------------|
| Budget exceeded / OOM risk | Tighten dehydration , lower limits , evict (**MMR-M1**–**MMR-M2** ). |
| Cold start after shape change without buster | Treat as process bug — fix **MMR-M5** + deploy. |
| A replayable credential field is present in a persisted MMKV blob | STOP persistence for that family, add the explicit policy exclusion, invalidate disallowed legacy state under **MMR-M10** / **MMR-N3** and [**UIP-M22**(c)](../tanstack-query/ui-startup-and-persistence-boundaries.md), and verify it cannot hydrate or re-save. Physical removal remains a separate proof. |
| A business-data family is proposed for MMKV persistence | Allowed only with a named risk owner, a written threat model and a dated record beside the dehydration predicate; otherwise memory-only (**MMR-M10**). |

---

## Implementation checklist

- [ ] **MMR-M1**–**MMR-M7**, **MMR-M9**, **MMR-M10**
- [ ] **MMR-N1**–**MMR-N3**
- [ ] Buster exception list understood

---

Older local retention guidance is historical; use this file as the current source for the subjects it covers.

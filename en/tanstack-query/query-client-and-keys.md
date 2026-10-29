# TanStack Query — QueryClient and query keys

```kit-cover
type: normative
part-of: README.md
binds: CLI obligations - QueryClient defaults and provider wiring, hierarchical query-key factories and the modular query-module layout
open-when: shape:frontend-heavy, signal:server-state-cache, signal:cache-lifecycle, signal:query-key-factory
skip-when: signal:backend-only, signal:no-server-state-change
owns: CLI-M*, CLI-N*
```

Scope: Only QueryClient defaults, provider wiring at app root, hierarchical query keys, and modular file layout for query modules. Excluded: Query hook business logic and transforms ([queries-and-transforms.md](queries-and-transforms.md)); mutations ([mutations-cache-sync.md](mutations-cache-sync.md)); loading/persist ([ui-persist-offline.md](ui-persist-offline.md)).

Rule prefix: **CLI-M**\* / **CLI-N**\* — rules in this file only.

Environment: Applies to the browser or native-app bootstrap, the configured TanStack Query dependency, the network transport used by `queryFn`, and the shared QueryClient instance.

Compliance: Violations of CLI- rules in this file are bugs; **must not** ship; STOP dependent work until fixed, per [TanStack Query core](tanstack-query.md) **TSQ-C4** and **TSQ-C11**.

Version compatibility: Confirm the installed `@tanstack/react-query` version supports the APIs these defaults rely on — [tanstack-query.md](tanstack-query.md) **TSQ-G1** / **TSQ-C10**.

---

## **MUST**

| ID | Rule |
|----|------|
| **CLI-M1** | The app **must** use one shared `QueryClient` (or documented test doubles in tests only) with documented defaults. Configure a bounded retry policy and backoff; choose window-focus, reconnect, mount, and network-mode behavior for the application's interaction and offline requirements; and define `staleTime` / `gcTime` in the architecture or a decision record. The default `retry` is one named predicate, not an inline copy: it declines when the canonical error envelope says `retryable === false` (the server's registered flag), declines a rate-limit response, and otherwise caps the count. A per-query `retry` override calls that predicate and may only narrow it (fewer attempts for a transport failure, a feature's own expected codes); it never re-implements it and never re-admits a response the server marked non-retryable. Backoff (`retryDelay`) and `retryOnMount` are named defaults in the same module, never per-query copies; `retryOnMount` lets an observer mount re-request a failed query without data only after the backoff ceiling has passed since the failure, because a surface that hides an observer while loading otherwise remounts it on every attempt and turns one terminal error into a request per round trip. A local predicate that skips the shared one costs redundant requests and log noise; record the actual scope and limits of any check that guards it. |
| **CLI-M2** | Placeholder / previous data within one semantic scope: Default query behavior may preserve previous list/detail data only while the previous and next keys belong to the same authorization, tenant, viewer, entity, and business-filter scope (for example, a page/cursor transition inside one filter). In v5, use `placeholderData` with `keepPreviousData` or the architecture's documented equivalent. A key change alone does not prove previous data is safe to render; cross-scope behavior is governed by **CLI-M12**, not this default. |
| **CLI-M3** | Query keys **must** be hierarchical (e.g. `['domain', 'segment', …params]`) and **must** be built via object-style key factories per domain (exported grouped object), not ad hoc stringly keys scattered in components. |
| **CLI-M4** | Query-related hooks and key modules **must** follow the architecture's modular boundaries (for example, domain-local hook modules and a shared `queryKeys` authority); do not return to a monolithic file when the codebase is organized by domain. |
| **CLI-M5** | The `QueryClient` factory and defaults **must** live in one documented module imported by the application root; do not create duplicate clients without a defined owner. |
| **CLI-M6** | The default client `staleTime` **must** match the application's documented baseline; per-hook overrides **must** align with **CLI-M7** or have a recorded rationale. |
| **CLI-M7** | New and updated hooks **must** select `staleTime` from the data class below or use a documented exception. The purpose is to avoid cache drift and arbitrary per-hook values. |

Stale-time matrix (normative classes):

| Data class | Freshness policy | Rationale |
|------------|------------------|-----------|
| Critical or time-sensitive lists | Short; define against expected update cadence and invalidation coverage | Keep cross-surface views consistent. |
| Dashboard or summary | Moderate; balance expected freshness with request cost | Avoid constant refetch for derived views. |
| Static or rarely changed data | Longer, with explicit invalidation when changed | Reduce unnecessary network work. |
| Detail or financial data | Define from the consequence of staleness and update cadence | Match freshness to the cost of showing stale values. |
| Near-real-time indicators | Short or event-driven | Match the user's expectation of timely updates. |

| **CLI-M8** | The default `gcTime` **must** be set and documented in the application's cache policy. A persisted query family **must** keep a `gcTime` at least as long as the horizon its data must survive unobserved (a family default derived from the persistence allowlist, not per call site), because garbage collection removes the query from memory and the next persister write removes it from disk — the next cold start then shows loading for data the user already saw. The longer retention stays bounded by the persistence budget (**MMR-M1**/**MMR-M2**) and the in-memory cap (**UIP-M13**), and the persister's eviction **must** stay linear in the entry count. |
| **CLI-M9** | Date-range list queries **must** cap the maximum requested span according to the application's data volume and service limits; wider ranges **must** use pagination or multiple queries, not unbounded range keys. |
| **CLI-M10** | Persist wiring: If the app uses persisted cache, the same QueryClient instance **must** be passed to `PersistQueryClientProvider` (or equivalent) together with `persistOptions` per [ui-persist-offline **UIP-M3**](ui-loading-and-persist-options.md) — buster, `maxAge`, `shouldDehydrateQuery` are not redefined here. |
| **CLI-M11** | An object-style domain key factory that exposes an `all(...)` family prefix **must** keep that exact prefix at the start of every array-valued descendant key. A descendant may spread/call the family authority or repeat a structurally identical prefix, but it **must not** insert a segment before the tenant/scope positions, reorder them, or open a sibling root that the family's prefix invalidation cannot match. Use the enforcement mechanism the adopting project documents, and record its actual scope and limits. |
| **CLI-M12** | Cross-scope placeholder isolation: When a query-key transition changes authorization, tenant, viewer/actor, entity owner, or business-filter scope, the consuming hook **must** locally disable any global previous-data placeholder (in TanStack Query v5, use `placeholderData: undefined`) and the surface **must** gate rendering on readiness for the exact current key. Data inherited from the previous scope, or a current key still pending, placeholder, paused, initially errored, or failed to refetch, is not usable as current-scope data: show the appropriate loading/error/retry state and do not render previous-scope rows beneath the new scope label. Current-key cached data may remain visible during an ordinary same-key background refetch only when that surface's freshness policy permits it; an authorization roster or equivalent current-capability input may need its own successful fetch before use. A proven same-scope cursor/page transition remains under **CLI-M2**. Worked example of a business-filter scope, because this one is routinely misread as a page transition: a reader-supplied geographic origin, together with the search radius it is paired with, is a business-filter scope for this row — rows computed for a previous coordinate **must not** render under a new one, and the fact that they arrive from the same endpoint through the same infinite query does not make them the same scope. The cursor transition inside one origin stays under **CLI-M2** and is unaffected. |

---

**CLI-M12** application — a report type is not the whole scope. Previous-data logic that compares only report family or type still carries old tenant, subject, actor or date-filter rows beneath a new selection. A hook with those changing dimensions explicitly overrides global previous-data policy with `placeholderData: undefined`; its region gates current-exact-key pending state and may preserve only the exact key's real cache during an ordinary same-key background fetch. Explicit local options override defaults; disabling placeholder synthesis does not clear actual current-key data. This is the same **CLI-M12** predicate, not a new rule identity.

**CLI-M3** application — scoped family prefixes and retained entry identity. A full key with optional trailing arguments is not its family prefix: explicit `undefined` participates in partial matching and misses concrete limit/cursor readers. Expose the shortest scoped segment prefix from the same factory and derive full keys from it; reserved scope values belong to that factory. Discover or patch matched families through APIs that retain each actual full key, preserving every envelope member through the reader's result type rather than a smaller local copy. The prefix excludes sibling segments and other scopes; full reader hashes and persistence identities remain unchanged. The registered prefix and synchronization API are stronger mechanisms than a new shape checker. Cross-scope previous-data isolation remains **CLI-M12**, even when invalidation or cleanup exists elsewhere.

**CLI-M3**/**CLI-M12** application — requested target and body association. A response's default tenant is not the reader's selected tenant. Qualifying a key with B cannot turn an account-wide/default-A actor body into B data: send the real selected target through the existing backend membership authority and prove the response association before current readiness or complete-snapshot publication. When no target was requested, expose that absence explicitly rather than infer a target from the default body. Global account display fields may remain the same across this correction, while actor, commission and tenant-scoped fields are scoped; preserving an old query spelling is not a compatibility duty when no positive consumer requires its wrong scope. Keep independent required cache work under the original session proof when publication itself legitimately retires a stronger context lease. Existing typed target/body/runtime authority is stronger than a new check; caller/SDK/lifecycle completeness stays review-owned.

**CLI-M12** application — receipt freshness and cache freshness. A receipt's business freshness is not its cache timestamp. When a scope's actual proof is permanently released, returning to an equal key **must** invoke the existing reader rather than reuse a time-fresh but unusable entry. Use the library's same canonical key identity to bind the complete registered context, and preserve real current-exact-key cache under that surface's ordinary background-display policy. Strict current-capability readiness remains separate: success, idle, non-invalidated and current validated receipt are all required. No previous-scope placeholder, family-prefix body injection or opaque receipt reconstructed by structural deep-sharing is admissible. SDK key/hash/readiness completeness remains source-review evidence; no new rule identity is added.

**CLI-M7** application — periodic refetch. The poll interval is a class choice like `staleTime`. A query whose server read-model is recomputed on every request (large scan, multi-authority aggregate, per-row derivation) **must** take its `refetchInterval` from its own data class — how often its source changes and how stale its screen may be — and **must not** inherit the client's global dashboard poll. A key family of such read-models gets that interval once, as a family default (TanStack `setQueryDefaults` on the family prefix from the key factory, **CLI-M3**), so a hook added to the family later cannot fall back to the global poll; a hook overrides it only with an interval from its own documented class. Reason: each tick from an idle open tab is a full server recomputation that returns no new data — a billed scan and a slow-request warning per tick, which floods the server's expected-warning signal until its episode alarm fires.

## **MUST NOT**

| ID | Rule |
|----|------|
| **CLI-N1** | Set `staleTime` / `gcTime` outside the documented matrix without an architecture note or recorded rationale — forbidden (**CLI-M6**, **CLI-M7**). |
| **CLI-N2** | A descendant key **must not** look visually related to a factory while placing its segment before or outside the factory's `all(...)` prefix; an invalidation against `all(...)` would silently miss that cache branch. |
| **CLI-N3** | A global `keepPreviousData` / `placeholderData` default **must not** carry rows across an authorization, tenant, viewer/actor, entity-owner, or business-filter scope change. Query-key segmentation, cache removal at another lifecycle boundary, or an eventual refetch does not permit displaying previous-scope data while the current scope is unresolved (**CLI-M12**). |

---

## Implementation checklist

- [ ] **CLI-M1** / **CLI-M5** / **CLI-M8** defaults documented
- [ ] **CLI-M2** previous-data behavior is limited to a proven same semantic scope
- [ ] **CLI-M3** key factories per domain
- [ ] **CLI-M7** matrix applied or exceptions recorded
- [ ] **CLI-M9** date-range caps for list queries
- [ ] **CLI-M10** if persist: same client + **UIP-M3**
- [ ] **CLI-M11** every array-valued descendant starts with its factory's exact `all(...)` prefix
- [ ] **CLI-M12** every cross-scope query locally disables previous-data placeholder and gates UI on current-key readiness, including paused/refetch-error states

Verification: Static review confirms one QueryClient module and documented defaults, with local placeholder overrides for sensitive-scope consumers. Runtime verification changes authorization, tenant, viewer, entity-owner, or business-filter scope while previous rows are cached; no previous-scope row may render under the new scope, and unresolved or paused current-scope reads must surface loading/error/retry per **CLI-M12** and **QRY-M7**.

---

Part of: [README.md](README.md) — TanStack Query SSOT.

# MMKV — instance ID and lazy init

```kit-cover
type: normative
part-of: README.md
binds: MMI obligations - one instance per domain, instance-ID and key namespace, singleton reuse, and lazy native init
open-when: shape:frontend-heavy, signal:key-value-storage-only, signal:mmkv-instance
skip-when: signal:backend-only, signal:no-client-persistence
owns: MMI-M*, MMI-N*
```

Scope

- Included: One MMKV instance per domain, ID naming, key namespace (**MMI-M7** ), singleton per ID, lazy `createMMKV` (Android Nitro safe), optional bootstrap retry (**MMI-M8** ), optional skip MMKV for ephemeral wizard state.
- Excluded: Async `getItem` / `setItem` wrapper (MMA-\*); capacity / buster (MMR-\*).

Document type: Normative — part of MMKV SSOT.

Environment: React Native / Expo with `react-native-mmkv`.

Binding principle: Eager `createMMKV` or one instance for all domains is a bug.

---

## References

- [mmkv.md](mmkv.md) — **MMK-C**\*, **MMK-N1**, GMM3
- [mmkv-async-adapter.md](mmkv-async-adapter.md)
- [Logging policy](../logging-policy/logging-policy.md)

---

## **MUST**

| ID | Rule |
|----|------|
| **MMI-M1** | Each logical domain (e.g. query cache, session prefs, language ) **must** use its own MMKV instance (isolation). Multiple keys inside one instance are allowed for that domain only. |
| **MMI-M2** | Instance `id` **must** follow `{project-prefix}-{domain}` (lowercase, kebab-case ) — e.g. `{prefix}-query-cache`, `{prefix}-session`, `{prefix}-language`. |
| **MMI-M3** | Per `id`, exactly one lazy-initialized singleton (module closure or factory ). |
| **MMI-M4** | `createMMKV` **must** run only on first use (lazy init ) inside a getter / factory, not at import evaluation time — align **MMK-N1**. |
| **MMI-M5** | On `createMMKV` failure (e.g. Nitro not ready ) the getter **must** log (warn or error per policy ) with root cause meta that holds on every platform the code runs on, owned once by the construction authority rather than copied per store (a per-store copy naming one platform's fault and fix mislabels the same failure on every other platform), and return `null` (no throw at init boundary ) so the adapter can degrade safely — see [mmkv-async-adapter.md](mmkv-async-adapter.md) (MMA-\*). |
| **MMI-M6** | Optional product rule: Unsaved multi-step form / wizard scratch data may remain memory-only (no MMKV ) — not required to persist before explicit save. |
| **MMI-M7** | Key namespace: Persist keys **must not** collide across TanStack Query persist vs Zustand persist (or across unrelated stores ) on the same MMKV instance : prefer separate instances per **MMI-M1** ; if one instance ever hosts multiple writers , each writer **must** use a documented non-overlapping prefix (e.g. `query-cache:`, `zustand:` ) in the project key registry . |
| **MMI-M8** | (MAY ) Bootstrap retry : for a critical domain only (e.g. query cache instance ) , after first lazy `createMMKV` failure (`null` ) , the app may attempt one additional `createMMKV` at a defined bootstrap milestone (e.g. post-splash ) — see **MMI-N3** .
| **MMI-M9** | Remembered init failure, one construction authority. The lazy singleton's state cell **MUST** record the failure, not only the instance, and that lifecycle state **MUST** live in exactly one construction authority keyed by instance id, consumed by every store module (**SSG-M8**). A per-module `{ instance \| null }` cell remembers success only: after the first failed construction it stays `null`, so the next access reconstructs, and the one after that, for the life of the process — a permanent failure then wears the costume of a transient one (**MMI-N3**). The authority **MUST** separate the two outcomes it can observe: a construction that threw is the init failure itself (remembered; reported once per process per instance id — see [client-observability-rn](../client-observability-rn/README.md) **COB-RN-M11**), whereas a factory returning "unavailable" because another authority's precondition is unmet (e.g. an at-rest encryption key) is not an init failure — it is owned and reported by that authority and **MUST NOT** be memoised as permanent, because that would extend one authority's outage across another's recoverable state. The report identity **MUST** be per instance id: a single shared init identity lets the first store's report suppress every other store's, and the rest fail silently. |
| **MMI-M10** | One guarded package load per process. A storage package whose module evaluation installs native bindings (e.g. `react-native-mmkv` evaluating Nitro's JSI install) **MUST** be loaded exactly once per process by a single load authority, inside a catch during that authority's own module evaluation, with only type-only imports elsewhere; the outcome **MUST** be remembered, and any other `require` of the package **MUST** run only after that authority reports success (then it is a cache read). A failed load **MUST** be reported once, as its own root cause, on the first consumer request (the crash reporter may not be initialised while the authority evaluates); every dependent store then degrades to `null` (**MMI-M5**) without a construction attempt or an init report of its own. Reasons: an unguarded static import throws an uncaught fatal at app start before any getter boundary exists; the bundler caches the module error, so the failure is permanent for the process and **MMI-M8**'s retry cannot recover it; and while a module factory runs a failing dependency is rethrown into the caller's catch, but a `require` issued later at runtime hands the cached error to the global fatal handler and returns `undefined` (Metro), so a second, runtime load turns one missing binding into a fatal-handler call plus a misleading "property of undefined" error. Review-held (**ENA-GV3**): a check that matches a module by name for static imports and `require` alike cannot tell a guarded load from an unguarded one. |

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **MMI-N1** | **Must not** route all persist domains through a single MMKV instance without domain separation — violates **MMI-M1**. |
| **MMI-N2** | **Must not** hardcode a global `createMMKV({` `id:` `'app'` `})` at top-level without lazy init — violates **MMK-N1** / **MMI-M4**. |
| **MMI-N3** | **Must not** retry `createMMKV` in a loop , poll indefinitely , or exceed one optional bootstrap retry per process start for a given instance id (**MMI-M8** ) .
| **MMI-N4** | **Must not** let each store module write its own `createMMKV` call and carry its own lifecycle cell. The duplication is the defect: every copy has to remember the failure independently, so the Nth copy silently will not, and "did this store open?" has N answers instead of one (**MMI-M9** / **SSG-M8**). Store modules declare their instance id and consume the authority. |

---

## Failure paths (normative)

| Situation | Required behavior |
|-----------|-------------------|
| Nitro / native module not ready at first access (construction) | Log + return `null` from getter; adapter resolves reads as `null` — see [mmkv-async-adapter.md](mmkv-async-adapter.md). Optional second attempt : **MMI-M8** (once only ) then **MMI-N3** . |
| Package load failed (bindings never installed, **MMI-M10**) | One report from the load authority; every getter returns `null` for the rest of the process with no retry and no per-store report. A JS update cannot repair it — the fix is a native build. |
| Critical path (e.g. query cache ) | Same as row above ; after retry exhausted , remain on null-safe degraded path (**MMI-M5** ) .

---

## Implementation checklist

- [ ] **MMI-M1**–**MMI-M10**
- [ ] **MMI-N1**–**MMI-N4**

Enforcement: the *construction-site* half of **MMI-M9** / **MMI-N4** is enforced only to the extent the adopting project documents a running check for it (every `createMMKV` call outside the declared authority); record that check's actual scope and limits. With construction confined to one authority, the *memo* half has exactly one place where it can be wrong, and review holds it there.

---

Older local instance and initialization guidance is historical; use this file as the current source.

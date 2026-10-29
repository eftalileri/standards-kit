# MMKV — async storage adapter

```kit-cover
type: normative
part-of: README.md
binds: MMA obligations - the async adapter shape TanStack persist and Zustand createJSONStorage consume, its null-safety and its single failure boundary
open-when: shape:frontend-heavy, signal:key-value-storage-only, signal:cache-persistence, signal:store-persistence
skip-when: signal:backend-only, signal:no-client-persistence
owns: MMA-M*, MMA-N*
```

Scope

- Included: Wrapping sync MMKV (`getString`, `set`, `delete`) into the async shape expected by TanStack Query persister and Zustand `createJSONStorage`, null-safe when storage is unavailable, failure reporting through one boundary (**MMA-M5** ), JSON serialization safety (**MMA-M8** ).
- Excluded: Instance creation (MMI-\* ); retention / buster (MMR-\* ).

Document type: Normative — part of MMKV SSOT.

Binding principle: Direct sync MMKV calls from TanStack / Zustand persist APIs without this adapter shape is a bug.

---

## References

- [mmkv.md](mmkv.md) — **MMK-N3**
- [mmkv-instance-and-lazy-init.md](mmkv-instance-and-lazy-init.md)
- [TanStack — UI persist](../tanstack-query/ui-persist-offline.md) — `createAsyncStoragePersister`
- [Zustand — persist](../zustand/store-persist-and-module.md) — **ZSP-M2**, `createJSONStorage(() =>` `adapter)`
- [Logging policy](../logging-policy/logging-policy.md) — backend tier only; see the warning below
- [Client observability (RN / Expo)](../client-observability-rn/classification-authority-and-outbound-links.md) — **COB-RN-M6** (single classification authority)
- [Client observability (RN / Expo) — silent failure paths](../client-observability-rn/silent-failure-paths.md) — **COB-RN-M11** (a local log is not observability on a shipped client); [absorbed defaults and global nets](../client-observability-rn/absorbed-defaults-and-global-nets.md) — **COB-RN-M12** (silent-degradation boundary)

> Failure-reporting rule. A client-side local log is not sufficient if it is not delivered through the application's observability boundary. For a failure that the adapter absorbs, report it through the single client classification authority and add local diagnostics only where useful. The backend logging policy may govern the shape of local log records, but does not replace the client delivery path.

---

## **MUST**

| ID | Rule |
|----|------|
| **MMA-M1** | Adapter **must** expose `getItem(key:` `string):` `Promise<string` `|` `null>`, `setItem(key:` `string,` `value:` `string):` `Promise<void>`, `removeItem(key:` `string):` `Promise<void>` compatible with TanStack persister and Zustand `createJSONStorage`. |
| **MMA-M2** | `getItem`: If lazy getter returns `null`, resolve `Promise.resolve(null)`. Else `storage.getString(key)` → `Promise.resolve(value` `??` `null)`. On read error: report through the single client classification authority (**COB-RN-M6**, via the **MMA-M5** boundary) + `Promise.resolve(null)` (no crash ). The resolved value **MUST** stay `null` -- reporting never changes the degraded return (**COB-RN-M12**). A read error that is only written to a local log is not handled (**COB-RN-M11**): the whole point of this path is that the caller cannot tell a failed read from an absent key, so the failure has no other way out. |
| **MMA-M3** | `setItem`: If storage `null`, `Promise.resolve()`. Else `storage.set(key,` `value)` → `Promise.resolve()`. On write error: `Promise.reject(error)` (or project policy equivalent that surfaces failure to callers ). When the project policy is the resolve variant (failure absorbed rather than surfaced), the failure **MUST** be reported per **MMA-M5** / **COB-RN-M12** -- an absorbed write is exactly the silent-degradation case, and a local log alone does not discharge it. |
| **MMA-M4** | `removeItem`: If storage `null`, `Promise.resolve()`. Else `storage.delete(key)` → `Promise.resolve()`. On error: report per **MMA-M5** + policy-consistent resolve / reject. A silently resolved `removeItem` is a security-relevant silent degradation when the key holds sensitive data (the value survives a "successful" clear) -- see [retention](mmkv-retention-limits-and-buster.md) **MMR-M11** / **MMR-N4**. |
| **MMA-M5** | Every adapter failure path (**MMA-M2** – **MMA-M4**, **MMA-M8b**, and lazy-init failure per MMI-\*) **MUST** go through one boundary helper that reports to the client's single classification authority (**COB-RN-M6**); the call sites **MUST NOT** each write their own catch-and-report (**SSG-M8**). A local project-logger line (never `console.log` / `console.error`) is written beside that report for developer-machine diagnostics -- never instead of it (**COB-RN-M11**). The report carries structural evidence only: fixed module / instance-id / operation identifiers plus the structural error identity -- never the stored value, and never raw `message` / `stack`, because persisted payloads and key names can hold user data or credentials (**COB-RN-M8**, **COB-RN-N6**). It is deduplicated per process with the suppressed-repeat count kept recoverable (**COB-RN-M12b**), since these methods run on every read. The backend [logging policy](../logging-policy/logging-policy.md) governs the shape of the local line; it is not the delivery channel on this tier. |
| **MMA-M6** | TanStack Query persist **must** use `createAsyncStoragePersister({` `storage:` `queryCacheStorageAdapter` `})` (or project named equivalent ) backed by this MMKV adapter. |
| **MMA-M7** | Zustand persist **must** use `createJSONStorage(() =>` `mmkvStorageAdapter)` (or project named equivalent ) per [**ZSP-M2**](../zustand/store-persist-and-module.md). |
| **MMA-M8** | Serialization safety (persist path ): (a) Values written with `setItem` for TanStack / Zustand persist **must** be valid JSON strings (**UTF-8** text that `JSON.parse` accepts ) — the middleware stringifies JSON ; do not persist non-JSON plain text under those keys. (b) No `JSON.parse` failure may crash the app or escape unhandled from the read path : either the `getItem` implementation validates with `try/catch` and returns `Promise.resolve(null)` on invalid / corrupt JSON before returning to middleware, or a single documented wrapper around the adapter does so — and the parse failure **MUST** be reported per **MMA-M5** (structural context: key namespace/operation and the structural error identity, `rootCause: invalid or corrupt JSON` -- never the corrupt payload itself, which is untrusted persisted data). A corrupt-JSON rehydrate that is only logged silently empties a persisted cache and is indistinguishable from a cold start (**COB-RN-M11** / **COB-RN-M12**). |
| **MMA-M9** | Composed adapters **must not** fabricate the answer they failed to read. MMA-M2's `null` degradation applies to a raw adapter: `null` means that adapter has no value to return. A composed adapter that builds an authoritative answer from multiple stores must not return a partial answer when any required source is unreadable. Each inner read must distinguish *absent* from *unreadable* with a typed outcome; on unreadable, the composed adapter returns no assembled answer. Likewise, a failed credential promotion must not skip removal of the credential from a less-protected general store or return a restored session. Successful promotion preserves secret-store write → general-store scrub order, serialized through one write authority so an older migration cannot overtake a newer auth write. [On violation: a state no store holds is presented as restored session state, or a replayable credential remains in a general store after failed promotion] [Verify by: failure of either source cannot produce an answer asserting the merged fact; promotion failure still reaches the scrub path] |

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **MMA-N1** | **Must not** pass raw sync MMKV API to TanStack / Zustand persist without Promise-wrapped methods — breaks contract (**MMA-M1** ). |
| **MMA-N2** | **Must not** return a non-JSON string from `getItem` to middleware that will `JSON.parse` it without a guarantee of valid JSON — violates **MMA-M8** (corrupt disk / manual writes ). |
| **MMA-N3** | **Must not** merge a failed inner read into an assembled answer that asserts the merged fact, treat a raw adapter's honest `null` as permission for a composed adapter to return a half-built authority answer, or let a failed credential promotion skip the general-store scrub and still return restored session state (**MMA-M9**). |

Declined check for the **MMA-M9** write side ([**IV-M13**](../implementation-verification/change-acceptance-bar.md)): one measured promotion site in one file is not a recurring class (**ENA-A1**(a)); a typed protocol or lint rule is reconsidered when a second independent production site appears.

---

## Failure paths (normative)

| Situation | Required behavior |
|-----------|-------------------|
| Storage `null` (init failed ) | Reads `null`; writes / removes no-op resolve (**MMA-M2**–**MMA-M4** ). The init failure itself is reported once per process (**MMA-M5**); re-attempting `createMMKV` on every call is forbidden (**MMI-N3**; at most one bounded bootstrap retry, **MMI-M8**). |
| Read throws | Report (**MMA-M5** ) + `Promise.resolve(null)` — return value unchanged. |
| Write throws | `Promise.reject` (**MMA-M3** ) unless project standard defines a single alternate surface (document it ); if that surface absorbs the failure, report it (**MMA-M5** ). |
| Corrupt / invalid JSON in MMKV for a persist key | **MMA-M8** (b) : report (**MMA-M5** ) + `Promise.resolve(null)` (degraded rehydrate ) — no parse throw to UI; the parse failure **MUST NOT** be discharged by a local log alone (**COB-RN-M11**). |
| Any of the above handled only by a local log | Defect. On a shipped client the log has no transport; the failure is silent (**COB-RN-M11** / **COB-RN-M12**). |

---

## Implementation checklist

- [ ] **MMA-M1**–**MMA-M9**
- [ ] **MMA-N1**–**MMA-N3**

---

Older local adapter guidance is historical; use this file as the current source.

# MMKV — core (global SSOT)

```kit-cover
type: normative
part-of: README.md
binds: MMK-C / MMK-G / MMK-N obligations and GMM decision gates when react-native-mmkv is a candidate or selected persistence backend
open-when: shape:frontend-heavy, signal:key-value-storage-only, signal:cache-persistence, signal:store-persistence, signal:persistence-backend-selection
skip-when: signal:backend-only, signal:no-client-persistence, signal:other-backend-selected
owns: MMK-C3, MMK-C7, MMK-G1, MMK-G2, MMK-G3, MMK-N1, MMK-N2, MMK-N3, GMM1, GMM2, GMM3, GMM4, GMM5
```

Scope

- Included: The option to use `react-native-mmkv` as persistence storage for TanStack Query or Zustand on React Native: its conditional version gate, agent contract, global MUST / MUST NOT rules, and decision routing among MMKV, memory-only operation, and other selected backends. Instance, adapter, and retention details live in part files.
- Excluded: TanStack `shouldDehydrateQuery` key lists (product); Zustand `partialize` field lists (product); token vault implementation ([security/README.md](../security/README.md)).

Document type: Normative — core for the MMKV topic.

Environment: React Native client projects evaluating or selecting MMKV; version and platform compatibility follow the adopting project's dependency and native-runtime configuration.

Binding principle: Top-level `createMMKV()`, secrets in MMKV, or bypassing lazy init on Android Nitro risk paths is a bug. Remedy: fix code or update these documents.

---

## Rule identifiers (normative)

| Prefix | Where defined | Meaning |
|--------|----------------|---------|
| **MMK-C**\* | This file only | Agent execution contract. |
| **MMK-G**\* | This file only | Global **MUST**. |
| **MMK-N**\* | This file only | Global **MUST NOT**. |
| MMI-\* | [mmkv-instance-and-lazy-init.md](mmkv-instance-and-lazy-init.md) | Instance ID, lazy init — only there. |
| MMA-\* | [mmkv-async-adapter.md](mmkv-async-adapter.md) | Async adapter — only there. |
| MMR-\* | [mmkv-retention-limits-and-buster.md](mmkv-retention-limits-and-buster.md) | Limits, buster, cleanup, orchestrator boundary — only there. |

Citations **must** use full IDs (e.g. **MMI-M1**).

Rule locality: One behavior class per part file. Hub [README.md](README.md) has no M/N tables. Compliance in parts ties to **MMK-C4** / **MMK-C11**.

---

## References

- [README.md](README.md) — reading order.
- [TanStack Query — UI persist](../tanstack-query/ui-loading-and-persist-options.md) — maxAge, buster, **UIP-M11** / **UIP-M12**
- [Zustand — persist](../zustand/store-persist-and-module.md) — **ZSP-M2**, `createJSONStorage`
- [Logging policy](../logging-policy/logging-policy.md) — structured diagnostics where the client observability model supports them
- [mmkv-async-adapter.md](mmkv-async-adapter.md) — **MMA-M8** serialization ; [mmkv-instance-and-lazy-init.md](mmkv-instance-and-lazy-init.md) — **MMI-M7** key namespace , **MMI-M8** / **MMI-N3** retry
- [Decision matrix](../decision-matrix/decision-matrix.md) — persist client state
- [Queries and transforms](../tanstack-query/queries-and-transforms.md) — **QRY-M2** per-item transform resilience
- The adopting project's architecture documentation — cache orchestration
- [security/README.md](../security/README.md) — where tokens live (not MMKV)

Code samples: [`../_meta/examples/mmkv-code-samples.md`](../_meta/examples/mmkv-code-samples.md) (non-normative).

---

## Agent execution contract

See [_meta/agent-contract.md](../_meta/agent-contract.md) for shared **C1-C12** rules, including the Resolution paragraph that defines the `MMK-C<n>` spelling. Hub-specific additions:

- **MMK-C3**: Precedence — STATE > BEHAVIOR > UI; TanStack > Zustand for server cache persist shape
- **MMK-C7**: When a project selects MMKV, its version must satisfy MMK-G1 and the compatibility assumptions of the adopted MMKV-specific APIs.

---

## Technology

| Topic | Rule |
|-------|------|
| MMKV | If selected: use the v4+ API compatibility floor required by this hub and its adapter guidance (**MMK-G1**). This does not require an unselected project to add MMKV. |
| Async API consumers | Zustand `createJSONStorage`, TanStack persister — **MMA-\***. |

---

## **MUST** (global)

MMK-G1: If the project selects react-native-mmkv, its resolved package version **must** satisfy v4+, the minimum API compatibility floor assumed by this hub's MMKV-specific rules and adapters; otherwise STOP and select a compatible version or update the MMKV guidance. This gate does not apply when the project selects memory-only persistence or another backend.

MMK-G2: Shipped adapter / instance modules **must** keep ESLint and TypeScript clean (zero new errors).

MMK-G3: The adopting project's architecture must choose memory-only operation or a persistence backend for each client state/cache family. When MMKV is the selected backend, new Zustand or TanStack Query persistence on React Native must use it through the documented MMA-* adapter. A memory-only or alternative-backend choice is a normal architecture decision, not a time-boxed exception to MMKV; apply that backend's own security, lifecycle, and restoration rules.

---

## MMKV vs alternatives (normative summary)

| Use case | Choice | Binding |
|----------|--------|---------|
| Zustand persist (RN ) | Use the architecture-selected backend; if MMKV is selected, MMKV + adapter | **MMK-G3**, GMM1 |
| TanStack Query persist (RN ) | Use the architecture-selected backend; if MMKV is selected, MMKV + adapter | **MMK-G3**, GMM1 |
| Secrets / tokens | Secure storage (project SSOT ) | MMK-N2** |
| Ephemeral wizard scratch | Memory only | GMM1, GMM3, **MMI-M6** |

Memory-only and alternative-backend choices are valid architecture decisions, not migration exceptions. A time-boxed exception is relevant only when a project is already bound to an MMKV decision and needs a temporary deviation while carrying out a documented migration.

---

## **MUST NOT** (global)

MMK-N1: createMMKV() at module top-level (eager import time) — forbidden; MMI-* lazy init only.

MMK-N2: Persist authentication tokens, refresh tokens, passwords, or other classified secrets in MMKV — forbidden; use project secure storage per security/README.md.

MMK-N3: Expose raw MMKV instance to UI / random modules for ad hoc reads / writes outside the documented adapter / singleton getters — forbidden (MMI- / MMA- access paths only).

---

## Decision gates (normative index)

Purpose: Binary routing for persist storage choice. Rows cite existing IDs.

GMM1: Select MMKV only if YES when: the family's requirements benefit from synchronous cold-start reads and the architecture selects MMKV rather than another backend. Binding rule IDs: MMK-G3, MMK-N2, ZSP-M2, UIP-M12. If NO: select memory-only operation or another backend through the architecture decision; this is not a migration exception.

GMM2: Proceed with MMKV persist only if YES when: Data is not token / secret / PCI class. Binding rule IDs: **MMK-N2**. If NO: Secure store per security SSOT.

GMM3: Persist a family only if YES when: it must survive the relevant session or restart; ephemeral scratch can remain in memory. If persistence is required, use the backend selected by architecture; apply MMKV-specific rules only when MMKV is selected. Binding rule IDs: MMK-G3, MMI-*. If NO: keep the family memory-only (for example, component state where appropriate).

GMM4: Proceed with MMKV persistence for a family only if capacity and retention requirements can be met under the family's policy. Binding rule IDs: MMR-*. If NO: narrow the persisted family, select memory-only operation or another architecture-approved backend, or stop until the persistence choice is resolved.

GMM5: Proceed with MMKV persistence for a query/state family only if YES when: the storage instance's approved at-rest protection matches the sensitivity of both the key and value. Binding rule IDs: **MMR-M10**/**MMR-N3**, security **SEC-M-STORE-2**/**SEC-N-STORE-2**, TanStack **UIP-M22**/**UIP-N7**. If NO: keep the whole family memory-only through the single persist-policy gate and bump the buster when an older release could have written it; if the old data lives in a dedicated instance outside that buster, apply **MMR-M11**/**MMR-N4** physical-removal (file-level proof) bounded lifecycle cleanup.

---

## Implementation checklist (core)

- [ ] **MMK-G1** / **MMK-G3** / **MMK-C10**
- [ ] Decision gates GMM1–GMM5
- [ ] **MMK-N1**–**MMK-N3**

---

Older local MMKV guidance is historical; use this folder as the current source.

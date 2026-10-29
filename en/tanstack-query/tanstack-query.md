# TanStack Query — core (global SSOT)

```kit-cover
type: normative
part-of: README.md
binds: TSQ-C / TSQ-G / TSQ-N cross-cutting server-state obligations, the react-query version gate and the rule-locality contract for this topic
open-when: shape:frontend-heavy, signal:server-state-cache, signal:cache-lifecycle, signal:dependency-upgrade
skip-when: signal:backend-only, signal:no-server-state-change
owns: TSQ-C3, TSQ-C7, TSQ-G1, TSQ-G2, TSQ-G3, TSQ-N1, TSQ-N2
```

Scope

- Included: Cross-cutting rules for TanStack Query as the server state layer: precedence, agent contract, technology version gate, global **MUST** / **MUST NOT** that apply regardless of feature area. Domain-specific rules live only in the part files linked from [README.md](README.md).
- Excluded: Details of QueryClient numeric defaults (see [query-client-and-keys.md](query-client-and-keys.md)); query/transform hooks (see [queries-and-transforms.md](queries-and-transforms.md)); mutations and cache sync (see [mutations-cache-sync.md](mutations-cache-sync.md)); loading UI and persist (see [ui-persist-offline.md](ui-persist-offline.md)). Zod on mutation payloads is specified in [forms](../forms/forms.md). MMKV mechanics: [mmkv](../mmkv/README.md) (MMK- / MMI- / MMA- / MMR-\*).

Document type: Normative — core file for the TanStack Query standard (this topic).

Environment: Applies to browser and native applications that use TanStack Query for network-backed server state.

Binding principle: Treating server state as Zustand / useState primary cache, bypassing this standard’s version gate, or scattering mutation rules beyond what **TSQ-N2** permits is a bug. Remedy: fix code or update these documents.

---

## Rule identifiers (normative)

To keep rule locality clear after the split:

| Prefix | Where defined | Meaning |
|--------|----------------|---------|
| **TSQ-C**\* | This file only | Agent execution contract (single sequence). |
| **TSQ-G**\* | This file only | Global **MUST** (cross-cutting). |
| **TSQ-N**\* | This file only | Global **MUST NOT** (cross-cutting). |
| CLI-\* | [query-client-and-keys.md](query-client-and-keys.md) | QueryClient, keys, layout — only there. |
| QRY-\* | [queries-and-transforms.md](queries-and-transforms.md) | Queries, transforms, hook flow — only there. |
| MUT-\* | [mutations-cache-sync.md](mutations-cache-sync.md) + the band files it names | All mutation, optimistic, bridge, invalidation, race, orchestration — only in that mutation part-file set. |
| UIP-\* | [ui-persist-offline.md](ui-persist-offline.md) + the band files it names | Loading/error UX, prefetch, pull-to-refresh, persist, offline, **UIP-M16** feature-MD overrides — only in that UI/persist part-file set. |

Citations **must** use these IDs (e.g. **MUT-M4**, not a generic **M4** in the mutations file).

Rule locality: **TSQ-N2** below is the single authority on where a domain's rules may live; the prefix table above says which file owns which prefix, and a prefix owned by a banded part set names the entry file that lists that set. The hub [README.md](README.md) has no **MUST** / **MUST NOT** rows. Each part file includes a Compliance line tying violations to the defect-resolution and release requirements in **TSQ-C4** / **TSQ-C11**.

---

## References

- [README.md](README.md) — reading order (non-normative index).
- [Decision matrix](../decision-matrix/decision-matrix.md) — TanStack vs Zustand vs forms.
- [Error handling](../error-handling/error-handling.md) — query/mutation error UX minimums.
- [Forms](../forms/forms.md) — mutations and Zod.
- [Zustand](../zustand/README.md) — client state boundary vs server cache (ZSB-\*).
- [SSOT readiness and form data](../ssot-readiness/ssot-readiness-and-form-data.md) — readiness gate, offline-first with cache.
- [Gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md)
- [Code modularity](../code-modularity/code-modularity.md) — runtime file baselines (COD-\*); pairs with **QRY-M4** for screen–hook modules
- [editable-persistent-attributes/README.md](../editable-persistent-attributes/README.md) — backend cascade after mutation.
- [ssot/README.md](../ssot/README.md) — cache lifecycle / validation gate cross-reference; **MUT-M22** / **SSG-R4** registry-linked cache bridges.
- The adopting project's architecture documentation, including cache orchestration guidance where applicable.

Code samples: [`../_meta/examples/tanstack-query-code-samples.md`](../_meta/examples/tanstack-query-code-samples.md) (non-normative). Mutation decision routing: [mutations-cache-sync.md § Decision gates](mutations-cache-sync.md#decision-gates-normative-index) (normative index).

---

## Agent execution contract

See [_meta/agent-contract.md](../_meta/agent-contract.md) for shared **C1-C12** rules, including the Resolution paragraph that defines the `TSQ-C<n>` spelling. Hub-specific additions:

- **TSQ-C3**: Precedence — STATE > BEHAVIOR > UI, then TanStack Query > Zustand > Form > Routing > Performance
- **TSQ-C7**: Version compatibility is a standard — use the major version assumed by the APIs in scope, or document and verify the equivalent behavior for the installed version.
- **TSQ-N1**: No parallel client cache for same server state per decision matrix

---

## Technology

| Topic | Rule |
|-------|------|
| Server state | `@tanstack/react-query` version compatible with the APIs used (**TSQ-G1**). |
| Persist (when used) | Compatible TanStack persistence package and the application's approved storage adapter — detail in [ui-persist-offline.md](ui-persist-offline.md). |

---

## **MUST** (global)

TSQ-G1: The installed @tanstack/react-query version **must** support the APIs and behavior relied on by the adopting codebase. If an in-scope rule depends on a version-specific API (such as v5 placeholder behavior), use that version or document and verify an equivalent; do not silently apply assumptions from another major version (**TSQ-C10**).

TSQ-G2: Shipped query/mutation modules in scope **must** keep the project's configured lint and type checks clean (zero new errors).

TSQ-G3: Zod schema placement and mutation parameter validation **must** follow forms; server request validation **must** follow error policy — no duplicate schema SSOT in this topic.

---

## **MUST NOT** (global)

TSQ-N1: Use another client library as the primary server-state cache for the same data that **must** use TanStack Query per decision matrix.

TSQ-N2: Scatter rules for one domain (e.g. mutation lifecycle) across multiple part files — a domain's rules belong in that domain's own part file, and every mutation rule belongs to the mutation domain whose part files mutations-cache-sync.md names (Rule identifiers). This row grants no exception of its own: the only ground on which one family's rows may sit in more than one file is a band that meets every condition of [**KIT-ADD-4**](../authoring/kit-rule-addition.md), and a spread that fails any of them is a scatter this row forbids. File size is never answered by narrowing this row.

---

## Implementation checklist (core)

- [ ] **TSQ-G1** / **TSQ-C10** version gate
- [ ] **TSQ-G2** / **TSQ-G3** toolchain + schema SSOT
- [ ] **TSQ-N2** locality: mutation content only under MUT-\*, and in more than one part file only as a band that meets every **KIT-ADD-4** condition

# Architecture core (agent entry map)

```kit-cover
type: reference
part-of: README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** agent entry, client architecture, layer map, forbidden edges, file placement, reading order

Document type: Non-normative routing and index aid. This file defines no new **MUST** or **MUST NOT** and restates no rule text. Binding obligations live only in linked normative documents. If this map conflicts with a topic SSOT, follow the topic file. The authoritative topic tree is always [README index](../README.md).

Purpose: One first-pass map for agents: stack routing, terminology, where each normative boundary family is defined (link + identifier only), default file placement, and audit entry points.

Copy policy: A reference to a rule here is a link plus its identifier, never its text, so a copy cannot diverge. Open the linked file for the rule's complete obligations, verification steps, and exceptions.

---

## When to open this file

`open-when: never-by-default` is this file's whole answer, and it is deliberate: a task opens it only when a hub or a rule names it, or when a reader wants the layer edges and the boundary identifier definition sites in one screen. Whatever it shows, the linked normative file is still opened for the full tables, the Pass: checks and the exceptions.

It publishes no reading order. The kit has exactly one, [agent-planning-procedure.md](../agent-planning/agent-planning-procedure.md) **P1-P8**, and a file that declares `binds: nothing` cannot issue a second one. This reference adds no file candidates or precedence; use the planning procedure's **P4**/**P5** cover-block selection and open the linked normative file for its full requirements.

---

## Stack precedence (pointer)

For conflicts among frontend client-state concerns in a stack that uses these libraries, [TanStack Query core **TSQ-C3**](../tanstack-query/tanstack-query.md) orders STATE above BEHAVIOR above UI, then TanStack Query above Zustand above Form above Routing above Performance. This is not a backend or security tie-break. For other cross-topic conflicts, use [decision matrix Precedence](../decision-matrix/decision-matrix-governance.md) and [precedence layers](precedence.md).

---

## Terminology map (informative)

| Informal term | Kit meaning | Primary SSOT |
|----------------|-------------|----------------|
| Screen / UI surface | Presentation screen; UI-only where **QRY-M4** applies | [queries-and-transforms](../tanstack-query/queries-and-transforms.md) **QRY-M4**; [code modularity](../code-modularity/code-modularity.md) COD-\* |
| Hook module | Paired module: TanStack hooks, handlers, transforms; **QRY-M1** wiring | [queries-and-transforms](../tanstack-query/queries-and-transforms.md) **QRY-M1**, **QRY-M5** |
| Service / API module | HTTP clients and `queryFn` owners — not navigation | **QRY-M1**; [store boundaries](../zustand/store-boundaries.md) **ZSB-N2**; [routing](../routing/navigation-rules.md) **RTG-M2** |
| Store | Zustand client state — not authoritative server cache | [store boundaries](../zustand/store-boundaries.md) ZSB-\*; [zustand core](../zustand/zustand.md) ZST-\* |
| Orchestrator | Flow policy hook or module (navigation or post-mutation sync) | [routing](../routing/navigation-rules.md) **RTG-M9**; [mutations-cache-sync](../tanstack-query/mutations-cache-sync.md) MUT-\* |
| Guard | Sync route gate — not async, not fetch, not store mutation | [routing](../routing/navigation-rules.md) **RTG-N5**, **RTG-M4** |

---

## Decision path (stack placement)

- Server-backed data, fetching, cache, mutations → [TanStack Query](../tanstack-query/README.md) per [decision matrix](../decision-matrix/decision-matrix.md) Matrix rows.
- UI client state when the matrix assigns it → [Zustand](../zustand/README.md).
- Forms and mutation payload validation → [Forms](../forms/forms.md) with TanStack parts as linked from the TanStack hub.
- Unclear server vs client → [store boundaries](../zustand/store-boundaries.md) failure path; [gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md); STOP until resolved.

Project overlays: Some consuming projects have architecture documentation. Those docs may tighten project paths; they must not weaken kit **MUST NOT** rows ([TanStack **TSQ-C8**](../tanstack-query/tanstack-query.md), [Zustand **ZST-C8**](../zustand/zustand.md)).

---

## Normative boundary index (definition sites only)

Where each layer-critical identifier family is defined. No rule text appears here — open the file.

| Boundary | Identifiers | Defining file |
|----------|-------------|---------------|
| TanStack Query — data flow and screens | **QRY-M1**–**QRY-M9**, **QRY-N1**–**QRY-N4** | [queries-and-transforms.md](../tanstack-query/queries-and-transforms.md) |
| TanStack Query — core contract | **TSQ-C3**, **TSQ-N1** | [tanstack-query.md](../tanstack-query/tanstack-query.md) |
| TanStack Query — client and keys | CLI-\* | [query-client-and-keys.md](../tanstack-query/query-client-and-keys.md) |
| TanStack Query — mutations and cache sync | MUT-\* | [mutations-cache-sync.md](../tanstack-query/mutations-cache-sync.md) |
| TanStack Query — UI, persist, offline | UIP-\* | [ui-persist-offline.md](../tanstack-query/ui-persist-offline.md) |
| Payment SSOT — financial list integrity | **PAY-UI-M6**, **PAY-UI-N2** | [ui-binding.md](../payment-ssot/ui-binding.md) |
| Zustand — store boundaries | **ZSB-M1**–**ZSB-M4**, **ZSB-N1**–**ZSB-N4** | [store-boundaries.md](../zustand/store-boundaries.md) |
| Zustand — global store rules | **ZST-N1**–**ZST-N4** | [zustand.md](../zustand/zustand.md) |
| Routing | **RTG-M1**–**RTG-M18**, **RTG-N1**–**RTG-N6** | [navigation-rules.md](../routing/navigation-rules.md) |
| Routing | GRTG1–GRTG5, RTG-C\* | [routing.md](../routing/routing.md) |
| Imports | **IMP-N1**–**IMP-N4** (and IMP-C\*, IMP-M\*, GIM\*) | [component-and-module-imports.md](../imports/component-and-module-imports.md) |
| Code modularity | [**COD-M3**](../code-modularity/code-modularity.md) — one responsibility | [code-modularity.md](../code-modularity/code-modularity.md) |

---

## File placement (defaults; project may document equivalents)

| Artifact | Typical location | Normative / example pointer |
|----------|------------------|----------------------------|
| Feature screen (UI surface) | `src/features/<feature>/screens/` (adjust per project) | [routing](../routing/navigation-rules.md) **RTG-M9** Pass glob |
| Flow orchestrator | `src/navigation/` or `src/features/<feature>/orchestration/` | [routing](../routing/routing.md) |
| Paired hook module | Same feature tree as screen (e.g. `Screen.hooks.ts`) | **QRY-M4** |
| Shared UI | Path under documented shared UI root | [component-and-module-imports](../imports/component-and-module-imports.md) IMP-\* |
| QueryClient owner | Single module (e.g. `src/services/queryClient.ts`) | [query-client-and-keys **CLI-M5**](../tanstack-query/query-client-and-keys.md) |
| Zustand stores | Project store root (e.g. `src/stores/`) | **RTG-N1** Pass paths; [zustand](../zustand/README.md) |
| Navigation types / linking | `src/navigation/types.ts`, `linking.ts` | **RTG-M3**, **RTG-M6** in [routing](../routing/navigation-rules.md) |
| Navigation patterns doc | A project-designated navigation or architecture document | **RTG-M10**, **RTG-M14** in [routing](../routing/navigation-rules.md) |

---

## Audit and verification entry points

| Mechanism | Hub |
|-----------|-----|
| Topic Pass: rg / multiline checks (example: **RTG-M2**, **RTG-M9**) | [navigation-rules.md](../routing/navigation-rules.md) and other topics with Pass columns |
| Guard scripts and CI fail-closed | [False positive prevention](../false-positive/README.md) |
| MD to code inventories and evidence rows | [Implementation verification](../implementation-verification/README.md) |

Binding split: Topic markdown (QRY-\*, ZSB-\*, RTG-\*, …) remains the normative contract. Any automated checks the adopting project runs are an executable subset — they can lag, misfire, or omit a rule; a reference to a check is not evidence that it exists or covers the full rule. If check output and a normative table disagree, resolve per [agent gray decisions](../agent-gray-decisions/gray-situation-decisions.md) and project process (STOP until the check, code, or SSOT is aligned).

---

## Maintenance rule

When kit **MUST** / **MUST NOT** rows change, update only this file's links and identifier ranges. Do not paste normative tables or one-line rule summaries here — that would fork SSOT. The complete topic list lives in [README.md](../README.md); this file keeps no copy of it.

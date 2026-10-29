# Standards (English) — index

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: signal:kit-rule-change, signal:standards-change
skip-when: none
owns: none
```

**Keywords:** standards index, topic navigation, SSOT, English kit

SSOT for normative text lives in topic folders below. `_meta/` contains both normative files and routing aids: [`agent-contract.md`](_meta/agent-contract.md) defines the shared **C1–C12** agent execution contract; [`precedence.md`](_meta/precedence.md) defines kit conflict resolution, routed by **SSG-P1-5** in [ssot-precedence-and-enforcement.md](ssot/ssot-precedence-and-enforcement.md). Each file declares its role in its own cover block `type:` key and Document type line; the folder does not decide it.

**Standards change discipline (routing aid; non-normative):** Before adding a **new** topic folder or normative `.md`, (1) name the **real-world problem** and check [decision-matrix](decision-matrix/decision-matrix.md) for an existing **problem class** row; (2) search **existing hubs** for the same concern (direct or indirect); (3) **default: extend the existing hub's part file** rather than open a parallel topic — a new **part file inside an existing topic** is ordinary and expected, while a **new topic folder** stays the one genuine last resort, because a new folder means a parallel topic; (4) add or adjust a **matrix** row only when introducing a **new binding problem class** or **stack** path — not for every paragraph; (5) if unsure, follow [gray-situation decisions](agent-gray-decisions/gray-situation-decisions.md) and default to **extend existing**. **Goal:** minimize duplicate SSOT and parallel systems. **What may be written:** only a new reusable rule, never per-fix narrative or history ([KIT-ADD-12](authoring/kit-rule-addition.md)). File size is authoring guidance, not a gate — what it prompts, and what it never authorises, is **KIT-ADD-3**'s and **KIT-ADD-4**'s and is not restated here. **Executable steps:** [adding a rule to this kit](authoring/kit-rule-addition.md) (**KIT-ADD** steps), [the structural invariants it protects](authoring/kit-structural-invariants.md) (**KIT-INV**) and [changing or deleting one](authoring/kit-rule-change-and-enforcement.md) (**KIT-CHG**, **KIT-ENF**, **KIT-LIM**). **Related:** [Agent planning procedure](agent-planning/agent-planning-procedure.md) (P1–P8), [Agent runner protocol](agent-planning/agent-runner-protocol.md) (**C7** when an authoritative execution MD is named), [markdown authoring](authoring/markdown-authoring.md) (**M10**, **M19**, **N3**).

## Meta

**This index links only what a task reads to decide something.** The orientation map, the optional project-local legacy-mapping scaffold, the optional migration tracker, the skill-hint pointer and the `§`-code glossary are one hop away in [`_meta/README.md`](_meta/README.md) and [`authoring/README.md`](authoring/README.md). Migration files are populated only by a consuming project with verified records; they are not live authority maps for a new copy. Each file is opened by **P5** from its own `open-when` when a task needs it — putting them here made every task pay for them.

- [Meta folder index](_meta/README.md) — what each `_meta/` file is and whether it binds; the orientation map, the empty project-local legacy-mapping scaffold and optional migration tracker are listed there
- [Agent planning procedure](agent-planning/agent-planning-procedure.md) (P1-P8 — binding plan/scoping order; use with topic standards); [Agent runner protocol](agent-planning/agent-runner-protocol.md) (**C7** — when @ referencing an authoritative execution plan MD)
- [Precedence and conflict layers](_meta/precedence.md) (**normative**: what a precedence ladder must satisfy and which side wins between two kit statements — **KIT-PRE-1**–**KIT-PRE-3**; the ladder between tiers stays in the root agent-rule file. The normative row **SSG-P1-5** routes conflict resolution here)
- [Agent execution contract, shared](_meta/agent-contract.md) (normative: defines **C1–C12** plus the `<TOPIC-PREFIX>-C<n>` resolution notation for topics that cite it)
- [Agent routing aid](_meta/agent-routing-aid.md) (non-normative: **P3** shape table + **P4** task-kind table and lookup commands; not SSOT)

## Topics

**This list is derived from the folder tree** — one row per directory under `en/` that is not `_meta/`, with the hub path and the hub's own H1 title. It is the kit's single topic index: no other file keeps a copy. Regenerate it from the tree rather than editing rows by hand.

<!-- kit-index:topics -->

| Topic | Hub |
|-------|-----|
| `accessibility-rn` | [Accessibility (React Native / Expo)](accessibility-rn/README.md) |
| `agent-gray-decisions` | [Gray-situation decisions (agent)](agent-gray-decisions/README.md) |
| `agent-planning` | [Agent planning (procedure)](agent-planning/README.md) |
| `ai-visibility` | [AI / Chatbot Visibility (GEO / AEO)](ai-visibility/README.md) |
| `analytics-rn` | [Product analytics (React Native / Expo)](analytics-rn/README.md) |
| `android-edge-to-edge` | [Android edge-to-edge and safe area (React Native / Expo)](android-edge-to-edge/README.md) |
| `api-list-pagination` | [API list pagination (backend)](api-list-pagination/README.md) |
| `app-lifecycle-rn` | [App lifecycle (React Native / Expo)](app-lifecycle-rn/README.md) |
| `appointment-lifecycle` | [Appointment lifecycle (status, time, notifications)](appointment-lifecycle/README.md) |
| `auth` | [Auth (client integration hub)](auth/README.md) |
| `authoring` | [Authoring standards](authoring/README.md) |
| `backend-http-efficiency` | [Backend HTTP efficiency](backend-http-efficiency/README.md) |
| `build-environment` | [Build and environment](build-environment/README.md) |
| `client-observability-rn` | [Client observability (React Native / Expo)](client-observability-rn/README.md) |
| `code-modularity` | [Code modularity (runtime modules)](code-modularity/README.md) |
| `connectivity-rn` | [Connectivity (React Native / Expo)](connectivity-rn/README.md) |
| `dead-code` | [Dead code (unused files, exports, dependencies)](dead-code/README.md) |
| `decision-function` | [Decision functions](decision-function/README.md) |
| `decision-matrix` | [Decision matrix](decision-matrix/README.md) |
| `editable-persistent-attributes` | [Editable persistent attributes (MongoDB — denormalization and cascade)](editable-persistent-attributes/README.md) |
| `email-provider` | [Email provider (transactional email — provider-agnostic seam + adapters)](email-provider/README.md) |
| `enforcement-architecture` | [Enforcement architecture (lint rules, guards, gates)](enforcement-architecture/README.md) |
| `error-handling` | [Error handling (behavior / client)](error-handling/README.md) |
| `error-policy` | [Error policy (backend)](error-policy/README.md) |
| `expo-notifications` | [Expo notifications (React Native / backend dispatch)](expo-notifications/README.md) |
| `false-positive` | [False positive prevention (guard scripts) — hub](false-positive/README.md) |
| `feature-flags-rn` | [Feature flags (React Native / Expo)](feature-flags-rn/README.md) |
| `forms` | [Forms](forms/README.md) |
| `idempotency` | [Idempotency (backend SSOT)](idempotency/README.md) |
| `implementation-verification` | [Implementation verification (MD–code 1:1)](implementation-verification/README.md) |
| `imports` | [Imports (components, modules, boundaries)](imports/README.md) |
| `internationalization-rn` | [Internationalization (React Native / Expo)](internationalization-rn/README.md) |
| `local-authentication-rn` | [Local authentication (React Native / Expo)](local-authentication-rn/README.md) |
| `local-database-rn` | [Local database (React Native / Expo)](local-database-rn/README.md) |
| `locale-names` | [Locale names (country and currency UI labels)](locale-names/README.md) |
| `logging-policy` | [Logging policy](logging-policy/README.md) |
| `maps-location-rn` | [Maps and location (React Native / Expo)](maps-location-rn/README.md) |
| `mmkv` | [MMKV (kit hub)](mmkv/README.md) |
| `mobile-ui-patterns` | [Mobile UI patterns (React Native)](mobile-ui-patterns/README.md) |
| `monorepo` | [Monorepo (workspace boundaries)](monorepo/README.md) |
| `name-consistency` | [Name consistency (canonical display names)](name-consistency/README.md) |
| `native-media-rn` | [Native media (React Native / Expo)](native-media-rn/README.md) |
| `nosql-query-safety` | [NoSQL query safety (hub)](nosql-query-safety/README.md) |
| `offline-sync-strategy-rn` | [Offline sync strategy (React Native / Expo)](offline-sync-strategy-rn/README.md) |
| `pagination-ux-rn` | [Pagination and list UX (React Native / Expo)](pagination-ux-rn/README.md) |
| `payment-ssot` | [Payment data SSOT and explicit policy](payment-ssot/README.md) |
| `performance` | [Performance (React / React Native)](performance/README.md) |
| `phone` | [Phone (E.164 SSOT, UI vs storage)](phone/README.md) |
| `realtime-rn` | [Realtime transport (React Native / Expo)](realtime-rn/README.md) |
| `redis` | [Redis (backend distributed cache and coordination — SSOT)](redis/README.md) |
| `report-excel` | [Report Excel (server-side)](report-excel/README.md) |
| `report-pdf` | [Report PDF (server-side)](report-pdf/README.md) |
| `repository` | [Repository (data access layer)](repository/README.md) |
| `routing` | [Routing (React Navigation)](routing/README.md) |
| `security` | [Security (hub)](security/README.md) |
| `ssot` | [SSoT governance (Single Source of Truth)](ssot/README.md) |
| `ssot-readiness` | [SSOT readiness and form data](ssot-readiness/README.md) |
| `styling` | [Styling (React Native)](styling/README.md) |
| `tanstack-query` | [TanStack Query (kit hub)](tanstack-query/README.md) |
| `timezone` | [Timezone resolution (IANA, UTC conversion)](timezone/README.md) |
| `transactions` | [Transactions (database atomicity)](transactions/README.md) |
| `zustand` | [Zustand (kit hub)](zustand/README.md) |

<!-- /kit-index:topics -->

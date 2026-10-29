# Routing — core (global SSOT)

```kit-cover
type: normative
part-of: README.md
binds: RTG-C agent-contract obligations, the RTG-T-STAB stability predicates, the GRTG decision gates and the guard model for React Native navigation
open-when: shape:frontend-heavy, signal:navigation-change, signal:deep-link-open, signal:route-guard
skip-when: signal:backend-only, signal:no-navigation-change
owns: RTG-T-STAB-1, RTG-T-STAB-2, RTG-T-STAB-3, RTG-C1, RTG-C2, RTG-C3, RTG-C4, RTG-C5, RTG-C6, RTG-C7, RTG-C8, RTG-C9, RTG-C10, RTG-C11, RTG-C12, GRTG1, GRTG2, GRTG3, GRTG4, GRTG5
```

Scope

- Included: React Native navigation discipline for applications that adopt React Navigation: route typing, guards, parameter validation, deep linking, session stack reset, flow ownership, idempotency, and failure paths. API details assume the version selected by the application. Routing reads TanStack Query, Zustand, and persistence outputs per the decision matrix; it does not redefine server/client state rules.
- Excluded: TanStack Query mutation / cache algebra ([mutations-cache-sync](../tanstack-query/mutations-cache-sync.md)); Zustand store shape ([zustand](../zustand/README.md)); MMKV persistence ([mmkv](../mmkv/README.md)); list / navigator performance minimums ([PERF-BIM-\*](../performance/bundle-navigation-images-memory.md)) except where this file cites them.

Document type: Normative — core for the routing topic. The **RTG-M\*** / **RTG-N\*** rows, the normative failure paths, modal vs push and hardware back live in [navigation-rules.md](navigation-rules.md); call order, deep linking and file layout live in [navigation-flow-and-layout.md](navigation-flow-and-layout.md).

Environment: Applies to React Native clients using the navigation library, deep-link hosts, and ref lifecycle selected by the application.

Binding principle: [Shared agent contract C4](../_meta/agent-contract.md) applies to every **RTG-M\*** / **RTG-N\*** row (**RTG-C6**, **RTG-C11**).

References: [README.md](README.md); [decision matrix](../decision-matrix/decision-matrix.md).

Code samples: [`../_meta/examples/routing-code-samples.md`](../_meta/examples/routing-code-samples.md) (non-normative).

---

## Deterministic stability predicates (normative) — **RTG-T-STAB**-\*

Purpose: Replace unmeasured "state is stable" with boolean predicates evaluable on a single orchestrator module at review time or by observing real operation. For GRTG1, all three must be YES unless a documented N/A branch applies (see notes below the table).

RTG-T-STAB-1: Proceed YES when: Mutation gate: Either no asynchronous mutation/write operation in the route-decision flow can affect the navigation target, or every such operation has completed successfully and its selected mutation system’s pending/writing state is false on every code path that reaches navigate/dispatch/reset. For TanStack Query, this includes `useMutation` operations and `isPending === false`; apply equivalent settled-success and pending semantics for another system. If the route depends on post-write server data, RTG-T-STAB-2 must also pass for that updated current key/scope. A failed operation follows its owning error path, not a success navigation.

RTG-T-STAB-2: Proceed YES when: Query gate: Either the orchestrator does not read data, status, or route fields from a server-state query to choose the target route / params, or every query result used for that decision satisfies all of the following: its resolved query key and semantic scope match the current route inputs; its data is defined and came from a successful result for that exact key; and it is not placeholder data (`isPlaceholderData !== true` in TanStack Query, or the equivalent in another system), especially data carried from a previous key or cross-scope transition. Apply the same contract to any server-state library used by the project. A same-key successful cached result may remain usable while a background refetch is in progress (`isFetching === true`) only when the route's data contract permits that cached freshness; the refetch need not finish solely because it is in flight. If a refetch fails while same-key cached data remains, use that data only when the route contract explicitly permits stale-on-error behavior. Without usable successful data for the exact current key/scope — including initial pending, first error, paused-without-data, undefined data, or cross-key/cross-scope placeholder data — this gate is NO and the existing loading, error, offline, or retry path owns the outcome.

RTG-T-STAB-3: Proceed YES when: Ref ready gate: Either this call site does not use navigationRef, or navigationRef.isReady() === true immediately before the navigation API call.

N/A branches (must be stated in code comment `RTG-T-STAB-NA` + predicate ID + one-line reason ): **RTG-T-STAB-2** N/A when the flow uses only static route targets and params from sync props / route params already validated (**RTG-M5**) and no server-state query from the selected system (TanStack Query or equivalent ) participates in the decision.

Measurement discipline: If a reviewer cannot evaluate **RTG-T-STAB-1**–3 from the diff (missing hooks, hidden indirection ) , the change fails GRTG1 — STOP.

---

## Rule identifiers (normative)

**RTG-C***: This file only — Agent execution contract.

**RTG-M***: [navigation-rules.md](navigation-rules.md) only — **MUST** (numbered 1–15).

**RTG-N***: [navigation-rules.md](navigation-rules.md) only — **MUST NOT** (numbered 1–6).

**RTG-T-STAB***: This file only — Deterministic stability predicates for GRTG1.

GRTG*: This file only — Decision gates (normative index).

Citations must use full IDs (e.g. **RTG-M8**, GRTG3).

---

## Agent execution contract

RTG-C1: This topic is mandatory for React Native navigation work in scope (README Scope).

RTG-C2: [Shared agent contract C2](../_meta/agent-contract.md).

RTG-C3: [Shared agent contract C2](../_meta/agent-contract.md); routing decisions come only from **RTG-M** / **RTG-N** / GRTG / **RTG-T-STAB** rows here; deviation STOP.

RTG-C4: Precedence: STATE > BEHAVIOR > UI; TanStack Query > Zustand > Form > Routing > Performance (same as **TSQ-C3** / project matrix).
RTG-C5: Navigation is not an unspecified "effect"; it is the result of stable inputs (state + guard + param validity) and deterministic policy (**RTG-M8**).

RTG-C6: [Shared agent contract C4](../_meta/agent-contract.md).

RTG-C7: [Shared agent contract C5](../_meta/agent-contract.md) — for guards, linking, stack reset and flow ownership.

RTG-C8: Library compatibility: use APIs supported by the application's selected navigation version; document any version-specific adaptation.

RTG-C9: [Shared agent contract C3](../_meta/agent-contract.md).

RTG-C10: If the installed navigation version does not support an API assumed by an in-scope rule, stop and select a compatible API or document an equivalent implementation in the architecture.

RTG-C11: [Shared agent contract C4](../_meta/agent-contract.md).

RTG-C12: [Shared agent contract C4/C5](../_meta/agent-contract.md) governs completion.



*(The Verify cells named above are in [navigation-rules.md](navigation-rules.md).)*

---

## Technology

| Topic | Rule |
|-------|------|
| Navigation | Use the React Navigation version and peer packages selected by the adopting application; align APIs and native dependencies with that version. |
| Alternatives | This topic applies to React Navigation. Applications using another routing framework need equivalent framework-specific guidance; this file does not govern those APIs. |
| Type-safe routes | Central `ParamList` types (**RTG-M3**) are mandatory. |

Version verification: Check the installed navigation-library version and confirm that every API used by the in-scope rules is supported by it.

---

## Decision gates (normative index) — GRTG\*

Purpose: Binary routing before calling navigation APIs. Gates cite existing **RTG-M** / **RTG-N** rows; they do not add new hidden obligations.

GRTG1: Proceed only if YES when: **RTG-T-STAB-1** AND **RTG-T-STAB-2** (or documented N/A per predicate notes) AND **RTG-T-STAB-3** (or N/A). Binding rule IDs: **RTG-M1**, **RTG-N4**, **RTG-M13**, **RTG-T-STAB-3**. If NO: Keep navigation blocked and follow the owning loading, error, offline, or retry path; disable the navigation CTA where appropriate. Do not navigate while the predicate is unresolved.

GRTG2: Proceed only if YES when: At least one holds: (1) Target route differs from the focused route after a state-only update; (2) The same route needs changed params and the application's routing policy forbids in-place updates; (3) Session reset policy applies (**RTG-M7**). Binding rule IDs: **RTG-M2**, **RTG-M7**, **RTG-M9**. If NO: Do not call navigate/push; update state or merge params only.

GRTG3: Proceed only if YES when: Guard returns { allow: true } for this target (**RTG-M4**). Binding rule IDs: **RTG-M4**, **RTG-N5**. If NO: Navigate to redirect from guard result (Login / Forbidden).

GRTG4: Proceed only if YES when: Param validation passes (**RTG-M5**) for this target. Binding rule IDs: **RTG-M5**, **RTG-M6**. If NO: Safe fallback / redirect; do not render business UI with invalid params.

GRTG5: Proceed only if YES when: Reset / replace is required for this event (login success, logout, policy). Binding rule IDs: **RTG-M7**. If NO: Use CommonActions.reset / replace per policy; do not leave old stack reachable via back.

GRTG2 — onboarding gloss (non-normative; does not add or weaken obligations): First ask whether updating TanStack / Zustand / local state alone (no navigate) would still leave the wrong focused route name or required params for the intended UX. If no, do not navigate / push — merge params / refresh data instead. If yes because the stack must change (different screen, param policy, or session reset per (1)-(3) above), then GRTG2 is YES and navigation APIs may apply.

---

## Guard model (normative)

Output type (minimum): see non-normative routing-code-samples.md.

Purity: Guards are sync pure functions of read-only inputs (**RTG-N5**).

No IO: No network, no async, no store mutation (**RTG-N5**).

Order: Evaluate guard (GRTG3) then params (GRTG4) at screen entry (or navigator wrapper).

---

Version: 1.0.0  

Legacy ID parity: **RTG-M1**–M13, **RTG-N1**–N5 match `ROUTING_STANDARDS.md` for stable citations. Net-new: **RTG-M14**–M15, **RTG-N6** (hardware back / listener cleanup ).

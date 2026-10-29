# Agent planning — problem class extraction, conflict order and tie-break

```kit-cover
type: normative
part-of: README.md
binds: how a request is decomposed into matrix problem classes, how competing rows and layers are ordered, and how a remaining tie is broken
open-when: signal:stack-choice, signal:conflicting-standards
skip-when: none
owns: A1, A2, A3, A4, A5, T1, T2, T3, T4, T5
```

Scope: The **P2** step of [agent-planning-procedure.md](agent-planning-procedure.md) in full — opened when a task chooses a new layer or technology, or when two standards conflict: the binding decomposition algorithm **A1**–**A5**, the agent's role in that step, the ordered conflict-resolution ladder used before gray-situation, the short-circuit when binding docs are silent, and the tie-break rows **T1**–**T5** that settle two still-compliant options.

Document type: Normative part — **A1**–**A5**, **T1**–**T5**.

References: [README.md](README.md); [agent-planning-procedure.md](agent-planning-procedure.md) (**C1**–**C8**, **P1**–**P8**); [agent-planning-obligations.md](agent-planning-obligations.md) (**M7**, **M8**, **M11**); [decision matrix](../decision-matrix/decision-matrix.md); [gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md); [precedence](../_meta/precedence.md).

---

## Tie-break when multiple compliant options remain

Context: After matrix Precedence, **M4**, and **MUST** / **MUST NOT** checks, two implementations might still look allowed by soft wording.

**T1**: Confirm both options satisfy every applicable **MUST** and violate no **MUST NOT** in the linked Standard file(s).

**T2**: If one option breaks a **MUST NOT** or a narrower matrix obligation → discard that option.

**T3**: If one matrix row uniquely applies to the concern after Precedence — use that row; do not add a second "style" that the docs do not require.

**T4**: Product ambiguity (what feature to build, which business rule to apply, which UX flow to choose): STOP — ask the user or record an approved choice in Decisions / facts (markdown-authoring **M15**). Technical ambiguity (which code pattern, which file structure, which query shape): the agent must read the relevant production code and standards, then make the compliant choice — do not stop or narrow scope to avoid a technical decision. Forbidden: default tie-breakers such as "performance wins" or "maintainability wins" unless a Standard file explicitly states that preference for that case.

**T5**: Performance-only exceptions (PERF-*): follow performance.md and Performance README — GPERF gates, **PERF-EX-1**, ADR where required; PERF does not override TanStack / Zustand / matrix rows (see Performance hub Precedence statement).

---

## Agent role (planning phase)

Standards-derived choices: Stack / layer choices for matrix-mapped problem classes must come from the matrix row + linked Standard file — same role bar as decision matrix Agent role.

Not the product owner: What to build is specified by the user or project docs; this procedure ensures how the plan aligns with `$KIT_ROOT/en/`.

Executor: Not a system architect: do not invent unmappable stacks; do record the documented path in the deliverable (**M16**). Executor means: execute the full user request by reading code and standards, then making compliant technical choices — not narrowing scope to avoid decisions. The agent must read all relevant code files in the affected flow and choose the standards-compliant path autonomously for technical questions.

---

## Problem class extraction

SSOT: [decision-matrix-governance.md](../decision-matrix/decision-matrix-governance.md) — **M1**–**M4**, Usage (ordered), Precedence when layers conflict; [decision-matrix.md](../decision-matrix/decision-matrix.md) — Matrix.

Do not invent ad-hoc problem class names. Binding algorithm:

**A1**: Decompose the user request into concerns (e.g. "fetch list", "submit form", "persist token", "server-side cache in handler").

**A2**: For each concern, find one or more rows in the Matrix whose Problem class column describes that concern (match the wording of the column; if multiple rows match one concern, keep all until Precedence is applied).

**A3**: Multiple concerns ⇒ multiple rows in the deliverable (**M16** lists each). One physical feature (e.g. a dashboard) can legitimately map to several rows (e.g. Server state + Performance optimization + Error handling (client)).

**A4**: When two or more rows could apply to the same concern, use decision matrix **M4** and Precedence when layers conflict before gray-situation. Do not jump to gray for stack-layer ambiguity that the matrix already orders.

**A5**: If no row matches after **A2**–**A4** and decision matrix **M8** applies, STOP — document the gap; do not invent a System column value.

Illustrative mapping (non-exhaustive): "REST list + cache" on the client ⇒ rows such as Data from API / Server state / Cache (server state) (TanStack Query hub), not backend BHE alone unless the work changes HTTP handler deduplication ([backend HTTP efficiency](../backend-http-efficiency/backend-http-efficiency.md)). Aggregation on server for metrics ⇒ see matrix row Domain business aggregation and linked files.

Canonical decomposition examples (illustrative, non-normative — **A1** training aid):

| User-facing request (summary) | Example concerns (**A1**) | Typical Matrix problem classes to consider (verify against live matrix) |
|-------------------------------|---------------------------|-------------------------------------------------------------------------------|
| Login + session restore | API session, token storage, client errors | Login / logout, Token management, Error handling (client), API error response (client) |
| Dashboard with many widgets | Parallel fetches, server cache, UI perf | Data from API, Server state, Cache (server state), Performance optimization |
| Slow scrolling list screen | List rendering, data shape, refetch | Performance optimization, Data from API / Server state (if changing fetch), Error handling (client) |
| Persist filters after kill | Client persistence, rehydration | Persist (client state), User preferences (as per matrix rows for your UI) |
| New POST endpoint + validation | Body validation, idempotency, errors | Request body validation, Mutation idempotency (if applicable), Backend error handling, Repository / Transactions as per design |
| Deduplicate DB reads in one HTTP handler | Request-scoped efficiency | Backend topic: [backend HTTP efficiency](../backend-http-efficiency/backend-http-efficiency.md) (BHE-*) — not a substitute for client TanStack rows |
| E.164 phone entry field | Parse, display, storage | Phone / Phone number hubs per matrix; Form validation where applicable |
| Map + device location screen | Permissions, map view, coords | Maps and device location (RN Expo); Error handling (client); Security if logging location |
| Product funnel + screen analytics | Events, PII boundaries | Product analytics (RN Expo); Security; Routing for screen names |
| App resume after background | Refetch, sockets, listeners | App foreground / background lifecycle (RN Expo); Realtime RN; TanStack Query |

**A1** quality rule: If a concern cannot be mapped to any row after honest **A2**, treat as [decision matrix **M8**](../decision-matrix/decision-matrix-governance.md) / **P7**, not as a freestyle label (**M7**).

---

## Multi-standard and multi-layer conflict resolution

Not every "tension" is a gray conflict. Use this order:

Two Matrix rows, same concern → decision matrix **M4** + Precedence when layers conflict

Client server state vs UI state vs routing → Same: matrix Precedence (e.g. TanStack Query vs Zustand vs Routing order in matrix doc)

Backend handler efficiency (BHE-*) vs client TanStack → Not a stack conflict: BHE applies to server request/handler boundaries; TanStack applies to client server state — plan both hubs when both are in scope

Performance (PERF-*) vs TanStack / Zustand → Not an override: Performance adds UI/list/cache-alignment rules under matrix stack order — see hub Precedence; use Tie-break **T5** for documented PERF exceptions only

Error policy (server) vs error handling (client) → Complementary: each layer's hub; cite both if the plan touches API and UI

Two standards at the same tier still clash → gray-situation **M8**: apply [**KIT-PRE-2**](../_meta/precedence.md) and name the rung; a remaining tie is a document defect — record and STOP, not a user question

Precedence (root agent-rule file vs Standards vs Skills vs user) → the project's ladder, whose owner and completeness condition [precedence](../_meta/precedence.md) names; Standards win over Skills; user conflict with binding standards requires explicit resolution — STOP and clarify

---

## When standards silent (short-circuit, before **P1**)

If binding docs are silent on a required decision: prefer code-as-SSoT. Read the relevant production code. If code also unclear -> gray-situation step 5 (ask user). Do NOT stall or over-cite non-binding docs.

# Cross-impact analysis (deliverables)

```kit-cover
type: normative
part-of: README.md
binds: the trigger set, table shape, enforcement and verifiability of the Cross-impact analysis section in implementation-bound deliverables
open-when: signal:plan-deliverable, signal:cross-impact
skip-when: signal:no-markdown-deliverable
owns: XIA-C1, XIA-C2, XIA-C3, XIA-M1, XIA-M2, XIA-M2b, XIA-M3, XIA-M4, XIA-M5, XIA-N1, XIA-N2, XIA-N3
```

**Keywords:** cross-impact, **M14**, implementation plan, negative impact, follow-up, enforcement, BLOCKER

Scope

- Included: Normative shape, triggers, enforcement, and verifiability for the Cross-impact analysis section in implementation-bound Markdown deliverables (markdown-authoring.md **M6**), extending **M14**.
- Excluded: Runtime code style; TanStack Query client cache rules (tanstack-query SSOT); backend handler efficiency mechanics (backend-http-efficiency SSOT). Out of **XIA-M1** trigger set: config-only changes, background job refactors, event-driven behavior, and similar work that does not satisfy (a)–(d) do not mandate this topic's full table (**XIA-M5**); they remain under **M14** only unless explicitly escalated (**XIA-M5**).

Document type: Normative - authoring topic part file.

Binding principle: Padding deliverables with unaffected systems or "no impact" inventories is invalid under **M14**. Violations of **XIA-M1**–**XIA-M4** or **XIA-M2**/**XIA-M2b** table shape are BLOCKER outcomes (same class as other STOP / reject / bug enforcement in the kit). Rows are verifiable by static inspection, runtime observation, or an explicit failure condition.

References: [markdown-authoring.md](markdown-authoring.md) (**M14**, **M6**, **M7**); [gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md) (**M15**); [implementation-verification README](../implementation-verification/README.md) (inventory Cross-impact table rows in target MD per **IV-D5** when present); [backend-http-efficiency.md](../backend-http-efficiency/backend-http-efficiency.md) (BHE-\*; planning overlap with **XIA-M1** triggers).

---

## Relationship to markdown-authoring **M14**

| Source | Rule |
|--------|------|
| [**M14**](markdown-authoring.md) | The baseline obligation, defined in markdown-authoring — read it there; it is not restated here. |
| This file | When a full Cross-impact analysis section is used, it **MUST** satisfy **XIA-M1** through **XIA-M5** and **XIA-M2**/**XIA-M2b** (**XIA-M5** locks trigger scope vs **M14** only). |

---

## **MUST**

| ID | Rule |
|----|------|
| **XIA-M1** | Trigger: A full Cross-impact analysis section **MUST** be present when the Technical plan includes one or more of the following: (a) new or changed request-scoped mutable state on the HTTP request object; (b) process-local or in-memory cache with TTL or invalidation; (c) concurrent singleflight / shared Promise maps for outbound API or DB; (d) semantic HTTP status or `error` code changes on gateway or middleware paths. If none of (a)–(d) apply, **MUST** not open a full cross-impact table (**XIA-N3**); scope vs **M14** is locked by **XIA-M5**. |
| **XIA-M2** | Table shape: The section **MUST** use one table with exactly these columns: `Impact` \| `Consequence if ignored` \| `Required follow-up`. Prose-only cross-impact sections **MUST NOT** replace the table when **XIA-M1** applies. |
| **XIA-M2b** | `Impact` column: Each Impact cell **MUST** name a concrete integration surface or lifecycle boundary (e.g. client HTTP contract, middleware order, non-HTTP caller entry points, cache lifecycle, multi-instance coherence). **MUST NOT** use vague-only labels (performance, UX, quality) without naming that boundary. |
| **XIA-M3** | Each data row **MUST** describe one mandatory follow-up or negative outcome if ignored and **MUST** be verifiable by at least one of: (1) static inspection (repo paths, config, middleware order); (2) runtime observation (HTTP response shape, logs, metrics); (3) explicit failure condition (rejected request, semantic error code, broken contract). **MUST NOT** restate generic project goals or praise unaffected modules. |
| **XIA-M4** | Enforcement: Violating **XIA-M1** (required table missing), **XIA-M2**/**XIA-M2b** (wrong shape or Impact not naming a boundary), or **XIA-M3** (row not verifiable by (1)–(3)) is a BLOCKER. The deliverable is invalid; it **MUST NOT** be treated as final for implementation or merge until fixed. |
| **XIA-M5** | Scope boundary (intentional narrow triggers): The full Cross-impact table is mandatory only when **XIA-M1** (a)–(d) apply. All other changes **MUST** follow [markdown-authoring](markdown-authoring.md) **M14** only (one-line cross-impact or omit the heading). Escalation: If the human author requires a full table without (a)–(d), record that in Decisions / facts with a named reason ([gray-situation](../agent-gray-decisions/gray-situation-decisions.md) **M15** when ambiguous ). Absence of a full table when (a)–(d) do not apply is not a violation of this topic (stops "why no cross-impact here?" disputes for out-of-scope work ). |

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **XIA-N1** | **MUST NOT** list unaffected areas at length (**M14**). |
| **XIA-N2** | **MUST NOT** duplicate the Risk documentation table (**M7**). Cross-impact rows address integration boundaries and lifecycle coupling; Risk rows address internal failure cause and fix. **MUST NOT** restate a Risk row in different wording; each Cross-impact row **MUST** refer to a different layer than Risk (boundary vs root cause). |
| **XIA-N3** | **MUST NOT** include a Cross-impact table when **XIA-M1** triggers are absent. **MUST NOT** pad with speculative or low-impact rows; that is invalid under **M14** and **XIA-M4**. |

---

## Agent execution contract

| ID | Rule |
|----|------|
| **XIA-C1** | If **XIA-M1** applies and the deliverable omits the **XIA-M2** table, violates **XIA-M2**/**XIA-M2b** shape, violates **XIA-N1**/**XIA-N2**/**XIA-N3**, or any row fails **XIA-M3**, the deliverable is invalid (bug) until fixed (**XIA-M4**). |
| **XIA-C2** | If **XIA-M1** does not apply, **M14** only applies (**XIA-M5**); use a one-line cross-impact sentence or omit the heading; do not invent rows (**XIA-N3**). Full table without (a)–(d) requires author escalation in Decisions / facts. |
| **XIA-C3** | Violations of **XIA-M1**–**XIA-M4** (when **XIA-M1** applies ) **MUST** be treated as BLOCKER and trigger STOP; do not ship or close review as compliant until remediated or standards amended. False positive: Demanding a full table when **XIA-M5** exempts the work is not a valid **XIA-C3** trigger. |

---

## Workflow (minimal)

| Step | Action |
|------|--------|
| 1 | Scan Technical plan for one or more **XIA-M1** triggers (a)–(d). |
| 2 | If triggered, derive rows from concrete integration points: middleware chains, non-HTTP callers (jobs, scripts, batch paths), client error handling and HTTP contracts, cache lifecycle (TTL, flush, invalidation), multi-instance behavior. Each row **MUST** satisfy **XIA-M3** and **XIA-M2b**. |
| 3 | If not triggered, use **M14** only (**XIA-M5**): one-line cross-impact or omit the heading (**XIA-N3**). |

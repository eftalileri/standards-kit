# Appointment lifecycle standard (normative)

```kit-cover
type: normative
part-of: README.md
binds: APL-C1 to APL-C5, the APL-D definitions, the APL-F failure paths and the GAPL decision gates -- the contract, vocabulary, closed failure outcomes and binary routing every appointment lifecycle rule is written against
open-when: shape:backend-heavy, signal:appointment, signal:appointment-lifecycle, signal:appointment-status, signal:timezone-resolution
skip-when: signal:no-appointment-write, signal:client-only
owns: APL-C1, APL-C2, APL-C3, APL-C4, APL-C5, APL-D1, APL-D2, APL-D3, APL-D4, APL-D5, APL-D6, APL-D7, APL-D8, APL-D9, APL-D10, APL-D11, APL-F1, APL-F2, APL-F3, APL-F4, APL-F5, APL-F6, GAPL1, GAPL2, GAPL3, GAPL4, GAPL5, GAPL6
```

Normative parts split out of this file: [state machine](appointment-state-machine.md) (TR-\*, TF-\*); [**MUST**](appointment-lifecycle-must.md) (APL-M1–APL-M18); [**MUST NOT**](appointment-lifecycle-must-not.md) (APL-N1–APL-N11). Non-binding tails: [appendix](appointment-lifecycle-appendix.md).

Scope

- Included when applicable: Scheduled work with a civil date and local start time, an owning timezone, duration, lifecycle states and transitions, notification gates, read or batch evaluation, missing-data behavior, idempotency, concurrency, and timezone-aware conversion to instants. Each product documents the states, transitions, and completion or notification behaviors it supports.
- Excluded: Transport-specific notification schemas ([Expo notifications](../expo-notifications/README.md)); booking UI beyond validation; payment fields ([payment SSOT](../payment-ssot/README.md)); database indexing except where a rule names a conditional write. Additional statuses and product-specific transitions require an explicit extension.

Document type: Normative — rule engine.

Environment: Applies to the server-side write, read, scheduled-worker, and notification-dispatch paths that implement the chosen lifecycle policy.

Binding principle: Violations of APL-M / APL-N are bugs — must fix; must not ship noncompliant lifecycle or notification gates (APL-C4).

References: [README.md](README.md); [decision function](../decision-function/decision-function.md); [error policy](../error-policy/error-policy.md); [logging policy](../logging-policy/logging-policy.md); [idempotency](../idempotency/README.md); [Expo notifications](../expo-notifications/README.md).

---

## Rule identifiers (normative)

| Prefix | Meaning |
|--------|---------|
| APL-C* | Agent execution contract |
| APL-D* | Definition |
| APL-F* | Failure path (outcome table) |
| APL-M* | **MUST** |
| APL-N* | **MUST NOT** |
| GAPL* | Decision gate (normative index) |

---

## Agent execution contract

| ID | Rule |
|----|------|
| **APL-C1** | This topic is mandatory for in-scope appointment write, read completion hooks, and appointment-related notification dispatch gates (Scope). |
| **APL-C2** | Apply the shared [agent contract C2](../_meta/agent-contract.md). |
| **APL-C3** | APL rows and GAPL gates define lifecycle behaviour; additional transitions require an explicit extension amendment. Resolve uncertainty through the shared [agent contract C2](../_meta/agent-contract.md). |
| **APL-C4** | Apply the shared [agent contract C4](../_meta/agent-contract.md). |
| **APL-C5** | Precedence: [error policy](../error-policy/error-policy.md) wins on HTTP status and semantic codes for thrown errors; [Expo notifications](../expo-notifications/README.md) wins on transport; this file adds lifecycle, time, and gate minimums only. |

Enforcement: STOP / merge blocked / must not ship on APL-C4 and any APL-N row whose Consequence states STOP or bug.

Verification: static inspection or allowed real-run observation per [M12](../agent-planning/agent-planning-obligations.md).

---

## Definitions (normative) — APL-D

| ID | Definition |
|----|------------|
| **APL-D1** | nowUTC means the evaluation instant as a UTC comparable timestamp, read only through the single injectable time source (APL-M14). All comparisons in APL-D4, APL-D5, and GAPL rows use UTC instants, not floating local Date objects without offset normalization. |
| **APL-D2** | Owning timezone means a valid IANA timezone identifier authoritative for the work item's scheduling context. Resolution follows the product's documented order in APL-M12 consistently. |
| **APL-D3** | Scheduled start instant means the instant derived from the work item's civil date, local wall time, and owning timezone by the implementation's single documented timezone-aware conversion authority (APL-M1, APL-N1). |
| **APL-D4** | appointmentEndUTC means appointmentLocalStartUTC plus durationMinutes (APL-D7), as a UTC instant. If durationMinutes === 0, end equals start (zero-length slot is valid). |
| **APL-D5** | Past start means appointmentLocalStartUTC < nowUTC (strict). |
| **APL-D6** | Expired means nowUTC > appointmentEndUTC (strictly after the end instant). Equivalently: not expired when nowUTC ≤ appointmentEndUTC. |
| **APL-D7** | durationMinutes means null if and only if duration cannot be resolved from authoritative populated refs or valid service config; `0` is a valid duration and **MUST NOT** be treated as null (APL-N4). |
| **APL-D8** | OwningContextLocalTodayCalendarDate means the calendar date (year-month-day) in the work item's resolved timezone at nowUTC, using IANA rules (DST-safe). |
| **APL-D9** | Appointment calendar date means the date field stored for the appointment (interpreted as a civil date in the owning timezone, not a raw UTC day shift). Comparison strictly before today uses OwningContextLocalTodayCalendarDate (GAPL5). |
| **APL-D10** | Read-path completion means completing pending → completed when serving a single-appointment read (e.g. getById), after timezone is available (APL-M5). |
| **APL-D11** | Batch completion means a scheduled job or worker that loads candidate pending appointments and applies the same expired predicate (APL-M6). |

---

## Appointment state machine — moved

The states, named transitions TR-1–TR-3, forbidden transitions TF-1–TF-2, the extension-amendment contract and the TR-5 amendment are defined in [appointment-state-machine.md](appointment-state-machine.md).

---

## Failure paths (normative) — APL-F

| ID | Condition | Outcome |
|----|-----------|---------|
| **APL-F1** | The owning timezone cannot be resolved after the APL-M12 order is exhausted at a boundary where APL-D3 is required. | STOP — raise a typed or structured error per [error policy](../error-policy/error-policy.md); do not guess or silently default to UTC (APL-M3). |
| **APL-F2** | Batch (APL-D11): timezone missing for one owning-entity id while others succeed. | **MUST** skip or fail that slice per documented batch policy; **MUST** emit structured error log with the owning-entity id and event name (APL-M8); **MUST NOT** treat missing tz as UTC via setUTCHours (APL-N1). |
| **APL-F3** | appointmentTime invalid or absent, or durationMinutes null, and appointment calendar date is before OwningContextLocalTodayCalendarDate (GAPL5 YES). | Treat as Expired for TR-1 purposes (complete pending appointment) and **MUST** emit error-level structured log with root cause fields per [logging policy](../logging-policy/logging-policy.md) — no silent pending forever (APL-M4). |
| **APL-F4** | Same as APL-F3 but GAPL5 is NO (today or future calendar date). | throw or structured error at validation / decision boundary — **MUST NOT** return `null` / `false` alone for decision functions that must explain invalid input ([decision function](../decision-function/decision-function.md)) (APL-M9). |
| **APL-F5** | Cron / batch does not run (infra down, deploy gap). | Eventual consistency: read-path completion (APL-M5) **MUST** still eventually set completed when GAPL2 YES and GAPL4 YES and GAPL6 YES — no requirement that batch is the only path (APL-M10). |
| **APL-F6** | Concurrent TR-1 from batch and read-path for the same id. | **MUST** result in exactly one durable transition to completed and no duplicate domain side effects (APL-M7). |

---

## Decision gates (normative index) — GAPL

Gates cite APL- rows; they do not add hidden obligations.

| Gate | Proceed only if YES | Binding rule IDs | If NO |
|------|-------------------------|------------------|-----------|
| **GAPL1** | appointmentLocalStartUTC < nowUTC (APL-D5) ; nowUTC per APL-M14 | APL-M2, APL-N3, APL-M14 | Initial status `pending`; create/update notification gated by GAPL3 (not GAPL4 ) |
| **GAPL2** | nowUTC > appointmentEndUTC (APL-D6) — time only (expiry ) ; nowUTC per APL-M14 | APL-M5, APL-M6, APL-M7, APL-M14 | No time-based expiry for TR-1 (TR-1 still requires GAPL4 / GAPL6 ) |
| **GAPL3** | NOT GAPL1 at notification dispatch time for create / update events (recompute the scheduled start with the current owning timezone and nowUTC from APL-M14) | APL-N3, APL-M13 | **MUST NOT** send the create/update notification for that event (APL-N3) |
| **GAPL4** | status === `pending` — status only | APL-M7, APL-N2 | No TR-1 ; TR-3 only (idempotent no-op on `completed` ) |
| **GAPL5** | Appointment calendar date strictly before OwningContextLocalTodayCalendarDate (APL-D8, APL-D9) ; nowUTC per APL-M14 | APL-F3, APL-M4, APL-M14 | Use APL-F4 path (today / future + invalid time / null duration) |
| **GAPL6** | Either schema has no cancelled status, or status is not cancelled | APL-N7 | **MUST NOT** run TR-1 |

TR-1 requires GAPL2 ∧ GAPL4 ∧ GAPL6 (all YES ). GAPL2 evaluates only time to expiry ; GAPL4 evaluates only `pending` — do not merge those predicates into one gate row.

Creation start — [**APL-M2**](appointment-lifecycle-must.md), [**GAPL1**](#decision-gates-normative-index--gapl). Every creation producer, including recurring materialization, group insertion and relays, **MUST** derive initial status from the single start predicate; validating duration first is permitted, but end/duration never decides birth status. The start predicate owns the start comparison; a separate expiry predicate owns persisted TR-1 expiry. Use the enforcement mechanism the adopting project documents for a direct expiry-based initial-status conditional; aliases, indirect calls and complete producer coverage require cross-file provenance, and a reference to a check is not evidence that it exists or covers the full rule.

Future targets — [**APL-D5**](#definitions-normative--apl-d). Delete, detach, resource and assignee writers **MUST** select future pending records through one start predicate: start is not before nowUTC. In-progress pending records **MUST NOT** be touched. Calendar-date query bounds only narrow candidates. Client optimistic mirrors **MUST** use the same shared predicate and scope (including group and package identity). The authority and writer set are documented by the adopting project; complete new-writer coverage is cross-file information.

Expiry — [**APL-D6**](#definitions-normative--apl-d), [**APL-F3/F4**](#failure-paths-normative--apl-f). Batch, detail-read, transactional recheck and past/upcoming classification **MUST** call one expiry predicate. Resolved start/duration uses `nowUTC > appointmentEndUTC` in the owning timezone; unresolved start/duration compares the stored civil day with owning-timezone-local today, never a raw UTC day. Batch upper bounds **MUST** cover every zone: `date ≤ end of tomorrow (UTC)` is a candidate superset, and the predicate removes not-yet-due rows. A today-UTC bound wrongly delays ahead-of-UTC sessions; UTC-day expiry completes west-of-UTC sessions early. Clients **MUST** preserve server-classified membership (sorting is permitted), never reclassify by device day: a prior-day session can still be in progress after midnight.

Read windows — [**APL-D8/D9**](#definitions-normative--apl-d). Every window **MUST** distinguish:

- A decision, displayed classification or writer target uses one owning-timezone-local civil-day-window helper.
- A multi-tenant/platform candidate prefilter may use one UTC-day helper only with maximum civil-day skew (±one day), retaining every row a later owning-timezone predicate may keep. It never classifies excluded candidates. Multi-tenant decisions use one batched timezone map, never per-row lookup.

Relative days, week and month starts **MUST** use civil-day-text arithmetic seeded by local today ([**TZ-M19**](../timezone/timezone-must.md)). Compare stored civil carriers to the matching carrier bound, or compare their day text; never shift them through the owning zone again. A window serving both instant and civil fields **MUST** derive both forms once from the same day texts. Expiry and notification past-day decisions share one stored-day-text predicate. Raw `setUTCHours`/`Date.UTC` is permitted only through the candidate helper or for a reasoned non-appointment window in the authority contract. Parsing day text to its carrier uses one pure core with thin source-error wrappers: client input is a business error, server-produced input a system error; materializers **MUST NOT** rebuild it inline.

Timezone change after persist: GAPL1 and GAPL3 **MUST** use the owning timezone read at evaluation time (dispatch or handler), not a stale cached value unless the cache is invalidated on settings update (APL-M11).

---

## MUST, MUST NOT and the non-binding tails — moved

The rows APL-M1–APL-M16 are defined in [appointment-lifecycle-must.md](appointment-lifecycle-must.md); APL-N1–APL-N9 in [appointment-lifecycle-must-not.md](appointment-lifecycle-must-not.md); the function taxonomy in [appointment-lifecycle-appendix.md](appointment-lifecycle-appendix.md).

---

*Normative name: appointment-lifecycle-standard. The APL- / GAPL rows are the compliance surface.*

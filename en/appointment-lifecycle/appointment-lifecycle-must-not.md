# Appointment lifecycle — MUST NOT (APL-N)

```kit-cover
type: normative
part-of: README.md
binds: APL-N1 to APL-N11 -- the prohibitions that keep the lifecycle honest: no naive UTC mutation, no automated demotion, no notification on a past start, no duration-zero coercion, no duplicate enqueue, no swallowed failure, no inferred extension transition, no availability gate on a system re-home, no second occupancy comparison beside the named one, and no half-run derivation when a work item moves between parent aggregates
open-when: shape:backend-heavy, signal:appointment, signal:appointment-lifecycle, signal:appointment-status, signal:appointment-notification, signal:resource-occupancy, signal:derived-field, signal:cross-domain-write
skip-when: signal:no-appointment-write, signal:client-only
owns: APL-N1, APL-N2, APL-N3, APL-N4, APL-N5, APL-N6, APL-N7, APL-N8, APL-N9, APL-N10, APL-N11
```

Scope: Every **MUST NOT** row of the appointment lifecycle standard.

Document type: Normative part — APL-N1–APL-N11.

References: [README.md](README.md); [appointment-lifecycle-standard.md](appointment-lifecycle-standard.md) (APL-C\*, APL-D\*, APL-F\*, GAPL\*); [appointment-state-machine.md](appointment-state-machine.md) (TR-\*, TF-\*); [appointment-lifecycle-must.md](appointment-lifecycle-must.md) (APL-M\*).

---

## MUST NOT (normative) — APL-N

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **APL-N1** | **MUST NOT** interpret local `HH:mm` as UTC wall time via `setUTCHours` (or equivalent naive UTC mutation ) without IANA context. | Bug | APL-M1 Verify |
| **APL-N2** | **MUST NOT** transition `completed` → `pending` via automation. | Bug | Static: no handler sets `pending` from `completed` without explicit human / admin workflow documented outside this standard |
| **APL-N3** | **MUST NOT** send appointment created / updated notification when GAPL3 is NO (start already past at dispatch ). | Bug | Inspect the dispatch path: past start → no push enqueued |
| **APL-N4** | **MUST NOT** treat `durationMinutes === 0` as missing duration. | Bug | APL-M4 Verify |
| **APL-N5** | **MUST NOT** enqueue duplicate same lifecycle notification for the same business event when handlers retry. | Bug | APL-M13 Verify (idempotency key or durable dedupe ) |
| **APL-N6** | **MUST NOT** silently swallow APL-F4 conditions (return `200` with `pending` when data invalid on today ). | Bug | Static error-branch inspection: invalid time today → error |
| **APL-N7** | **MUST NOT** apply TR-1 when status is `cancelled` if that status exists in schema (GAPL6 ). | Bug | Static status-gate inspection: `cancelled` + expired → unchanged by auto complete |
| **APL-N8** | **MUST NOT** infer `cancelled` → `completed` (or other extension transitions ) from this file alone — project amendment required. | Spec gap bug | Doc search: extension section exists or schema has no `cancelled` |
| **APL-N9** | **MUST NOT** gate the system orphan re-home (APL-M15 / APL-M16) behind the interactive slot-availability / conflict preview, and **MUST NOT** relocate / auto-reschedule the work item to avoid an overlap with the fallback owner. | Bug — re-home blocked → orphan persists, or original time lost | APL-M16 Verify |
| **APL-N10** | **MUST NOT** duplicate APL-M17 occupancy in a query, memory intersection or screen check, nor use local strings, date-only values or closed `[start, end]` intervals. Touching half-open intervals do not conflict. | Bug — divergent or false slot conflicts | APL-M17: inspect every resource comparison's import, UTC inputs and half-open interval. |
| **APL-N11** | Re-parenting **MUST NOT** refresh only the destination. One link authority returns old/new identity; capture source inside the attempt before mutation, persist the move, then refresh both parent derivations in the same unit. A pre-transaction source or post-mutation lookup is not that evidence. Closed-parent counted-item guards cover this move using the item's pre-move state; an exempt "move" **MUST** explicitly mean time-only reschedule rather than parent transfer. User-actionable refusal is a business refusal (never a server fault), with the error registry's category and status and every locale's user-facing text covering this action, never old copy promising it is allowed. | Bug — stale source count or wrong refusal channel | Inspect the named link writer's fact, both same-session refreshes after persistence, pre-move state gate, precise exemption boundary and registered/localized refusal. |

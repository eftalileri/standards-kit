# Timezone resolution — recurrence occurrence, due-window claiming and runner reference zone (**TZ-M13**, **TZ-M14**, **TZ-M16**, **TZ-M17**)

```kit-cover
type: normative
part-of: README.md
binds: the MUST rows that govern a recurring scheduled occurrence -- one named nth-weekday derivation resolved in the owning subject's zone with an explicit no-occurrence branch and a deterministic DST rule, an at-or-after due window whose uniqueness comes from a durable per-occurrence claim rather than from the time predicate, the two preconditions that make widening such a window admissible (a declared finite width and a tick-independent claim proved on every delivery arm), and the runner's own reference zone declared at the registration call site instead of inherited from the host process
open-when: shape:backend-heavy, shape:full-stack, signal:timezone-phone, signal:timezone-resolution, signal:local-to-utc, signal:dst-handling, signal:calendar-day-display, signal:scheduled-job, signal:recurrence-schedule
skip-when: signal:no-timezone-surface, signal:instant-only
owns: TZ-M13, TZ-M14, TZ-M16, TZ-M17
```

Part of [Timezone resolution — **MUST**](timezone-must.md). The remaining **TZ-M** rows — the fixed resolution order (**TZ-M1**), the single local-to-UTC family (**TZ-M2**), the DST-safe conversion (**TZ-M4**), the typed-failure path (**TZ-M5**), the single clock owner (**TZ-M8**), the one-capture-per-decision rule (**TZ-M12**) and the transition-instant policy (**TZ-M15**) — are defined there and bind this band; the definitions (**TZ-D\***), contract (**TZ-C\***) and fallbacks (**TZ-F\***) are in [timezone-resolution-standard.md](timezone-resolution-standard.md), the prohibitions in [timezone-must-not.md](timezone-must-not.md) (**TZ-N\***), the gates in [timezone-decision-gates.md](timezone-decision-gates.md) (GTZ\*, **TZ-GV\***) and the verification binding in [timezone-verification-and-binding.md](timezone-verification-and-binding.md). Those five files plus this one are the complete band set for this topic.




Document type: Normative part — **TZ-M13**, **TZ-M14**, **TZ-M16**, **TZ-M17**.

References: [timezone-must.md](timezone-must.md) (**TZ-M1**, **TZ-M2**, **TZ-M5**, **TZ-M8**, **TZ-M12**); [timezone-resolution-standard.md](timezone-resolution-standard.md) (**TZ-D6**, **TZ-D9**); [ledger-scheduler-and-membership-predicate.md](../idempotency/ledger-scheduler-and-membership-predicate.md) (**IDEMP-M19** — the scheduler-owned key **TZ-M14** claims an occurrence with); [key-scope-and-replay-contract.md](../idempotency/key-scope-and-replay-contract.md) (**IDEMP-M5**); [redis-connection-keys-and-authority.md](../redis/redis-connection-keys-and-authority.md) (**RDS-M9**).

---

## **MUST** (normative) — **TZ-M**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **TZ-M13** | A recurrence defined by a calendar rule **MUST** be resolved by one named derivation used by every consumer. Evaluate it in the timezone that owns the recurrence, using the resolution order in **TZ-M1** and one captured **TZ-D9** instant per run. A period with no matching occurrence is an explicit outcome; do not move it to a neighboring date or period. Convert the resulting local civil time only through **TZ-D6**. When the local time falls in a DST gap or fold, apply one documented deterministic policy that resolves to exactly one instant. | Bug — an occurrence fires in the wrong period, zone, twice, or not at all. | Review a single derivation, explicit no-occurrence branch, one clock capture, and documented gap/fold behavior. |
| **TZ-M14** | A scheduled action tied to local civil time **MUST** use an at-or-after due condition, not equality with a clock tick. Since that window may be true on consecutive runs, uniqueness comes from a durable atomic per-occurrence claim, not the time predicate. The claim key includes at least the subject scope, occurrence period, and action purpose; it is independent of the evaluating run current time. A subject that becomes eligible after evaluation waits for the next canonical run; do not replay elapsed periods unless the product explicitly defines catch-up semantics. | Bug — a missed tick postpones work or a retry/concurrent worker duplicates it. | Review the due predicate, durable claim identity and transaction boundary, and any catch-up policy. Static inspection alone may not determine whether a predicate is a due condition. |
| **TZ-M17** | Widening an at-or-after due window under **TZ-M14** is admissible only when its finite width is justified by the runner interval and the latest time the action remains valid, and every delivery path is proven to use the same durable claim. The claim key must not include the runner tick. Close any ungated delivery path before widening; this proof is a precondition to the change. | Bug — a window delivers an action after it is valid or duplicates it on repeated runs. | Document the width rationale; review each delivery path and confirm claim identity is stable across runs. A local static check may verify the width source but cannot establish full call-graph coverage. |
| **TZ-M16** | Every recurring scheduler registration **MUST** declare the timezone in which its schedule expression is interpreted; never inherit an unspecified host-process timezone. If monitoring or a related schedule describes the same execution window, derive both from the same timezone authority. A task whose business decision uses another context local time still resolves that time inside the task through **TZ-M1** / **TZ-D6**. | Bug — execution occurs at an undeclared or inconsistent local time. | Review scheduler registration and any related monitoring window for one explicit timezone authority. |

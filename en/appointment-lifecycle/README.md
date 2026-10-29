# Appointment lifecycle (status, time, notifications)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** appointment, status, booking, notification, UTC, completion

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) — P1–P8 when this topic is in scope (P8 verification when implementation-bound); cite in deliverables per [markdown-authoring M16](../authoring/markdown-authoring.md).

Purpose: Hub for reusable rules that apply to scheduled work items when a product defines lifecycle states, an owning timezone, automatic completion, and notification gates.

Normative SSOT: [`appointment-lifecycle-standard.md`](appointment-lifecycle-standard.md) (APL-C\*, APL-D\*, APL-F\*, GAPL\*); [`appointment-state-machine.md`](appointment-state-machine.md) (TR-\*, TF-\*); [`appointment-lifecycle-must.md`](appointment-lifecycle-must.md) (APL-M\*); [`appointment-lifecycle-must-not.md`](appointment-lifecycle-must-not.md) (APL-N\*). Non-binding tails: [`appointment-lifecycle-appendix.md`](appointment-lifecycle-appendix.md).

Related standards (detail, not replacement): [decision function](../decision-function/decision-function.md), [error policy](../error-policy/error-policy.md), [logging policy](../logging-policy/logging-policy.md), [idempotency](../idempotency/README.md) (dedupe patterns where applicable), [Expo notifications](../expo-notifications/README.md).

Non-normative: This README is a router; rule text lives only in the normative part files listed above.

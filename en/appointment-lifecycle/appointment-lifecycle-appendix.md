# Appointment lifecycle — function taxonomy (informative)

```kit-cover
type: reference
part-of: README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Scope: Informative alignment between appointment lifecycle functions and the decision-function standard.

Document type: Reference — carries no rule of its own. Every obligation named here is defined in [appointment-lifecycle-standard.md](appointment-lifecycle-standard.md), [appointment-state-machine.md](appointment-state-machine.md), [appointment-lifecycle-must.md](appointment-lifecycle-must.md) or [appointment-lifecycle-must-not.md](appointment-lifecycle-must-not.md).

---

## Function taxonomy (informative alignment)

Aligns with [decision function](../decision-function/decision-function.md): duration resolution may return `null` (informational); expired predicate that throws on invalid today data is not a nullable invalid branch; complete writers **MUST** be decision paths with explicit errors (no `null` meaning failure ).

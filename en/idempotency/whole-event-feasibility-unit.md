# Idempotency — one claimed event, several irreversible effects, one feasibility gate (IDEMP-M30)

```kit-cover
type: normative
part-of: README.md
binds: whole-event feasibility before irreversible effects, one witnessed carrier and registered failure
open-when: shape:backend-heavy, signal:idempotency, signal:provider-integration, signal:webhook, signal:mutation-endpoint
skip-when: signal:client-only, signal:read-only-endpoint
owns: IDEMP-M30
```

Part of [the topic index](README.md).

**Keywords:** multi-party effect, fan-out, feasibility gate, pre-provider resolution, stranded ledger, all-or-none, branded carrier, runtime witness, saga

References: [README.md](README.md); [idempotency.md](idempotency.md); [boundary-stores-and-provider-callbacks.md](boundary-stores-and-provider-callbacks.md); [partial-failure-and-sealing-contract.md](partial-failure-and-sealing-contract.md); [compensating-action-unit.md](compensating-action-unit.md); [ssot-principles-and-precedence.md](../ssot/ssot-principles-and-precedence.md); [ssot-must-provider-projection.md](../ssot/ssot-must-provider-projection.md); [error-policy.md](../error-policy/error-policy.md); [Check verification](../false-positive/check-verification-rules.md).

---

<a id="must-normative--idemp-m30"></a>

## Whole-event feasibility — [IDEMP-M30](whole-event-feasibility-unit.md)

**IDEMP-M30**: One claimed record producing several irreversible effects **MUST** establish every effect's feasibility before the first starts. Resolve each target identity, method and environment by read-only means, without provider mutation. If any effect is infeasible, apply none: per-effect preparation followed by immediate dispatch can strand an irreversible half-event.

- (a) Establish the whole effect set before any effect, rather than discover later parties after earlier dispatch.
- (b) Every effect entry requires one feasibility carrier, protected by both a type brand and a producer-owned runtime witness; a cast or hand-built object **MUST NOT** forge entry.
- (c) Exactly one module mints the carrier. The gate and later preparation share the same target-resolution authority.
- (d) Failure is a registered system fault, reaching the category-derived crash/alert channel and preserving registry retryability for durable redelivery. It is not a business outcome and leaves ledger/provider untouched.
- (e) After the gate, each effect lives on its own durable record with its own bounded retry. A later execution failure of one effect **MUST NOT** fail the claimed record's other effects or the subject's own processing of that event: it is reported once by category and its record carries it to completion or a visible manual terminal. Reason: a secondary party's permanent fault otherwise holds the paying subject's processing hostage until the redelivery budget is spent.

## Stated enforcement limits

The branded carrier and runtime witness reject ungated/forged entry. A sequencing syntax fence is insufficient: provider reachability crosses files and a gate-name allowlist goes silent on replacement (FP-M35).

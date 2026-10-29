# Zustand — store actions, errors, TSDoc, logging

```kit-cover
type: normative
part-of: README.md
binds: ZSA obligations - synchronous store actions, null and decision semantics, TSDoc on exports, and logger use inside store code
open-when: shape:frontend-heavy, signal:client-state-store, signal:store-action, signal:log-write
skip-when: signal:backend-only, signal:no-store-action-change
owns: ZSA-M*, ZSA-N*
```

Scope: Synchronous actions, null / decision semantics, TSDoc on exports, logger vs `console`, TypeScript shape for state interfaces. Excluded: Selector usage ([selectors-and-hooks.md](selectors-and-hooks.md)); persist wiring ([store-persist-and-module.md](store-persist-and-module.md)).

Rule prefix: **ZSA-M**\* / **ZSA-N**\* — rules in this file only.

Environment: Applies to runtime client state; use the adopting project's structured logging policy where logging is required.

Compliance: Violations are bugs; **must not** ship; STOP — [zustand.md](zustand.md) **ZST-C4**, **ZST-C11**.

---

## **MUST**

| ID | Rule |
|----|------|
| **ZSA-M1** | Decision actions (validation, **must** choose valid transition) **must** throw `Error` (or project typed error) with root cause + remedy text when preconditions are invalid — no silent no-op, no default fabricated state; align the failure with [decision functions](../decision-function/decision-function.md) and [error policy](../error-policy/error-policy.md). |
| **ZSA-M2** | Read-only selectors / getters that return nullable entity state may return `null` / `undefined` when absent — callers **must** branch; decision paths **must not** use null as success (see [decision functions](../decision-function/decision-function.md)). |
| **ZSA-M3** | Every exported store hook factory and exported cross-store helpers **must** have TSDoc: purpose, params, `@throws` where **ZSA-M1** applies. |
| **ZSA-M4** | Structured logging of non-trivial transitions is required when persistence is enabled, an action throws under **ZSA-M1**, `get()` drives branching business logic, or the slice stores authentication material or sensitive user/payment data. Logging is optional for purely ephemeral toggles; raw `console.*` remains forbidden (**ZSA-N1**). Follow the adopting application's logging policy. |
| **ZSA-M5** | Store state **must** have an explicit TypeScript type, reuse shared domain types from their authority, and follow the adopting project's strict-type policy. |

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **ZSA-N1** | `console.log`, `console.error`, `console.warn` in shipped store modules — forbidden; use `logger` (**ZSA-M4**) or remove. |
| **ZSA-N2** | Decision functions that return `null` / `undefined` instead of throwing or result type when input is invalid — forbidden ([decision functions](../decision-function/decision-function.md)). |
| **ZSA-N3** | Default or zero fabrication to hide missing user / entity when policy requires failure visibility — forbidden (same bar as TanStack topic). |

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|---------------------|
| Invalid action preconditions | **ZSA-M1** — throw with action name in message or structured log + throw. |
| Structured logging unavailable in a new store | STOP — wire the configured logging boundary or document an architecture-approved exception. |

---

## Implementation checklist

- [ ] **ZSA-M1** / **ZSA-N2** / **ZSA-N3** decision paths
- [ ] **ZSA-M3** TSDoc on exports
- [ ] **ZSA-M4** / **ZSA-N1** logging
- [ ] **ZSA-M5** typing

Verification: Review that store modules use the configured logging boundary rather than raw `console.*`, exported APIs have TSDoc, and decision actions expose invalid-precondition failures.

---

## Non-normative note

Devtools middleware is optional; if used, **must not** ship production-only secrets in state. Detail: [`../_meta/examples/zustand-code-samples.md`](../_meta/examples/zustand-code-samples.md).

---

Part of: [README.md](README.md) — Zustand SSOT.

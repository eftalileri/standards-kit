# Decision functions — scope and the agent execution contract

```kit-cover
type: normative
part-of: README.md
binds: which functions this standard governs and what the agent must do when it applies — the C1 to C10 execution contract, its enforcement and verification, and the naming, folder, JSDoc, body-signal and critical-initialization criteria that classify a function as a decision function
open-when: shape:backend-heavy, shape:full-stack, signal:validation-function, signal:domain-decision
skip-when: signal:no-decision-function
owns: C1, C2, C3, C4, C5, C6, C7, C8, C9, C10
```

Scope: Part of [Decision functions (validation and domain decisions)](decision-function.md). That file keeps every behavioural row — M1–M12, N1–N5, V1, V2, the false-vs-throw table, the async rules, the `decision()` wrapper, the guard expectations, the summary and the implementation checklist — and they bind this band: the classification below is what makes a function subject to them, and C1 is the sentence that binds them to it. Those two files are the complete normative set for this topic.


Document type: Normative part — C1–C10. These are file-local bare identifiers; cite them across files in link form, e.g. `[C10](decision-function-scope-and-contract.md)`.

References: [decision-function.md](decision-function.md) (M1–M12, N1–N5, V1, V2 — the behaviour this contract binds); [README.md](README.md); [Error policy](../error-policy/error-policy.md) — required message shape; [error model, registry and boundary](../error-policy/error-model-registry-and-boundary.md) — `validate*` caller M10, retrieval M6 / M8; [Error handling](../error-handling/error-handling.md) — client-side alignment, M12; [gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md) (M15 — the documented-exception path C8 forbids skipping); [False positive prevention](../false-positive/README.md) (FP-\*).

---

## Agent execution contract

| ID | Rule |
|----|------|
| C1 | This document is mandatory for any code classified as a decision function under this spec. |
| C2 | [Shared agent contract C2](../_meta/agent-contract.md). |
| C3 | Precedence: [Error policy](../error-policy/error-policy.md) owns throw/API shape and categories; this document owns decision vs validate vs retrieval behavior and identification rules. |
| C4 | Violations are bugs — must be fixed or standards updated; no informal exceptions. |
| C5 | Change impact: List affected standards (error policy, error handling, guards); if a change breaks binding rules, stop — update standards first. |
| C6 | [Shared agent contract C2](../_meta/agent-contract.md). |
| C7 | No duplicate normative tables for decision vs retrieval in other kit files — link here. |
| C8 | Rules must not be softened locally without a documented standards change (aligned with [gray-situation M15](../agent-gray-decisions/gray-situation-decisions.md)). |
| C9 | validate* call sites must comply with [error policy M10](../error-policy/error-model-registry-and-boundary.md) and M12 in [error handling](../error-handling/error-handling.md). |
| C10 | If a non-null `validate*` result would be ignored or a critical inner `null`/`undefined` is used without `decision()`, STOP implementation — no silent success path. |

Enforcement: Violation → bug / must fix; M7–M10, V2, N1–N3 breaches → reject until corrected.



[M11](decision-function.md) binds three consumers to one authority: the computation, the maturity gate, and *the sentence stating it on screen*. None has a mechanical check: the computation and gate are held by the verdict functions' shared no-verdict / not-mature helpers and review ([decision-function.md](decision-function.md)), the sentence by the procedure below.

- What the check would need: a machine-readable edge from a user-facing string to the arithmetic it narrates — specifically, which field is the ratio's denominator. No such edge exists. Denominator identity lives in a naming convention (for example a mature-population field named beside the metric it qualifies) and in prose doc comments; a rendered sentence and the value it describes are two unrelated AST nodes in the same subtree, related only by natural-language meaning. Any rule reduces to blocklisting one sentence, which the next denominator change walks straight past — a rule wrong about itself rather than an enforcement.
- Therefore the obligation is procedural and belongs in the change, not the gate: when a metric's denominator, window or population narrows, every surface that *states* it narrows in the same change — the KPI label, the hint sentence, the section explainer, the worked example and the empty-state branch, not only the one the bug report named. Enumerate the surfaces from the field's read sites before editing any of them.
- Why this is written down: a denominator or maturity rule can change while its explanatory copy stays unchanged; the calculation and the text then disagree even though each displayed number is correct, and review that checks only the arithmetic does not catch it.
- Ratio-shaped copy carries the same trap as a ratio-shaped value: "of every 100 who X" is a denominator claim, and so is "how many of them came back". A sentence that names no denominator (a column header beside an explicit count) is the safer default where the surface allows it.

---

## What counts as a decision function

A function is treated as decision if any of the following holds.

### 1. Naming (prefix)

Name starts with one of (camelCase after prefix):

| Prefix | Example | Role |
|--------|---------|------|
| `can` | `canUserProceed` | Permission / feasibility |
| `validate` | `validateInputData` | Validation result |
| `should` | `shouldAllowAccess` | Policy branch |
| `isAllowed` | `isActionAllowed` | Permission |
| `decide` | `decideResourceStatus` | Domain decision |
| `check` | `checkInputConstraints`, `checkResourceAvailability` | Suitability / constraint |
| `isValid` | `isValidCombination` | Validity |
| `has` (decision sense) | `hasConflict`, `hasPermission` | Presence / permission decision |

Excluded prefixes (not decision by naming alone): `map`, `to`, `from`, `format`, `build`, `transform`, `convert`, `parse`, `get`.

### 2. Folder path

A consuming project may designate decision-bearing directories using conventional patterns such as:

- `*/domain/`
- `*/use-cases/`
- `*/decisions/`
- `*/services/domain/` or another project-designated domain-service path

For any designated pattern, exported or primary functions in matching files are evaluated as decision functions under this spec (subject to §3 and §4).

### 3. JSDoc

- `@decision` — function is a decision function.
- `@non-decision` — explicit opt-out; guard does not apply decision null/throw rules to this function.

### 4. Body signal (when 1 or 2 matched)

The body must include at least one of:

- `if (`
- `switch (`
- `throw `
- `return true` / `return false`
- `return` of an error string / `throw new Error` (or equivalent)

Otherwise tooling may treat the match as a false positive (no decision logic).

### 5. Critical initialization

Also in scope:

- File name contains `Initialization`, `AppInit`, or matches `useAppInitialization`, `useInitialization`
- Function names: `initApp`, `ensureInitialized`

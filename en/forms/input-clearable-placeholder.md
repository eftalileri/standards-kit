# Clearable value inputs and passive empty-state copy (placeholder)

```kit-cover
type: normative
part-of: README.md
binds: ICP-C agent-contract obligations, the enforcement outcomes and the GICP decision gates for clearable typed inputs
open-when: shape:frontend-heavy, signal:form-input, signal:empty-semantics, signal:placeholder-copy
skip-when: signal:backend-only, signal:no-user-input-field
owns: ICP-C1, ICP-C2, ICP-C3, ICP-C4, ICP-C5, ICP-C6, ICP-C7, GICP1, GICP2
```

Scope

- Included: Text, numeric (money, counts, decimal), time (HH:mm and multi-slot), and any user-typed field where the user **must** be able to clear the value and see passive empty-state copy (placeholder or clearly default presentation). Controlled binding, onChange semantics for empty and invalid partial input, placeholder styling, and payload boundaries (UI state vs submit mapping).
- Excluded: Picker, switch, and single-select surfaces with no free-text or numeric typing (placeholder on those is recommended but not governed by the clearable typing rules here). Backend-only validation taxonomy (full detail in [error policy](../error-policy/error-policy.md)); phone mask specifics: [phone UI formatting](../phone/ui-formatting.md) and [country config](../phone/country-config.md).

Document type: Normative part. The **ICP-M**\* / **ICP-M-F**\* / **ICP-X**\* / **ICP-N**\* rows live in [input-clearable-rules.md](input-clearable-rules.md).

Decision gates: This standard applies where a clearable typed input's empty value affects API or validation behavior. The GICP table is the normative routing index and creates no obligations beyond the cited ICP rules.

Environment: Applies to client platforms with clearable typed input components; React Native and web components (`TextInput` or equivalent) are examples. Server-side errors follow [error handling](../error-handling/error-handling.md).

Binding principle: Violations are bugs — **must** fix; **must not** ship; merge blocked until compliant or this standard is amended (**ICP-C4**, Enforcement).

References: [forms.md](forms.md); [input-clearable-rules.md](input-clearable-rules.md); [error policy](../error-policy/error-policy.md); [error handling](../error-handling/error-handling.md); [SSOT readiness](../ssot-readiness/ssot-readiness-and-form-data.md); [decision function](../decision-function/decision-function.md); [decision matrix](../decision-matrix/decision-matrix.md); [phone/placeholder-i18n.md](../phone/placeholder-i18n.md).

Code samples (non-normative): [`../_meta/examples/input-clearable-placeholder-code-samples.md`](../_meta/examples/input-clearable-placeholder-code-samples.md).

---

## Rule identifiers (normative)

| Prefix | Meaning |
|--------|---------|
| **ICP-C**\* | Agent execution contract. |
| **ICP-M**\* | **MUST** (includes failure-path **ICP-M-F**\* and cross binds **ICP-X**\*). |
| **ICP-N**\* | **MUST NOT**. |
| GICP\* | Decision gates (normative index). |

**ICP-M**\* / **ICP-M-F**\* / **ICP-X**\* / **ICP-N**\* are defined in [input-clearable-rules.md](input-clearable-rules.md) — that part file is their single definition site.

---

## Agent execution contract

| ID | Rule |
|----|------|
| **ICP-C1** | This document is mandatory for in-scope inputs on client surfaces. |
| **ICP-C2** | Apply [shared **C2**](../_meta/agent-contract.md). |
| **ICP-C3** | Apply [shared **C2**](../_meta/agent-contract.md). |
| **ICP-C4** | Apply [shared **C4**](../_meta/agent-contract.md). |
| **ICP-C5** | Precedence: [forms](forms.md) **M6** / **N1** for controlled core; this file adds clearable empty semantics and placeholder rules only. |
| **ICP-C6** | Change impact: If empty semantics or payload mapping changes, list affected route-contract rows and [error policy](../error-policy/error-policy.md) consumers before merge. |
| **ICP-C7** | Apply [shared **C4**](../_meta/agent-contract.md). |

Verification: The Verify column may use a review predicate or a runtime check permitted by the consuming project's verification policy; it must describe an observable outcome rather than taste alone.


---

## Enforcement

For any violation of **ICP-M** / **ICP-N** in this file:

| Outcome | Meaning |
|---------|---------|
| Bug classification | The change is tracked as a defect; **must** fix. |
| Reject (merge / deploy) | The change **must not** merge and **must not** deploy until compliant or standards are explicitly amended. |
| STOP (agent / critical path) | On money, authz-sensitive quantity, or other critical flows named in project architecture, the agent halts further dependent work until the violation is resolved (**ICP-C7**). |

*(The **ICP-M** / **ICP-N** rows this section governs are in [input-clearable-rules.md](input-clearable-rules.md).)*

---

## Technology

| Topic | Rule |
|-------|------|
| Control | Controlled value source per [forms](forms.md) **M6**. |
| Validation | The project's selected client schema mechanism and decision helpers per [forms](forms.md) and [decision function](../decision-function/decision-function.md); use Zod where selected. |
| Placeholder | Platform `placeholder` / `placeholderTextColor` (RN) or documented web equivalent. |

---

## Decision gates (normative index) — GICP

| Gate ID | Proceed YES when | Binding rule IDs | If NO |
|---------|----------------------|------------------|-----------|
| GICP1 | The field accepts free numeric typing (decimal / integer ) for a business amount or count. | **ICP-M7**, **ICP-M-F1**, **ICP-M-F2**, **ICP-X1**, GICP2 | Use string state + **ICP-M10** ; do not apply amount parsing rules meant for money to pure labels. |
| GICP2 | The route contract documentation or the project's existing contract record documents whether empty amount is represented as omitted field, `null`, or `0`, and the UI empty semantic matches that contract via mapper (**ICP-X3** ). | **ICP-M-F2**, **ICP-X1**, **ICP-X3** | STOP — fix the documented contract or UI model before shipping ; do not guess null vs 0. |

---

## Verification

Use static inspection or real-run observation; the consuming project's verification policy governs execution.

| Check | Pass criteria |
|-------|----------------|
| Clear → state | String field : `''` . Numeric : `0` or `null` per GICP2 , never stale prior digits . |
| Placeholder | Visible when semantic empty and display string empty (per pattern ) . |
| onChange on empty | Empty string input fires handler and updates state once (**ICP-M8** ) . |
| No silent fallback | No automatic revert to previous value or fixed sentinel on clear (**ICP-M2**, **ICP-N2** ) . |
| NaN | Stored model never `NaN` ; partial invalid does not corrupt last valid (**ICP-M-F1** ) . |
| Crash | No unhandled throw from change path (**ICP-M-F3** ) . |

---

## Obligation map

| Obligation | Rule IDs |
|----------------------|-------------------|
| Clearable ; no fallback on empty | **ICP-M1**, **ICP-M2**, **ICP-N2** |
| Placeholder / passive default | **ICP-M4**, **ICP-M5**, **ICP-N4**, **ICP-N5** |
| Controlled value and onChange | **ICP-M6**, **ICP-M8**, **ICP-M10**, **ICP-M11**, **ICP-N1**, **ICP-N3** |
| Submit default only in payload | **ICP-M3**, **ICP-N2** |
| Numeric / time / text patterns | **ICP-M7**, **ICP-M9**, **ICP-M10**, **ICP-M-F1**, **ICP-M-F2** |
| Prohibited silent state and fallback | ICP-N1, ICP-N2, ICP-N3 |
| Checklist items | Verification section |

---

Examples: [`../_meta/examples/input-clearable-placeholder-code-samples.md`](../_meta/examples/input-clearable-placeholder-code-samples.md) (non-normative).

# Clearable inputs — **MUST** / **MUST NOT** rows and cross-standard binds

```kit-cover
type: normative
part-of: README.md
binds: ICP-M and ICP-N obligations - clearable typed fields, the empty semantic committed on clear, passive placeholder copy, submit-only defaults and the payload boundary
open-when: shape:frontend-heavy, signal:form-input, signal:empty-semantics, signal:placeholder-copy, signal:numeric-input
skip-when: signal:backend-only, signal:no-user-input-field
owns: ICP-M1, ICP-M2, ICP-M3, ICP-M4, ICP-M5, ICP-M6, ICP-M7, ICP-M8, ICP-M9, ICP-M10, ICP-M11, ICP-M12, ICP-M13, ICP-M-F1, ICP-M-F2, ICP-M-F3, ICP-X1, ICP-X2, ICP-X3, ICP-N1, ICP-N2, ICP-N3, ICP-N4, ICP-N5
```

Scope: The **ICP-M** / **ICP-N** rule pair, the failure-path rows (**ICP-M-F**\*) and the cross-standard binds (**ICP-X**\*). Scope, contract (**ICP-C**\*), enforcement, GICP gates, verification and obligation map: [input-clearable-placeholder.md](input-clearable-placeholder.md).

Document type: Normative part file under [README](README.md).

Binding principle: Violations are bugs — **must** fix; **must not** ship; merge blocked (**ICP-C4**).

References: [forms.md](forms.md); [input-clearable-placeholder.md](input-clearable-placeholder.md).

---

## **MUST** (normative) — **ICP-M**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **ICP-M1** | Clearable: The user **must** be able to remove all typed characters (backspace / clear ) so the field can reach the same empty presentation state as "never filled" (where product allows editing ). | Bug; reject | Real-run observation: focus field , type , delete all → visible value empty ; no stuck non-empty display without a documented read-only mode outside Scope. |
| **ICP-M2** | No UI fallback on empty: On empty or invalid partial input, the UI state **must not** automatically revert to a previous value or a fixed sentinel (e.g. `09:00`, `0`) unless the product explicitly defines a non-clearable control (out of Scope ). | Bug; reject | Code review : no `useEffect` / handler that rewrites state to last good on '' ; test : clear → state matches **ICP-M-F2**. |
| **ICP-M3** | Submit-only defaults: If the API or server rejects empty and a default is required, apply that default only when building the submit payload or in a documented mapper — **must not** write the default back into the editable field state as the user clears (**ICP-N2** ). | Bug; reject | Test : clear field , cancel without submit → UI still empty ; inspect submit transform only on submit path. |
| **ICP-M4** | Passive empty copy: When semantic value is empty, show either `placeholder` with field purpose (e.g. `HH:mm`, `0`, `Total`) or a visually passive default label that does not pretend to be user data. | Bug; reject | UI snapshot or manual : empty state shows placeholder or passive default per spec. |
| **ICP-M5** | Placeholder contrast: If `placeholder` is used, set a passive color (for example, the platform placeholder-color prop or a theme token) distinct from filled text. | Bug (accessibility class if indistinguishable); reject | Review the rendered colors in each supported theme and platform. Declined check: a per-call-site lint rule failed **ENA-A3** (style/token harm) and **ENA-A5** (lint cost); the stronger closure is a passive default inside the shared input component, so no call site has to pass the prop. |
| **ICP-M6** | Controlled binding: `value` (or library equivalent ) **must** derive from the single field state model per [forms](forms.md) **M6**. | Bug; reject | Static : no `defaultValue` -only pattern for in-scope clearable fields without controlled sync ([forms](forms.md) **N1** ). |
| **ICP-M7** | Display mapping for numbers: For non-negative amounts, empty semantic may render as `''` in the input while state holds `0` or `null` per GICP ; `placeholder` carries the passive hint (e.g. `"0"` ). | Bug; reject | Test : state 0 or null → input shows empty + placeholder visible (if product uses that pattern ). |
| **ICP-M8** | onChange on clear: When the user clears visible text to empty, the handler **must** run and **must** commit the empty semantic to state (**ICP-M-F2** ) — no silent skip. | Bug; reject; STOP on critical | Test : fire `onChangeText('')` (or platform equivalent ) → parent state observer records exactly one update to empty semantic. |
| **ICP-M9** | Time fields: Free time text **must** mirror user text including empty ; **must not** snap back to prior valid time on blur without explicit product spec (still **must not** violate **ICP-M-F2** on clear ). | Bug; reject | Test : delete all → state '' or `['']` per model ; no auto-restore on change path. |
| **ICP-M10** | Text fields: State `string` ; empty `''` ; `value={field ?? ''}` pattern or equivalent. | Bug; reject | Real run: clear the field and observe `''` in the store / hook output. |
| **ICP-M11** | Controlled inputs only for in-scope clearable fields : **must not** rely on uncontrolled core ([forms](forms.md) **N1**, **ICP-N3** ). | Bug; reject | Static : field has `value=` bound to state or form library controller with same invariant. |
| **ICP-M12** | Mechanical enforcement path: The project **must** either (a ) enforce **ICP-N1** / **ICP-M8** via ESLint (custom or documented plugin rule IDs in `docs/lint-input-ux.md` or equivalent ) , or (b ) record in `docs/standards-enforcement.md` (or equivalent ) that lint is not yet available and make the Verification section a mandatory PR checklist for touches to `TextInput` / `onChangeText`. | Process bug; reject at governance | Pass: File exists with (a ) rule names or (b ) explicit manual gate + owner. |
| **ICP-M13** | Shared parser when present: If the repository already exports `parseNumberInput` (`string` → `number` | `null` ) from a documented shared module (architecture or `shared/` path ) , new decimal clearable amount fields **must** import that helper — **must not** add another inline parser with divergent NaN / empty rules. | Bug; reject | `rg` `Number\\.parseFloat|parseFloat` in new field file : either no match or wrapper delegates to shared function (review ). |
| **ICP-M-F1** | Numeric model (`number` | `null` per GICP2 ) **must** never hold `NaN` ; on parse failure or partial invalid text, do not write a new invalid numeric value — keep the last committed valid number or the empty semantic (see **ICP-M7** for display string vs model ). | Bug; reject | Test : type `"12a"` → stored amount unchanged from last valid or empty only ; `Number.isNaN(model)` is false when model is typed as number. |
| **ICP-M-F2** | Empty input after user clear : state **must** match the chosen empty semantic : string fields `''` ; numeric fields `0` or `null` per GICP2 and API contract — **must not** leave stale non-empty state. | Bug; reject; STOP on critical | Test : clear → `''` / `0` / `null` exactly as per type row in Verification. |
| **ICP-M-F3** | Parsing or mask failure **must not** crash the tree ; surface controlled error UI per [error handling](../error-handling/error-handling.md) when the failure is user-relevant — **must not** throw unhandled from `onChangeText`. | Bug; reject | Test : fuzz change handler with random strings → no redbox / unhandled rejection ; optional error boundary only if product standard requires it. |
| **ICP-X1** | Empty semantic → API payload : **must** align with [error policy](../error-policy/error-policy.md) and route contract (no silent coercion that hides invalid business state ) ; forbidden client fallbacks that contradict [SSOT readiness](../ssot-readiness/ssot-readiness-and-form-data.md) silent failure bans. | Bug; reject | Inspect the mapper beside its route contract; observe empty input → documented 4xx or valid omission . |
| **ICP-X2** | Validation messages for these fields **must** use the project user-visible error shape per [error handling](../error-handling/error-handling.md) **M3** and [SSOT readiness](../ssot-readiness/ssot-readiness-rules.md) **M7** — no ad-hoc unstructured codes at submit boundary. | Bug; reject | Static: the submit-boundary error object carries the project error-shape keys. |
| **ICP-X3** | Single empty semantic per field : do not define one meaning in UI state and a contradictory one in payload mapper without a documented transform in the API layer spec (no hidden SSoT split ). | Bug; reject | Table in architecture : UI value , mapper , wire example for empty — PR **must** update table when changing either side. |

**ICP-M9** timestamp-bound drafts: A date/time text draft and a recorded timestamp are different values. Partial, empty or invalid text stays in the controlled draft; the timestamp remains absent until both fields satisfy the shared contract. The conversion **must not** clamp, zero-fill, retain a stale valid timestamp, or invent today's date. Explicit valid midnight is a real value and remains accepted. Both the row's local confirmation and the main command boundary **must** refuse the incomplete timestamp before mutation or optimistic work. A UI row identity **must** survive row updates and neighbouring deletion so the draft cannot migrate to another row. An explicit user cancel may discard an unsaved row or restore that row's readonly authoritative display seed; blur, refetch and unrelated edits **must not** restore it automatically. Recovery may remain visible after another form field closes normal editing, but it **must not** reopen an otherwise forbidden action. The shared schema and one conversion adapter close invalid projection; review traces every command path and recovery consumer. No new lint rule is admitted for this measured single flow under **ENA-A1**(a).

Stable identity applies to every sibling input surface consuming the timestamp adapter, including create and edit rows. Updating a row's immutable object **must** retain its identity; deleting a neighbouring row **must not** move its local confirmation or selector state. The common UI identity hook is instance-local plumbing: it stores no identity in the form model or API and is not a second writer.

---

## **MUST NOT** (normative) — **ICP-N**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **ICP-N1** | **Must not** return early from `onChangeText` / `handleChange` on empty or whitespace-only without dispatching the empty semantic state update (**ICP-M8**, **ICP-M-F2** ). | Bug; reject; STOP on critical | Code review : `if (text.trim() === '') { return; }` without state setter → fail. |
| **ICP-N2** | **Must not** push UI state back to a default when the user cleared the field (**ICP-M3** ). | Bug; reject | Same as **ICP-M3** Verify. |
| **ICP-N3** | **Must not** use uncontrolled value source for in-scope clearable typed fields ([forms](forms.md) **N1** ). | Bug; reject | Same as **ICP-M11** Verify. |
| **ICP-N4** | **Must not** omit passive empty copy (placeholder or passive default ) for a value-typed field in Scope. | Bug; reject | Same as **ICP-M4** Verify. |
| **ICP-N5** | **Must not** use a placeholder without passive styling when the platform supports a placeholder-color mechanism (ICP-M5). | Bug; reject | Review the shared input primitive and platform equivalents. |

---

## Cross-Standard Binding (summary)

| ID | Binding |
|----|---------|
| **ICP-X1** | UI empty → wire : [error policy](../error-policy/error-policy.md), [SSOT readiness](../ssot-readiness/ssot-readiness-and-form-data.md). |
| **ICP-X2** | Validation surface : [error handling](../error-handling/error-handling.md), [forms](forms.md) **M4**. |
| **ICP-X3** | One truth per field across UI and mapper : [forms](forms.md) submission discipline. |

---

Part of: [README.md](README.md) — forms hub.

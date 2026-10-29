# Input clearable and placeholder (non-normative examples)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Status: Non-normative. Obligations live in [`../../forms/input-clearable-placeholder.md`](../../forms/input-clearable-placeholder.md).

These samples adapt reference patterns; names and paths are illustrative, not a required repository layout or a claim that a particular helper or theme token exists.

---

## Before you copy

- Placeholder / passive empty copy: All `TextInput` examples below include `placeholder` (and `placeholderTextColor` where shown) on purpose. Omitting them while the value is empty violates **ICP-M4** in the SSOT; do not ship a bare empty field without passive copy.
- Empty numeric semantic (`0` vs `null`): The route registration comment or SSoT contract and GICP2 in the SSOT define whether an empty amount is `0`, `null`, or omitted on the wire. The decimal example uses `onTotalAmountChange(0)` for illustration only. Your code must match the documented contract (often `null` for "no amount") — do not copy `0` by default without checking GICP2.
- Theme and shared parser: `COLORS.TEXT_TERTIARY` is an example theme token; replace it with the consuming design system's placeholder color. If the repository already exports `parseNumberInput` (or an equivalent helper with the same contract) from a documented shared module, **ICP-M13** requires new decimal clearable amount fields to use that helper instead of inline `Number.parseFloat` logic. This example's identifier and `shared/` location are conditional, not required names or paths.

---

## Non-negative decimal amount (React Native)

```typescript
const handleChange = (text: string): void => {
  const trimmed = text.trim();
  if (trimmed === '') {
    // Empty semantic: 0 here is illustrative only; use null or 0 per GICP2 + route registration comment or SSoT contract (ICP-M-F2).
    onTotalAmountChange(0);
    return;
  }
  const parsed = Number.parseFloat(text.replace(',', '.'));
  // Invalid or negative input does NOT overwrite the last valid value (ICP-M-F1).
  if (!Number.isNaN(parsed) && parsed >= 0) {
    onTotalAmountChange(parsed);
  }
};

// ...
<TextInput
  value={totalAmount === 0 ? '' : String(totalAmount)}
  onChangeText={handleChange}
  placeholder="0"
  placeholderTextColor={COLORS.TEXT_TERTIARY}
  keyboardType="decimal-pad"
/>
```

Note: If GICP2 uses `null` for empty, replace the empty branch and `value=` mapping accordingly (for example `onTotalAmountChange(null)` and `value={totalAmount == null || totalAmount === 0 ? '' : String(totalAmount)}` only if that matches your product model).

---

## Time string (clearable)

```typescript
const setTimeForDay = (day: number, time: string): void => {
  const trimmed = time.trim();
  // Empty string is allowed and committed to state (ICP-M-F2); no fallback to a previous time here.
  const nextTimes = { ...value.timesByDay, [day]: [trimmed] };
  onChange({ ...value, timesByDay: nextTimes });
};
```

---

## Shared helper contract

Normative signature and semantics: `parseNumberInput(text: string): number | null`, aligned with **ICP-M-F1** and **ICP-M-F2** in the SSOT. When the consuming repository adopts this helper, its implementation belongs in that repository's documented shared module; no specific path is prescribed here.

When it binds: As soon as that export exists, **ICP-M13** applies to new decimal clearable amount fields — import the helper; do not add another inline parser with different NaN or empty rules.

---

## Anti-pattern (do not copy)

Silent early return on clear without updating state violates **ICP-M8** and **ICP-N1**:

```typescript
const handleChange = (text: string): void => {
  if (text.trim() === '') {
    return; // Violates ICP-M8 / ICP-N1: empty input must commit empty semantic to state.
  }
  // ...
};
```

Uncontrolled core for a clearable typed field violates [forms](../../forms/forms.md) **N1** and **ICP-N3** (for example `defaultValue` only with no `value` bound to state).

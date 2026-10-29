# Accessibility (React Native / Expo) -- normative

```kit-cover
type: normative
part-of: README.md
binds: accessible React Native screen obligations - labels, roles, focus order and screen-reader announcements
open-when: shape:frontend-heavy, signal:rn-screen-ui, signal:accessibility-label, signal:screen-reader, signal:modal-focus
skip-when: signal:backend-only, signal:no-user-facing-ui
owns: A11Y-RN-C*, A11Y-RN-D*, A11Y-RN-M*, A11Y-RN-N*
```

References: [React Native Accessibility](https://reactnative.dev/docs/accessibility); Expo inherits RN Accessibility APIs.

---

## Definitions

| ID | Definition |
|----|------------|
| **A11Y-RN-D1** | Interactive control means `Pressable`, `Touchable*`, `TextInput`, switches, sliders, and primary navigation targets that accept tap or keyboard / switch control input. |
| **A11Y-RN-D2** | Significant state change means modal open/close, destructive action completion, offline / online transition when the product promises user-visible status (see [connectivity RN](../connectivity-rn/README.md)). |

---

## Agent execution contract

| ID | Rule |
|----|------|
| **A11Y-RN-C1** | **Must not** ship interactive controls without a unique accessibilityLabel (or accessible name via child Text where RN documents that pattern) -- aligns with [forms](../forms/forms.md) for form controls. |
| **A11Y-RN-C2** | When visual label text exists, **must** wire accessibilityLabel / hint so screen reader users get equivalent information (no empty or generic "Button" unless product-approved). |

---

## **MUST**

| ID | Rule |
|----|------|
| **A11Y-RN-M1** | **MUST** set `accessibilityRole` on custom interactive components where role is non-obvious (e.g. header vs button). |
| **A11Y-RN-M2** | **MUST** ensure modal / sheet flows move accessibility focus to primary content on open and restore focus on close when APIs allow (platform differences documented in Decisions / facts if limited). |
| **A11Y-RN-M3** | The derivation that produces an accessible name **MUST NOT** be able to collapse to an empty string. A fallback chain built with `??` only skips `null` / `undefined`; it does not skip `''`, `0`, or `false`. In particular, `A && B` returns A's own value when it short-circuits — so `(A && B) ?? C` (directly, or through an intermediate `const`) keeps the falsy value and never reaches `C`. Express the intent explicitly instead: use `||` when a falsy value **must** trigger the fallback, or produce `undefined` deliberately (`A?.trim() ? B : undefined`) when "no match" genuinely means absence. Optional fields that are normalized to `''` at a transform boundary (a phone, a middle name) are the usual trigger — the name silently disappears for exactly the records that lack that field, while the visual card still renders correctly, so the defect is invisible without a screen reader. A single-file syntax check can detect the narrow shape (`??` whose left operand is, or resolves to, a `&&` result), but cannot prove the resulting accessible name is meaningful at runtime. |
| **A11Y-RN-M4** | A colour-only state channel (**A11Y-RN-N1** exception) is permitted only as an explicit product-owner decision, never as an agent's own simplification, and only when all of the following hold. (a) Scope is one named surface; the exception does not generalize to sibling surfaces. (b) The assistive-technology channel stays complete — every removed state still reaches the accessibilityLabel in full, so the derivation that produces those labels **MUST NOT** be deleted along with the visuals. (c) The decision is recorded in the surface's own file header with the date and what was removed, so the next reader does not "restore" it as a bug or re-remove it as clutter. (d) The exception **MUST NOT** cover error, destructive-confirmation, or safety-critical state, where colour-only is a defect regardless of owner preference. Dense grid / calendar cells are the usual trigger: the same state is often already painted twice (fill *and* rail / border), so the cheap first move is dropping the duplicate colour channel and keeping the shape channel — propose that before proposing removal of the only non-colour channel. Enforcement depends on the adopting project: if it maintains a machine-readable map from style tokens to state meanings, use that map for targeted checks and verify the mapped surface; if no such map exists, review the named surface and its rendered/assistive output directly — no single-file syntax check can tell a colour that carries state from a colour that is decoration, and a missing map is not proof. In either case, the exception remains limited by the scope and safety conditions above. |
| **A11Y-RN-M5** | The `accessibilityState` field **MUST** match the declared `accessibilityRole`: switch, checkbox and radio publish `checked`; tab and other selectable items publish `selected`. Publishing the wrong field leaves the state channel silent for screen-reader users while the visual control still looks correct, so the defect is invisible without a screen reader. The constant or helper that produces the state **MUST** be named after the field it emits: a reader who sees `A11Y_CHECKBOX.selectedEnabled` concludes that `selected` is published, so a misleading name can produce a review that reports a defect that does not exist. Where the state travels through a helper call or an imported constant, the emitted field is not in the consuming file; verify the mapping at the shared definition and at representative consumers during review — a check that guessed the field from the constant's name would inherit exactly the confusion this rule exists to prevent. |
| **A11Y-RN-M6** | An accessible name (`accessibilityLabel`, `accessibilityHint`, `aria-label`) **MUST** be translated catalog text that says what the control does or what the element shows, and **MUST NOT** carry a machine identifier (`order-submit`, `insight-tab-${id}`): a screen reader reads the identifier aloud in every language. An identifier belongs in `testID`. A non-interactive container whose children already speak carries no name of its own; an interactive control with visible text uses the same catalog entry as that text. Selection or busy state is published through `accessibilityState`, never appended to the name as text. Verify: review, plus the project's own check for untranslated user-visible literals in assistive-name props if it has one — record its actual scope (a lettered static fragment in an assistive-name prop is a finding; a name assembled only from variables is not seen by a static check). |
| **A11Y-RN-M7** | A keyboard shortcut **MUST NOT** be the only way to an action: the same action **MUST** have a visible control, and a hover-only surface (tooltip, row actions shown on hover) **MUST NOT** carry the only copy of a meaning or an action. Shortcuts **MUST** be declared in one table and dispatched by one listener that is inactive while a modal dialog is open and — except close and save — while a text field has focus (close and save **MUST** still reach the listener from inside a field: on web it reads a field's keys in the capture phase, because react-native-web's `TextInput` stops keydown propagation), and only the screen in front (the top route, or the screen drawn beside an open pane or docked detail panel — not one under an overlay panel's scrim) **MUST** have live shortcuts — a screen covered by a window or another page **MUST NOT**; key legends are decorative and hidden from screen readers. A centred route window **MUST** be modal for the keyboard — focus enters it when it comes to the front, Tab stays inside it, focus returns to the opener when it leaves, and only shortcuts registered inside it stay live (none from the navigation around it) — while a detail panel or pane beside its screen **MUST** stay non-modal: the screen in front beside it **MUST** stay in the accessibility tree (a navigator that hides every unfocused screen from assistive technology is told otherwise for that screen only), and every covered screen **MUST** stay hidden and inert. Reason: touch, switch-access and screen-reader users have no keyboard or hover, and a shortcut or arrow key that fires inside a field, under a dialog or behind a window acts on the wrong surface. Held by review. |

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **A11Y-RN-N1** | **Must not** rely only on color to convey state (e.g. error or selection) -- pair color with a visible text, icon, shape, or pattern cue per [error handling](../error-handling/error-handling.md). The second channel **MUST** be VISIBLE: an `accessibilityLabel` / `accessibilityState` that names the state satisfies the assistive-technology channel and does NOT discharge this rule, because the reader who needs it here is sighted and colour-blind -- they never hear the label. The two channels are additive, never substitutes, so a justification of the form "colour is not the only channel, the accessible name says it too" is false on its face and **must** be rejected at review. The cheapest compliant visible channel in a dense surface is a shape cue that costs no geometry -- an absolutely positioned marker (bar / dot / outline) removed from the layout flow -- because a wrapping word does not fit every locale at the narrowest column and reflows the header. A density-driven removal of the non-colour channel is allowed only under **A11Y-RN-M4**; an agent **must not** decide it alone. |
| **A11Y-RN-N2** | **Must not** nest touchable elements in ways that trap or duplicate activation without product-approved pattern (verify with manual screen reader pass for critical flows). |

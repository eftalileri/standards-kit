# Theming and appearance mode (React Native) -- normative

```kit-cover
type: normative
part-of: README.md
binds: STY-THM obligations - light, dark and system appearance selection over the canonical theme tokens
open-when: shape:frontend-heavy, signal:rn-screen-ui, signal:theme-token, signal:appearance-mode
skip-when: signal:backend-only, signal:no-screen-layout-change
owns: STY-THM-D*, STY-THM-M*, STY-THM-N*
```

Scope: Light / dark (or system) appearance and theme token selection — extends [styling](styling.md) (COLORS / TYPOGRAPHY) without redefining StyleSheet discipline.

Document type: Normative part file under [README](README.md).

References: [styling.md](styling.md); [Zustand](../zustand/README.md) (user preference slice); `react-native` `useColorScheme` or documented wrapper.

---

## Definitions

| ID | Definition |
|----|------------|
| **STY-THM-D1** | Theme mode means `light`, `dark`, or `system` (follow device) as stored in client state per [decision matrix](../decision-matrix/decision-matrix.md) (UI / user preferences). |

---

## **MUST**

| ID | Rule |
|----|------|
| **STY-THM-M1** | **MUST** derive COLORS / TYPOGRAPHY (or equivalent tokens) from one theme object selected by **STY-THM-D1** — no ad-hoc hex per component for the same semantic role. |
| **STY-THM-M2** | **MUST** avoid hardcoded light-only contrast in new screens when dark mode is in scope (WCAG contrast per product). |
| **STY-THM-M3** | The native root view background **MUST** be set to the theme's page background token by one startup authority, once per JS process (a reload rebuilds the native root), after the native splash is hidden. Reason: an update-capable launcher rebuilds the root in the splash colour, so every area the React tree leaves unpainted — gaps a translucent keyboard leaves around it, a navigator remount frame — shows the splash colour over the app; a colour the platform module persists and restores natively on a later launch lands under the splash cover, so it never changes the launch sequence. Held by review. |

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **STY-THM-N1** | **Must not** persist theme mode in multiple stores without a single SSOT (Zustand persist or documented). |

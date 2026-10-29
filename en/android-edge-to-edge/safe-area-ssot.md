# Safe area — single source of truth (React Native)

```kit-cover
type: normative
part-of: README.md
binds: the safe-area single source of truth - provider placement, view edges, footer and scroll bottom padding, and the local minimum against the styling spacing tokens
open-when: shape:frontend-heavy, signal:safe-area-insets, signal:rn-screen-ui, signal:scroll-bottom-padding
skip-when: signal:backend-only, signal:no-screen-layout-change
owns: AEE-M10, AEE-M11, AEE-M12, AEE-M13, AEE-M14, AEE-M15, AEE-M16, AEE-M17, AEE-N10, AEE-N11, AEE-N12
```

Scope

- Included: React Native / Expo applications that draw behind Android system bars — the safe-area provider (`react-native-safe-area-context` or an equivalent maintained API documented for the supported runtime), the safe-area view, the safe-area footer, the shared scroll-content bottom-padding hook, initial window metrics; edges rules; minimum bottom padding via [styling](../styling/styling.md) spacing tokens (local minimum).
- Excluded: iOS-only layout rules — N/A (one-line reason: this SSOT does not add extra AEE rows for iOS; shared RN components stay governed by the same **AEE-M** / **AEE-N** where they run on Android).

Document type: Normative part — **AEE-M10**–**AEE-M17**, **AEE-N10**–**AEE-N12**.

Environment: React Native / Expo client; device insets from native.

References: [README.md](README.md); [styling/stylesheet-and-theme-tokens.md](../styling/stylesheet-and-theme-tokens.md) **STY-M4**; [android-edge-to-edge-core.md](android-edge-to-edge-core.md).

---

## Local minimum vs styling

Critical behavior: Bottom inset minimums when the reported bottom inset is 0 must use spacing tokens from the canonical theme — not numeric literals — per [**STY-M4**](../styling/stylesheet-and-theme-tokens.md). This file does not replace **STY-M4**; it adds where to apply those tokens (footer / scroll padding).

---

## **MUST**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **AEE-M10** | The application root **MUST** mount one safe-area provider above the navigation tree. Supply initial window metrics when the selected provider exposes a valid value; if the value is `null`, passing `undefined` or omitting the initial metrics is allowed only when the call site documents explicit null handling in the same file (no silent fake metrics). | Bug — must not ship. | Inspect the root provider setup (provider present at the documented root, initial metrics passed or the omission documented) and verify startup layout before and after navigation mounts. |
| **AEE-M11** | Screen-level inset handling **MUST** use the selected safe-area library's current view API, not the deprecated framework-core safe-area view, unless a documented exclusion applies. | Bug — must not ship. | Review safe-area view imports and confirm none resolve to `react-native` core. |
| **AEE-M12** | If the screen has a fixed bottom footer implemented with the safe-area footer, the safe-area view `edges` **MUST** include `'top'` only at the screen wrapper (not `'bottom'` at screen level) to avoid double bottom inset. | Bug — must not ship if footer + bottom edge both apply. | For each screen that uses the safe-area footer, confirm its safe-area view `edges` do not contain `bottom`; inspect the composed screen with system bars visible. |
| **AEE-M13** | If the screen has no fixed safe-area footer, the safe-area view `edges` **MUST** include `'top'`, and the bottom inset **MUST** be applied exactly once — by `'bottom'` in `edges`, or by the scroll-content bottom-padding hook / the insets hook in the screen or in the content component it renders (**AEE-M14**) — unless a documented exception (full-screen media whose controls remain reachable) exists in the project's safe-area exception record. | Bug — must not ship. | Review. A per-file scan cannot see a bottom inset applied through the content a screen renders (a list wrapper or a body component), so it would flag clean screens. |
| **AEE-M14** | Scrollable content that must clear the bottom gesture / nav area **MUST** use the shared scroll-content bottom-padding hook (or a documented project alias with the same behavior). | Bug — must not ship if a list ends under the nav bar. | Inspect representative lists, refresh controls and end-of-content actions on supported devices; every screen with a scroll container and no safe-area footer uses the hook or has a recorded exception. |
| **AEE-M15** | Android minimum bottom padding when the bottom inset is 0 **MUST** use theme spacing tokens (see [**STY-M4**](../styling/stylesheet-and-theme-tokens.md)) inside the safe-area footer / scroll-padding implementation — not raw dp integers. | Bug — must not ship. | Open the footer / hook implementation and confirm token references; confirm no raw numeric `paddingBottom` literal there. |
| **AEE-M16** | Failure path: if the safe-area provider is missing from the app root, STOP — do not add new screens that depend on insets until the provider exists. | STOP. | **AEE-M10** verify. |
| **AEE-M17** | Vertical scroll surfaces do not nest: the vertical scroll surface whose content renders a component owns the bottom inset (**AEE-M14**) and the keyboard visibility of the inputs inside it. Sibling surfaces (pager pages, a fixed header above a list, alternating branches) are separate hosts, not nesting. A component rendered inside a vertical surface's content (a form, a tab body) **MUST NOT** open its own vertical `ScrollView` or vertical list; it renders a content-sized `View` and reaches the host surface through the scroll-surface context when it must scroll programmatically. An inner vertical list is allowed only with an explicit bounded height (`height` / `maxHeight`) or with `scrollEnabled={false}` and no flex-based height. Reason: a flex-sized vertical scroll container inside unbounded scroll content has no determinate height and collapses to 0 on a relayout (Android keyboard / resize), so the content under the header disappears. | Bug — must not ship. | Review. |

---

## **MUST NOT**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **AEE-N10** | Duplicate bottom safe area by setting the safe-area view `edges` to include `bottom` while also rendering the safe-area footer for the same screen. | Bug — must not ship. | **AEE-M12** verify. |
| **AEE-N11** | Use numeric literals for bottom padding that implements safe-area policy in the safe-area footer / scroll-padding hook (violates [**STY-M4**](../styling/stylesheet-and-theme-tokens.md)). | Bug — must not ship. | **AEE-M15** verify. |
| **AEE-N12** | Add a new screen whose bottom inset is applied by none of the safe-area footer, the scroll-padding hook, the insets hook or a safe-area view bottom edge — in the screen file or the content component it renders (**AEE-M13**) — unless the project's safe-area exception record lists that path. | Bug — must not ship. | Review (same limit as **AEE-M13**). |

---

## Failure path

| Situation | Required behavior |
|-----------|-------------------|
| **AEE-M10** fails | STOP — fix root provider before feature work. |
| Conflict between this file and [**STY-M4**](../styling/stylesheet-and-theme-tokens.md) | [**STY-M4**](../styling/stylesheet-and-theme-tokens.md) wins for token literals; this file wins for which component / hook applies — both must hold ([**AEE-C3**](android-edge-to-edge.md)). |

---

## Environment constraint

| Dimension | Binding |
|-----------|---------|
| Runtime | Device / emulator optional for UX audit only; normative Verify for this file is inspection or review. |

Part of: [README.md](README.md) — Android edge-to-edge hub.

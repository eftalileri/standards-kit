# Android edge-to-edge — core (JS and app-owned native)

```kit-cover
type: normative
part-of: README.md
binds: application-code obligations - no direct deprecated Window colour or display-cutout API calls, and style-only expo-status-bar usage
open-when: shape:frontend-heavy, signal:edge-to-edge, signal:status-bar-style, signal:android-window-api
skip-when: signal:backend-only, signal:ios-only-change
owns: AEE-M1, AEE-M2, AEE-M3, AEE-M4, AEE-M5, AEE-M6, AEE-M7, AEE-N1, AEE-N2, AEE-N3
```

Scope

- Included: Binding rules for application code (Kotlin / Java / JS / TS) that must not call deprecated Android 15 Window color / display-cutout APIs directly; `expo-status-bar` style-only usage; consequence and verify for each row.
- Excluded: Third-party library bytecode inside `node_modules` / Gradle cache — not fixable in app diff; track via [library-upgrade-policy.md](library-upgrade-policy.md) (**AEE-M50**–**AEE-M54**).

Document type: Normative part — rule IDs **AEE-M1**–**AEE-M7**, **AEE-N1**–**AEE-N3**.

Environment: Applies to React Native / Expo Android apps on supported Android versions (Android 15+ device or emulator; JS bundle; Gradle Android assemble).

Binding principle: Violations are bugs — must not ship; STOP dependent work until fixed ([android-edge-to-edge.md](android-edge-to-edge.md) **AEE-C4**).

References: [README.md](README.md); [safe-area-ssot.md](safe-area-ssot.md); [library-upgrade-policy.md](library-upgrade-policy.md); [decision-gates.md](decision-gates.md).

---

## Rule identifiers (this file)

| Prefix | Meaning |
|--------|---------|
| **AEE-M1**–**AEE-M7** | **MUST**. |
| **AEE-N1**–**AEE-N3** | **MUST NOT**. |

---

## Technology (local minimum)

| Topic | Rule |
|-------|------|
| JS status bar | `expo-status-bar` for light / dark / auto style only — **AEE-M** / **AEE-N** below. |
| Layout under system bars | Content must use insets / safe area SSoT — [safe-area-ssot.md](safe-area-ssot.md); not opaque system bar paint as the primary strategy. |

---

## **MUST**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **AEE-M1** | Application-owned code **MUST NOT** directly call deprecated Android `Window` status/navigation bar color APIs (`getStatusBarColor`, `setStatusBarColor`, `getNavigationBarColor`, `setNavigationBarColor`) or set a display-cutout layout mode on a Window. Prefer the supported edge-to-edge and inset APIs for the selected Android and React Native/Expo versions. If a required behavior is exposed only by an outdated dependency, STOP and upgrade it per [library-upgrade-policy.md](library-upgrade-policy.md) or document a scoped, temporary exception with exit condition (**AEE-M50**). | Bug — must not ship deprecated application calls. | Search the app-owned native and JavaScript sources in the project's declared source scope for those API names; generated or third-party files are not evidence of application-owned calls. Stated limit: where the native projects are prebuild output (a managed workflow generates and does not track `android/` and `ios/`), the Kotlin/Java half has no source in the repository to scan — a search returns zero because the files are absent, not because the call sites are. Only the JS/TS half is checkable there; the native half is answered by the dependency policy ([library-upgrade-policy.md](library-upgrade-policy.md)), not by a source scan. State which half a run actually covered. |
| **AEE-M2** | JavaScript / TypeScript **MUST** use `expo-status-bar` (or a documented wrapper that only forwards style props) for status bar appearance and style; it **MUST NOT** set a status bar background color through APIs that map to the deprecated native `setStatusBarColor` for opaque bars, and an opaque system-bar background color is not the strategy for avoiding content overlap. | Bug — must not ship. | Review status-bar call sites: every use is style-only and a search for background-color setters (`setStatusBarBackgroundColor`, `setBackgroundColorAsync`) finds nothing outside documented exceptions; confirm layout safety comes from insets. The class is held by the inset/safe-area authority ([safe-area-ssot.md](safe-area-ssot.md)) and review. |
| **AEE-M3** | Edge-to-edge layout intent **MUST** be satisfied by drawing background behind system bars and applying inset padding to interactive content — see [safe-area-ssot.md](safe-area-ssot.md) (**AEE-M10**+). | Bug — must not ship if interactive controls sit under opaque system UI without insets. | Inspect that the root provider exists and that screens use safe-area views / inset hooks; check representative screens on supported Android versions with system UI visible. Static checks are a proxy only. |
| **AEE-M4** | If the selected Android or Expo toolchain exposes an edge-to-edge opt-out, keep it enabled for in-scope applications unless a reviewed, temporary exception documents its scope, owner and exit condition (**AEE-N51**). Recheck this obligation when upgrading the toolchain; a removed or inert setting is not a substitute for the inset requirements in **AEE-M3**. | Bug — layout contract is disabled or an obsolete setting implies false coverage. | Read the selected toolchain's configuration and platform documentation (tracked configuration, never generated build output); verify the built behavior on a supported device. Limit: this row is conditional on the toolchain still exposing the switch — re-measure that before reading it as an open obligation. Where the platform makes edge-to-edge mandatory, the live obligation is **AEE-M3** and the safe-area SSoT, and a check over an inert key would advertise coverage nobody can break. |
| **AEE-M5** | Build or device logs containing deprecated system-bar or cutout APIs **MUST** be attributed to application code or an upstream dependency. Record upstream tracking and an accountable upgrade plan for dependency findings before closing the milestone (see **AEE-M51** in [library-upgrade-policy.md](library-upgrade-policy.md)); do not suppress the warning without disposition. | Process violation — STOP release if warnings are silenced without tracking. | Review the build log, identify the producing dependency or app source, and record the resolution in the project's dependency or release notes. An unreadable log is never a pass, and a clean log alone does not prove an upstream fix. |
| **AEE-M6** | Failure path: if the static review for **AEE-M1** / **AEE-M2** finds a problem, STOP — remove or replace calls before merge; do not ship with known direct deprecated Window color / cutout API use in app sources. | STOP merge. | Explicit binary: the review passes or merge is blocked. |
| **AEE-M7** | A surface whose ground differs from its host's ground (a dark brand scene inside a light-ground host) **MUST** set its own status-bar style by rendering its own `expo-status-bar` `<StatusBar style=…>`, the style derived from that ground; a host that also renders a base `<StatusBar>` **MUST** render it before (mounted earlier than) the subtree that holds such surfaces. Reason: `expo-status-bar` merges the props of mounted `StatusBar` components in mount order and the last-mounted entry wins, so a base rendered after its children overrides every nested surface and leaves dark icons on a dark ground. | Bug — must not ship (status bar unreadable). | Review: open each host that renders a base `<StatusBar>` and confirm it precedes the screen subtree. |

---

## **MUST NOT**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **AEE-N1** | Add new direct calls to deprecated Window color or cutout APIs listed in **AEE-M1** in application Kotlin / Java / JS / TS. | Bug — must not ship. | Same as **AEE-M1** Verify. |
| **AEE-N2** | Use `expo-status-bar` / React Native APIs to set opaque status bar background color as the primary layout strategy for avoiding overlap (instead of insets). | Bug — must not ship. | Same review as **AEE-M2** and **AEE-M3**. |
| **AEE-N3** | Silence or delete Gradle or Logcat warnings about deprecated system-bar APIs without a tracked upstream dependency action or an application-source fix (**AEE-M5**). | Process violation — STOP. | Review the warning source and the tracked resolution record. |

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|-------------------|
| **AEE-M1** / **AEE-M2** review fails, or obscured controls are found | STOP — fix the application source (an exclusion is allowed for documented third-party code only) and verify the rendered layout before release. |
| Warnings originate only in a dependency | Do not weaken **AEE-M**; follow [library-upgrade-policy.md](library-upgrade-policy.md) (**AEE-M50**–**AEE-M54**) and keep the issue and upgrade plan visible. |

---

## Environment constraint

| Dimension | Binding |
|-----------|---------|
| Runtime / host | **AEE-M3** static checks are a proxy only; rendered verification is on a device or emulator. |

N/A: None for this file — Android host always applies to in-scope apps.

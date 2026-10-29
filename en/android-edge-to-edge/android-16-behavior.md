# Android 16 (API 36) behavior

```kit-cover
type: normative
part-of: README.md
binds: Android 16 edge-to-edge, adaptive large-screen behavior, predictive back, and temporary compatibility exceptions
open-when: shape:frontend-heavy, signal:target-sdk-36, signal:android-16-behavior, signal:large-screen-layout
skip-when: signal:backend-only, signal:ios-only-change, signal:target-sdk-below-36
owns: AEE-M30, AEE-M31, AEE-M32, AEE-M33, AEE-M35, AEE-M36, AEE-M37, AEE-M38, AEE-M39, AEE-N30, AEE-N31, AEE-N32, AEE-N33, AEE-N34
```

Scope

- Included: Edge-to-edge opt-out removal; large-screen (smallest width ≥ 600 dp) orientation / resize ; Predictive Back; temporary `PROPERTY_COMPAT_ALLOW_RESTRICTED_RESIZABILITY`.
- Excluded: Server API behavior — N/A. The conditional API 36 rows and their Detect table — see [android-16-conditional-rules.md](android-16-conditional-rules.md) (**AEE-M34**, **AEE-M40**–**AEE-M46**, **DET-AEE-M\***).

Document type: Normative part — **AEE-M30**–**AEE-M33**, **AEE-M35**–**AEE-M39**, **AEE-N30**–**AEE-N34**.

Environment: Android 16 (API 36) target; physical device or emulator.

These behavior changes apply according to the app target SDK, device API, and display size. Confirm current Android behavior for the target combination before treating a conditional row as applicable.

References: [README.md](README.md); [android-16-conditional-rules.md](android-16-conditional-rules.md); [android-native-configuration.md](android-native-configuration.md); [library-upgrade-policy.md](library-upgrade-policy.md); [Android 16 behavior changes](https://developer.android.com/about/versions/16/behavior-changes-16); [Android adaptive apps](https://developer.android.com/develop/adaptive-apps/guides/app-orientation-aspect-ratio-resizability).

---

## **MUST**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **AEE-M30** | Apps targeting API 36 on Android 16 cannot rely on the edge-to-edge opt-out. Remove obsolete opt-out configuration and implement edge-to-edge layout with appropriate insets. | Controls or content may be obscured by system UI. | Inspect effective app configuration and verify representative screens on Android 15 and Android 16. |
| **AEE-M31** | Apps targeting API 36 MUST support user-selected orientation and resizing on large displays (smallest width at least 600 dp), unless a documented platform exception applies. | Layout or interaction failure on tablets, foldables, and desktop windows. | Rotate, resize, and test multi-window behavior on a representative large-screen device or emulator. |
| **AEE-M32** | Expo applications targeting API 36 MUST NOT rely on a portrait-only app configuration as a guarantee on large displays. A product exception for smaller phone form factors does not exempt large-screen behavior. | Unsupported layout assumptions and inaccessible controls. | Review resolved app configuration and verify at least one large-screen layout. |
| **AEE-M33** | Root navigation and screen layouts MUST respond to current window dimensions. Do not use a fixed portrait width or height to decide primary layout structure. | Content may overflow, clip, or become unusable after resize. | Inspect the rendered layout at multiple window sizes and text scales. |
| **AEE-M35** | State needed to complete a multi-step form or task MUST survive Android configuration changes and window resizing. Use the lifecycle state mechanism or durable client state appropriate to the product; do not rely only on transient component state when recreation would lose user input. | User-entered data loss. | Rotate, resize, and enter multi-window on representative supported devices; confirm that in-progress work remains intact. |
| **AEE-M36** | Before releasing an API 36 target, review critical user flows on both a phone-sized and a large-screen configuration. | Release may contain undiscovered layout or navigation regressions. | Record the tested device/display sizes and outcome in the project’s release review. This is rendered verification, not source-only coverage. |
| **AEE-M37** | The Android 16 restricted-resizability compatibility property MUST be used only as a temporary, scoped exception for affected activities, with an owner, rationale, and removal plan. Android documents this compatibility opt-out as temporary and not available for target API 37. | Adaptive layout compatibility risk. | Review the manifest exception, target SDK, affected activities, and dated removal decision against the current Android behavior documentation. |
| **AEE-M38** | For apps targeting API 36 and running on Android 16 or later, migrate legacy `onBackPressed` and `KEYCODE_BACK` handling to supported predictive-back APIs when custom back handling is required. | Back navigation may no longer run as expected. | Exercise gesture back, back-to-home, and in-app navigation on an Android 16 device or emulator; confirm the selected React Native/Expo navigation integration supports the platform behavior. |
| **AEE-M39** | If a temporary `android:enableOnBackInvokedCallback="false"` opt-out is used, document the affected surface, owner, reason, and removal plan in the project’s exception record. | Process violation and unverified back behavior. | Confirm the exception is scoped, reviewed, and tested with the target SDK and runtime combination. |

---

## **MUST NOT**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **AEE-N30** | Do not rely on `windowOptOutEdgeToEdgeEnforcement` to avoid edge-to-edge behavior for an app targeting API 36 on Android 16. | Bug — must not ship. | Same as **AEE-M30**. |
| **AEE-N31** | Do not ship a large-screen experience that assumes a fixed portrait orientation without verifying responsive behavior and documenting a supported platform exception. | Bug — must not ship. | Same as **AEE-M31** and **AEE-M36**. |
| **AEE-N32** | Do not use `PROPERTY_COMPAT_ALLOW_RESTRICTED_RESIZABILITY` without the scoped temporary exception required by **AEE-M37**. | STOP. | Same as **AEE-M37**. |
| **AEE-N33** | Do not disable predictive-back behavior without the scoped temporary exception required by **AEE-M39**. | Process violation. | Same as **AEE-M39**. |
| **AEE-N34** | Do not claim Android 16 readiness without reviewing the rendered experience on supported phone and large-screen configurations. | Release process violation. | Confirm the release review records the tested target API, display configurations, and critical-flow outcomes. |

---

## Failure path

| Situation | Required behavior |
|-----------|-------------------|
| The manifest or configuration cannot satisfy **AEE-M31** and the product requires portrait-only phones | Document the exception plus tablet UX mitigation, or STOP the API 36 target until resolved. |

---

## Environment constraint

| Dimension | Binding |
|-----------|---------|
| Runtime | API 36 emulator or device; `adb` compat flags optional for early resize testing (`UNIVERSAL_RESIZABLE_BY_DEFAULT` per Google docs). |

Part of: [README.md](README.md) — Android edge-to-edge hub.

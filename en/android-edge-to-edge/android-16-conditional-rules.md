# Android 16 (API 36) conditional rules — feature detection

```kit-cover
type: normative
part-of: README.md
binds: the conditional Android 16 rows - each binds only when its own Detect condition finds the feature in this application
open-when: shape:frontend-heavy, signal:android-manifest, signal:target-sdk-36, signal:android-16-behavior
skip-when: signal:backend-only, signal:ios-only-change, signal:target-sdk-below-36
owns: AEE-M34, AEE-M40, AEE-M41, AEE-M42, AEE-M43, AEE-M44, AEE-M45, AEE-M46, DET-AEE-M*
```

Scope

- Included: The Detect table (**DET-AEE-M34**, **DET-AEE-M40**–**DET-AEE-M46**) and the **AEE-M** rows it gates: barcode/scanner dependency compatibility, `elegantTextHeight`, `scheduleAtFixedRate`, health permission split, Bluetooth behavior, `MediaStore.getVersion`, `intentMatchingFlags`, local network policy.
- Excluded: The unconditional Android 16 rows (**AEE-M30**–**AEE-M33**, **AEE-M35**–**AEE-M39**) and every **AEE-N** row — see [android-16-behavior.md](android-16-behavior.md).

Document type: Normative part — **AEE-M34**, **AEE-M40**–**AEE-M46**, **DET-AEE-M34**, **DET-AEE-M40**–**DET-AEE-M46**.

Environment: Android 16 (API 36) target; physical device or emulator.

These rows apply to applications targeting API 36 when the named platform feature is used.

References: [README.md](README.md); [android-16-behavior.md](android-16-behavior.md); [decision-gates.md](decision-gates.md); [Android 16 behavior changes](https://developer.android.com/about/versions/16/behavior-changes-16); [Android adaptive apps](https://developer.android.com/develop/adaptive-apps/guides/app-orientation-aspect-ratio-resizability).

---

## Conditional rules — feature detection (normative)

| ID | Detect the feature in (present = the matching **AEE-M** row binds) |
|----|-----------------------|
| **DET-AEE-M34** | The resolved Android dependencies and application code for barcode or ML Kit scanning. |
| **DET-AEE-M40** | Text rendering code or resources that set `elegantTextHeight`. |
| **DET-AEE-M41** | Application-owned scheduling code that calls `scheduleAtFixedRate`. |
| **DET-AEE-M42** | The merged Android manifest and runtime permission requests for body or health data. |
| **DET-AEE-M43** | Application-owned Bluetooth adapter, bonding, or encryption-change handling. |
| **DET-AEE-M44** | Calls to `MediaStore.getVersion`. |
| **DET-AEE-M45** | The resolved manifest and exported intent filters using intent-matching behavior. |
| **DET-AEE-M46** | Local-network permissions, discovery, or connection behavior. |

A feature row applies only when the application targets API 36 and its Detect condition is present. When absent, mark it not applicable in the change or release review; do not create a new project-wide index solely to restate this table. Review generated manifests and resolved dependencies where the source tree does not show the effective configuration.

---

## **MUST**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **AEE-M34** | If barcode or scanning dependencies are present, confirm their Android 16 compatibility and verify the scanner adapts to rotation, resizing, and large-screen window changes. Prefer upgrading the maintained dependency; any temporary orientation restriction needs a scoped exception and removal condition. | Scanner may fail or display incorrectly on large screens. | Review the resolved dependency version and exercise scanner flows across representative window sizes. |
| **AEE-M40** | If `elegantTextHeight` is used, inspect text layout on scripts and fonts affected by Android 16 line-height changes. | Text clipping or unexpected vertical layout. | Render affected text using representative scripts, font scales, and supported devices. |
| **AEE-M41** | If scheduled tasks use `scheduleAtFixedRate`, document the missed-run/catch-up behavior and choose a policy that preserves the feature’s timing semantics. Avoid bursts of stale work after a pause. | Timing or resource-use defect. | Review the scheduler and exercise pause/resume behavior. |
| **AEE-M42** | If health or body-data permissions are requested, use the permission groups and runtime flow required by the targeted Android release. Keep manifest declarations aligned with the data actually accessed. | Permission denial or store-compliance defect. | Inspect the merged manifest and test grant, denial, and revocation paths on the target API. |
| **AEE-M43** | If the application handles Bluetooth bonding or encryption-change events, handle the Android 16 behavior and any updated action or permission contract. | Connectivity or pairing defect. | Review the platform API contract and exercise the affected pairing flow on a target device. |
| **AEE-M44** | Treat `MediaStore.getVersion` as an opaque change token. Do not parse it as a fixed-format value. | Invalid media-change detection. | Review all call sites and confirm the value is compared only for change. |
| **AEE-M45** | When Android 16 intent-matching behavior applies to the application’s exported components, configure and verify intent matching according to the platform guidance. | Integration or intent-routing defect. | Inspect the merged manifest and exercise the external intents the app supports. |
| **AEE-M46** | When an application accesses local-network devices, follow the target API’s permission and runtime requirements and explain the user-facing purpose before requesting access. | Local-network discovery or connection failure. | Test permission grant, denial, and subsequent settings changes on the target API. |

---

## Verification limit

Feature presence may come from a transitive dependency or generated manifest, so searching source files alone can miss the effective Android surface. Verify the resolved dependency graph and merged manifest when those inputs determine applicability. Keep the evidence with the implementation or release review rather than claiming source-only coverage.

Part of: [README.md](README.md) — Android edge-to-edge hub.

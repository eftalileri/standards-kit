# Decision gates — Android edge-to-edge (GAEE)

```kit-cover
type: normative
part-of: README.md
binds: binary routing for which edge-to-edge part file and rule rows apply, plus the compliance obligation for the gate answers
open-when: shape:frontend-heavy, signal:android-manifest, signal:edge-to-edge, signal:safe-area-insets
skip-when: signal:backend-only, signal:ios-only-change
owns: AEE-DG-M1, AEE-DG-N1, GAEE*
```

Scope

- Included: Binary routing for which AEE file and rule rows apply.
- Excluded: New behavior not already in **AEE-M** / **AEE-N** rows — forbidden (gates cite existing IDs only).

Document type: Normative index — GAEE1–GAEE8 plus **AEE-DG-M1** / **AEE-DG-N1** (compliance).

Environment: Applies when Android / RN layout or manifest changes are in scope.

References: [README.md](README.md); [Android edge-to-edge core](android-edge-to-edge-core.md); [safe-area SSOT](safe-area-ssot.md); [Android native configuration](android-native-configuration.md); [Android 16 behavior](android-16-behavior.md); [conditional rules](android-16-conditional-rules.md); [library upgrade policy](library-upgrade-policy.md).

---

## **MUST** (gate table compliance)

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **AEE-DG-M1** | Every change that touches Android native files, the app configuration, the app root, or the documented safe-area owners **MUST** identify the single gate (GAEE1–GAEE8) entered first, in one line of its project review record (description or review template). | Process violation — STOP if routing is ambiguous. | Review the change summary and its cited gate and rule IDs. |

---

## **MUST NOT**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **AEE-DG-N1** | Add new obligations only in this gate table without a matching **AEE-M** or **AEE-N** row in a part file. | Invalid standard change — STOP. | For each explicit ID in the Binding cells, confirm that ID exists in the cited file; ranges are expanded to the listed part files before the check. |

---

## Decision gates (normative index)

| Gate | Proceed only if YES | Binding rule IDs | If NO |
|------|---------------------|------------------|-------|
| GAEE1 | Work changes React Native/Expo screen layout, status-bar style, or safe-area handling without changing native resources. | **AEE-M1**–**AEE-M7**, **AEE-N1**–**AEE-N3** in [android-edge-to-edge-core.md](android-edge-to-edge-core.md); **AEE-M10**–**AEE-M17**, **AEE-N10**–**AEE-N12** in [safe-area-ssot.md](safe-area-ssot.md) | Continue to GAEE2 or GAEE3 if native configuration or Android 16 behavior is also involved. |
| GAEE2 | Work changes Android themes, resources, manifests, or a custom activity. | **AEE-M20**–**AEE-M24**, **AEE-N20**–**AEE-N21** in [android-native-configuration.md](android-native-configuration.md) | Use GAEE1 for screen-only layout work. |
| GAEE3 | The application targets API 36 or changes behavior specific to Android 16. | **AEE-M30**–**AEE-M33**, **AEE-M35**–**AEE-M39**, **AEE-N30**–**AEE-N34** in [android-16-behavior.md](android-16-behavior.md); **AEE-M34**, **AEE-M40**–**AEE-M46** in [android-16-conditional-rules.md](android-16-conditional-rules.md) when the corresponding feature is used | If the target SDK is below 36, GAEE3 is N/A — use GAEE1 / GAEE2 only. |
| GAEE4 | Build or device logs show deprecated system-bar APIs emitted by a dependency (not application sources). | **AEE-M50**–**AEE-M54**, **AEE-N50** in [library-upgrade-policy.md](library-upgrade-policy.md); **AEE-M5** in [android-edge-to-edge-core.md](android-edge-to-edge-core.md) | If warnings are from application code, fix **AEE-M1** first — do not use GAEE4. |
| GAEE5 | Work changes the shared safe-area footer. | **AEE-M12**, **AEE-N10** | Use GAEE6. |
| GAEE6 | Work changes scroll containers or list content that may extend behind system UI, without a footer. | **AEE-M13**, **AEE-M14** | Use GAEE7. |
| GAEE7 | Work changes an immersive or full-screen surface with an explicit safe-area exception. | **AEE-M13** exception path | Apply the **AEE-M13** default (top edge, bottom inset applied once). |
| GAEE8 | Work changes Android compatibility flags or a temporary platform exception. | **AEE-M37**, **AEE-M39**, **AEE-N32**, **AEE-N33** in [android-16-behavior.md](android-16-behavior.md); **AEE-N51** in [library-upgrade-policy.md](library-upgrade-policy.md) | STOP — no compat flag without a dated, reviewed exception record. |

---

## Failure path

| Situation | Required behavior |
|-----------|-------------------|
| Two gates both YES (ambiguous layer) | STOP — split the change or list which files or behavior belong to each gate. If the applicable platform or target API is unknown, resolve it from the project's build configuration before treating a conditional rule as not applicable. |

---

## Decision gates N/A

Not applicable when the task is documentation-only with no Android / RN layout diff — state N/A in the review record with a one-line reason.

Part of: [README.md](README.md) — Android edge-to-edge hub.

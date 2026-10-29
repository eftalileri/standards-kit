# Library upgrade policy (React Native, Screens, Expo, Material)

```kit-cover
type: normative
part-of: README.md
binds: upstream dependency tracking obligations - resolving or explicitly tracking deprecated Window system-bar warnings, with dated exit conditions for temporary exceptions
open-when: shape:frontend-heavy, signal:dependency-upgrade, signal:gradle-deprecation-warning, signal:edge-to-edge
skip-when: signal:backend-only, signal:no-android-native-build
owns: AEE-M50, AEE-M51, AEE-M52, AEE-M53, AEE-M54, AEE-N50, AEE-N51
```

Scope

- Included: Tracking and upgrading React Native, `react-native-screens`, Expo SDK / expo-dev-client, Material Components / androidx.activity and other native dependencies that affect system bars, window insets, or edge-to-edge behavior, so that deprecated Window system bar API warnings from dependencies are resolved or explicitly tracked; documented temporary exceptions with exit conditions. Apply each rule only to dependencies the application uses.
- Excluded: npm packages that do not affect the Android native build — N/A (no Android native project).

Document type: Normative part — **AEE-M50**–**AEE-M54**, **AEE-N50**–**AEE-N51**.

Environment: CI, `package.json`, Gradle lockfiles.

Binding principle: Shipping without tracking upstream when warnings persist is a process violation — STOP ([**AEE-C5**](android-edge-to-edge.md)).

References: [README.md](README.md); [android-edge-to-edge-core.md](android-edge-to-edge-core.md) **AEE-M5**; [android-native-configuration.md](android-native-configuration.md); consult the selected framework and dependency release notes when upgrading.

---

## **MUST**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **AEE-M50** | Before closing any release milestone that targets Android 15+, or before a native dependency upgrade that changes system-bar behavior, the team **MUST** review the compatibility guidance for the framework and affected dependencies and record the current semver of `react-native`, `react-native-screens`, `expo`, `expo-dev-client` (if used) in the project's dependency baseline record with date. Record any unresolved warning with its package, version, upstream reference, owner, and next review point. | Process violation — STOP release if missing. | Confirm the baseline record exists and contains those package names with version strings; review the resolved native dependency graph and relevant build warnings. |
| **AEE-M51** | If Gradle or Metro build logs still show deprecated `setStatusBarColor` / `setNavigationBarColor` / `LAYOUT_IN_DISPLAY_CUTOUT_MODE` from `com.facebook.react`, `com.swmansion.rnscreens`, `expo.modules`, or `com.google.android.material`, the team **MUST** either (1) upgrade to a version documented in release notes as fixing the call site, or (2) file / link an upstream issue / PR in the dependency baseline record with a next check date. Do not report the release as clean while such warnings remain unexplained. | STOP closing as "clean" without (1) or (2). | Attribute each warning to its producing dependency and retain the issue or upgrade plan with release evidence. Suggested record shape: a table row per matched API token with columns API, Disposition (TRACK = upstream issue/PR, FIX = fixing release notes, WARN = owned temporary exception), Evidence (an HTTP(S) URL), Review date (real `YYYY-MM-DD`), Owner and Exit condition (WARN requires a named owner and a non-empty exit condition). Human review remains mandatory for the log's origin and completeness, the warning's source library, the evidence's validity and actual fixing version, and the owner and exit condition's adequacy. A record's shape alone does not prove an Android build or warning clearance. |
| **AEE-M52** | `react-native-screens` (and other native UI dependencies) **MUST** stay on a version compatible with the project's `react-native` and Expo versions per their documentation; check peer requirements and platform support together before upgrading one part of the graph. | Build / runtime incompatibility. | Review package compatibility guidance, the resolved native dependency versions, and that peer dependency ranges are satisfied. |
| **AEE-M53** | Material / androidx versions **MUST** match the Expo / React Native supported matrix; avoid independent version overrides unless compatibility is demonstrated. Upgrades that touch `BottomSheetDialog`, `EdgeToEdgeUtils`, or `androidx.activity:activity` note the version in the dependency baseline record. | Integration regression. | Review the resolved Gradle graph and build result for the selected platform toolchain, and the baseline record entry. |
| **AEE-M54** | Failure path: if no upstream fix exists and the team must ship, the dependency baseline record **MUST** contain a "WARN" row with the exact log substring, affected dependency, stack owner, risk and next review date — not an empty TODO. | STOP if the WARN row is incomplete. | Confirm the temporary exception is scoped and current. The actual log substring, originating library, absence of an upstream fix, accountable person and exit-condition adequacy require human review; a syntactically complete row alone is not permission to declare warnings cleared. |

---

## **MUST NOT**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **AEE-N50** | Close a release ticket as "Android 15 warnings cleared" when build logs still contain the deprecated API warnings listed in **AEE-M51** without **AEE-M51**(2) documentation. | Process violation — STOP. | Audit: compare release build logs with the current dependency issue record. |
| **AEE-N51** | Introduce a new Gradle or manifest workaround that disables edge-to-edge or resize behavior (edge-to-edge opt-out flag, window opt-out attribute, restricted-resizability compat property) without a reviewed ADR, a scoped exception and a dated exit in the project's temporary-overrides record (see [android-16-behavior.md](android-16-behavior.md)). | Architecture violation — STOP. | Inspect the resolved platform configuration; every match has an exception record row. |

---

## Failure path

| Situation | Required behavior |
|-----------|-------------------|
| Version pin prevents upgrade | Document pin reason + upstream issue + accountable owner + review date (**AEE-M54**); re-evaluate at the next dependency or platform upgrade. |

---

## Environment constraint

| Dimension | Binding |
|-----------|---------|
| CI / host | The release branch archives the Gradle / npm lock or exact versions in the baseline record. |

Part of: [README.md](README.md) — Android edge-to-edge hub.

# Android edge-to-edge explainer (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Status: Non-normative training and context only. Runtime obligations are in the [normative Android edge-to-edge standard](../../android-edge-to-edge/README.md).

---

## Why Android 15+ changed the model

Android 15 (API 35 ) defaults to edge-to-edge : content draws behind the status and navigation bars . Opaque `setStatusBarColor` / `setNavigationBarColor` calls are deprecated ; correct behavior uses backgrounds and `WindowInsets` / safe area insets in React Native (`react-native-safe-area-context` ) .

---

## Sample project snapshot pattern (not binding)

Illustrative project inventory (not binding): A project may verify edge-to-edge behavior across its app entry point, Android theme resources, and screen-level safe-area handling. Example filenames include `App.tsx` or `styles.xml`, but actual locations vary by project; do not copy paths as requirements. Locate the implementation in the target repository and follow the Verify columns in the normative AEE tables.

---

## Upstream tracking narrative

Upstream tracking: React Native `StatusBarModule`, `react-native-screens` `ScreenWindowTraits`, Expo Dev Launcher, and Material `EdgeToEdgeUtils` may emit warnings until upstream fixes are released. Record affected versions, upstream issues, ownership, and the next review point under the [library upgrade policy](../../android-edge-to-edge/library-upgrade-policy.md) (**AEE-M50**–**AEE-M54**); do not ignore dependency warnings.

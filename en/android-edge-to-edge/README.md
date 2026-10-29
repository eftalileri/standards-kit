# Android edge-to-edge and safe area (React Native / Expo)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** safe area, insets, edge-to-edge, Android 15, Android 16

Planning: Apply the [agent planning procedure](../agent-planning/agent-planning-procedure.md) when Android layout or native configuration is in scope; cite it in implementation deliverables per [markdown-authoring](../authoring/markdown-authoring.md).

Purpose: Normative guidance for Android edge-to-edge behavior, React Native inset handling, native theme and activity configuration, Android 16 adaptive behavior, and relevant dependency upgrades. Apply conditional rows only for the target API and features the application actually uses.

Normative core: [`android-edge-to-edge.md`](android-edge-to-edge.md) — **AEE-C1**–**AEE-C5** agent execution contract. This README routes; it defines no rule rows.

---

## Reading order (routing)

Each entry names the file that defines those rule IDs; the obligation is in that file, not in this list.

1. [android-edge-to-edge.md](android-edge-to-edge.md) — **AEE-C1**–**AEE-C5** — agent execution contract: when the topic is mandatory, interpretation ban, styling precedence, STOP conditions.
2. [android-edge-to-edge-core.md](android-edge-to-edge-core.md) — **AEE-M1**–**AEE-M7**, **AEE-N1**–**AEE-N3** — no direct deprecated Window color / cutout APIs in app code; JS status bar style-only (`expo-status-bar`), a differing-ground surface sets its own style and a host's base status bar mounts first.
3. [safe-area-ssot.md](safe-area-ssot.md) — **AEE-M10**–**AEE-M17**, **AEE-N10**–**AEE-N12** — SafeAreaProvider, SafeAreaView edges, safe-area footer, scroll-content bottom padding, no nested vertical scroll surface; local minimum vs [styling](../styling/styling.md) spacing.
4. [android-native-configuration.md](android-native-configuration.md) — **AEE-M20**–**AEE-M24**, **AEE-N20**–**AEE-N21** — `styles.xml`, `MainActivity`, `values-v34` split when targetSdk ≤ 34.
5. [android-16-behavior.md](android-16-behavior.md) — **AEE-M30**–**AEE-M33**, **AEE-M35**–**AEE-M39**, **AEE-N30**–**AEE-N34** — edge-to-edge opt-out removal, large-screen orientation / resize, Predictive Back, release matrix, Verify.
6. [android-16-conditional-rules.md](android-16-conditional-rules.md) — **AEE-M34**, **AEE-M40**–**AEE-M46**, **DET-AEE-M34**, **DET-AEE-M40**–**DET-AEE-M46** — conditional API 36 rows and the Detect table that gates them.
7. [library-upgrade-policy.md](library-upgrade-policy.md) — **AEE-M50**–**AEE-M54**, **AEE-N50**–**AEE-N51** — React Native, react-native-screens, Expo, Material / androidx tracking and documented temporary exceptions.
8. [decision-gates.md](decision-gates.md) — GAEE1–GAEE8 normative index.

---

## Scope (topic folder)

- Included: React Native / Expo Android applications, especially targets using Android 15 (API 35) edge-to-edge behavior and Android 16 (API 36) large-screen changes.
- Excluded: iOS-only layout and web-only CSS. Shared React Native components remain subject to their cross-platform accessibility and styling standards.

---

## Cross-links

- [Styling (RN theme — spacing minimums)](../styling/styling.md)
- [Styling](../styling/README.md)
- [Mobile UI patterns](../mobile-ui-patterns/README.md)
- [Agent planning procedure](../agent-planning/agent-planning-procedure.md)
- [Gray situation decisions](../agent-gray-decisions/gray-situation-decisions.md) (no TODO / ambiguous resolution in normative path)

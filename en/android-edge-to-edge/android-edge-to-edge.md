# Android edge-to-edge and safe area — agent execution contract (**AEE-C**)

```kit-cover
type: normative
part-of: README.md
binds: when edge-to-edge standards apply, precedence, and exception handling
open-when: shape:frontend-heavy, signal:android-manifest, signal:safe-area-insets, signal:edge-to-edge
skip-when: signal:backend-only, signal:ios-only-change
owns: AEE-C*
```

Scope: This file defines when the topic applies, how it relates to styling rules, and the stop conditions. Technical obligations are defined in the other part files.

Environment: Apply when an Android manifest, native theme or activity, Expo status bar, safe-area integration, or Gradle edge-to-edge setting changes.

References: [README.md](README.md); [Android edge-to-edge core](android-edge-to-edge-core.md); [safe-area SSOT](safe-area-ssot.md); [native configuration](android-native-configuration.md); [Android 16 behavior](android-16-behavior.md); [conditional rules](android-16-conditional-rules.md); [library upgrade policy](library-upgrade-policy.md); [decision gates](decision-gates.md).

---

## Agent execution contract — **AEE-C**

| ID | Rule |
|----|------|
| **AEE-C1** | This topic applies to changes affecting Android manifests, native themes or activities, status-bar behavior, safe-area handling, or edge-to-edge configuration. |
| **AEE-C2** | Apply [shared agent contract C2](../_meta/agent-contract.md): the **AEE-M**, **AEE-N**, and GAEE rows that match the target SDK and feature surface. A visual preference does not justify bypassing inset or platform behavior requirements; record any exception with scope, rationale, owner, and exit condition (see **AEE-N51** in [library-upgrade-policy.md](library-upgrade-policy.md)). |
| **AEE-C3** | The styling authority governs visual tokens. This topic governs Android system-bar behavior, insets, and native configuration. Both apply when a layout change uses theme spacing; safe-area parts cite **STY-M4** where padding minimums apply. |
| **AEE-C4** | Apply [shared **C4**](../_meta/agent-contract.md). |
| **AEE-C5** | Pause dependent work when a required platform or upstream dependency fix is missing and no scoped exception with an exit condition exists (**AEE-M50**–**AEE-M54**, **AEE-N50**). |

Part of: [README.md](README.md) — Android edge-to-edge hub.

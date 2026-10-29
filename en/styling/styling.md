# Styling — React Native

```kit-cover
type: normative
part-of: README.md
binds: styling execution contract, exception discipline and decision gates
open-when: shape:frontend-heavy, signal:rn-screen-ui, signal:theme-token, signal:inline-style
skip-when: signal:backend-only, signal:no-screen-layout-change
owns: STY-C1, STY-C2, STY-C3, STY-C4, STY-C5, STY-C6, STY-C7, STY-C8, GSTY1, GSTY2, GSTY3, GSTY4, GSTY5, GSTY6, STY-EX-1
```

Scope: Binding guidance for React Native UI styling, theme tokens, appearance, shared primitives, and narrowly scoped exceptions. Detailed **STY-M** and **STY-N** rules live in [stylesheet-and-theme-tokens.md](stylesheet-and-theme-tokens.md); shared controls are covered by [ui-primitives.md](ui-primitives.md).

References: [README.md](README.md); [React Native StyleSheet](https://reactnative.dev/docs/stylesheet); [theming and appearance](theming-and-appearance.md).

## Standard exceptions (**STY-EX-1**)

A project exception is valid only when a decision record identifies the rule, the affected platform or files, the reason, an accountable approver, and any condition for review or removal. Scope the exception as narrowly as possible. A code comment alone does not create a project-wide exception.

## Agent execution contract

General obligations: [shared agent contract](../_meta/agent-contract.md). Local identities below retain their citation handles.

| ID | Rule |
|----|------|
| **STY-C1** | Apply this topic when changing React Native layout, colors, typography, spacing, radii, shadows, or shared visual components. |
| **STY-C2** | Use the project's documented theme and component authorities. If none are documented, establish a single authority as part of the styling change. |
| **STY-C3** | Styling decisions MUST NOT override server state, domain behavior, accessibility, or performance requirements defined by their owning standards. |
| **STY-C4** | Fix violations of **STY-M** and **STY-N** before shipping, or document a scoped exception under **STY-EX-1**. |
| **STY-C5** | Review affected screens and shared consumers when changing a token or primitive. |
| **STY-C6** | Apply [shared **C2**](../_meta/agent-contract.md): **STY-M** / **STY-N** and GSTY are applied exactly — no parallel styling stack or theme authority, and no structure built from your own design judgment ("better UX") in their place. |
| **STY-C7** | Keep the styling API compatible with the application's selected React Native and Expo versions. |
| **STY-C8** | If an unresolved styling decision blocks a dependent implementation, record the decision needed and pause that dependent change. |

## Decision gates

| Gate | Proceed when yes | If no |
|------|------------------|-------|
| **GSTY1** | A value depends on runtime props, state, measurement, or animation. | Use a static style and theme token. |
| **GSTY2** | A style block remains cohesive and easy to review. | Split it using the application's existing module convention. |
| **GSTY3** | A new styling dependency is compatible and justified by project needs. | Continue with the established styling model. |
| **GSTY4** | The theme already contains a suitable token. | Add a justified token through the theme authority. |
| **GSTY5** | The changed file is shipped application UI. | Apply the rules to any shared or shipped style source; omit generated or documentation-only artifacts when appropriate. |
| **GSTY6** | The change affects the theme authority. | Update its consumers and review the affected appearance modes together. |

## Verification

Use the project's normal lint, type, and build checks when applicable. Visual choices, text scaling, platform appearance, and launch-screen continuity require rendered review on supported devices. A green source check proves only the files and patterns it inspects.

Part of: [README.md](README.md) — styling hub.

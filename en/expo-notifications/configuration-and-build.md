# Configuration and build — NOTIF-CFG-*

```kit-cover
type: normative
part-of: README.md
binds: NOTIF-CFG-M and NOTIF-CFG-N -- the app.json / app.config plugin entries, iOS and Android native requirements, EAS / FCM / APNs credentials and the post-build verification recipe
open-when: shape:frontend-heavy, signal:push-notification, signal:expo-config, signal:eas-build, signal:native-credentials
skip-when: signal:backend-only, signal:no-config-or-build-change
owns: NOTIF-CFG-M1, NOTIF-CFG-M2, NOTIF-CFG-M3, NOTIF-CFG-M4, NOTIF-CFG-M5, NOTIF-CFG-N1, NOTIF-CFG-V1
```

Scope: `app.json` / `app.config.*` plugins, iOS / Android native requirements, EAS / FCM / APNs, and post-build verification recipes.

Document type: Normative — part of [README.md](README.md).

References: [decision-gates.md](decision-gates.md) (GNOTIF3); [client-expo.md](client-expo.md) (NOTIF-CLI-M3).

---

## **MUST** — NOTIF-CFG-M

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **NOTIF-CFG-M1** | `expo-notifications` **must** appear in `app.json` (or `app.config.js` output) `plugins` array as a config plugin — not only in `package.json` dependencies. | Critical bug — native service missing (silent non-delivery). | Pass: `rg` `expo-notifications` `app.json` `app.config.js` `app.config.ts` exits 0 with ≥ 1 match in `plugins` section (see NOTIF-CFG-V1). |
| **NOTIF-CFG-M2** | Plugin options **must** set `defaultChannel` to the same string the backend sends as Android `channelId` (typically `default`). | Bug — low priority / wrong channel. | Pass: `rg` `defaultChannel` `app.json` `app.config.*` exits 0 AND same string as dispatcher payload builder (NOTIF-BE-M6). |
| **NOTIF-CFG-M3** | Declare native configuration required by the enabled notification features and provider. For iOS headless/background notifications, enable the `remote-notification` background mode; for Android, configure the selected FCM credential flow and notification permissions for the target OS. These settings are feature- and provider-dependent; ordinary visible push does not by itself imply every background mode. | Bug — configured notification behavior cannot run. | Review the resolved native configuration against the exact client features, provider setup, and target SDK. |
| **NOTIF-CFG-M4** | When using Expo Push Service, token acquisition **MUST** use the application’s canonical Expo project identity from its configuration authority. Do not maintain a second project-ID value in build profiles. | Bug — invalid or misrouted token. | Compare the resolved Expo project identity with the value consumed by token registration. |
| **NOTIF-CFG-M5** | Production builds **MUST** have valid provider credentials for every enabled platform. Store and rotate credentials using the selected build/provider service, and keep secrets out of source control. | Provider rejects sends or credentials are exposed. | Review the provider credential state and perform a safe release-readiness check for each enabled platform. |

---

## **MUST NOT** — NOTIF-CFG-N

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **NOTIF-CFG-N1** | Do not ship a production build that depends on `expo-notifications` without the required Expo config plugin and native configuration for the selected platforms. | Critical configuration defect — **must not** ship. | Inspect the resolved Expo configuration and a built artifact; source dependency presence alone is insufficient. |

---

## NOTIF-CFG-V1 — Static verification recipe

Purpose: Binary check for GNOTIF3.

Pass when all hold:

1. Parse: `node -e "JSON.parse(require('fs').readFileSync('app.json','utf8'))"` exits 0 (or run `npx expo config --type public` exits 0).
2. Plugin: Parsed JSON has `expo.plugins` array containing an entry whose string form includes `expo-notifications` (including `['expo-notifications', {... }]` form).

Failure → STOP (merge blocked) until NOTIF-CFG-M1 satisfied.

---

## Native build verification

When a change affects native notification configuration, inspect a fresh build or prebuild output for the selected platforms. Confirm that the generated service declarations, notification channel defaults, and platform entitlements match the application configuration and provider credentials. Record the release evidence in the project’s normal release review. A source configuration file cannot prove what the built binary contains.

Missing release evidence for a build that changed native configuration is a process violation ([agent contract C4](../_meta/agent-contract.md)).

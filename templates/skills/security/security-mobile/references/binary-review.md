# Reviewing shipped mobile artifacts (offline, read-only)

Source review shows intent; the artifact shows what actually ships. Do this only with artifacts the owner provides, in a scratch directory outside the repository, deleted afterwards. Never upload artifacts to third-party online scanners without the owner's approval (they may contain secrets and unreleased features).

## 1. Artifacts

- Android: APK or AAB (an AAB is a zip; the base module holds the manifest and assets).
- iOS: IPA (a zip; `Payload/<App>.app` holds `Info.plist`, entitlements in the embedded provisioning profile, and resources).
- React Native JS bundle: `assets/index.android.bundle` (Android) or `main.jsbundle` (iOS); with Hermes it is bytecode, but string tables are readable.
- OTA update bundles: fetched by the app from the update service; ask the owner for the exported update or the build output used to publish it.
- Web export: the static output directory.

## 2. What to look for

1. Strings: API keys, tokens, private keys (`-----BEGIN`), service-account JSON fragments, internal or staging hostnames, admin endpoints, feature flags, test credentials, debug toggles.
2. Environment values: every public-prefixed or build-injected variable; compare with what the source treats as secret.
3. Source maps or unminified sources shipped in the artifact.
4. Android manifest: `debuggable`, `allowBackup` and backup rules, `usesCleartextTraffic`, network security config (user CAs, cleartext domains, pin sets), exported activities/services/receivers/providers and their permissions, intent filters and `autoVerify`.
5. iOS: ATS keys, URL types (custom schemes), associated domains, background modes, entitlements (keychain groups, app groups), privacy manifest presence.
6. Third-party SDK list and versions (for advisory triage and privacy declarations).
7. Signing: the artifact is signed with the expected certificate; debug certificates never in store builds.

## 3. Optional tools (owner approval required to install; candidates only)

| Tool | Useful for | Blind spots |
|---|---|---|
| MobSF (static mode) | manifest/plist issues, exported components, hard-coded strings, ATS/cleartext, permissions | business logic in JS/Hermes bundles, server-side authorization, OTA bundles not in the binary, runtime behavior, false positives from SDK code |
| apkleaks / string search | secrets and URLs in APK and bundle | encoded or split secrets; values fetched at runtime |
| Hermes bytecode disassemblers | readable strings and function names from `.hbc` bundles | full logic reconstruction is partial |
| Dynamic tools (proxy, instrumentation) | real traffic, storage at runtime, pinning behavior | require an owner-named device and environment; never against production users |

Report from tools only after confirming each hit in source or artifact context.

## 4. What static artifact review cannot tell you

- Whether the server enforces authorization (always review the API separately).
- Whether an OTA update currently live differs from the store binary.
- Whether provider-side key restrictions exist for keys found in the bundle (needs console evidence).
- Runtime-only data flows (what is written to storage after login, what is sent to analytics).

Mark these "needs owner evidence" or "needs dynamic evidence" in the coverage section instead of guessing.

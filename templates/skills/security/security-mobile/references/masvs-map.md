# MASVS v2.1 → what to check in a React Native/Expo (or native) app

MASVS v2.1 defines the controls; MASTG v2 holds the tests and MASWE the weaknesses (control → weakness → test → demo). Use the official MASTG/MASWE pages for test procedures; this map tells you where to look in this kind of codebase and what evidence closes each item.

Kit: where a row below names an expected state that a kit rule also fixes, the kit rule decides — STORAGE: SEC-M-STORE-1–SEC-M-STORE-4, SEC-N-STORE-1, SEC-N-STORE-2; NETWORK: SEC-M-PIN-1, SEC-M-CRYPTO-1; AUTH: LBA-RN-N1, LBA-RN-D2; PLATFORM: SEC-M-MOB-M2; PRIVACY: PAN-RN-N5, SEC-M-MOB-M1. The per-check `Kit:` lines in `SKILL.md` carry the full list.

## 1. Pick the depth by data tier

Agree the tier with the owner's data classification before reviewing:

- **Baseline (every app):** STORAGE, CRYPTO, AUTH, NETWORK, PLATFORM, CODE, PRIVACY controls.
- **Sensitive (credentials, personal data, money/entitlements, business-private data):** baseline plus strict storage choices, step-up for sensitive operations, pinning decision documented, update-integrity controls enforced.
- **High-risk (regulated finance/health, high-value fraud targets):** add RESILIENCE controls (integrity, anti-tampering, anti-instrumentation) with server-side attestation as a risk signal.

## 2. Control map

| Control | Where to look | Evidence that closes it |
|---|---|---|
| STORAGE-1 sensitive data stored securely | storage wrappers, persistence of state, auth token helpers, file writes, image/document caches | credentials only in keystore-backed storage; personal data not persisted or encrypted with a keystore key; cleared on logout |
| STORAGE-2 no leakage | logging calls, error-tracking config, backup settings, screen-capture protection, clipboard, notification content | release builds strip or gate logs; scrubbing in error tracking; backups exclude sensitive storage; sensitive screens protected |
| CRYPTO-1 strong crypto | any custom crypto, JS crypto libraries, hard-coded IVs/keys | platform APIs or vetted libraries; no custom schemes; random from a CSPRNG |
| CRYPTO-2 key management | key generation and storage | keys in keystore/keychain; no keys in bundle or config |
| AUTH-1 secure auth protocols | login, token refresh, OAuth client | server-side verification; PKCE; system browser; tokens short-lived and revocable |
| AUTH-2 local authentication done right | biometric/PIN code paths | biometrics unlock a keystore-bound secret; no boolean gate trusted by the server |
| AUTH-3 additional auth for sensitive operations | payment, payout, email/phone change, account deletion screens | step-up enforced server-side |
| NETWORK-1 all traffic secured | API base URLs, ATS and cleartext config, custom TLS code | HTTPS only; no global exceptions; no verification bypass |
| NETWORK-2 identity pinning where needed | network config, pinning library, native pin sets | documented decision; backup pins; rotation plan; not breakable by OTA mismatch |
| PLATFORM-1 IPC secure | deep links, intent filters, exported components, URL handlers, share extensions | verified links; parameters validated; actions confirmed; components not exported without need |
| PLATFORM-2 WebViews secure | every WebView instance and its props | origin allowlist; navigation restricted; bridge messages validated by origin; no file access |
| PLATFORM-3 UI secure | sensitive screens, overlays, text inputs | screenshots/app-switcher protected where needed; secure text entry; no secrets in notifications |
| CODE-1 up-to-date platform | min OS versions, target SDK | justified minimums; current target SDK |
| CODE-2 enforced updates | forced-update mechanism, OTA policy | ability to block vulnerable versions; OTA signed and channel-bound |
| CODE-3 no known-vulnerable components | native modules, JS dependencies shipped in the bundle | advisories triaged by reachability (`security-secrets-supply-chain-cicd`) |
| CODE-4 untrusted input validated | link params, push data, QR codes, files, clipboard, WebView messages | validation before use in navigation, queries or rendering |
| RESILIENCE-1..4 | only for high-risk tier | integrity checks, tamper response, anti-instrumentation; server-side attestation verification |
| PRIVACY-1 data minimization | permission requests, SDK list, analytics events | only needed permissions and fields |
| PRIVACY-2 prevent identification | device identifiers, analytics ids | no unnecessary persistent identifiers; resettable ids |
| PRIVACY-3 transparency | privacy manifest, store labels, consent prompts | declarations match code and SDK behavior |
| PRIVACY-4 user control | settings, deletion, export | in-app deletion where required; consent revocable |

## 3. Expo/React Native specific evidence sources

- App config: `scheme`, `ios.bundleIdentifier`, `ios.associatedDomains`, `ios.infoPlist` (ATS), `ios.privacyManifests`, `android.package`, `android.intentFilters`, `android.allowBackup`, `android.permissions`, `updates.*`, `runtimeVersion`, `extra` (anything here ships in the app).
- Build profiles: per-profile environment variables and update channels; which profile produces store builds.
- Config plugins: each can add manifest entries, permissions and native code; read them, including third-party ones.
- Prebuild/native folders when present: the real `AndroidManifest.xml`, `Info.plist`, entitlements and network security config.

## 4. Attacker models (state one per finding)

1. Remote attacker with no device access (network, links, push content, server responses).
2. Malicious app installed on the same device (claims URL schemes, sends intents, reads shared storage).
3. Physical access to an unlocked or rooted device, or access to its backups.
4. Network position (hostile Wi-Fi, user-installed CA).
5. Compromised update or distribution channel (update host, CI, publish credentials).

A finding that needs model 3 on a rooted device and yields only the attacker's own data is not reportable.

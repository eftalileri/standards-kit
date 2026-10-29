# Feature flags (React Native / Expo) -- normative

```kit-cover
type: normative
part-of: README.md
binds: ordinary feature-flag delivery obligations - server-sourced flags validated with Zod through the server-state cache, and the ban on build-time or hardcoded flag sources
open-when: shape:frontend-heavy, shape:full-stack, signal:feature-flag, signal:remote-config
skip-when: signal:no-remote-config
owns: FFL-RN-C*, FFL-RN-D*, FFL-RN-M1, FFL-RN-M2, FFL-RN-N1, FFL-RN-N2
```

References: [TanStack Query](../tanstack-query/README.md); [Expo Updates](https://docs.expo.dev/eas-update/introduction/) (non-normative -- static channel metadata only).

The blocking app-control / force-update policy is a separate problem class and lives in two part files, cited from here by ID and never restated: [app-control-policy.md](app-control-policy.md) (FFL-RN-M3-FFL-RN-M11) and [app-control-release-evidence.md](app-control-release-evidence.md) (FFL-RN-M12-FFL-RN-M15, FFL-RN-N3-FFL-RN-N4).

---

## Definitions

| ID | Definition |
|----|------------|
| **FFL-RN-D1** | Selected delivery means a server-sourced flag payload validated by the application’s runtime schema authority and fetched through its established server-state mechanism. TanStack Query and Zod are options when they are part of the application stack. |
| **FFL-RN-D2** | Vendor SDK means LaunchDarkly, Firebase Remote Config, ConfigCat, or similar client SDKs. |

---

## Agent execution contract

| ID | Rule |
|----|------|
| **FFL-RN-C1** | **Must not** add FFL-RN-D2 without [gray-situation](../agent-gray-decisions/gray-situation-decisions.md) and user approved Decisions / facts (cost, DSN, data residency). |
| **FFL-RN-C2** | **Must** keep flag evaluation deterministic per session unless product requires real-time flip (document TTL). |

---

## **MUST**

| ID | Rule |
|----|------|
| **FFL-RN-M1** | **MUST** use FFL-RN-D1 for new feature flags unless FFL-RN-C1 exception applies. |
| **FFL-RN-M2** | **MUST** version flag payloads with Zod schemas shared where API and client overlap ([monorepo](../monorepo/monorepo-architecture.md)). |

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **FFL-RN-N1** | **Must not** hardcode flag defaults that hide server kill switches without explicit product sign-off (safety risk). |
| **FFL-RN-N2** | **Must not** use `expo-constants` alone for dynamic per-user flags -- constants are build-time unless EAS Update metadata is the intended SSOT (record in Decisions / facts). |

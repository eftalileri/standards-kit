# Local authentication (React Native / Expo) -- normative

```kit-cover
type: normative
part-of: README.md
binds: biometric and device-credential gate obligations - the local gate never substitutes for the server session
open-when: shape:frontend-heavy, signal:biometric-gate, signal:device-credential, signal:sensitive-screen-lock
skip-when: signal:backend-only, signal:server-session-auth-only
owns: LBA-RN-C*, LBA-RN-D*, LBA-RN-M*, LBA-RN-N*
```

References: [Expo LocalAuthentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/).

---

## Definitions

| ID | Definition |
|----|------------|
| **LBA-RN-D1** | Default module. For the local gate there is no default package named here. The module is chosen per project, against criteria stated before it is picked: first-party to the platform SDK or demonstrably actively maintained; a config plugin proven to build on the project's current SDK version, not on a fix that is still unmerged; and it **must** expose a capability probe and an enrolment probe separately from the authentication call, because LBA-RN-M2 is unsatisfiable without that separation *(in an Expo project `expo-local-authentication` meets these and is installed with `npx expo install`)*. The choice, the criteria and the packages rejected against them are recorded in that project's Decisions / facts. Shipping no local gate is a legitimate outcome of that evaluation, not a gap in it: LBA-RN-D2 already forbids the gate from carrying authentication weight, so its absence costs convenience and not security. |
| **LBA-RN-D2** | App gate means unlocking client secrets or sensitive screens after server session exists -- not a substitute for login API. |

---

## Agent execution contract

| ID | Rule |
|----|------|
| **LBA-RN-C1** | **Must** add NSFaceIDUsageDescription (or equivalent) when Face ID is used on iOS (Expo app.json / config plugin). |
| **LBA-RN-C2** | **Must** handle no hardware / not enrolled with non destructive UX (PIN fallback or skip). |

---

## **MUST**

| ID | Rule |
|----|------|
| **LBA-RN-M1** | **MUST** settle the biometric module choice by LBA-RN-D1's criteria, with the result written down in Decisions / facts before the dependency is added. |
| **LBA-RN-M2** | **MUST** call the module's capability probe and its enrolment probe before the authentication call, and **MUST** branch on each separately -- "no hardware" and "hardware present but nothing enrolled" are different states and LBA-RN-C2 owes each a different UX *(in `expo-local-authentication`: `hasHardwareAsync` / `isEnrolledAsync` before `authenticateAsync`)*. |

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **LBA-RN-N1** | **Must not** treat biometric success as server authentication by itself -- LBA-RN-D2. |
| **LBA-RN-N2** | **Must not** silently fail when user cancels -- surface state per [error handling](../error-handling/error-handling.md). |

---

<a id="stated-enforcement-limits"></a>

## Verification boundaries


A biometric fence requires a real gate and positive/negative proof; when no local-authentication module is installed there is no consumer to bind, so no speculative check is admitted (FP-M18, ENA-A1). Any future admitted LBA-RN-M2 check **must** follow awaited calls and require both probes and their separate branches before authentication. Platform configuration, downstream cancellation UX and server-session use require whole-flow review.


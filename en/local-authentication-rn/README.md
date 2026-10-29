# Local authentication (React Native / Expo)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** biometrics, Face ID, Touch ID, device PIN, expo-local-authentication

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) -- P1-P8 when this topic is in scope (P8 verification when implementation-bound); cite in deliverables per [markdown-authoring M16](../authoring/markdown-authoring.md).

Purpose: Normative single source of truth for optional biometric or device-credential gates in React Native / Expo applications. The project selects a compatible module; a local gate never replaces server-session authentication ([auth](../auth/README.md)).

Normative part file: [`local-authentication-rn.md`](local-authentication-rn.md).

---

## Scope (hub)

- Included: Hardware availability checks, authenticateAsync, fallback behavior, iOS Face ID usage string in config.
- Excluded: Passkeys / WebAuthn unless product adds. Keystore crypto -- [security](../security/README.md).

---

## Reading order (normative)

1. [local-authentication-rn.md](local-authentication-rn.md) -- Definitions (LBA-RN-D\*), **MUST** / **MUST NOT** (LBA-RN-M\* / LBA-RN-N\*), agent contract (LBA-RN-C\*).

---

## Rule identifier prefix (normative index)

| Prefix | Meaning |
|--------|---------|
| LBA-RN-C\* | Agent execution contract |
| LBA-RN-D\* | Definitions |
| LBA-RN-M\* | **MUST** |
| LBA-RN-N\* | **MUST NOT** |

---

## Related

- [Auth](../auth/README.md) -- session tokens after identity proof.
- [Security](../security/README.md) -- what biometric unlock protects (e.g. MMKV gate).

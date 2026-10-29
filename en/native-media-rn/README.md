# Native media (React Native / Expo)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** expo-image-picker, expo-file-system, expo-media-library, permissions, camera, photos


Purpose: Normative single source of truth for camera, photo library, file paths, and media access on Expo using first-party Expo modules (`npx expo install`). Stability preference: Expo modules over random native wrappers unless [gray-situation](../agent-gray-decisions/gray-situation-decisions.md) documents an exception.

Normative part file: [`native-media-rn.md`](native-media-rn.md).

---

## Scope (hub)

- Included: Permissions (`expo-image-picker`, `expo-media-library`), read/write paths via expo-file-system, URI handling, iOS / Android Info.plist / manifest strings via app config / plugins.
- Excluded: Video streaming protocols. Server upload multipart -- repository / API layer (cite Zod + forms). PDF rendering -- product choice.

---

## Reading order (normative)

1. [native-media-rn.md](native-media-rn.md) -- Definitions (**NMD-RN-D\***), **MUST** / **MUST NOT** (**NMD-RN-M\*** / **NMD-RN-N\***), agent contract (**NMD-RN-C\***).

---

## Rule identifier prefix (normative index)

| Prefix | Meaning |
|--------|---------|
| **NMD-RN-C\*** | Agent execution contract |
| **NMD-RN-D\*** | Definitions |
| **NMD-RN-M\*** | **MUST** |
| **NMD-RN-N\*** | **MUST NOT** |

---

## Related

- [Security](../security/README.md) -- PII in images / files.
- [Forms](../forms/README.md) -- validation of upload metadata if applicable.

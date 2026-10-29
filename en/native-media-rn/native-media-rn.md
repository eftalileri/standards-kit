# Native media (React Native / Expo) -- normative

```kit-cover
type: normative
part-of: README.md
binds: camera, photo library and file access obligations - first-party Expo modules and explicit permission gates
open-when: shape:frontend-heavy, signal:camera-photo-library, signal:file-system-access, signal:media-permission
skip-when: signal:backend-only, signal:no-media-access
owns: NMD-RN-C*, NMD-RN-D*, NMD-RN-M*, NMD-RN-N*
```

References: [Expo ImagePicker](https://docs.expo.dev/versions/latest/sdk/imagepicker/); [Expo FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/); [Expo MediaLibrary](https://docs.expo.dev/versions/latest/sdk/media-library/).

---

## Definitions

| ID | Definition |
|----|------------|
| **NMD-RN-D1** | Default stack. For sandboxed file access the default is the platform SDK's own first-party file module, installed through that SDK's install command so the version tracks the SDK rather than the package registry *(in an Expo project: `expo-file-system`, via `npx expo install`)*. For camera / photo-library capture and for album save there is no default package. Each is chosen per project, against criteria stated before it is picked: first-party to the SDK or demonstrably actively maintained; a config plugin proven to build on the project's current SDK version, not on a fix that is still unmerged; and a permission surface reviewable against **NMD-RN-D2** before the dependency is added. The choice, the criteria and the packages rejected against them are recorded in that project's Decisions / facts. Shipping no capture or album path is a legitimate outcome of that evaluation, not a gap in it: a media feature can be complete with file import and a platform share hand-off alone. |
| **NMD-RN-D2** | Permission gate means explicit user prompt before camera or library access per OS rules -- no silent failure. |

---

## Agent execution contract

| ID | Rule |
|----|------|
| **NMD-RN-C1** | Must declare usage strings and permissions in app config before store submission (see Expo docs for iOS usage keys and Android permissions). |
| **NMD-RN-C2** | Must not use deprecated `Permissions` APIs where Expo docs mandate module-specific request methods. |

---

## **MUST**

| ID | Rule |
|----|------|
| **NMD-RN-M1** | **MUST** use **NMD-RN-D1**'s named default for new sandboxed file paths, and **MUST** settle any camera / library / album-save package choice by **NMD-RN-D1**'s criteria, with the result written down in Decisions / facts before the dependency is added. |
| **NMD-RN-M2** | **MUST** handle denied permissions with recoverable UX (Settings link where platform allows) per [error handling](../error-handling/error-handling.md). |

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **NMD-RN-N1** | Must not silently swallow permission errors -- surface root cause to user or logs per product policy. |
| **NMD-RN-N2** | Must not persist PII files in world-readable paths outside Expo documented directories without security review. |

---

## Stated enforcement limits

(a) Most of this hub governs a surface the adopting repository may not contain, and that -- not difficulty -- is the first reason nothing is fenced. A capture or album obligation is only checkable where capture or album code exists. A check written against an absent surface cannot be measured: it has no positive case to prove it fires and no clean set to prove it does not misfire, so it would ship as an unverified assertion, which [**FP-M18**](../false-positive/check-design-rules.md) rejects. The rule for such a hub is therefore to fence at the moment the surface arrives, in the same change that adds it, and to state the absence until then. 

(b) **NMD-RN-C1**, **NMD-RN-M2** and **NMD-RN-N1** are not single-file decisions even once the surface exists. C1 compares a declared permission string in app config against the module that consumes it, and the store-submission half is an event outside the repository entirely. M2 asks whether a *recoverable* path exists on the same surface as the denial, and N1 asks whether a caught permission error reaches a user or a log somewhere downstream -- both are cross-file reachability questions, and a syntax tree that sees one file cannot answer either. These rest on review.

(c) **NMD-RN-C2** is the one identity a single-file rule could decide, and it is still not worth fencing today. "Does this file import the deprecated permissions API" is a plain import check. What it lacks is not decidability but a subject: with no capture module installed there is no call site that could reach the deprecated API, so the rule would be a permanently green check whose greenness carries no information. Read plainly: this is deferred for want of a surface, not for want of a predicate -- when the capture module lands, this row is the cheapest one to fence and should be fenced in that same change.

(d) **NMD-RN-N2** is not a property of a repository at all. Whether a written path is world-readable depends on the directory the OS hands the app at runtime and on the platform version, so no static artifact answers it. This row rests on security review.

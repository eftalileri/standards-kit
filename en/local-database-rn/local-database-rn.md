# Local database (React Native / Expo) -- normative

```kit-cover
type: normative
part-of: README.md
binds: relational client storage obligations - expo-sqlite usage and versioned local schema migration
open-when: shape:frontend-heavy, signal:client-sqlite, signal:local-schema-migration
skip-when: signal:backend-only, signal:key-value-storage-only
owns: LDB-RN-C*, LDB-RN-D*, LDB-RN-M*, LDB-RN-N*
```

References: [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/).

---

## Definitions

| ID | Definition |
|----|------------|
| **LDB-RN-D1** | Selected module means the relational database module chosen for the application's runtime and supported SDK version. In Expo projects, `expo-sqlite` is one first-party option and should be installed using the Expo-compatible version-selection workflow. Record alternatives and their migration, threading, and maintenance trade-offs. |
| **LDB-RN-D2** | Schema migration means versioned DDL or documented migration tool runs before app reads new columns. |

---

## Agent execution contract

| ID | Rule |
|----|------|
| **LDB-RN-C1** | Must use async APIs recommended by Expo for current SDK (avoid blocking UI thread). |
| **LDB-RN-C2** | Must not ship destructive migrations without backup / export plan when user data is at risk. |

---

## **MUST**

| ID | Rule |
|----|------|
| **LDB-RN-M1** | New relational local storage **MUST** use the selected module (**LDB-RN-D1**) and its documented asynchronous APIs where available. Choose relational storage only when relationships, querying, or transactional requirements justify it; keep simple key-value preferences in the application's established key-value authority. |
| **LDB-RN-M2** | **MUST** implement **LDB-RN-D2** for any production schema change. |

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **LDB-RN-N1** | Must not store raw tokens in SQLite without encryption review ([security](../security/README.md)). |
| **LDB-RN-N2** | Must not duplicate server authoritative business metrics in SQLite as second truth without editable persistent attributes SSOT ([editable persistent attributes](../editable-persistent-attributes/README.md)). |

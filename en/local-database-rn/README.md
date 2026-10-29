# Local database (React Native / Expo)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** expo-sqlite, SQL, persistence, migrations


Purpose: Normative single source of truth for relational local storage in React Native / Expo applications. Select a database module for the supported runtime and documented requirements. Keep key-value preferences and small UI state in the application's established storage authorities unless relational queries or transactions justify a database.

Normative part file: [`local-database-rn.md`](local-database-rn.md).

---

## Scope (hub)

- Included: openDatabaseAsync / sync APIs per SDK, migration policy, thread affinity rules per Expo docs.
- Excluded: Server MongoDB. Full ORM choice (Drizzle, Watermelon) -- optional Decisions / facts layer on top of expo-sqlite.

---

## Reading order (normative)

1. [local-database-rn.md](local-database-rn.md) -- Definitions (**LDB-RN-D\***), **MUST** / **MUST NOT** (**LDB-RN-M\*** / **LDB-RN-N\***), agent contract (**LDB-RN-C\***).

---

## Rule identifier prefix (normative index)

| Prefix | Meaning |
|--------|---------|
| **LDB-RN-C\*** | Agent execution contract |
| **LDB-RN-D\*** | Definitions |
| **LDB-RN-M\*** | **MUST** |
| **LDB-RN-N\*** | **MUST NOT** |

---

## Related

- [MMKV](../mmkv/README.md) -- non relational persist.
- [Offline sync strategy RN](../offline-sync-strategy-rn/README.md) -- outbox vs cache.

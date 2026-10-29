# Decision gates (normative index) — editable persistent attributes

```kit-cover
type: normative
part-of: README.md
binds: GEPA1 to GEPA8 -- the binary routing that decides whether a cascade is required or forbidden, and whether it must be chunked, async, body-aware, type-filtered, migration-backed or index-backed
open-when: shape:backend-heavy, signal:editable-attribute, signal:mongo-cascade, signal:cascade-gate-routing
skip-when: signal:no-denormalized-copy, signal:client-only
owns: GEPA1, GEPA2, GEPA3, GEPA4, GEPA5, GEPA6, GEPA7, GEPA8
```

Purpose: Route when cascade is required, forbidden, chunked, async, body-aware, type-filtered, migration-backed, and indexed — without relying on prose alone.

Gates cite existing rule IDs in part files; they do not invent new obligations outside those rows.

Evaluation order: GEPA1 → GEPA2 (per target collection) → GEPA5 → GEPA6 → GEPA8 → GEPA3 → GEPA4 → GEPA7 (when schema changes).

---

## Normative gate table — GEPA

| Gate ID | Proceed YES when | Binding rule IDs | If NO |
|---------|---------------------------|------------------|------------|
| GEPA1 | The attribute's registry row contract names at least one denormalized copy target (structured field and/or `body`). | **EDM-M5**, **EDM-M6**, **CAS-M1**, **EDM-M2** | NO → Implement only the SSoT update; do not run cascade. If denormalized data exists in the database but the contract names none — STOP (**EDM-C4**). |
| GEPA2 | For this target collection, the contract does not mark it as ID-only for this attribute (no denormalized text/price). | **EDM-M2**, **EDM-M3**, **EDM-N1** | Must not cascade name/value into this collection (**EDM-N1**). |
| GEPA3 | Estimated affected documents are within the adopted **EPA-T2** and each bulk write is within **EPA-T1**, or chunking per **EXE-M1** is implemented. | EXE-M1, EXE-N1 | Must chunk and cap concurrency (**EXE-M1**, **EXE-N1**). **STOP** until the project-defined limits are met. |
| GEPA4 | Cascade is not `await`ed inside the HTTP handler that serves the user edit (**EXE-N2** satisfied), or cascade runs only in a background worker (**EXE-N2** N/A for HTTP). | **EXE-M2**, **EXE-N2** | NO → STOP — dispatch async, fire-and-forget with error logging, or job queue (**EXE-M2**); must not ship blocking handler. |
| GEPA5 | `body` is not user-visible for these documents or cascade updates `body` with word-boundary replace (**CAS-M3**, **CAS-M4**). | **CAS-M3**, **CAS-M4** | Must implement `data.\*` + `body` replace with boundaries (**CAS-M3**, **CAS-M4**). |
| GEPA6 | The structured field does not multiplex multiple entity kinds or cascade filters by type / ID per **CAS-M5**. | **CAS-M5** | Must add type (or ID) filter before bulk update. STOP if same-name collision possible without filter. |
| GEPA7 | No new required Mongo field is introduced or a migration script ships per **EVL-M4**. | **EVL-M4** | STOP — add migration before relying on new required field. |
| GEPA8 | Every filter field used in cascade queries has index evidence per **MCI-M1** for that collection. | **MCI-M1**, **MCI-M2**, **MCI-N1** | STOP — add indexes or reduce query shape (**MCI-M1**). |

---

## Binary summary (agent quick path)

| Question | YES → | NO → |
|----------|--------|------|
| Denormalized copy exists? | Cascade required (with GEPA2 per collection) | No cascade for consistency (SSoT only) |
| Only ID in collection? | GEPA2 NO path — do not cascade | Apply cascade if the registry row contract says denormalized |
| Affected set exceeds the adopted **EPA-T2** or chunking is needed? | **EXE-M1** chunking | **STOP** if unbounded write |
| Handler awaits cascade? | STOP (**EXE-N2**) | OK |
| `body` shown to user? | `body` replace (**CAS-M3**) | `data` only |
| Multi-entity same field? | **CAS-M5** filter | Single filter OK |

---

Part of: [README.md](README.md).

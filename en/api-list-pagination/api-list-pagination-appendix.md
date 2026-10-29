# API list pagination — appendix (non-normative)

```kit-cover
type: reference
part-of: README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Part of [API list pagination](api-list-pagination.md). This file carries the traceability tail only: it defines no rule ID, adds no obligation, and is not part of the reading path. The rows it names are defined in [api-list-pagination.md](api-list-pagination.md) and [list-response-and-cursor-rules.md](list-response-and-cursor-rules.md).

---

## Legacy obligation map

| Legacy statement | English row (s) |
|----------------------|-------------------------|
| PaginationResponse contract required | **GAPI-M1**, **GAPI-M2** |
| Cursor for large collections ; skip forbidden there | GGAPI1, **GAPI-M4**, **GAPI-N2** |
| Small / fixed lists may use limit/skip | GGAPI1 carve-out, **GAPI-M5**, **GAPI-M3** |
| N+1 forbidden | **GAPI-M10**, **GAPI-N1** |
| Frontend useInfiniteQuery / cursor useQuery | **GAPI-M9** |

---

## Determinism note

Example verification: inspect the invalid-cursor rejection path required by [**GAPI-M7**](list-response-and-cursor-rules.md); no successful page may be emitted.

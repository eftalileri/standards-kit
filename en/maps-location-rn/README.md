# Maps and location (React Native / Expo)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** expo-location, geolocation, location permission, permission-free path, directions hand-off, coordinate authority, geospatial index


Purpose: Normative single source of truth for a location surface end to end: which dependency provides a device position, how a map-rendering package is chosen (or deliberately not adopted), when the permission prompt may be shown, what must stay reachable when it is refused, how directions are handed off, and what a stored coordinate and a geospatial query owe their consumers. The default is named for device location only; rendering carries no default package and is decided per project against **MAP-RN-D1**'s criteria — a stack default is a measured choice, not a reputation.

Normative part files (two bands, one family): [`maps-location-rn.md`](maps-location-rn.md) — obtaining a position: stack choice, permission, prompt timing, permission-free reachability, hand-off. [`coordinate-authority-and-geospatial-query.md`](coordinate-authority-and-geospatial-query.md) — what happens to a position once it exists: the single construction authority and coordinate order (**MAP-RN-M6**) and the geospatial-index proof with its two meaning-changing behaviours (**MAP-RN-M7**).

---

## Scope (hub)

- Included: Foreground location and permission flows, including prompt timing and the prohibition on re-prompting a refusal; the permission-free path every location surface owes a person who declines; paid-provider key and billing disclosure; directions hand-off by platform URL; the single construction authority for a stored coordinate and the ban on persisting a derived distance; the live-index precondition of a geospatial query and the two behaviours of a geospatial index that change what the query means; marker / region props at integration level.
- Excluded: Routing engines and turn-by-turn navigation SDKs — this topic binds only the *hand-off* to an installed application (**MAP-RN-M3**); adopting a routing engine is a product Decisions / facts matter. Backend geocoding SLAs. The index-migration procedure itself ([**REP-M-15**](../repository/repository-index-migrations-and-validated-reads.md)) and the cursor pagination contract ([**GAPI-M6**](../api-list-pagination/list-response-and-cursor-rules.md)), which this topic depends on and cites rather than restates.

---

## Reading order (normative)

1. [maps-location-rn.md](maps-location-rn.md) -- Definitions (**MAP-RN-D\***), agent contract (**MAP-RN-C\***), the acquisition **MUST** rows (**MAP-RN-M1**--MAP-RN-M5, **MAP-RN-M8**), **MUST NOT** (**MAP-RN-N\***), and stated enforcement limits (b) and (c).
2. [coordinate-authority-and-geospatial-query.md](coordinate-authority-and-geospatial-query.md) -- **MAP-RN-M6** (stored-coordinate authority, order, provenance, derived distance) and **MAP-RN-M7** (live-index proof, sparse index, geospatial-stage-first), plus stated enforcement limit (a).

---

## Rule identifier prefix (normative index)

| Prefix | Meaning |
|--------|---------|
| **MAP-RN-C\*** | Agent execution contract |
| **MAP-RN-D\*** | Definitions |
| **MAP-RN-M\*** | **MUST** |
| **MAP-RN-N\*** | **MUST NOT** |

---

## Related

- [Security](../security/README.md) -- location privacy in logs and analytics; cross-subject exposure ([**SEC-M-ZT-4**](../security/security-tenant-scope-gates.md)) and the recorded-consent exception a published location surface lands in ([**SEC-M-ZT-7**](../security/security-tenant-published-profile.md)).
- [Connectivity RN](../connectivity-rn/README.md) -- offline map tiles.
- [Client observability RN](../client-observability-rn/README.md) -- opening an outbound URL through one validated authority and declaring a capability probe ([**COB-RN-M5**](../client-observability-rn/classification-authority-and-outbound-links.md), [**COB-RN-M7**](../client-observability-rn/classification-authority-and-outbound-links.md), [**COB-RN-N5**](../client-observability-rn/client-observability-rn.md)) -- the mechanics behind **MAP-RN-M3**.
- [Repository](../repository/README.md) -- index-migration authority and the live-inventory read-back ([**REP-M-15**](../repository/repository-index-migrations-and-validated-reads.md)) that **MAP-RN-M7** stands on.
- [SSOT](../ssot/README.md) -- one authority and the derived-value prohibition ([**SSG-M1**](../ssot/ssot-must-authority-and-derivation.md), [**SSG-M8**](../ssot/ssot-principles-and-precedence.md)) that **MAP-RN-M6** applies to a coordinate.
- [API list pagination](../api-list-pagination/README.md) -- the cursor total order ([**GAPI-M6**](../api-list-pagination/list-response-and-cursor-rules.md)) that a distance-ordered list satisfies and a mutable sort key breaks; the unreconciled case is stated in the normative part file.

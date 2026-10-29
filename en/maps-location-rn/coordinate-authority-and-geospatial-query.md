# Maps and location (RN / Expo) — stored coordinate and geospatial query

```kit-cover
type: normative
part-of: README.md
binds: what happens to a position once it exists - the single construction authority and coordinate order for a stored point, the provenance that travels with it, the derived-never-persisted distance, and the proof plus the two meaning-changing behaviours a geospatial query must carry
open-when: shape:frontend-heavy, signal:device-location, signal:map-view, signal:location-permission, signal:directions-handoff, signal:geo-query
skip-when: signal:no-location-access
owns: MAP-RN-M6, MAP-RN-M7
```

Scope: Part of [Maps and location (React Native / Expo)](maps-location-rn.md). That file keeps the definitions (**MAP-RN-D1**, **MAP-RN-D2**), the agent execution contract (**MAP-RN-C1**, **MAP-RN-C2**), the acquisition rows — stack choice, permission gating, prompt timing and staleness, the permission-free path, the split entry points and the directions hand-off (**MAP-RN-M1**–**MAP-RN-M5**, **MAP-RN-M8**) — the prohibitions **MAP-RN-N1** and **MAP-RN-N2**, and stated limits (b) and (c). They bind this band: **MAP-RN-N1** governs what may be written about a coordinate anywhere, including here, and **MAP-RN-M6**'s provenance field records which of that file's acquisition paths produced the point. Those two files are the complete normative set for this topic.


Rules this band depends on and does not restate ([**KIT-INV-3**](../authoring/kit-structural-invariants.md)): index migration and the live-inventory read-back — [**REP-M-15**](../repository/repository-index-migrations-and-validated-reads.md); one authority and derived values — [**SSG-M1**](../ssot/ssot-must-authority-and-derivation.md), [**SSG-M8**](../ssot/ssot-principles-and-precedence.md); cursor total order — [**GAPI-M6**](../api-list-pagination/list-response-and-cursor-rules.md); cross-subject exposure and the recorded-consent exception a published location surface lands in — [**SEC-M-ZT-4**](../security/security-tenant-scope-gates.md), [**SEC-M-ZT-7**](../security/security-tenant-published-profile.md); what may never be written about a coordinate — [**MAP-RN-N1**](maps-location-rn.md).

References: [maps-location-rn.md](maps-location-rn.md) (**MAP-RN-M1**–**MAP-RN-M5**, **MAP-RN-M8**, **MAP-RN-N1**, **MAP-RN-N2**, stated limits (b) and (c)); [README.md](README.md).

---

## **MUST**

| ID | Rule |
|----|------|
| **MAP-RN-M6** | A stored coordinate has exactly one construction authority and one coordinate order. One named helper builds the stored point and one reads it back into named fields; no other module constructs or destructures the coordinate pair (**SSG-M8**). The reason is that the storage order and the human-facing order are commonly reversed — a geospatial store that wants longitude first, a UI that says latitude first — so a swapped pair is a structurally valid record that passes validation, stores cleanly and is simply in the wrong place on the planet. Provenance travels with the coordinate: how the position was obtained is written and cleared together with the position, so a later reader can tell a surveyed point from a typed one. A distance is derived and never persisted — it is recomputed from the caller's origin on every request, so it cannot drift from the coordinate it came from (**SSG-M1**). |
| **MAP-RN-M7** | A geospatial query **MUST NOT** ship without proof that its geospatial index is live, read from the deployment's own index inventory rather than from a model or schema declaration; creating it is an index migration and **REP-M-15** governs that unchanged. Two behaviours of a geospatial index are stated here because they change what the query means, not merely how fast it is. (a) It is inherently sparse. A record with no indexed location field is not in the index, so a geospatial stage never returns it, whatever the other filters say — and on the document stores in common use this cannot be switched off. That is a product statement, not a tuning detail: the owner of a record with no coordinate must be told the record is invisible on that surface. (b) The geospatial stage runs first. It selects the candidate window before any later filter narrows it, so a filter written after it cannot widen the set and a candidate ceiling bounds the whole query, not just the page. Both facts belong in the surface's Decisions / facts alongside the radius and ceiling values they interact with. |

---

## Stated enforcement limit

Limits (b) and (c) for acquisition remain in [maps-location-rn.md](maps-location-rn.md).

(a) Geospatial ordering against a cursor total order is unreconciled, and this topic does not invent a reconciliation. [**GAPI-M6**](../api-list-pagination/list-response-and-cursor-rules.md) requires a cursor list to publish a total order — primary sort keys plus a unique tie-breaker — so that paging neither repeats nor omits a row. A distance order satisfies it: for a fixed origin, distance and the tie-breaker are both stable for the life of the paging session. Placing a mutable key ahead of distance — a rating, a popularity score, a freshness stamp — removes the guarantee: a value written between two page fetches moves a row across a page boundary and the reader sees one duplicate or one missing row. No rule in this kit reconciles the two. What a check would need is a snapshot handle for the query shape — a read token that pins the candidate set across fetches — and the geospatial aggregation surfaces these queries run on do not expose one; nothing in a source tree can substitute for it, because the drift happens in the data between two requests rather than in the code. The obligation that remains is the one **GAPI-M6** already implies and this limit makes explicit: the API contract documentation names the instability and the key that causes it, and a surface that cannot tolerate a duplicate row does not put a mutable key ahead of a stable one.

# Timezone resolution — decision gates (GTZ) and gate validation (**TZ-GV**)

```kit-cover
type: normative
part-of: README.md
binds: GTZ1 to GTZ4 and TZ-GV1 to TZ-GV6 -- the ordered resolution gate, the guard before any local-to-UTC conversion, the country-only rejection, the calendar-day route, and the observable scenario that proves each gate
open-when: shape:backend-heavy, shape:full-stack, signal:timezone-resolution, signal:local-to-utc, signal:calendar-day-display
skip-when: signal:no-timezone-surface, signal:instant-only
owns: GTZ1, GTZ2, GTZ3, GTZ4, TZ-GV1, TZ-GV2, TZ-GV3, TZ-GV4, TZ-GV5, TZ-GV6
```

Scope: The gate index of the timezone standard and the scenarios that validate it. Every gate routes to rows defined in the other part files; no gate adds an obligation of its own.

Document type: Normative part — GTZ1–GTZ4, **TZ-GV1**–**TZ-GV6**.

References: [README.md](README.md); [timezone-resolution-standard.md](timezone-resolution-standard.md) (**TZ-C\***, **TZ-D\***, **TZ-F\***); [timezone-must.md](timezone-must.md) (**TZ-M\***); [timezone-must-not.md](timezone-must-not.md) (**TZ-N\***); [timezone-verification-and-binding.md](timezone-verification-and-binding.md) (**TZ-V**-\*, **TZ-X1**).

---

## Decision gates (normative index) — GTZ

Gates cite TZ-\* rows; they do not add hidden obligations.

| Gate | Proceed only if YES | Binding rule IDs | If NO |
|------|-------------------------|------------------|-----------|
| GTZ1 | Ordered resolution yields one valid IANA timezone: explicit record value (**TZ-D2**), then owning-context setting (**TZ-D3**), then an approved country mapping (**TZ-D4**/**TZ-D5**, via **TZ-D8** with **TZ-X1** satisfied) when that inference is enabled; otherwise **TZ-F1**. If two supplied valid sources disagree, apply **TZ-M10** and emit its diagnostic before return. | **TZ-M1**, **TZ-M3**, **TZ-M7**, **TZ-M9**, **TZ-M10**, **TZ-D2**, **TZ-D3**, **TZ-D4**, **TZ-D5**, **TZ-X1** | **TZ-F1** |
| GTZ2 | Inbound local → UTC conversion is invoked only with IANA from GTZ1 YES branch for that context. | **TZ-M2**, **TZ-M6** | STOP — do not call **TZ-D6** |
| GTZ3 | Country-only inputs without clock time are not passed to **TZ-D6** as if they were instants (no fake midnight unless documented product rule in Scope). | **TZ-N5** | STOP; if the input is independently proven to be a **TZ-D10** calendar day rather than country-derived time, route through GTZ4 |
| GTZ4 | Input semantics are **TZ-D10** (calendar day only): route to the one documented calendar-day display authority; validate components and explicit locale, then format without device-timezone interpretation. | **TZ-D10**, **TZ-M11**, **TZ-N8** | **TZ-F5** — do not route through **TZ-D6** or implicit device-local `Date` parsing |

Gate validation: Each gate **MUST** have at least one observable check in **TZ-GV**.

---

## Gate validation scenarios (normative) — **TZ-GV**

| ID | Gate | Scenario | Pass criteria |
|----|------|----------|---------------|
| **TZ-GV1** | GTZ1 | Fixture: **TZ-D2** set → resolver returns that id; clear **TZ-D2**, set **TZ-D3** → returns settings id; clear both, **TZ-D4** + **TZ-D5** default → returns mapped id; none → **TZ-F1** (throw or policy error). | Order never skips (1) for (2) when (1) valid. |
| **TZ-GV2** | GTZ2 | GTZ1 NO → no call to **TZ-D6** in trace; GTZ1 YES → exactly one **TZ-D6** call site per conversion boundary documented in architecture. | Static review proves guard. |
| **TZ-GV3** | GTZ3 | Supply a country code alone to an operation that requires a timezone-aware instant. | Reject, or require the product's explicit documented rule; do not invent local midnight. |
| **TZ-GV4** | GTZ1 | When country-to-timezone inference is enabled, supply the calling-country from the canonical phone-normalization output; verify timezone code does not parse phone input itself. | The timezone resolver consumes the documented handoff only; no duplicate phone parsing in timezone code. |
| **TZ-GV5** | GTZ1 | Provide two different valid IANA identifiers from the record and owning-context settings (for example `America/New_York` and `Europe/London`). | Resolver chooses the higher-precedence source and emits exactly one structured conflict diagnostic per **TZ-M10**. |
| **TZ-GV6** | GTZ4 | Format the same valid calendar day under devices configured to timezones on opposite sides of UTC, using the same explicit display locale. | Both renders preserve the same year/month/day; malformed or impossible dates follow **TZ-F5** rather than rolling into another day/month. |

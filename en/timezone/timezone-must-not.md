# Timezone resolution — **MUST NOT** (**TZ-N**)

```kit-cover
type: normative
part-of: README.md
binds: TZ-N1 to TZ-N8 -- no naive UTC mutation, no timezone inferred from locale or currency, no silent UTC substitution, no null-means-invalid, no fabricated midnight, no untraceable calling country, no duplicate zone map, and no implicit device-zone handling of a calendar day
open-when: shape:backend-heavy, shape:full-stack, signal:timezone-resolution, signal:local-to-utc, signal:calendar-day-display
skip-when: signal:no-timezone-surface, signal:instant-only
owns: TZ-N1, TZ-N2, TZ-N3, TZ-N4, TZ-N5, TZ-N6, TZ-N7, TZ-N8
```

Scope: Every **MUST NOT** row of the timezone resolution standard.

Document type: Normative part — **TZ-N1**–**TZ-N8**.

References: [README.md](README.md); [timezone-resolution-standard.md](timezone-resolution-standard.md) (**TZ-C\***, **TZ-D\***, **TZ-F\***); [timezone-decision-gates.md](timezone-decision-gates.md) (GTZ\*, **TZ-GV\***); [timezone-must.md](timezone-must.md) (**TZ-M\***).

---

## **MUST NOT** (normative) — **TZ-N**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **TZ-N1** | **MUST NOT** interpret local wall time as UTC by mutating `Date` with `setUTCHours`, `setUTCMinutes`, or equivalent naive shifts without IANA context . | Bug | Static: search scheduling paths for naive UTC-field mutation (`setUTCHours`, `setUTCMinutes`, `setUTCDate`) → zero hits or a documented exempt list |
| **TZ-N2** | **MUST NOT** infer IANA timezone from UI locale , `Intl` display locale , or currency alone . | Bug | Lint / review : no `language` → `timezone` map outside documented **TZ-D5** fed by **TZ-D4** |
| **TZ-N3** | **MUST NOT** substitute UTC or offset zero when GTZ1 cannot resolve a required timezone, unless the product explicitly documents a bounded exception naming the exact surface and data class . | Bug / STOP | Inspect unresolved-input handling: it rejects rather than producing UTC without the declared exception. |
| **TZ-N4** | **MUST NOT** return `undefined` / `null` from validation layer for impossible local times . | Bug | Decision function audit |
| **TZ-N5** | **MUST NOT** fabricate local midnight or other default clock time from country alone inside **TZ-D6** without a written product rule in the adopting project's Scope for that API . | Bug | **TZ-GV3** scenario inspection or static denylist |
| **TZ-N6** | **MUST NOT** accept **TZ-D4** for **TZ-M1** (3) from UI locale, guess, or string not traceable to **TZ-D8** . | Bug / STOP | Code review + DTO field required when step (3) enabled |
| **TZ-N7** | **MUST NOT** ship two independent authoritative copies of the **TZ-D5** map (second copy **MUST** import or codegen from the **TZ-D5** owner ) . | Bug | Static: duplicate map files → zero or one re-exports the other |
| **TZ-N8** | **MUST NOT** parse or format a **TZ-D10** value through implicit device-local timezone behavior (`new Date(dateOnly)` plus locale formatting without an explicit fixed display zone, or equivalent). **MUST NOT** invent a clock time or IANA timezone to make a date-only value displayable. | Bug | Review that date-only values use the registered calendar-day authority and are not passed to a timezone-interpreting instant formatter; static checks may catch direct forms but cannot prove aliases or semantic types across files. |

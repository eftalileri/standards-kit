# Timezone resolution standard (normative)

```kit-cover
type: normative
part-of: README.md
binds: TZ-C1 to TZ-C4, the TZ-D definitions and the TZ-F failure paths -- the contract, the vocabulary every other timezone rule is written against, and the closed set of outcomes when a timezone cannot be resolved
open-when: shape:backend-heavy, shape:full-stack, signal:timezone-resolution, signal:local-to-utc, signal:calendar-day-display
skip-when: signal:no-timezone-surface, signal:instant-only
owns: TZ-C1, TZ-C2, TZ-C3, TZ-C4, TZ-D1, TZ-D2, TZ-D3, TZ-D4, TZ-D5, TZ-D6, TZ-D7, TZ-D8, TZ-D9, TZ-D10, TZ-D11, TZ-F1, TZ-F2, TZ-F3, TZ-F4, TZ-F5
```

Normative parts split out of this file: [decision gates and gate validation](timezone-decision-gates.md) (GTZ1–GTZ4, **TZ-GV1**–**TZ-GV6**); [**MUST**](timezone-must.md) (**TZ-M1**–**TZ-M12**); [**MUST NOT**](timezone-must-not.md) (**TZ-N1**–**TZ-N8**); [verification, enforcement and cross-standard binding](timezone-verification-and-binding.md) (**TZ-V**-\*, **TZ-X1**).

Scope

- Included: Ordered resolution of an authoritative IANA timezone for a bounded context (user, tenant, account, or record); conversion of local civil date/time to one UTC instant through a single documented authority; conversion of one captured UTC instant into zoned calendar/time parts; DST-safe gap/fold behavior; documented country-to-timezone defaults where applicable; explicit failure when resolution is impossible; and user-visible formatting of a date-only calendar day without converting that day into a device-local instant. Applies wherever a product schedules or compares instants, stores UTC derived from local time, or displays date-only values that must not shift across device timezones.
- Excluded: User-visible country or currency names — [locale names](../locale-names/README.md) (LCN-\*). Parsing, validation, or normalization of telephone strings — [phone number](../phone/README.md) (PHN-\*); **TZ-D4** **MUST** enter only via **TZ-D8** (PHN output field ) per **TZ-M7** / **TZ-X1**. Push transport, PDF layout, chart specs — respective topic SSOTs. Database index design — N/A (one-line reason: performance-only).

Document type: Normative — rule engine.


Environment: Applies to server and client runtimes that interpret local time, scheduled work, or calendar-day display. Log failures per the consuming application's [logging policy](../logging-policy/logging-policy.md).

Binding principle: Violations of **TZ-M** / **TZ-N** are bugs — must fix; must not ship silent UTC guesses, naive local mutations, or device-timezone-shifted calendar days (**TZ-C3**).

References: [README.md](README.md); [error policy](../error-policy/error-policy.md); [error handling](../error-handling/error-handling.md); [decision function](../decision-function/decision-function.md); [phone number](../phone/README.md); [locale names](../locale-names/README.md).

---

## Rule identifiers (normative)

| Prefix | Meaning |
|--------|---------|
| **TZ-C*** | Agent execution contract |
| **TZ-D*** | Definition |
| **TZ-M*** | **MUST** |
| **TZ-N*** | **MUST NOT** |
| **TZ-F*** | Failure path |
| GTZ* | Decision gate (normative index) |
| **TZ-V*** | Verification |
| **TZ-GV*** | Gate validation scenario |
| **TZ-X*** | Cross-standard binding (PHN → TZ handoff) |

---

## Agent execution contract — **TZ-C**

| ID | Rule |
|----|------|
| **TZ-C1** | This topic is mandatory for code that resolves IANA timezone for scheduling, instant comparison, or persisted local time → UTC conversion, and for code that formats a **TZ-D10** date-only calendar day in Scope. |
| **TZ-C2** | [Shared agent contract C2](../_meta/agent-contract.md); compliance is only from TZ-\* / GTZ\* rows here; deviation → STOP. |
| **TZ-C3** | Apply [shared **C4**](../_meta/agent-contract.md). |
| **TZ-C4** | [Error policy](../error-policy/error-policy.md) wins on HTTP status and semantic codes; this file adds timezone resolution, instant conversion, and date-only calendar-day display minimums only. |

Enforcement: STOP / merge blocked on **TZ-F1** class outcomes when Scope requires a timezone; bug for **TZ-N1** / **TZ-N2** violations.


---

## Definitions (normative) — **TZ-D**

| ID | Definition |
|----|------------|
| **TZ-D1** | IANA timezone means a non-empty identifier from the IANA Time Zone Database, or a documented supported subset validated by the application. |
| **TZ-D2** | Explicit persisted timezone means a non-empty IANA timezone field on the same aggregate (record, row, document) that owns the local time being converted, documented in architecture as authoritative for that record when present. |
| **TZ-D3** | Owning-context setting means a non-empty IANA timezone read from the single documented settings authority for the user or entity that owns the scheduled fact, when **TZ-D2** is absent or empty per GTZ1. |
| **TZ-D4** | Calling-country code means ISO 3166-1 alpha-2 produced only by PHN-\*-compliant E.164 parsing (not inferred from UI locale). |
| **TZ-D5** | Country-to-timezone map means the single documented authority that maps a calling-country code to one IANA timezone, marks the country ambiguous with a documented default, or requires an explicit timezone. Use this mapping only when the product has approved that inference. Its owner and source are documented in the adopting system's architecture (**TZ-M9**). |
| **TZ-D6** | SSOT local-to-UTC means the one documented function (or documented overload family with one entry re-export) that converts (local civil or wall time + calendar date + IANA timezone) → UTC instant, DST-safe, used everywhere **TZ-M2** applies. |
| **TZ-D7** | UTC instant means an unambiguous absolute time point (for example epoch milliseconds or RFC 3339 with Z / explicit offset) comparable across zones without further locale context. |
| **TZ-D8** | PHN-to-TZ handoff means **TZ-D4** delivered only as : (i ) a named property on a documented shared type / DTO filled from [phone number](../phone/README.md) **PHN-D3** (b ) in the same request , job payload , or transaction context ; or (ii ) a named parameter on a documented resolver function whose caller warrants that value came from that PHN output . Timezone resolver implementation **MUST NOT** re-parse E.164 or national phone strings to produce **TZ-D4** . |
| **TZ-D9** | nowUTC means the current evaluation instant as **TZ-D7**, read only through the single documented time source module (for example `getNowUtc()` , `clock.now()` ) per **TZ-M8** . All predicates in this standard that compare or order instants against wall clock **MUST** use **TZ-D9** , not raw `Date.now()` / `new Date()` outside that module . |
| **TZ-D10** | Calendar-day display value means a date-only civil value (for example canonical `YYYY-MM-DD`) whose year/month/day are the complete product fact; it is not a UTC instant or local wall-clock datetime. A runtime `Date` may be used only as a fixed-zone display carrier after strict component validation; that carrier does not change the value's semantics into an instant. |
| **TZ-D11** | Zoned-parts authority means the one documented helper that accepts an already captured **TZ-D7** UTC instant plus one validated IANA timezone and returns canonical local calendar/time parts (for example `YYYY-MM-DD`, exact `HH:mm`, and bounded ISO weekday). It does not read a new current time; context-specific wrappers may obtain **TZ-D9** once and delegate to this authority. |

---

## Failure paths (normative) — **TZ-F**

| ID | Condition | Outcome |
|----|-----------|---------|
| **TZ-F1** | After GTZ1 steps (1)–(3) are evaluated in order, no IANA timezone is non-empty and valid per **TZ-D1**, or step (3) is required but **TZ-D5** is missing / undeclared for the **TZ-D4** supplied. | STOP — throw or structured error per [error policy](../error-policy/error-policy.md); **MUST NOT** default to `UTC` or offset 0 without documented product exception filed in Scope amendment (**TZ-N3**). |
| **TZ-F2** | **TZ-D5** marks country ambiguous and no explicit IANA is supplied where **TZ-M3** requires it. | STOP — same as **TZ-F1**; **MUST NOT** pick an arbitrary zone silently. |
| **TZ-F3** | SSOT local-to-UTC (**TZ-D6**) receives invalid local components (impossible local time, malformed strings). | throw or typed error per [decision function](../decision-function/decision-function.md); **MUST NOT** return `null` / `undefined` on validation paths (**TZ-N4**). |
| **TZ-F4** | Batch job: timezone unresolvable for one partition key while others succeed. | **MUST** skip or fail that slice per documented batch policy; **MUST** emit structured error log with partition id and rule id **TZ-F1** / **TZ-F2**; **MUST NOT** coerce UTC via naive Date mutation (**TZ-N2**). |
| **TZ-F5** | A **TZ-D10** calendar-day value, or its required explicit display locale, is malformed or cannot be validated as a real calendar date. | throw or return a typed contained error per [decision function](../decision-function/decision-function.md); **MUST NOT** emit a guessed date, device-locale fallback, or the unvalidated raw value as if formatting succeeded. |

---

## Gates, **MUST**, **MUST NOT**, verification — moved

The gate index GTZ1–GTZ4 and the scenarios **TZ-GV1**–**TZ-GV6** are defined in [timezone-decision-gates.md](timezone-decision-gates.md); the rows **TZ-M1**–**TZ-M12** in [timezone-must.md](timezone-must.md); **TZ-N1**–**TZ-N8** in [timezone-must-not.md](timezone-must-not.md); the verification matrix, enforcement layer, traceability table, **TZ-X1** and the skill boundary in [timezone-verification-and-binding.md](timezone-verification-and-binding.md).

---

*Normative name: timezone-resolution-standard.*

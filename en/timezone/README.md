# Timezone resolution (IANA, UTC conversion)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** IANA, UTC, local time, timezone resolution, owning context


Purpose: Hub for reusable rules that determine which IANA timezone applies to a context, how local civil time maps to UTC instants, and how a date-only calendar day is displayed without device-timezone shifting. This topic does not define country or currency display labels or E.164 parsing.

Normative SSOT: [`timezone-resolution-standard.md`](timezone-resolution-standard.md) (**TZ-C\***, **TZ-D\***, **TZ-F\***); [`timezone-decision-gates.md`](timezone-decision-gates.md) (GTZ\*, **TZ-GV\***); [`timezone-must.md`](timezone-must.md) (**TZ-M1**–**TZ-M12**, **TZ-M15**, **TZ-M18**–**TZ-M21**); [`timezone-recurrence-and-due-window.md`](timezone-recurrence-and-due-window.md) (**TZ-M13**, **TZ-M14**, **TZ-M16**, **TZ-M17** — the single nth-weekday occurrence derivation, the at-or-after due window whose uniqueness comes from a durable per-occurrence claim, the runner reference zone declared at the registration call site instead of inherited from the host process, and the two preconditions that make widening such a window admissible); [`timezone-must-not.md`](timezone-must-not.md) (**TZ-N\***); [`timezone-verification-and-binding.md`](timezone-verification-and-binding.md) (**TZ-V**-\*, **TZ-X1**).

Cross-domain contracts (normative index): **TZ-D8** / **TZ-M7** (calling-country output field only); **TZ-D9** / **TZ-M8** (single `nowUTC` source); **TZ-D10** / GTZ4 / **TZ-M11** / **TZ-N8** (calendar-day display); **TZ-X1** ↔ phone number [**PHN-X1**](../phone/phone-number-verification-and-binding.md) / [**PHN-M6**](../phone/phone-number-standard.md).

Non-normative: This README is a router; rule text lives only in the normative part files listed above.

Developer ergonomics (non-normative): Repositories SHOULD expose one thin documented facade (for example a single `resolveIanaForContext` plus `localToUtc` wrapper) that applies GTZ1, **TZ-D6**, and **TZ-D9** so feature code does not re-implement precedence by hand. This does not replace **TZ-M** rows; it reduces copy-paste risk.

Related standards: [Phone number (E.164 core)](../phone/README.md) — PHN-\* supplies ISO 3166-1 alpha-2 calling-country only for **TZ-D4** when E.164 normalization ran first. [Locale names](../locale-names/README.md) — LCN-\* owns Intl.DisplayNames labels; **TZ-N2** forbids inferring IANA timezone from UI locale. [Appointment lifecycle](../appointment-lifecycle/README.md) — APL-\* composes scheduling with the owning timezone; TZ-\* defines IANA resolution order where products align. [Error policy](../error-policy/error-policy.md), [error handling](../error-handling/error-handling.md), [logging policy](../logging-policy/logging-policy.md).

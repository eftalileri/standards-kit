# Country and currency UI display names (normative)

```kit-cover
type: normative
part-of: README.md
binds: the LCN core obligation set -- definitions, failure paths, and every LCN-M / LCN-S / LCN-N row governing how an ISO country or currency code becomes a user-visible label
open-when: shape:frontend-heavy, signal:display-names, signal:country-label, signal:currency-label, signal:intl-displaynames, signal:locale-sourced-label
skip-when: signal:single-locale-documented, signal:no-label-surface
owns: LCN-D1, LCN-D2, LCN-D3, LCN-D4, LCN-D5, LCN-D6, LCN-D7, LCN-F1, LCN-F2, LCN-M1, LCN-M2, LCN-M3, LCN-M4, LCN-M5, LCN-M6, LCN-M7, LCN-M8, LCN-M9, LCN-M11, LCN-M12, LCN-S1, LCN-N1, LCN-N2, LCN-N3, LCN-N4, LCN-N5, LCN-N6, LCN-N7, LCN-N8, LCN-N9
```

Normative parts split out of this file: [decision gates and gate validation](decision-gates.md) (GLOC1–GLOC3, **LCN-GV1**–**LCN-GV4**); [contract, verification and enforcement](contract-and-enforcement.md) (**LCN-C1**–**LCN-C3**, **LCN-V**-\*).

Scope

- Included: User-visible labels for ISO 3166-1 alpha-2 regions and ISO 4217 currencies; Intl.DisplayNames and i18n hybrid per **LCN-M3**–**LCN-M9**; SSR / SSG / HTML shell rules **LCN-M11** where server markup includes these labels.
- Excluded: IANA timezone resolution, local wall-clock to UTC conversion — [timezone](../timezone/README.md) (TZ-\*). E.164 parsing, validation, normalization, calling-country derivation from subscriber digits — [phone number](../phone/README.md) (PHN-\*). Single-locale products MAY document a Scope carve-out; until documented, **LCN-M1** applies. Pure client-only shells (typical RN, or SPA without SSR for that surface) → N/A for **LCN-M11** (one-line reason: no server HTML to mismatch).

Document role: Normative rule set. Each **LCN-M**, **LCN-N**, or **LCN-S** row states one independently reviewable obligation.

References: [README.md](README.md); [phone number](../phone/README.md); [timezone](../timezone/README.md); [forms](../forms/forms.md); [error policy](../error-policy/error-policy.md); [error handling](../error-handling/error-handling.md); [logging policy](../logging-policy/logging-policy.md).

Environment: Runtime support for Intl and available locale bundles can differ by platform and release configuration. Record the supported target set and apply **LCN-V-INTL** to that set.


---

## Definitions (normative) — **LCN-D**

| ID | Definition |
|----|------------|
| **LCN-D1** | App language means the active UI language string from the single documented language store or hook (for example `currentLanguage`). It is the only allowed input for resolving locale-relative display names in product UI. |
| **LCN-D2** | Display name SSOT means the single documented module or exported hook that implements **LCN-M1** (no parallel implementations in feature components). Exact path **MUST** be recorded in the repo README or architecture doc one place. |
| **LCN-D3** | BCP 47 locale means the tag passed to `Intl.DisplayNames` (for example `en-US`, `tr-TR`) produced only by the single documented mapper **LCN-M2**. |
| **LCN-D4** | Hardcoded single-language label map means any in-repo object or switch keyed by country or currency code that supplies end-user visible names in one natural language only, without using **LCN-D2**. |
| **LCN-D5** | Technical fallback (allowed) means: after documented Intl attempt, use documented i18n keys; **LCN-D5** does not permit inventing a fake label or silently substituting a different country or currency. |
| **LCN-D6** | Locale fallback chain means the ordered list of BCP 47 tags (and the matching i18n language ids) tried for Intl and for i18n lookup before concluding that no translation exists — one documented sequence (for example `en-AU` → `en`, `pt-BR` → `pt`) **MUST** live next to **LCN-M2** / **LCN-D3** in architecture or **LCN-D2** module doc. |
| **LCN-D7** | Domain ISO code means an ISO 3166-1 alpha-2 country code or ISO 4217 currency code already held as application domain state: persisted entity field, validated form / mutation payload property, or API response field documented as authoritative for that surface. **LCN-D2** accepts only **LCN-D7** as the code input for label resolution; it does not discover or infer the code. |

---

## Failure paths (normative) — **LCN-F**

| ID | Condition | Outcome |
|----|-----------|---------|
| **LCN-F1** | Allowlisted ISO country or currency code has no non-empty resolved label after **LCN-M3**, **LCN-M9** (full chain), and **LCN-M4** paths documented for the build. | BLOCKER — must not ship until keys, Intl coverage, or allowlist is fixed; **MUST** log per [logging policy](../logging-policy/logging-policy.md) with root cause fields required by [error handling](../error-handling/error-handling.md) where client-visible. |
| **LCN-F2** | `Intl.DisplayNames` throws, returns empty, or engine lacks `type: "region"` / `type: "currency"` support at runtime. | Not a silent success — **MUST** take **LCN-M4** i18n path and **MUST** emit a single structured warning or error log per project policy (no log spam per call without rate limit documented). |

---

## Decision gates and gate validation — moved

The gate index GLOC1–GLOC3 and its validation scenarios **LCN-GV1**–**LCN-GV4** are defined in [decision-gates.md](decision-gates.md).

---

## **MUST** (normative) — **LCN-M**


| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **LCN-M1** | All user-visible country and currency names **MUST** be produced only via **LCN-D2** (single module or hook). | Reject / bug | Static: no **LCN-D4** in selector components; imports trace to **LCN-D2** |
| **LCN-M2** | **LCN-D3** **MUST** be derived only from **LCN-D1** through one documented `getLocaleForIntl` (or equivalent name in architecture doc). | Reject | Code search: single mapper; no ad-hoc `toLowerCase()` locale hacks in screens |
| **LCN-M3** | When Intl.DisplayNames is the primary resolver, the implementation **MUST** wrap calls so that **LCN-F2** is detected and **LCN-M4** runs. | Bug | Inspect the Intl failure wrapper: **LCN-F2** selects the **LCN-M4** recovery path. |
| **LCN-M4** | When Intl and i18n both yield no usable non-empty string, the UI **MUST** show the ISO code (or one documented sentinel string approved in error handling SSOT) and **MUST** log **LCN-F1** class diagnostics. | BLOCKER if code ships without log | Inspect missing-label handling: it emits the documented ISO/sentinel and **LCN-F1** diagnostic. |
| **LCN-M5** | Adding a code to the product allowlist **MUST** include i18n entries reachable via **LCN-M9** for every shipped **LCN-D1** value unless GLOC2 YES and **LCN-GV2** proves Intl covers that code on all targets. | Reject | PR checklist + **LCN-GV3** style check |
| **LCN-M6** | The project **MUST** publish **LCN-V-INTL** (table or script output) and keep it current when minimum OS or engine version changes. | Warning escalates to BLOCKER if missing at release freeze | Doc path exists; dated matrix |
| **LCN-M7** | If GLOC2 is NO, i18n **MUST** be the primary label source; Intl **MUST NOT** be assumed. | Reject | GLOC2 recorded NO in SSOT + implementation matches |
| **LCN-M8** | i18n keys for country and currency **MUST** live under the documented namespace (for example `{namespace}.countries.<CODE>` and `{namespace}.currencies.<CODE>`) or another single documented prefix; no duplicate parallel trees. | Reject | Grep key prefix; one tree only |
| **LCN-M9** | Locale fallback chain (**LCN-D6**) **MUST** be applied for both `Intl.DisplayNames` locales argument (array or equivalent) and i18n resolution so that a missing exact tag (for example `en-AU`) **MUST** try documented parents (for example `en`) before **LCN-F1**. The chain **MUST** be identical in spirit for Intl and i18n (no orphan `en-AU` UI with no `en` bundle). | BLOCKER if absent | Inspect Intl and i18n locale arrays: a regional tag reaches the same documented parent chain. |
| **LCN-M11** | Where SSR, SSG, or HTML prerender emits these labels, the server **MUST** use the same **LCN-D3** / **LCN-M9** rules for the request (or cookie) locale or the client **MUST** re-resolve labels after mount when **LCN-D1** differs, so wrong-language text **MUST NOT** remain visible after hydration and locale stabilization. | Bug — reject for user-visible mismatch | Inspect request/client locale propagation and the hydrated real UI after locale stabilization. |
| **LCN-M12** | ISO codes passed into **LCN-D2** **MUST** be **LCN-D7** only (domain data or validated transport). **MUST NOT** derive country or currency codes inside **LCN-D2**, selector components, or label hooks from [phone number](../phone/README.md) normalization, [timezone](../timezone/README.md) resolution, `Intl` default locale, or **LCN-D1** alone. | BLOCKER | Code review: call sites pass props from store / API / form state; static: no **PHN-D2** / TZ resolver imports in **LCN-D2** (see **LCN-N5**–**LCN-N7**) |

---

## SHOULD (normative) — **LCN-S**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **LCN-S1** | Display name resolution inside **LCN-D2** SHOULD memoize or cache stable results per (ISO code, effective locale tag after **LCN-M9**) so list rendering (large selectors) does not repeat Intl / i18n work without bound. Cache **MUST** invalidate when **LCN-D1** or **LCN-D3** inputs change. | WARNING if perf regression or jank in lists | Profiler, React `useMemo` / module-level Map, or equivalent documented pattern |

---

## **MUST NOT** (normative) — **LCN-N**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **LCN-N1** | **MUST NOT** render allowlisted selector labels from **LCN-D4** in multi-locale products. | BLOCKER | Static pattern scan (see Enforcement layer) |
| **LCN-N2** | **MUST NOT** duplicate currency display name maps inside feature components. | BLOCKER | Project-appropriate static inspection or source search |
| **LCN-N3** | **MUST NOT** ship Intl-primary labeling without **LCN-V-INTL** evidence (**LCN-M6**). | Reject | **LCN-GV2** artifact present |
| **LCN-N4** | **MUST NOT** invent a plausible country or currency name string when resolution fails (**LCN-D5**). | BLOCKER | Inspect failed-resolution branches: no guessed name escapes **LCN-F1** handling. |
| **LCN-N5** | **MUST NOT** resolve IANA timezone or perform UTC instant conversion inside **LCN-D2** or any **LCN-M1** call path . | BLOCKER | Static: **LCN-D2** module imports — no **TZ-D6** / timezone SSOT |
| **LCN-N6** | **MUST NOT** parse, validate, normalize, or interpret E.164 telephone strings inside **LCN-D2** . | BLOCKER | Static: **LCN-D2** — no **PHN-D2** / libphonenumber imports |
| **LCN-N7** | **MUST NOT** infer ISO 3166-1 alpha-2 for labels from telephone input or E.164 prefix ; label resolution uses only codes already selected or stored as domain fields . | BLOCKER | Code review: selectors read code from props / form state only |
| **LCN-N9** | **MUST NOT** retain an **LCN-D4** map once the **LCN-D2** path for that code space ships: the hardcoded label field is deleted from the carrier type and from every literal in the same change that lands **LCN-M1**. **LCN-N1** bans rendering from D4 and says nothing about the map surviving — but a surviving map re-acquires consumers through paths nobody calls "display": search and filter predicates, sort keys, log lines, export columns. Each is user-observable and single-language, and none is a catalog entry, so no parity gate can look there. Deletion is the migration's own obligation ([**DCD-M2**](../dead-code/dead-code-rules.md)) and the single-writer one ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md)): D2 landing without D4 dying leaves two writers of one name. Where the field is part of a published wire contract, [**DCD-M8**](../dead-code/dead-code-rules.md) orders the removal instead — measure consumers first, do not skip the deletion. | Bug — second writer of a localized name | Single-file syntax-tree check, not review: one object literal carrying both an ISO-shaped code (`^[A-Z]{2,3}$` — the shape, never a country list, which would be the parallel authority one layer up) and a hardcoded label field. Stated limit: only string-literal labels are asked; one from a variable or call is out of scope, since its language is a run-time fact.  |
| **LCN-N8** | **MUST NOT** request a display-name-bearing `Intl` option on an engine with no CLDR name data (**LCN-F2**, e.g. Hermes). For timezone labels this bans every `timeZoneName` value, `shortOffset` included. `shortOffset` reads as "pure offset, therefore portable"; that is false — it is still a formatting option served from the engine's locale data, and a name-less engine resolves it to the generic fallback. It does not degrade to empty or to the raw identifier: it returns a plausible wrong answer (`"GMT"` for a UTC+3 zone), so the screen states an offset the user does not have and nothing reports an error. A missing label is visible; a confidently wrong one is not. The portable construction never asks the engine to *name* anything: format the instant's wall-clock fields in the target zone (`timeZone` works wherever dates render at all), rebuild that wall clock as UTC, take the difference — arithmetic the locale data cannot corrupt. Underivable → omit the offset segment rather than guess. Sharper generalization: an `Intl` output the engine looks up is unsafe; one you compute is safe. A product reason reinforces it — metazone names change with daylight saving while the user is choosing a stable location. | Bug — user-visible text that is silently wrong, not merely platform-dependent | Single-file syntax-tree check, not review: flag any object property named `timeZoneName`, whatever its value. Keying on the property name rather than the `Intl.DateTimeFormat` call site is deliberate — option objects are routinely hoisted or spread, where a call-site predicate goes silently blind. Stated limit: a computed key is not statically readable and is out of scope. |

---

## Contract, verification and enforcement — moved

The agent execution contract **LCN-C1**–**LCN-C3**, the verification matrix **LCN-V**-\*, the enforcement layer, violation handling, rule traceability, the skill boundary and the false-completeness guard are defined in [contract-and-enforcement.md](contract-and-enforcement.md).

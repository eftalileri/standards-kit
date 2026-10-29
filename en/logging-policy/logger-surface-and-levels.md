# Logging policy — logger surface and structured meta (**M1**–**M14**, **M20**)

```kit-cover
type: normative
part-of: README.md
binds: the first band of logging-policy MUST rows — the selected structured logging implementation, a single application-owned logger facade, which level a record takes, required structured meta and its key discipline, message prefixes, and the one feature-facing wrapper surface
open-when: shape:backend-heavy, signal:log-write, signal:logger-wrapper, signal:failure-boundary
skip-when: signal:client-only, signal:no-logging-change
owns: M1, M2, M3, M4, M5, M6, M7, M8, M9, M10, M11, M12, M13, M14, M20
```

Part of [Logging policy](logging-policy.md) — the agent execution contract (**C1**–**C10**), the technology row, the log-level table, the message/meta shape section, the hosted-runtime rows (**R1**–**R5**) and every **N** prohibition are defined there and bind these rows.

Bare-ID scope: an unlinked `C*` / `M*` / `N*` / `R*` id cited in this topic always means a logging-policy row; the band that defines each one is listed in [README.md](README.md).

---

## **MUST** — **M1** to **M14**, **M20**

**M1**: Backend runtime paths **MUST** use a maintained structured logging implementation whose version baseline is documented for the consuming system.

**M2**: Runtime operational paths must use the application logger facade (`logger.*`) — not console methods (error policy **N5** aligned; **N5** here for scope).

**M3**: Must choose the correct level per Log levels below — no demoting error to info to hide incidents.

**M4**: In managed container or PaaS deployments, must log to the platform-supported output stream (stdout / stderr) or a configured central sink — no mandatory local file sinks for runtime logs.

**M5**: Any structured meta object passed to logger.* must satisfy **M13**.

**M6**: logger.error must be used for errors and thrown failures, with the Error (or message + stack) passed per the application logger facade's documented call shape; associated structured meta must satisfy **M12**.

**M7**: On failure paths aligned with error policy, log metadata must include rootCause and, where that policy or your schema defines it, solution — same bar as **M12** for logger.error.

**M8**: Critical, user-blocking, and data-integrity events **MUST** include structured meta. Minimum keys: action (string), and at least one identifier among userId, requestId, correlationId, tenantId, jobId, etc., when any such value exists in the current context. If no identifier exists in context, action alone must still be present — do not skip meta because the list is incomplete.

**M9**: logger.debug must be disabled or no-op in production unless an explicit temporary diagnostic flag is documented (default: off in prod).

**M10**: All backend runtime operational logs **MUST** go through one application logger module (single import surface). Direct logger-factory calls or ad-hoc logger instances in feature code are forbidden — configure transports only in the logger module.

**M11**: If the deployed logging-library version does not satisfy the consuming system's documented compatibility baseline, the agent **MUST** stop: upgrade the dependency or update the documented baseline before writing or changing logging code. Do not proceed on version drift silently.

**M12**: On every logger.error call, structured meta **MUST** include at minimum action (string) and rootCause (string). If error policy or your logging schema defines solution for that class of failure, solution **MUST** also be present.

**M12** root-cause corollary: `rootCause` describes the failure, so it comes from the carrier's own root cause when present, else from the one shared derivation (controlled root-cause marker → registry code → validated structural evidence, per **M31**). A fixed sentence such as "error detail was redacted at the security boundary" is forbidden: once error text is value-scanned instead of deleted (**M25**) it is false, and it hides the carrier's actual cause behind a constant. No static rule can reliably lock the literal — detecting "a sentence claiming redaction" is natural-language matching with unbounded false positives and negatives; the structural lock is that boundary helpers take `rootCause` from the shared derivation, and review of any new boundary checks it.

**M13**: Metadata **MUST** be JSON-serializable: no functions, no class instances, no circular references. Prefer flat keys; nesting is allowed only where domain structure requires it — keep depth small (avoid deep graphs).

One datum, one key name — and the name must mean something (**SSG-M8** applied to metadata). Flat keys are only half the discipline. Where a single authority derives a fact that many call sites log — a caught error's validated class identity, an outcome label — that fact **MUST** travel under exactly one key name across the tier, and the value under that name **MUST** come from the derivation authority rather than being re-read raw at the call site. Two distinct harms: (a) with several spellings no consumer can bind to one contract, so every reader re-resolves which spelling was used, and a record that *lost* the fact still looks populated because a sibling spelling is present; (b) the canonical name stops carrying any guarantee once unvalidated input may be written under it — and there is an ordering trap here, because renaming a raw read *onto* the canonical name is strictly worse than leaving it aliased: it launders unverified text through the authority's reputation. A unification pass that only renames therefore degrades safety unless the raw-read sites are routed through the authority in the same change.

The one permitted variation is a qualified form of the canonical name, which is not a second spelling: where one record legitimately carries the fact for two different subjects, the subject qualifies the canonical base (`<subject>CodeName` beside `codeName`). Collapsing both onto the bare name would produce a duplicate key.

Unify early: the alias count grows in the background. A naming decision that lives only in prose does not hold, so choose the canonical name when the field is introduced and update every consumer in the same change.

Enforcement: both halves are decidable from a single file's syntax tree — "this property's value is a call to the derivation authority" and "this property's key is the canonical name" are one subtree relationship each — so where the adopting project uses static source checks they **MUST** be locked by a static rule rather than review alone; use the enforcement mechanism the adopting project documents, and record its actual scope and limits. Check reach: the rule anchors on the value (an authority call) or on the canonical key, so it cannot see a site that does both wrong at once — an alias key holding a raw read (`errorName: error.name`), where neither anchor is present. Catching that shape would need a key-name blacklist, i.e. the name heuristic the false-positive policy forbids; it is covered instead by the raw-error-text prohibitions (**M25**) and by the canonical-key half, which fires the instant such a site is renamed onto the canonical name.

**M14**: The message string (first argument to logger.*) **MUST** start with a module prefix in square brackets, e.g. `[Module]`, then a space and the description.

**M20**: The logging module **MUST** expose exactly one feature-facing surface (a thin facade) whose `error` method has an explicit `(message, error, meta)` signature and merges `meta` into the structured record. The raw underlying logger instance (e.g. the object returned by the logging library's factory, whose level methods may be typed `(message, ...meta: any[])`) **MUST** stay module-private — it **MUST NOT** be exported. All code (feature paths and scripts / CLI) uses only the facade. Enforce both structurally — keeping the raw instance unexported makes TypeScript reject any reference from typecheck-included code (`Cannot find name`) — and with a lint rule (**N8**), which gives a clearer message and also covers script / CLI files that may sit outside the typecheck scope. Reason: calling the raw instance as `raw.error(message, error, meta)` silently drops the third argument — it type-checks (because of `...meta: any[]`) yet the `meta` carrying the **M8** / **M12** fields (`action`, `rootCause`, `solution`, ids) never reaches the record, so the crash report (**M17**) and metric channel (**M18**) lose exactly what **M12** mandates. Two surfaces with identical level-method names but different `error` shapes is a footgun; collapse to one facade and keep the raw instance private (enforce with **N8**).

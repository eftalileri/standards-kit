# NoSQL query safety — Zod-first and Mongoose sanitizeFilter

```kit-cover
type: normative
part-of: README.md
binds: NoSQL injection obligations — Zod-first boundary validation, per-query sanitizeFilter policy, projection and field-selection safety, the guard-outcome policy, server-side JavaScript operators, the webhook carve-out and the GSEC-NOSQL1 gate
open-when: shape:backend-heavy, signal:mongo-query, signal:user-input-filter, signal:destructive-write
skip-when: signal:client-only, signal:no-database-query
owns: GSEC-NOSQL1, NOSQL-GC-1, NOSQL-GC-2, NOSQL-GC-3, SEC-M-NOSQL-1, SEC-M-NOSQL-2, SEC-M-NOSQL-3, SEC-M-NOSQL-4, SEC-M-NOSQL-10, SEC-M-NOSQL-WH-1, SEC-N-NOSQL-1, SEC-N-NOSQL-2, SEC-N-NOSQL-3, SEC-N-NOSQL-4, SEC-N-NOSQL-5
```

Scope

- Included: NoSQL / MongoDB query injection policy: Zod (or equivalent schema) as primary control, per-query `sanitizeFilter` as optional second layer, global `sanitizeFilter` forbidden, raw `req.body` / `req.query` rules, projection / field-selection safety, Express `req.params` rule, CI guard semantics, regex-pattern injection through `$regex` / `RegExp` (**SEC-M-NOSQL-10**), server-side JavaScript operators (**SEC-N-NOSQL-5**), **GSEC-NOSQL1** gate.
- Excluded: Silently ignored index declarations, ODM projection-prefix correctness, bulk destructive scope and request-derived array bounds — [nosql-declaration-index-and-destructive-writes.md](nosql-declaration-index-and-destructive-writes.md) (**SEC-M-NOSQL-5**–**SEC-M-NOSQL-8**); Webhook HMAC and trust model — [Security backend](../security/security-backend-controls.md) (**SEC-M-WH-1**); generic non-Mongo validation — [Forms](../forms/forms.md); server authz — **SEC-D3** / **SEC-M-ZT-1**.

Document type: Normative — **NOSQL-GC-1**–**NOSQL-GC-3** (governance), **SEC-M-NOSQL-1**–**SEC-M-NOSQL-4**, **SEC-M-NOSQL-10**, **SEC-M-NOSQL-WH-1** and **SEC-N-NOSQL-1**–**SEC-N-NOSQL-5** (obligations), **GSEC-NOSQL1**.


Environment: Backend Node services using Mongoose (or documented equivalent Mongo driver) and HTTP inputs.

Binding principle: Zod-first (typed scalars / objects without attacker-controlled operator keys reaching the driver) is mandatory; `sanitizeFilter` is not a substitute for Zod at the boundary (**NOSQL-GC-2**).

References: [Security backend](../security/security-backend-controls.md) (**SEC-M-BE-NOSQL-1** bridge); [Forms](../forms/forms.md); [nosql-declaration-index-and-destructive-writes.md](nosql-declaration-index-and-destructive-writes.md) (**SEC-M-NOSQL-5**–**SEC-M-NOSQL-8** — the sibling band).

Code samples (non-normative): [`../_meta/examples/nosql-query-safety-code-samples.md`](../_meta/examples/nosql-query-safety-code-samples.md).

---

## Agent contract (normative)

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **NOSQL-GC-1** | Any handler that builds a MongoDB filter, projection, or aggregation pipeline segment from HTTP input must comply with **SEC-M-NOSQL**-\* / **SEC-N-NOSQL**-\* in this file. | STOP — merge blocked. | PR checklist. |
| **NOSQL-GC-2** | Must not treat global or default-on `sanitizeFilter` as the primary fix for injection — **SEC-M-NOSQL-1** must be satisfied first. | Architecture bug. | Design review. |
| **NOSQL-GC-3** | Interpretation forbidden: Global `mongoose.set('sanitizeFilter', true)` is always forbidden (**SEC-N-NOSQL-1**) — no project exception without Security hub amendment. | SEC bug. | Code grep. |

---

## **MUST** / **MUST NOT** — Zod and Mongo filters

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-M-NOSQL-1** | All user-controlled values incorporated into MongoDB query shapes must be validated at the route / handler boundary with Zod (or documented equivalent schema) so arbitrary operator objects (`$ne`, `$gt`, nested injection) cannot reach the driver as user input. Shapes include: filter arguments (find first argument, updateOne / deleteOne filter, etc.); projection / field selection (find second argument when an object, `select()` / `fields` options where objects are built from HTTP); and `aggregate` pipeline stages (or stage arrays) that consume HTTP-derived input. | Bug — must not ship; merge blocked. | Handler audit + code review. |
| **SEC-N-NOSQL-1** | Must not call `mongoose.set('sanitizeFilter', true)` globally — it breaks legitimate `$gte` / `$lte` (and similar) on Date/numeric paths and causes CastError. | Bug — STOP. | Project-wide source scan. |
| **SEC-M-NOSQL-2** | Only where a raw user-controlled filter object is intentionally passed to a Mongoose query (Zod cannot safely shape the entire filter), must use per-query `setOptions({ sanitizeFilter: true })` (or documented equivalent) and document the call site (PR description or security note). | Bug if raw filter without mitigation. | PR review. |
| **SEC-M-NOSQL-3** | When using the **SEC-M-NOSQL-1** path, must pass only schema-validated outputs (e.g. `schema.parse()` results) into Mongo filters for those fields — must not mix raw HTTP objects into the same filter without **SEC-M-NOSQL-2**. | Injection class bug. | Code review. |
| **SEC-N-NOSQL-2** | Must not use raw `req.body`, raw `req.query`, or unvalidated JSON parse from them as the sole Mongo filter without **SEC-M-NOSQL-1** (plus **SEC-M-NOSQL-3**) or **SEC-M-NOSQL-2** (per-query sanitizeFilter). | Injection class bug — merge blocked. | Static guard + review. |
| **SEC-N-NOSQL-3** | Must not require Zod on `req.params` solely to prevent NoSQL operator injection from path segments — Express params are strings; must still validate ID shape and authz (**SEC-D3**) on separate rules. | Doc / wrong tooling bug. | Lint / review policy. |
| **SEC-N-NOSQL-4** | Must not use raw `req.body`, raw `req.query`, or unvalidated objects parsed from them as Mongo projection / field selection (e.g. `Model.find(filter, req.body)`, `select(req.query.fields)` when that resolves to an attacker-controlled object) without the same validation bar as **SEC-M-NOSQL-1** (allowlisted field names / Zod-shaped projection only). | Injection / data-exposure class bug — merge blocked. | Code review + static guard (if present). |
| **SEC-M-NOSQL-10** | A dynamic value placed in a regex pattern position on the server — a Mongo `$regex` value, or the pattern argument of a `RegExp` constructor — must pass through the project's single regex-escape authority (one function that escapes `. * + ? ^ $ { } ( ) \| [ ] \`), so the text matches literally; must not keep a second local escape copy ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md)). A user-supplied search string that reaches such a position must also carry a length cap at the boundary schema, taken from one shared constant that the server-side search sanitizer uses too. Where a boundary and a downstream search sanitizer both classify the same term, they read one format authority and the same length measurement; an admitted nonempty term must reach the escaped filter, not disappear into the absent-search branch. Absence is represented separately from invalidity: a nonempty invalid term is refused through the existing input-error boundary, never converted into a broader successful query. Stated enforcement limit (**ENA-GV3**): this acceptance/filter equivalence requires the bodies of both the boundary and downstream consumer, which one file's AST cannot hold. A new check is admitted only if it passes **ENA-A1**(c): a single classifier plus runtime invalid-input refusal already prevents silent widening. Future bypasses and semantic consumer changes remain review-bound; an escape-authority check proves only pattern escaping. Why: Zod proves the value is a *string*, not that it is a *literal* — an unescaped `(` throws (500 + error-tracker noise), `(a+)+$` backtracks on a database every tenant shares, `.*` turns a search into a wildcard, and an ordinary phone search such as `+1 …` is already an invalid pattern. Scope of the check: a single file's AST cannot tell user text from a constant, so the check locks the entry path into the pattern, not the source: every non-literal pattern goes through the authority (escaping a constant is behaviour-neutral); a deliberately composed pattern is a reasoned inline suppression. Not seen by the check (stated limit): aggregate `$regexMatch` / `$regexFind` `regex` fields, `RegExp` values inside `$in`, string arguments that `String.prototype.match` / `replace` / `search` turn into patterns, and tooling outside the server runtime. | Injection / availability class bug — merge blocked. | a focused static check for the reachable pattern forms + review for the stated limits. |
| **SEC-M-NOSQL-4** | If the consuming project uses a static NoSQL guard, outcomes (WARN vs FAIL) for unmitigated Mongo + `req.body`/`req.query`/`req.params` on filter or projection paths must be written in CI or security docs; must not merge FAIL-classified findings without fix or **SEC-NA-1** ([Security enforcement](../security/security-enforcement-and-na.md)). | CI / process failure. | CI config + doc. |
| **SEC-N-NOSQL-5** | Must not use a server-side JavaScript operator — `$where`, `$function`, `$accumulator` or `mapReduce` — in a query or pipeline that carries request or stored user data; the logic is written with native query and aggregation operators. Reason: these operators run JavaScript inside the database, so data that reaches them is code, and no schema on the value makes that safe. Review-held until the tree contains an operator for a check to reject ([ENA-A1](../enforcement-architecture/enforcement-admission.md)(a)). | Injection class bug — merge blocked. | Repository search for the operator names + review. |

---

## Webhook carve-out (normative pointer)

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-M-NOSQL-WH-1** | `req.body` used only for audit raw storage (e.g. `rawPayload`) under [**SEC-M-WH-1**](../security/security-backend-controls.md) must not be treated as **SEC-N-NOSQL-2** violation when body never becomes a Mongo filter — must still satisfy **SEC-M-WH-1** (HMAC, parent validation). | Bug. | Webhook review. |

---

## Decision gate — **GSEC-NOSQL1**

| Gate | Proceed only if YES | Binding IDs | If NO |
|------|------------------------|-------------|-------|
| **GSEC-NOSQL1** | Every HTTP-derived value in this Mongo query path (filter, projection, `aggregate` stage input) is covered by **SEC-M-NOSQL-1** + **SEC-M-NOSQL-3** (Zod path), **SEC-M-NOSQL-2** (documented per-query sanitizeFilter on raw filter), or **SEC-M-NOSQL-WH-1** / **SEC-M-WH-1** (webhook storage only); no **SEC-N-NOSQL-4** violation | **SEC-M-NOSQL-1**, **SEC-M-NOSQL-2**, **SEC-M-NOSQL-3**, **SEC-M-NOSQL-WH-1** | STOP — do not merge until validated |

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|---------------------|
| User input reaches Mongo as filter, projection, or `aggregate` stage input without **GSEC-NOSQL1** satisfaction | STOP — **GSEC-NOSQL1** failed; fix before merge. |
| Global `sanitizeFilter` detected | STOP — **SEC-N-NOSQL-1**; remove immediately. |
| Unvalidated HTTP object used as projection / `select` shape | STOP — **SEC-N-NOSQL-4**. |

---

Aggregate pipeline (clarification): `aggregate([...])` stages (or a pipeline array) built from unvalidated `req.body` / `req.query` must meet the same bar as find filters (**SEC-M-NOSQL-1**; **SEC-N-NOSQL-2** / **SEC-M-NOSQL-2** where raw objects are intentional). A separate obligation ID is not required.

---

## Non-normative: guard algorithm (reference)

A typical static guard that scans for Mongo queries and raw `req.*` values in filters or projections without Zod, per-query `sanitizeFilter`, or the webhook storage pattern is illustrated in [`../_meta/examples/nosql-query-safety-code-samples.md`](../_meta/examples/nosql-query-safety-code-samples.md) — this does not replace the **SEC-M-NOSQL-4** documentation duty.

---

Part of: [README.md](README.md).

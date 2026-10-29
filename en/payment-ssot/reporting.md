# Payment SSOT — reporting and revenue (normative)

```kit-cover
type: normative
part-of: README.md
binds: PAY-R-D, PAY-R-M, PAY-R-N and RV -- the separation of revenue accrual from cash collection, the explicit time, population and owning-ledger basis of every report metric, the single internal/test-account exclusion of platform metrics, the survival of platform revenue-ledger rows as anonymized copies through subject erasure, the value-source basis that keeps a closed period from moving when the catalogue is edited, the birth-freeze obligation on every creation path and its proven-evidence backfill, the gating of a subscription-loss count, and the shared-transform source rule for report pipelines, and the derivation of a displayed money total from its visible rows
open-when: shape:backend-heavy, signal:financials, signal:payment-field, signal:revenue-report, signal:dashboard-metric, signal:subscription-lifecycle
skip-when: signal:no-payment-surface, signal:no-reporting-surface
owns: PAY-R-D1, PAY-R-D2, PAY-R-D3, PAY-R-D4, PAY-R-D5, PAY-R-D6, PAY-R-D7, PAY-R-M1, PAY-R-M2, PAY-R-M3, PAY-R-M4, PAY-R-M5, PAY-R-M6, PAY-R-M7, PAY-R-M8, PAY-R-M9, PAY-R-M10, PAY-R-M11, PAY-R-M12, PAY-R-N1, PAY-R-N2, PAY-R-N3, PAY-R-N4, RV1, RV2, RV3, RV4, RV5, RV6, RV7
```

Scope: Separation of revenue accrual vs cash collection, summary metrics, and report data sources.

Related: [report-pdf](../report-pdf/report-pdf.md), [report-excel](../report-excel/report-excel.md), [tanstack-query/](../tanstack-query/) for cache invalidation after payment updates.

---

## Definitions (normative)

| ID | Definition |
|----|------------|
| **PAY-R-D1** | Record-based revenue (accrual) counts records whose PAY-D11 status row accrues revenue and takes their value toward revenue metrics independent of whether PAY-D3 shows collection. A report row's price never changes because its status changes: a status that expects no payment shows the unchanged price with zero remaining, while every aggregate selects membership from the relevant PAY-D11 column rather than inferring it from the displayed amount. A bundle session ordinal is assigned only to statuses that consume a session, over the bundle's complete history rather than the report window. |
| **PAY-R-D2** | A bundled or prepaid sale's revenue is recorded when the bundle is created (its total price once); that recognition point is distinct from later usage or per-record paymentStatus, and the same value is never counted twice. |
| **PAY-R-D3** | Collected amount for dashboards **MUST** aggregate PAY-D3 across records after the PAY-D4 transform, not infer collection from PAY-R-D1 alone. |
| **PAY-R-D4** | Reporting time consistency: Each metric **MUST** declare its time basis explicitly — e.g. accrual by status transition / update window, collection by the payment time of completed payment rows in range, or a record-creation cohort — must not mix creation-based and payment-time-based cash in one unlabeled total. A refund or refund-reversal row **MUST** carry both its own time and the time of the purchase it reverses: a cohort or per-acquisition figure (LTV, ROAS, payback, cohort revenue) attributes it to the purchase, a period cash figure to the refund time, and a surface showing a cohort figure says that refunds can still change past periods. A period cash figure **MUST** select its source records by the money rows' own times (payment and refund instants), never by the parent record's date window, while lists, counts and accruals of the same report keep the parent's date; a payment in the window for a parent outside it lands in a visible row (PAY-R-M12). A stored-text instant compared in the database **MUST** have its shape enforced by the write authority (model validator, not only the request schema) and is pre-filtered on a window widened by the largest offset, backed by an index, the exact instant test staying in the cash authority. Reason: selecting by the parent's date drops money paid in the window for an earlier or later parent and counts it in no window at all. |
| **PAY-R-D5** | Reporting population basis: Beside its time basis, each metric **MUST** declare whose rows it counts — a cohort (subjects whose *entry* falls in the selected window) or an as-of-now set (every subject, the window applied only inside the measurement). Two metrics of the same noun computed over different populations legitimately disagree; the defect is not the disagreement but a surface that shows both without saying which population each used. A funnel step is always cohort: every step shares one population, which is what makes each step a subset of the one above it. A subscription-money denominator (payers, ARPPU, LTV, CAC) **MUST** count the billed subject — the entity that holds the subscription — never a person acting for it (owner, staff, end user); where one person holds several billed subjects, an acquisition view **MAY** collapse them into one acquisition subject, and each metric names which of the two units it uses. Reason: a person-keyed and a subject-keyed count of the same payers disagree whenever one person holds two subjects, and the cheaper metric silently becomes the denominator of the other. |
| **PAY-R-D6** | Subscription loss (churn) definition: A subject counts as lost only if it (i) really paid — proven by the revenue authority under the shared production-environment scope, not by an entitlement flag — and (ii) is not paying now, proven by the subscription-status authority. A provider lifecycle/expiry event is neither gate; it is admissible only as the date of a loss already established by (i) and (ii). A trial that ran out and an administratively granted period that ended are not losses: a subject that never paid cannot stop paying. "Really paid" means the subject's signed revenue (purchases minus refunds plus refund reversals) is positive; the existence of a positive purchase row is not proof once refunds are recorded. "Paying now" requires an active entitlement backed by a paid platform subscription; a promotional, administrative or otherwise unpaid entitlement does not make a previously paying subject paying. A one-time consumable purchase is money paid (it counts in cash, realized revenue and "really paid") but has no plan period: a recurring derivation (recurring revenue, renewal survival, per-plan breakdown) **MUST** skip it and **MUST NOT** read it as an unknown-period or unknown-plan row, which would void the figure for every subject. A product gate that asks whether the subject has bought a plan (a trial offer, a conversion nudge) **MUST** read the plan-purchase scope, never "really paid": a consumable is no plan decision, and counting it would withhold the offer from a subject who never subscribed. The loss date is the expiry instant the provider event itself reports, never a storage or inbox timestamp, which may hold the purchase time. |
| **PAY-R-D7** | Value-source basis: metrics **MUST** distinguish frozen commitment values from the editable live catalogue. The catalogue is authoritative only at birth or explicit pricing re-selection; on a multi-line record only added lines are born anew. Unchanged selections retain frozen money, quantity, label, duration and other birth terms; unrelated edits rewrite none. A stored derived total is server-owned behind the shared re-selection predicate (PAY-N10). Missing frozen data fails loud and is repaired from proven birth evidence (PAY-R-M9(c)), never today's catalogue or a default. Catalogue deletion **MUST NOT** be blocked: existing renewals, schedules, series screens and labels still read frozen terms. A new member of a recurring series after deletion is born from the reference record's frozen terms through the renewal derivation. Completion-time rule snapshots and notification labels obey the same existing-record boundary. |

---

## MUST (normative)

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PAY-R-M1** | A summary labelled as collected payments ("received payments" or an equivalent label) **MUST** sum PAY-D3 from the canonical financial projection (PAY-M6). | Bug | Verify the metric equals the sum of canonical `paidAmount` values. |
| **PAY-R-M2** | If accrual and collection both appear in one response, they **MUST** use distinct field names (no overloaded `totalRevenue` without definition). | Bug | API schema review. |
| **PAY-R-M3** | Report and preview rows **MUST** use `paymentStatus` / `remainingAmount` / `paidAmount` from the shared financial projection (PAY-O1). | Bug | Review that all surfaces consume the same projection. |
| **PAY-R-M4** | Report and dashboard APIs **MUST** document (API schema, type, or named response fields) which PAY-R-D4 basis each numeric total uses — must not rely on implicit "last 30 days" without field-level definition. A money total with even one counted row whose amount is unknown **MUST** remain unknown; a partial sum cannot be reported as complete. An empty population may truthfully total zero. Persisted unknown uses field absence; a JSON response may use `null` to distinguish it from numeric zero. Every downstream summary **MUST** preserve that `null` and the field's name. Cache keys **MUST** change when this wire meaning changes, so an old cached zero cannot masquerade as a new complete total. | Reject | Schema or README lists time field per metric; each aggregate and summary preserves unknown membership and cache key version. |
| **PAY-R-M5** | A surface showing a cohort metric beside an as-of-now metric of the same noun **MUST** state the cohort's scope in its own copy ("of those who joined in this range"). Where a metric's source cannot cover the whole population, that coverage limit **MUST** be printed from a backend-supplied field, never asserted in static copy. | Bug | Copy audit against PAY-R-D5; coverage sentence renders only when the field is present. |
| **PAY-R-M6** | A loss/churn count **MUST** receive an already-gated population (PAY-R-D6 (i)+(ii)) as its input, so it cannot be handed a raw provider-event set; and a provider subject identity **MUST** be resolved through the durable identity mapping, never by parsing the identifier's shape or counting distinct provider identifiers as accounts. Where a proven loss has no dated provider record, it is not folded into an arbitrary period and the gap reaches the error channel. | Bug | Signature review (pre-gated parameter); identity mapping read; undated-loss warning path present. |
| **PAY-R-M7** | Every report, analysis and history surface that describes an already-made commitment **MUST** take its per-row money and quantity values from that record's frozen fields (PAY-R-D7), and a surface that shows the same record on more than one path (a client preview beside the server's own evaluation of it) **MUST** feed all of those paths from the one derivation that reads those fields — a second, independently written read is a parallel authority that diverges the first time the catalogue is edited. Where the frozen field is absent the surface fails loudly and names the repair; it **MUST NOT** fill the gap from the catalogue, from a default, or from a neighbouring row. | Bug | Read paths import the frozen-value derivation; the missing-field branch raises rather than substitutes. |
| **PAY-R-M8** | A collected-money row **MUST** enter a cash total from its owning ledger exactly once. When a parent ledger owns bundle money, a completed row mirrored on a child record is compatibility/history data, never a second cash source: child-cash inputs **MUST** be constructible only after proving the child is not parent-ledger-backed, while bundle cash reads the parent ledger. If child activity supplies the reporting attribution, every child row **MUST** carry the exact parent-record identity; the report deduplicates on that identity, requires every duplicate to agree on subject and attribution owner, and loads the parent ledger once through a tenant-scoped bounded read. A catalogue/template identity is not an exact parent identity and **MUST NOT** be a fallback. Parent cash uses the parent record's own seller/assignee attribution; it is never assigned from an arbitrary child row. Status-blind cash semantics apply inside the selected owner; they do not permit summing both ledgers. | Financial SSoT bug — duplicate, missing, or misattributed cash | The type system accepts child-cash inputs only from the ownership gate; report adapters carry exact parent identity to it; bundle cash imports the parent-ledger authority; duplicate child references collapse to one parent read and disagreeing attribution fails loud. |
| **PAY-R-M9** | Every creation path **MUST** freeze sale-time values at birth; existing-record reads and amendments **MUST** follow [the clauses below](#pay-r-m9-clauses). | Bug — an existing record's ceiling, size or value moves when the catalogue is edited, or a widened frozen field silently reclassifies records | Creation inputs, schema, read derivations and amendment writers are inspected against the clauses below. |
| **PAY-R-M10** | Internal and test subjects leave a platform-level metric (operator analytics, revenue, funnel, acquisition, advertising) through ONE exclusion authority. The operator's own and QA/test accounts, and every subject derived from them (the tenants they own, including closed ones, and the rows they produced), **MUST** be removed by one persisted, operator-written marker read by one authority, applied inside the shared population and revenue-scope authorities so every consumer inherits it and none re-filters. (a) The exclusion changes what is counted, never what the account does: product decisions about the subject itself (has it paid, is it eligible) and outbound conversion feeds **MUST NOT** read it. (b) Raw records **MUST NOT** be deleted or altered to exclude them. (c) A composable query fragment carrying the exclusion **MUST** sit under an operator key no caller sets (for example a top-level negated-disjunction operator), never under a field key — a caller spreading its own tenant or subject condition after it silently drops the exclusion. (d) An account recognised only through removable configuration (for example a store-review login) **MUST** also carry the persisted marker; removing the configuration otherwise returns its history to every metric. | Bug — test purchases count as revenue and payers, and CAC, ROAS and conversion decisions rest on the operator's own traffic | Static inspection: one exclusion reader and writer; shared population and revenue scopes apply it; product-logic importers keep the plain scope. Real run: read-only before/after comparison when one account is marked. |
| **PAY-R-M11** | A platform revenue-ledger row (money the platform received or returned: purchase, refund, refund reversal) **MUST NOT** disappear when its subject's account or tenant is erased. Every erasure path that would delete it (account erasure, tenant teardown) **MUST** first replace it, through the ledger's one anonymizer, with a copy built from an allowlist of non-identifying fields (type, signed amounts, currency, time fields, product, store, environment) carrying fresh random subject, tenant and document identifiers — one tenant value per erased tenant, no old→new mapping stored or logged. A document id derived from identifiers **MUST** be replaced too. Non-production rows and rows of an analytics-excluded subject (PAY-R-M10) are erased as before. | Bug — past revenue shrinks and ROAS rewrites itself when a paying business leaves | Static inspection: every erasure path calls the one anonymizer before its event delete; the anonymizer selects through the revenue-scope authority and builds copies from an allowlist. |
| **PAY-R-M12** | A surface that shows money rows and a total of the same money concept (report, preview, PDF, screen card) **MUST** derive the total from the rows it emits: fold the emitted row amounts, or take rows and total from one keyed partition of the same line set — never from a second read or a wider line set. Every source line **MUST** land in exactly one visible row: a line without a row key, or with a key outside a closed row set, fails loud or gets an explicitly named row (for example "no seller recorded"); it is never left out of the rows while counted in the total. A total of a different concept or population shown beside rows (cash above price rows, all-time beside in-range, a full-scope total beside a page) **MUST** name that scope in its label. Reason: a total computed from a different source than its rows diverges silently (a headline amount above an empty table) and no reader can reconcile it. | Bug — a headline money total that no visible row explains | Summary builders take only emitted rows; cash lines reach rows only through one keyed-partition helper that rejects an unplaceable line; money folds use the one currency-aware sum. Whether a total and rows are the same money concept is not decidable from one file, so a syntax check cannot replace review. |

<a id="pay-r-m4-m7-m8-clauses"></a>

## Clauses for PAY-R-M4, PAY-R-M7 and PAY-R-M8

<a id="unknown-net-reach-pay-r-m4"></a>

### Unknown-net reach — [**PAY-R-M4**](#must-normative)

A single-file static check can reject a direct query-engine null-coalescing of the persisted net field to `0`. It cannot prove that a later aggregate alias came from that field, that every grouped row's unknown membership reaches the response, or that a downstream summary retains the same field and null; those links require read-path review.

<a id="unknown-time-reach-pay-r-m4"></a>

### Unknown-time reach — [**PAY-R-M4**](#must-normative)

A row whose event time is unknown makes a windowed total unknown only when the row can fall inside that window. Its storage time **MUST NOT** stand in for the event time, but it is a proven upper bound (an event precedes its record): a row recorded before the window start is outside the window, and with a proven lower bound inside the window (for example the subject's own birth) a row recorded before the window end is inside it. Reason: treating every unknown-time row as possibly anywhere turns one legacy row into a permanent unknown for every later period.

<a id="parent-ledger-ownership-pay-r-m8"></a>

### Parent-ledger ownership — [**PAY-R-M8**](#must-normative)

The ownership-gate type (and any project check on it) covers mirror admission only. Exact parent identity, duplicate attribution agreement and parent-assignee attribution **MUST** be preserved through the cross-module report assembly.

<a id="cash-and-sale-counts-pay-r-m8"></a>

### Cash and sale counts — [**PAY-R-M8**](#must-normative)

Cancelling the remaining receivable of a parent record writes no refund and un-collects nothing, so every report family loads that record's collected rows from the parent ledger whatever cancellation state it later reached. A cash total that drops a cancelled record drops real, received money (the "missing or misattributed cash" this rule names) and makes an already-closed period change on the day of the cancellation. The sales count is not a cash metric: its time basis is the sale instant, its population is the commitments sold in the window, and it excludes records whose receivable was cancelled. It is never derived from the number of payment rows — a record paid in two instalments is one sale, a record with no collection yet is also one — and it is defined once: every report that shows a count under the same name (per seller, per month, per template) groups the rows of one loader instead of writing a second query, so one name never carries two meanings across reports (SSG-M8). Where a per-seller or per-month row would otherwise exist only because cash or child records exist, the count's own keys join that union, so a real sale is never silently absent from the report. Cash readers import the parent-ledger seam without a cancellation filter; count readers import the single sales-count loader.

<a id="frozen-line-inputs-pay-r-m7"></a>

### Frozen-line inputs — [**PAY-R-M7**](#must-normative)

A report read that carries the record's frozen line evidence but deliberately does not join today's catalogue **MUST** feed quantity and detail consumers through one frozen-line input resolver. The input contract requires those resolved lines; a consumer must not turn the absent join field into zero units or an empty detail list. Genuine empty populations and record kinds whose contract carries no such lines remain empty. Identity, label, duration and price are read from the same record evidence; a grouped summary taking metadata from the latest visit takes every metadata field from that one visit, with a deterministic date/time/identity tie-break. A current producer's de-duplication is not a universal read invariant. Preserve every schema-permitted frozen line in its original order, and consume monetary slices positionally before grouping; grouping by identity must not overwrite a line's allocated remainder. A new check is weaker than the required resolved-line input contract. A current birth writer's set normalization alone never proves a legacy read rejection is allowed.

<a id="contribution-views-pay-r-m7"></a>

### Contribution views — [**PAY-R-M7**](#must-normative)

Frozen row order and repeated identifiers remain monetary evidence. Report detail rows consume their own ordered contribution leg, while an item ranking consumes one subtotal across the same identifier's frozen legs. Both views delegate to one allocation authority. Missing required selected-to-frozen association rejects the dependent aggregate; neither current catalogue weights nor a guessed zero repairs it. Positive rounded intermediate allocations are bounded by the remaining budget so a final residual cannot become negative. Distinct display, accrued-contribution and cash questions keep their existing named contracts; this obligation does not merge their policies. Review must inspect the view requested by each caller; required typed views and the allocator are stronger mechanisms than additional syntax enforcement.

<a id="pay-r-m9-clauses"></a>

<a id="sold-commitment-clauses-pay-r-m9"></a>

## Sold-commitment clauses — [**PAY-R-M9**](#pay-r-m9-clauses)

Every creation path **MUST** write each sale-time quantity or price that later ceilings, history or renewal reads need. Freezing only one record variant leaves the others exposed to catalogue drift ([**PAY-R-D7**](#definitions-normative)).

<a id="pay-r-m9-a-kind-stays-on-its-own-marker"></a>

<a id="kind-marker-pay-r-m9a"></a>

### Kind marker — [**PAY-R-M9**](#pay-r-m9-clauses) (a)

A frozen value that was first written for one kind of record (for example "adopted from an existing bundle") is not that kind's marker; consumers read the kind from its explicit flag, never from the frozen field's presence, so extending the freeze to all records reclassifies nothing. Before widening such a field, prove from every consumer — including already-released clients ([DCD-M8](../dead-code/dead-code-rules.md)) — that none uses presence as the marker.

<a id="pay-r-m9-b-the-persistence-layer-makes-the-birth-write-non-optional"></a>

<a id="required-birth-write-pay-r-m9b"></a>

### Required birth write — [**PAY-R-M9**](#pay-r-m9-clauses) (b)

The field is required on a *new* record and optional on an existing one, so a future creation path that forgets it cannot create a record at all, while legacy rows the backfill could not prove still save.

<a id="pay-r-m9-c-a-backfill-writes-only-a-proven-birth-value"></a>

<a id="proven-backfill-value-pay-r-m9c"></a>

### Proven backfill value — [**PAY-R-M9**](#pay-r-m9-clauses) (c)

Backfill **MUST** use stored birth evidence only: catalogue modified no later than earliest birth; the predecessor value copied by renewal and corroborated by stored quantity; or the commitment's own birth-frozen child durations. Differing child durations are successive agreements: the latest by date, time, then identity wins, because realized children retain older terms while unrealized ones receive changes. The code's one duration reader and this clause say the same thing; a second reader that picks another child or refuses the record is a parallel derivation.

Post-birth catalogue edits, missing links or disagreement about the same fact leave rows unresolved: counted by class and reported, never filled from today's catalogue or a default, with reads still failing loudly (PAY-R-M7). A derived-value repair uses one authority over the record's own stored inputs and only the explicitly approved class; other classes are counted, not written. Realized commitments, visits and accrued allocations keep frozen terms. Pending children align only by explicit user choice through the writer's snapshot derivation, parent and children in one atomic unit with old-value compare-and-set.

<a id="pay-r-m9-d-ceilings-read-the-frozen-value-only"></a>

<a id="frozen-ceiling-source-pay-r-m9d"></a>

### Frozen ceiling source — [**PAY-R-M9**](#pay-r-m9-clauses) (d)

A range helper for an existing record takes the frozen field and nothing else — no catalogue input, no kind branch (PAY-N10 helper-signature corollary).

<a id="pay-r-m9-e-total-on-an-existing-records-screen-is-the-sold-quantity-the-working-quantity-is-a-separately-labelled-fact"></a>

<a id="sold-and-working-quantity-labels-pay-r-m9e"></a>

### Sold and working quantity labels — [**PAY-R-M9**](#pay-r-m9-clauses) (e)

Existing-commitment total displays **MUST** read frozen sold quantity through the ceiling's same derivation. Live catalogue quantity may appear only as an additional labelled figure beside sold quantity. A separately labelled working-quantity editor seeds/writes only stored working quantity; neither display nor editor writes the frozen field. Missing frozen quantity is unknown and reported, never filled from working or catalogue data.

For `used = total − remaining`, the shared summary derivation chooses sold total on mid-life adopted records (including prior consumption), otherwise the quantity against which remaining is computed. Every screen and report-row builder uses that choice; a per-screen choice prints two totals for one record. Position against this total adds `sold − current working` to the item's own system position through the paired derivation, so completed position equals summary used. If an allowed working correction exceeds sold total, the offset is negative: show total but no position, without an invalid-record error. The adoption marker reads its separate entered/working quantity, never the summary total.

<a id="pay-r-m9-f-one-ceiling-for-every-amendment-of-the-working-quantity"></a>

<a id="working-quantity-amendment-ceiling-pay-r-m9f"></a>

### Working-quantity amendment ceiling — [**PAY-R-M9**](#pay-r-m9-clauses) (f)

When a ceiling from (d) bounds the remaining count of a correction, every path that amends the same working field applies the same predicate, with the same registered error, to the remaining count that results — a correction dialog, an editor on another screen, a generic update command. A ceiling applied on one path while a sibling editor of the same field is unbounded is not a rule but a detour: the user reaches the forbidden value through the other box, often on the same screen. The client editor shows the resulting maximum (the ceiling restated on the working quantity) before the save and is not drawn when the ceiling cannot be derived; the server re-applies the predicate after the remaining count is recomputed, so a status change in the same request is counted. An amendment that leaves the value unchanged is a no-op and is not gated.

<a id="pay-r-m9-g-a-user-chosen-re-agreement-is-the-one-post-birth-writer-of-the-frozen-quantity"></a>

<a id="user-chosen-re-agreement-pay-r-m9g"></a>

### User-chosen re-agreement — [**PAY-R-M9**](#pay-r-m9-clauses) (g)

Immediate re-agreement **MUST** write working and frozen sold quantity together to the same value; it is the only post-birth frozen-quantity writer. It rejects quantity below consumed, derives unit price through the one authority, rechecks (f) after remaining is recomputed and clears (h) scheduled terms.

The re-agreement realigns the current cycle's schedule only by the bounded difference in the same transaction — never by re-laying it:

- Raising by N adds at most N after the last future pending record, using the existing cadence materializer and sequence numbers above all standing records. Lowering by N removes at most the last N future pending records through the existing cascade deleter.
- The shared bound prevents unnecessary over/under-booking and never recreates deliberately unscheduled rights. Existing identities, notes, links and payments stay; no schedule-change notice is sent. The confirmation reads the writer's same bound and states maximum additions/removals.
- Difference is derived before the first write. Additions require recurring entitlement and fail with its registered error; removals do not. If another change in the request legitimately re-lays the plan, it targets the new remaining count and skips the difference step.

Every quantity-writing surface uses that planner. An edit of an individual child record derives the difference after its own state/date edit, using the previously stored quantity as the old value. The edited child **MUST** be excluded from removals and the edit is never refused for it; when it is among the last N, remove its preceding pending sibling instead. The deleter consumes exactly the planner's IDs. If too few other future pending records exist, save the edit and remove only those available; a surviving surplus is neither an error nor automatically repaired.

Equality with consumed is allowed and finishes the commitment. After the difference, one completion step seals it, immediately renews a recurring commitment and emits its lifecycle notice — never a second renewal path. Finishing recurring commitments requires entitlement before the first write, even with no additions. A surface that does not write the quantity never triggers this step. All quantity writers share one registered floor error and use the consumed count after the request's writes. Deferred scope writes no active quantity, so neither floor nor completion applies.

A closed commitment's quantity is locked: a shared closed/adopted/recurring lock uses the closure seal, not activity; client fields disappear, stale writes receive a registered business error, and closed commitments reject attachment. Only completed-session undo reopens them.

Remaining-count correction uses the same immediate difference and never a second generator. Quantity changes **MUST NOT** rescale total price: only explicit price edits do, with unit price derived as total ÷ quantity. A changed price clears scheduled terms through their one writer in the same unit, while unchanged price preserves them. A "payment received" action on the correction screen appends only the server-derived remaining receivable through the ledger append writer, never a ledger rewrite or typed amount. Cancelled or fully-collected receivables refuse collection, but a cancelled-receivable price edit is accepted and re-derives the cancelled amount. Non-recurring raises add no slots; reductions use the same removal bound.

Creating a recurring series on an existing commitment is bound the same way: a recurring create uses at most `remaining − already pending`, shared by the server batch bound, the client request size and the one-off gate. Oversized requests shrink rather than refuse, including released clients sending the full remaining. Zero creates nothing: the response says "0 created" and the screen says the records already exist. An identical stored schedule on an open recurring commitment is not scheduled again; the client informs. A different schedule opens a second recurring commitment with its own sale, never restricted.

A one-off booking on an open recurring commitment consumes one right without changing recurrence or plan. When all rights are booked, a registered conflict offers replacement of the last planned future pending record: remove it through the cascade authority before inserting, in one transaction, preserving the pending total. Where the only pending record is already running it cannot be removed; the same unit then births the renewal now through the single renewal orchestrator and binds the booking there, and a later completion finds that renewal through the single evidence derivation and creates no second one. Paid access is resolved once outside the unit; no effective access, an optional-provider operational failure (WARN-logged), or a recurring commitment without a plan keeps the earlier behaviour: add the booking to the current commitment without blocking. A commitment bound to a live group keeps that earlier behaviour too, because group renewal is per member; the server supplies the confirmation answer and the client never derives it. Undo of the last completed session removes a renewal only after re-homing its user-created records to the reopened commitment in the same unit ([PAY-M21](money-owning-record-teardown.md)).

Scheduled terms remain convertible: immediate re-agreement uses their quantity and price as base and clears them in the same write. The screen offers conversion explicitly and discloses every resulting active-price change before confirmation, using the writer's same price derivation. Scheduling consequences of a re-agreement beyond this bound (slot conflicts, occupancy, room and assignee changes) follow the adopting project's scheduling rules.

<a id="pay-r-m9-h-a-change-deferred-to-the-next-cycle-is-frozen-on-the-current-commitment-never-read-from-the-catalogue-at-renewal"></a>

<a id="deferred-next-cycle-terms-pay-r-m9h"></a>

### Deferred next-cycle terms — [**PAY-R-M9**](#pay-r-m9-clauses) (h)

Deferred scope **MUST** leave active quantity and price untouched. One derivation writes quantity, total and unit price into scheduled next-cycle terms. Renewal prefers those terms, otherwise the completed commitment's own terms, and does not inherit the scheduled field. Renewal **MUST NOT** read the catalogue: a later, unrelated catalogue edit would resize a cycle the user already agreed to (PAY-R-D7). Unit price is derived from the renewal's own total/quantity, never copied from a predecessor with another quantity.

Every recurring next-cycle base **MUST** use the sold-quantity derivation of (e), including a price-only deferral with no entered quantity. Only (g)'s re-agreement moves that base; remaining corrections, later-converted one-time working edits and closed-period reductions affect the current cycle only. Removing a counted unit while keeping a closed period closed leaves sold quantity and total unchanged, derives unit price from reduced working quantity, and renews at sold quantity. Previews show each answer's resulting unit price from the same base. Unreadable sold quantity suppresses deferred unit-price display and raises the registered writer error, never substitutes working quantity.

Quantity and price share the chosen scope, including price-only edits: a sold commitment's price never changes without the user's choice (a commitment sold at the old price keeps its snapshot; choices are offered to the user). "Apply when it ends" schedules the price; "apply now" changes active price without quantity or child records. Existing scheduled terms receive the new price under either answer, paired with their own quantity; (g)'s correction-screen exception applies price now and clears them. Terms matching ordinary renewal's sold quantity/current total clear the field instead of scheduling a no-op.

Every recurring quantity/price edit screen **MUST** ask with both answers' current/new quantities, totals and unit prices from the writer's same derivation, and no default: choose or cancel. Scheduled deferrals display both quantity and price. Change and answer form one required resolved request value. A missing answer raises a registered update-the-client contract business error at the domain scope resolver, never a schema default or crash report. A client knowing the code shows its specific message; released catalogues predating it show generic keyed errors, never raw server text.

A compatibility branch is permitted only while released clients unable to send the field remain supported ([DCD-M8](../dead-code/dead-code-rules.md)); it answers with the intent its own screen stated to the user, never with what the server happened to do, is explicit and logged — never a silent default in the request schema — and is deleted once those clients are retired.

<a id="pay-r-m9-i-a-sold-commitments-own-price-may-be-edited-below-what-has-already-been-received-the-excess-is-derived-warned-about-and-never-hidden"></a>

<a id="price-below-received-amount-pay-r-m9i"></a>

### Price below received amount — [**PAY-R-M9**](#pay-r-m9-clauses) (i)

A change to the catalogue entry never touches a sold commitment — the sale-time price stays (PAY-R-D7). Editing the sold commitment's own price on a surface the adopting project has admitted for it is the user's explicit correction and MAY go below the received total: the save is not blocked. The excess (`max(0, received − price)`) is one derivation beside the remaining-receivable authority, passed through the money-rounding authority — never a stored field, never a new payment status (PAY-M23), never written back; every reader calls that derivation, and the admitted edit surface states the overpayment from the candidate price before the save, reading the candidate through the same parse that builds the saved intent (a warning for a price that will not be saved is a second, diverging reading). The remaining receivable stays clamped at 0 and reports keep summing the received ledger (cash received does not change).

The overpayment warning **MUST** appear only on the surfaces the adopting project admits; other price editors deliberately show no warning. An overpayment is information only: no refund or overpayment-return operation is implied by it. Raw accumulation of the derivation's output is held by the money-accumulation rule (PAY-D8).

<a id="pay-r-m9-j-a-value-that-a-later-completion-consumes-is-frozen-on-the-record-at-birth-by-one-builder-that-every-creation-path-calls-and-completion-reads-only-the-records-own-frozen-value"></a>

<a id="birth-frozen-completion-inputs-pay-r-m9j"></a>

### Birth-frozen completion inputs — [**PAY-R-M9**](#pay-r-m9-clauses) (j)

Every creation path (recurring batch, one-off, group, renewal, add-member, quantity increase and re-selection) **MUST** call one builder for values deciding later money, such as allocation rules. A required persistence input prevents omission.

Later records/renewals carry the commitment's latest frozen value ordered by date, time, then identity; a renewal with no records uses its predecessor. Only a chain with no value consults the catalogue (first sale); no chain value plus deleted catalogue raises the registered error, never skips money or invents an empty value. Resolve carried values before deleting pending records for a re-lay. Completion reads frozen inputs, never builds them from current catalogue.

Legacy pre-freeze records use this same builder/order at completion until no such record can exist, then that compatibility path is deleted.

<a id="pay-r-m9-verification-and-check-boundaries"></a>

<a id="verification-and-check-boundaries-pay-r-m9"></a>

### Verification and check boundaries — [**PAY-R-M9**](#pay-r-m9-clauses)

Inspect creation writers and new-record schema requirements; explicit kind markers; per-class backfill dry-run and unresolved rows; frozen-only ceiling and sold-summary readers; shared amendment floor/ceiling and difference planner; same-unit re-agreement quantity writes; scheduled-term precedence and clearing; required quantity/price scope and registered missing-choice rejection; bounded append/trim preserving the edited child; and admitted overpayment warnings that neither write an excess nor block saving.

The required persistence input holds birth completeness; a creation-path syntax check is weaker than required inputs. Record the actual scope and limits of any check the adopting project applies.

## MUST NOT (normative)

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PAY-R-N1** | **MUST NOT** label accrual totals as "collected" without also supplying PAY-D3-based totals when the UI promises collection. | Reject | Copy + field audit. |
| **PAY-R-N2** | **MUST NOT** derive report payment language from a lifecycle status alone. | Bug | PAY-N2 |
| **PAY-R-N3** | **MUST NOT** read a business count from a provider webhook inbox. That table is the authority of delivery/processing state (idempotency, retry, audit) and holds duplicates, test-environment traffic and superseded events; counting from it bypasses every gate the domain applied when it processed those deliveries. **MUST NOT** widen a cohort step to the global set to make it agree with an as-of-now card — that breaks the funnel's subset invariant (PAY-R-D5). | Bug | Metric read paths import the revenue/subscription authorities, not the inbox model. |
| **PAY-R-N4** | Closed-period totals, rows and buckets **MUST NOT** read values from live catalogue (PAY-R-D7); current frozen/catalogue equality proves nothing about future edits. A static check can decide the intersection of two facts one file carries: the provenance of the operand (a chain rooted in the catalogue's own data-access symbol, tracked through element access, loop variables and collection callbacks) and the path of the file (a tree that by definition emits past-period summaries: report, analysis, insight). Birth/selection uses remain legitimate. The general class is not decidable from one file's syntax tree — the same expression is legitimate at birth and illegitimate on a saved record — so cache/repository-return and cross-file provenance, labels, and saved/birth context not carried by a named boundary field remain a review obligation; record the check's actual scope and limits. | Bug | Inspect the source provenance and report/window-field boundary; verify birth and selection paths retain valid catalogue reads. |

---

## Report copy mapping (normative)

| paymentStatus | User-visible gist |
|----------------|-------------------|
| `paid` | Payment complete (use the product's single localization authority). |
| `partial` | Partial payment |
| `unpaid` or `remainingAmount > 0` | Amount outstanding |

Preview screens **MUST** follow the same mapping as export (PAY-R-M3).

---

## Verification (reporting)

| # | Check |
|---|--------|
| **RV1** | Dashboard collection metric equals sum of paidAmount post-transform. |
| **RV2** | Reporting consumes the same canonical financial projection used by API list/detail surfaces. |
| **RV3** | A completed status without payments does not imply paid in payment columns. |
| **RV4** | Each exported metric's time window and timestamp field match PAY-R-D4 / PAY-R-M4. |
| **RV5** | Each metric names its population basis (PAY-R-D5); a cohort step and an as-of-now card of the same noun are labelled so a reader cannot mistake one for the other. |
| **RV6** | The loss count returns 0 when every payer is still paying, becomes non-zero for a payer whose paid access ended in range, and never counts a trial expiry, an administratively granted expiry, a test-environment event, or a re-subscribe; a fully refunded subject is never a payer, and a lapsed payer holding only a promotional entitlement counts as lost, dated by its paid expiry (PAY-R-D6, PAY-R-M6). |
| **RV7** | Editing a catalogue entry's price and duration, then re-running a report over a period that closed before the edit, returns the same numbers as before the edit (PAY-R-D7, PAY-R-M7, PAY-R-N4). A record whose frozen field is missing makes that report raise, not silently fall back. |

---

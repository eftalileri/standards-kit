# Payment SSOT — lifecycle status economics

```kit-cover
type: normative
part-of: README.md
binds: PAY-D11 and PAY-M22 to PAY-M25 -- the exhaustive status-economics table, its mandatory derivation path, not-expected write consequences, cancel-with-money decision and server-owned refund ledger
open-when: shape:backend-heavy, shape:full-stack, signal:financials, signal:customer-package, signal:payment-field, signal:payment-status
skip-when: signal:no-payment-surface
owns: PAY-D11, PAY-M22, PAY-M23, PAY-M24, PAY-M25
```

Scope: The single closed decision table that states what each lifecycle status means for payment expectation, entitlement consumption, revenue, accrual, schedule occupancy and booked-visit counting, plus the derivation rule and the payment-response/write consequences of the not-expected row.

Document type: Normative — PAY-D11, PAY-M22, PAY-M23, PAY-M24 and PAY-M25.

References: [rules.md](rules.md) (PAY-D5); [derivation.md](derivation.md) (query-engine rendering); [SSOT authority and derivation](../ssot/ssot-must-authority-and-derivation.md) (SSG-M1); [SSOT principles](../ssot/ssot-principles-and-precedence.md) (SSG-M6, SSG-M8).

---

## Definition

| ID | Definition |
|----|------------|
| **PAY-D11** | A status-economics table is one closed, exhaustive map from every lifecycle status to separately named economic and operational facts: whether payment is expected, an entitlement is consumed, revenue accrues, a commission or allocation accrues, a schedule slot is occupied, and the record counts as a booked visit. Each column answers exactly one question; two columns **MUST NOT** encode the same fact under different names. Status membership is explicit for both `true` and `false`, so adding a lifecycle status cannot silently inherit an unknown branch. |

## MUST

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PAY-M22** | Every status-dependent money, entitlement or schedule decision **MUST** read PAY-D11 through the table, a predicate derived from it, a subset derived from it, or a type derived from it. A consumer **MUST NOT** write an inline status set, an `||` chain, a duplicate union, or a hand-written query-engine membership list that restates a column. When a query engine cannot call the in-memory predicate, its value array is generated from the same table as required by [derivation.md](derivation.md), never maintained beside it. The table **MUST** be typed as exhaustive over the lifecycle-status authority so a new status fails compilation at the table until every column has a decision. | Bug — two consumers can answer the same status question differently without an error. | Static: typecheck proves table exhaustiveness and typed predicate inputs; use the adopting project's duplicate-status-set check where one exists, and record the mechanically decidable shapes it covers; review proves every touched consumer and query rendering imports a derivation from the table and covers the stated limits. |
| **PAY-M23** | A status whose PAY-D11 row says payment is not expected **MUST** derive `remainingAmount = 0`, retain the real collected amount, refuse new collected or planned rows, and stay out of receivable, planned-total and reminder populations. A closed payment-state enum already compiled into released clients represents that state by the field's absence, never by a new member ([MRP-M15](../monorepo/monorepo-rules.md)); the in-process expectation discriminator **MUST NOT** cross the wire. The status-aware payment mapper's persisted-record input **MUST** be assembled by one domain constructor: field presence, snapshot validation and expected-total resolution are parts of that one decision, so serializers, reports, aggregates and write planners pass raw record fields instead of pre-sanitizing or rebuilding the input. A group aggregate keeps its payment-state field present, derives every member through the single payment authority and aggregates only payment-expecting members for status: member remaining amounts are summed separately, so one member's overpayment never settles another member; an empty expecting set is fully settled with remaining zero. | Bug — a cancelled record still looks collectible, a released client rejects a new enum member, or one member's overpayment hides another's debt. | Static: one input constructor and one status-aware payment derivation feed response/report/group surfaces; collection writers call the same status gate. Released-client review: no new enum member. |
| **PAY-M24** | Parent-level money **MUST NOT** promote a child record's plain cancel. A child record backed by a parent-owned bundle therefore persists the requested `cancelled`. A record carrying its own collected money is cancelled only by an explicit choice between paid cancellation and cancel-with-refund; a plain-cancel command in that state is refused by one registered pre-write code for every actor. The one non-command exception is deletion of the owning subject, which retains such a pending child as `cancelled` without either money write ([money-owning-record-teardown.md](money-owning-record-teardown.md)). Money visibility **MUST NOT** change the code or remove the choice: an actor who cannot see the money is offered the same two options without amounts (money visibility limits what is seen, never the workflow). The cancel step is a pure refusal gate returning `void`: it **MUST NOT** compute or return a status different from the requested one. No new collected or planned row may be written when PAY-D11 says payment is not expected; one registered pre-write code owns that refusal. | Bug — a parent mirror consumes entitlement, or a plain cancel silently changes money semantics. | Static: the pure gate reads the post-request record ledger through the payment authority, a bundle-backed input never refuses from parent money, every writer carries the common payment gate, and the persistence path writes the requested status as-is. |
| **PAY-M25** | A refund of money collected on a record **MUST** be a separate, server-owned ledger on that record, never a signed or re-typed row inside a ledger that clients echo back. Net collected money is derived only by the payment authority and its query-engine twin; the query-engine adapter nets validated refunds using the refund ledger's own invalid marker, separately from the payment marker. A refund sum above collected money is a persisted defect and **MUST NOT** be clamped. Once a record carries a refund, its collected rows are frozen. A refund is a negative cash event on its own date in the same cash category as the payment it reverses; it neither edits the original row nor introduces a category value that released consumers can misbook. The command derives the amount on the server (the full net collected amount; the actor never enters or sees it), asks the record's money-write authority on every fresh/replay request and again on the unit's fresh read, and reconciles dependent money records through their single writer. Money visibility is not a precondition of the command; its response passes the viewer money projection, and a stored success that carries money is replayed only after the current viewer's money visibility is re-proved. | Financial integrity bug — double authority, negative net collection, rewritten history, unauthorized refund or stale dependent money. | Static: one refund-writer authority (update surfaces, hydrated writes and refund-array mutation) is the sole writer; required refund inputs bind the in-memory and cash derivations; one shared refund schema binds model, parser and query-engine renderings. Review: narrow projections carry the ledger; replay preflight precedes claim; accrual consumes the same attempt's document. |

### Cancelled-receivable display — [**PAY-M23**](#must) clauses

A payment-expecting record with a cancelled bundle receivable **MUST** carry an additive optional true-only marker, with a separate group marker for aggregates. The bundle reader decides it through the single cancellation predicate; mapper, group aggregate and client only carry or display it. Financial redaction hides it with the payment triple.

The server **MUST NOT** clear remaining money until a marker-reading client is live. Thereafter remaining is zero, collected money stays real and payment status remains derived from collected versus expected money; a cancelled receivable is not paid. Group collection contributions use actual collection capped by each member's expected amount, never `expected − remaining`. Sum/filter surfaces see no debt; surfaces distinguishing cancelled from settled **MUST** read the marker, which aggregates not reading the payment triple do not carry.

Installed bundle identity is unavailable to a source scan and may be unavailable to the server even when binary identity is known. A force-update gate retiring older binaries leaves the store-active binary's embedded older bundle on first launch/unapplied over-the-air update; an applied update closes that window, and a binary embedding the reader closes it fully.

### Occupancy and accrual — [**PAY-M22**](#must) clauses

Entering the slot-blocking set by create, move, owner change or status change **MUST** claim the slot atomically like a booking. Leaving it releases no anchor: occupancy is derived from records.

Leaving an accruing set **MUST** reconcile its money records in the same atomic unit from that attempt's fresh document. A partly or fully settled obligation makes the status change refuse rather than rewrite/delete settled history.

Changing an accrued record's frozen price source while it remains accruing **MUST** reconcile through the single money writer in the same unit. Settled rows never change and never cause refusal of this source change. Compare recomputed obligation with settled plus unsettled total: equality writes nothing; a positive difference over settled replaces unsettled rows through the one remover with one difference row; zero removes only stale unsettled rows; a negative difference (settled above the recomputed obligation) writes nothing, preserving even existing partly-settled remainders (for example 15 earned, 12 settled, 3 unsettled, new obligation 10 → the 3 remains). Replacement preserves the accrual date; a new difference over a fully settled key uses its new occurrence time. No absent key is created here, and status-entry callers do not inherit this trigger. The remover refuses a settled row id at runtime (fail-loud), and a fixed allocation above the new price fails loud with the registered validation code, as at completion.

The trigger is a bundle move whose snapshot patch changes the frozen bundle snapshot; one writer and one remover own the accrual rows. A difference row retains partial-payout remainder semantics in reports (base × rule need not equal its amount). Settled-row preservation and trigger-only execution require reading writer, remover and trigger together; the remover's settled-id refusal remains the runtime hold.

### Embedded ledger — [**PAY-M23**](#must) writer boundary

Every embedded-ledger update **MUST** use one persistence module combining acceptance proof and concurrency condition. Initial constructor values are not update writes. A single-writer check confines member assignment, ODM setters and update keys; create legitimacy is read from the expression, never a per-builder bypass. Computed keys and forwarded update objects require runtime target/key provenance.

The status table has one declaration and its subsets retain the canonical status order. The payment input constructor is a single declaration. A check that rejects direct mapper/response object literals assembling total, snapshot or expected inputs sees only that local node; variable-held objects, aliased imports and cross-function provenance are outside that boundary.

## Enforcement and stated limits

A static check can mechanically reject some single-file shapes: an array or type union restating a lifecycle-status subset that contains a status only one record kind has, an equality/inequality group on one operand over such a value (including an operand whose type contains the complete closed status set), and a literal status set inside a query-engine membership filter. Such a check derives its member set from the lifecycle-status authority, not from a list inside the rule, and a configuration that requests a type-aware arm in a tree with no type program **MUST** fail loud instead of silently degrading. Use the enforcement mechanism the adopting project documents; a reference to a check is not evidence that it exists or covers the full rule, so record its actual scope and limits.

The following parts remain review, with the missing information stated rather than implied as coverage:

1. A chain or set over a `string`-typed operand made only from ambiguous status words needs the value's collection-field provenance. Typing row fields and helper parameters with the lifecycle-status type makes the type-aware arm applicable.
2. A two-member ambiguous-word union or array outside a status-keyed query cannot be distinguished from another domain's vocabulary.
3. A set assembled through a variable or spread, a fall-through `switch`, and arithmetic over separately counted statuses distribute the decision across statements rather than one inspected node.
4. A query aggregation that compares a field path to ambiguous literals needs query-subject provenance beyond the local expression.
5. A future collection queried with a status filter using the same words would match; the syntax tree carries the filter shape but not the collection it will target.

The creation-status union is closed by construction through a single declaration; it is neither a check exception nor a second status-economics subset.

The append/replace acceptance token's brand is private to its status gate; the type system prevents structural forgery and the store independently applies the derived status compare-and-set ([FP-MS4a](../false-positive/mechanism-selection.md), [FP-MS9](../false-positive/mechanism-selection.md)). A second call-graph guard would duplicate this mechanism. Whether every status writer preserves the requested status needs the cross-file writer set.

Slot-claim execution and the status assignment may be in different modules; review follows the returned intent into the same transaction. Confine raw single-slot occupancy filters to their owner, and reject literal status copies with the subset check. Reconciliation likewise needs the semantic status-writer set and same-attempt session provenance.

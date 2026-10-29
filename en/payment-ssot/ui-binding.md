# Payment SSOT — UI binding (normative)

```kit-cover
type: normative
part-of: README.md
binds: PAY-UI-M, PAY-UI-N and UV -- how the client displays payment state, what it does when a money value cannot be established, the integrity of a financial row/aggregate/selection/action, the required i18n keys, and the explicit financial cancellation flow
open-when: shape:frontend-heavy, signal:payment-field, signal:payment-status, signal:financial-list-ui
skip-when: signal:backend-only, signal:no-payment-surface
owns: PAY-UI-M1, PAY-UI-M2, PAY-UI-M3, PAY-UI-M4, PAY-UI-M5, PAY-UI-M6, PAY-UI-M7, PAY-UI-M8, PAY-UI-N1, PAY-UI-N2, PAY-UI-N3, PAY-UI-N4, UV1, UV2, UV3, UV4, UV5, UV6, UV7, UV8
```

Scope: Client display of payment state, financial row/aggregate/selection/action integrity, and explicit financial cancellation choices where the product supports them. Computation stays in [rules.md](rules.md) / [derivation.md](derivation.md).

Excluded: PDF/Excel column layout detail — binding minima live in [report-pdf](../report-pdf/report-pdf.md) and [report-excel](../report-excel/report-excel.md).

---

## MUST (normative)

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PAY-UI-M1** | Every client view of financial state **MUST** read `paymentStatus`, `paidAmount`, `remainingAmount` only from API fields (PAY-N1). | Reject | No client-side payment-state algebra; whether a collect/plan affordance exists is read from [PAY-D11](status-economics.md)'s payment-expected column, never from a literal status set. |
| **PAY-UI-M2** | A payment mark on a list or calendar item (for example a "money to collect" indicator) **MUST** derive only from the API's payment-state field through the one payment-presentation authority; it must not branch on a lifecycle status. | Bug | Review that the mark helper accepts the payment presentation only. |
| **PAY-UI-M3** | A cancel acknowledgement **MUST** be driven by the persisted server response, delivered through the success channel, and never predicted locally or emitted from an optimistic resolve. Its terminal observer **MUST** survive the initiating screen's optimistic unmount: use the mutation hook's terminal authority or an unawaited mutation promise, never a call-level callback that the observer can discard on unmount. Because both plain cancel and paid cancel can be refused by a fresh server money/refund snapshot, both wait for the persisted response before success/navigation; an optimistic cache patch may render but cannot be the success barrier. An explicit command shows success only when the response carries the requested end state; a no-op 200 is not success. A plain cancel never receives a different persisted status, so no response-difference acknowledgement exists. | Bug if silent, false, or lost on unmount | Static/review: both cancel targets are response-driven and unmount-independent; one navigation; requested end state required. |
| **PAY-UI-M4** | All user-visible payment choices, outcomes and refund descriptions (explicit choice/result keys and refund display keys) **MUST** use the product's translation catalog and be present in every locale in PAY-M7. | Reject | Review translation completeness for all supported locales. |
| **PAY-UI-M5** | After any mutation that changes `payments` or `totalAmount` (or any server field that alters PAY-D4 output), the client **MUST** invalidate or refetch the affected financial queries per [tanstack-query/README.md](../tanstack-query/README.md) (mutations, cache sync) so payment UI cannot display stale `paidAmount` / `paymentStatus`. | Bug | Review mutation success handling and the affected query invalidation. |
| **PAY-UI-M6** | Financial/payment/settlement rows and any authoritative aggregate/count, selection eligibility, or action surface derived from the same result **MUST** be treated as one integrity unit. If any required or supplied row cannot be validated or transformed, the contained surface **MUST** block and suppress its rows, aggregate/count, selection, and actions until retry. A valid cursor/page subset may still render with a server-authoritative full-scope total; the prohibition is omitting a row supplied for that subset while keeping the aggregate or actions successful. | Bug | Static/runtime: [QRY-M8](../tanstack-query/queries-and-transforms.md) blocking error owns the whole unit. |
| **PAY-UI-M7** | Unknown client money **MUST** be withheld, never rendered as legal `0` or raised from render (PAY-UI-N3). Suppress its amount line or use the screen's unknown/not-ready/error affordance (PAY-UI-M8), preserving any unpaid/error condition the surrounding state already communicates. | Bug — silent receivable loss | Static: a check for money-named zero defaults and presence/type-tested zero ternaries, run over the client tree as well as the server tree, using the adopting project's documented mechanism (record its actual scope and limits); inspect the reach limits below. |
| **PAY-UI-M8** | Withholding **MUST** use the screen's existing not-ready/empty/error affordance, never a second "unknown" pattern. A missing required value is also reported through the single client failure-classification authority from an effect/handler, never render. If boundary schema and every cache writer prove presence, a dead zero branch gets a reasoned rule-identified suppression citing that write path, not a fabricated display. | Bug | Inspect the existing affordance and pure render; verify report sites and unreachable-branch provenance. |

PAY-UI-M8 provenance: An absent money field may mean optimistic withholding or authorized redaction. The server projection labels visibility, and an optimistic cache writer labels pending state. Report a missing-field breach only when the server labeled that field authoritative. Never reconstruct redacted money in the client. Enforcement limit: classification needs facts from the authorization boundary, cache writer and render consumer across files; a single-file AST cannot establish their agreement, so review is required.

Financial visibility — [**PAY-UI-M8**](#must-normative) clauses. The visibility authority's client twin **MUST** hide money and every derived disclosure without zeroing or reconstructing it. Hide write inputs too, and send no hidden field beyond the server contract; an unchanged stored-value echo may be omitted when the server accepts absence. Components **MUST NOT** restate role/tier checks. Hidden money alone never makes the viewer's record invalid. Display hiding is not access control: if the server still sends the field, the change **MUST** state that fact. Complete derived-display coverage is cross-file review.

## MUST NOT (normative)

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **PAY-UI-N1** | **MUST NOT** infer collected money from a transaction or lifecycle status alone in UI. | Bug | PAY-N2 |
| **PAY-UI-N2** | A client **MUST NOT** skip a malformed financial row and continue as a successful partial list beside the same population's aggregate/count, selection, or payment action. Returning no rows together with an explicit propagated blocking error is allowed; swallowing the error into a successful empty/partial fallback is forbidden. | Reject | PAY-UI-M6, QRY-M8 |
| **PAY-UI-N3** | A client **MUST NOT** raise from render to signal a missing money value, and **MUST NOT** answer it with a zero either. Both ends are defects and they fail in opposite directions: throwing turns one absent field into a blank screen for a page that is otherwise correct, while `0` turns a fault into a plausible amount. The admissible answer is PAY-UI-M7 — withhold the figure through the surface's own gate (PAY-UI-M8). | Bug | PAY-UI-M7, PAY-UI-M8 |
| **PAY-UI-N4** | A display list and the aggregate computed over the same population **MUST NOT** apply different validity predicates to a row. Where the aggregate authority excludes a row whose amount is not a finite number, the list **MUST NOT** render that row as `0` — that is a second definition of "valid payment row" and the two surfaces then disagree by construction: the reader sees a collected-payment line the total does not contain. The list reads the authority's rule instead of restating it. | Bug | Static/review: list filter and aggregate skip share one predicate. |

---

## Cancel flow (normative)

1. Precheck: A cancel on a record carrying its own collected money asks the actor to choose paid cancellation or cancel-with-refund. The client sends that intent explicitly; it never relies on server inference. Parent-owned money (including a bundle) cancels plainly with no money message. When money is withheld from the actor, the client asks nothing and sends the plain request; if the server's fresh ledger has collected money, it returns the same registered refusal and the client then offers the same choice without amounts (PAY-M24) — never a dead end that sends the actor to someone else.
2. Submit: Refund is one explicit command and is never chained after a separate save of other edits. No refund method is invented; the actor chooses before submit.
3. Ack: The client reads the response status/end state, not HTTP success. A no-op stays on screen with keyed information. A plain cancel never treats a different persisted status as success.

"Payment collected?" for this branch **MUST** use `paidAmount` from PAY-D4 output, not status (PAY-D5).

Enforcement limit: ask versus plain cancel depends on the persisted parent link, actor visibility and server money field at the save moment. No single-file syntax check has those runtime values; review plus one pure decision function carries this half.

---

## Partial payments display (normative)

For financial detail surfaces: list each completed payment with its effective date and amount; show remainingAmount explicitly unless [PAY-D11](status-economics.md) says payment is not expected — then show only the collected amount ([PAY-M23](status-economics.md)).

---

## Verification (UI)

| # | Check |
|---|--------|
| **UV1** | No `paymentStatus` assignment in UI code paths except from API/store. |
| **UV2** | Payment-state styling and marks receive only the payment presentation built from the server `paymentStatus`, never a lifecycle status (PAY-UI-M2). |
| **UV3** | A cancel command reports success only when the response carries the requested terminal status; no response-difference acknowledgement or paid-cancel prediction remains (PAY-UI-M3). |
| **UV4** | Payment mutation completes → affected financial query is invalidated or refetched (PAY-UI-M5). |
| **UV5** | One supplied financial-row transform failure blocks the contained rows, aggregate/count, selection, and actions; no partial-success skip (PAY-UI-M6, PAY-UI-N2). |
| **UV6** | No money-named binding on a display path is filled by `?? 0`, `\|\| 0`, or a presence/type-tested ternary collapsing to `0`. Each surviving occurrence is either an unreachable branch justified by a cited write path or a value that is not money (PAY-UI-M7, PAY-UI-M8). |
| **UV7** | A row the aggregate authority excludes as invalid is absent from the list rendered beside that aggregate — one predicate, both surfaces (PAY-UI-N4). |
| **UV8** | A status whose [PAY-D11](status-economics.md) row expects no payment renders no due/remaining/"paid" line and no collect/planned action; payment-state absence is rendered, never guessed. A group/aggregate whose members all expect no payment renders none either, even when the summary authority emits a nominal `paid` for an empty expectation. Literal status subsets may be mechanically fenced; which branch renders a line is review-owned because one file's syntax tree does not carry the server-field meaning. |

---

## Reach limit of the static half (declared, not implied)

A syntax-tree check for PAY-UI-M7 decides from the receiver's name — it cannot see where the value came from. Three classes therefore stay a review obligation and are named here rather than left to look covered: a fill routed through a local whose name carries no money morpheme; a zero introduced inside intermediate arithmetic rather than at the binding; and a fill carried transitively by a helper. A fourth is the inverse and costs false positives instead of misses: a count whose name contains a money morpheme (`receivedPaymentsLength`) reads as money to the predicate, and the answer is a reasoned suppression at the call site — never widening the rule's vocabulary for the one case, which would blunt it everywhere.

One further boundary belongs to the ternary arm: a ternary is a silent-zero fill only when its test asks a presence/type question ("is this value there, is it a number"). A purely numeric clamp (`x > 0 ? x : 0`, i.e. a floor) is not a fill — there the zero is a deliberate lower bound on a known number — and a predicate that cannot tell the two apart would report every clamp.

Shared render-path derivations **MUST NOT** be hardened into an uncontained render throw. A hard signal for resolved-but-invalid data is permitted only within the affected region ([UIP-M17](../tanstack-query/ui-loading-and-persist-options.md), [UIP-N3](../tanstack-query/ui-persist-offline.md)).

Server callers **MUST** consume the existing gated composition so tolerant skip branches are unreachable there, without duplicating "gate then sum" ([SSG-M8](../ssot/ssot-principles-and-precedence.md)). The derivation's own body **MUST** declare its surviving client leniency, consumer coupling and measured reach ([IV-M13](../implementation-verification/change-acceptance-bar.md)); changing a predicate that also selects display rows changes what the user sees. Verify each consumer's render/request path, every server caller's gated inputs, and the declaration.

---


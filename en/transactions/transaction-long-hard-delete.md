# Long hard delete across transactions (TX-M-12 application)

```kit-cover
type: normative
part-of: README.md
binds: durable closing decision, racing child gates and explicitly classified parent readers
open-when: shape:backend-heavy, signal:multi-step-write, signal:db-transaction, signal:session-threading
skip-when: signal:client-only, signal:single-document-write
owns: none
```

Part of [the topic index](README.md).

References: [transaction-contention-and-unit-scope.md](transaction-contention-and-unit-scope.md); [transaction-policy.md](transaction-policy.md); [redis.md](../redis/redis.md); [repository-boot-readiness-prerequisite-proof.md](../repository/repository-boot-readiness-prerequisite-proof.md); [scheduled-work-liveness-and-outcome.md](../logging-policy/scheduled-work-liveness-and-outcome.md).

---

## Long hard-delete application of TX-M-12

If a multi-collection hard delete exceeds one unit, it **MUST** persist the parent's closing decision before cascade. Racing child writers pass one shared real-write parent gate inside their own units; a fenced terminal authority passes it once before its parent writes. **MUST NOT** copy the open predicate into another CAS. Remove the parent only after scoped records, external references and owner effects complete or join the final unit. Retry resumes durably; public reads never present closing as active.

Background/post-commit child writers read closure on the same session before touching the parent and classify closing as a named item skip/cancellation, never crash or batch-wide failure for the parent. A cascade-deleted lease row first reasserts fleet ownership, whose loss still stops the batch; then one fresh closure read classifies transition miss/effect failure: closing/gone skips, open retains its real failure. Shared request/background persistence owns that read and returns one closed cancellation signal carrying the registered gate code; caller hooks declare their domain cancellation without re-reading closure. An unstarted deleted item cancels; after external start, a terminal miss caused by cascade is “attempted, record gone with the parent, no retry,” while an open-parent miss stays a system-class defect. One classifier handles returned rows/thrown signals.

Rows whose parent key exists only in an ambiguous composite prefix cannot use unsafe prefix deletion. Bound them by retention derived from their protection interval: an in-flight anchor expires after the longest unit, rather than the date in its key.

Which writes pass the gate:

- Insert/upsert and commands/jobs changing existing child domain state pass it before their first write. Closing forbids mutations even when orphan creation is impossible.
- Stop/clear-only cleanup, bookkeeping for an already-gated effect, and in-place identity re-key need no gate because they cannot escape the cascade. If bookkeeping authorizes a new external effect, its managed reservation unit must gate.
- Cleanup-derived recount may remain ungated; any effect it enqueues is skipped for closing and gated for open inside the effect-row writer, leaving cleanup committable.
- A no-write branch opens no unit/touch. A find-or-create gates only its create branch, even with a fenced caller; it uses the caller's session or a short declared own-unit path.
- Identity transfer skips new-key insertion for closing and removes the old row. In-place re-key still runs without touch when it creates no row and preserves parent key. Uniqueness preflight still counts closing rows until cascade releases their keys; conflicts retain registered classification.

Newly gated units join the parent's contention set. Exhausted conflict **MUST** use the shared TX-M-11 retryable mapper rather than persistence-defect/crash classification.

Optional fenced authority **MUST** still yield exactly one gate per unit. One composition takes an optional candidate and returns authority, no-access result, or nothing after plain gate; refusal variants add only one shared refusal. Read choosing state on-session through the writer's derivation; mint only when needed, because unnecessary epoch advancement stales concurrent candidates. Derivation/result disagreement fails loud. Existing-row effect-changing shared writers require the caller's session and leave gating to its unit, preventing second/N-fold touches; remove unused own-unit fallback. Insert branches keep their internal gate.

Enforcement: use the mechanism the adopting project documents for the registered writer call shapes, and record its actual scope and limits; a reference to a check is not evidence that it exists or covers the full rule. Such a check requires an unconditional awaited gate in an enclosing block/`case` to finish before the target starts, including before its arguments. A literal stop selector (for example a constant that only clears a recurrence flag) exempts; variable selectors do not. An authority entry must gate at top level before every parent write/return and cannot disappear. Composition returns/fall-through must be dominated by a gate or a same-file fenced function; outside its owner, awaiting both plain and composed/authority gates is forbidden. Outside that file authority/composition awaits are unconditional function-body statements; earlier no-write returns require review.

The registered writer set covers creation of scoped records, updates of existing scoped records, expired-completion writes, recurrence intents, settings, reservation of outbound pushes, period intents and payment-ledger appends. Recount is deliberately not a registered writer. Audience-discriminated notification creation, internal outbox/referral insert order and cross-function duplicate gating remain review-held. A check that rejects caller closure reads and local closed-signal predicates is project-documented; proving a post-start miss actually follows cascade is review.

Resume, identity-only completion and lost-response receipt live in [transaction-long-hard-delete-completion.md](transaction-long-hard-delete-completion.md).

One open-parent predicate: query filter, document check and fresh existence read belong beside the closing state machine. Other consumers derive from them. Request memoization is a separately named precheck accessor only; refused-write classification reads fresh. A project check may give the closing marker a single owning repository and model; types, multi-field projections and computed marker names remain outside such a syntax predicate.

Every direct parent reader **MUST** declare its closure class through the read seam's name:

- Open-only: write/effect-leading entitlement/trial/notification/report/job reads, request screens and analytics populations.
- Explicit including-closing: closure/repair, identity re-key, dispatcher-owned recipient lookup, selected-parent operator inspection, own write read-back, identity-only miss classification, gated parent-keyed entitlement snapshot and provider identity resolution. Realized historical purchases remain attributed to closing parents.

Entitlement+event writers gate first in their unit rather than copy the open filter into CAS. Background jobs select open candidates, then classify failure by fresh closure existence. A derivation owns one recognizable closed skip; parent-unit containment loops rethrow it rather than collect as member failure, and audience filters count it non-matching. Choosing the parent-scoped loop is cross-file, so it is review-held rather than fenced.

Authenticated provider events for verified closing parents bind to the verified subject and complete a named terminal class with no parent-scoped store-reference, entitlement, trial, referral, revenue or lifecycle effects. Failures after effects began get fresh closure classification before retry persistence. Identity trust remains checked, but closure precedes open-parent transfer/reconciliation fences; closing identity is its own type excluded by effect-writer parameters, and multi-subject events skip provider reconciliation for closing participants. Synthetic-parent detection uses one persisted-flag filter, never sentinel-id duplication.

One repository module owns open reads and a separate one owns inclusive reads. A project check may reject parent reads outside that repository folder; variable-carried models, runtime model lookups, driver collections and scripts remain outside such a check. Consumer/class agreement requires review.

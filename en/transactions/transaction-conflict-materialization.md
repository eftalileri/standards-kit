# Materializing a conflict the engine can see

```kit-cover
type: normative
part-of: README.md
binds: atomic rejecting claims, shared conflict anchors and bounded forward repair
open-when: shape:backend-heavy, signal:multi-step-write, signal:db-transaction, signal:session-threading
skip-when: signal:client-only, signal:single-document-write
owns: TX-M-23
```

Part of [the topic index](README.md).

References: [Transaction policy](transaction-policy.md); [transaction-decision-gates.md](transaction-decision-gates.md); [transaction-write-context.md](transaction-write-context.md); [Repository contract](../repository/repository-boundary-and-atomic-claims.md).

---

Snapshot isolation validates writes, not reads. Two units reading the same facts and writing disjoint documents can both commit; re-reading the same snapshot or ordering scan-before-remove narrows/aborts a window without closing it. A scan/remove racing a creator therefore needs a shared real-write fence or uniqueness conflict.

Before adopting a fence, account for atomic scan/removal, TX-M-13's row/byte budget, moving cache/outbound obligations after commit, and the extra contention among creators. If the fence is the document removed last, an idempotent forward-repair sequence may instead read its version, re-home outside a transaction, then conditionally remove that version. Creators bump the document in their own units. A missed removal repeats the scan; a creator after removal aborts. This keeps an unbounded re-home outside a transaction, but creator contention still requires real-data measurement. Declare any residual window when these conditions are unpaid.

A legitimately absent fence row needs a proved no-removal-path arm, not unconditional rejection. Preserving an existing assignment does not establish a new one and must not block ordinary edits after departure. Conditional bump/removal are paired authorities, each with one owner.

<a id="must--tx-m-23"></a>

## Atomic rejecting claims — [TX-M-23](transaction-conflict-materialization.md)

**TX-M-23**: A read whose result rejects or skips a write **MUST** be one atomic claim containing the predicate and a real-write fence in one authority. If a natural uniqueness constraint would wrongly forbid an always-allowed system write, use a conflict-anchor document in the same transaction.

- (a) Classify by use: advisory previews return occupancy without writing; rejecting/skipping paths claim it. Merely adding a session to the read cannot materialize a conflict.
- (b) The authority requires the transaction context (and accounting handle where applicable). Its fence changes on every attempt; a no-op update supplies no conflict.
- (c) The fence carries no domain fact and is keyed by the contended resource, including cross-scope contention, rather than caller scope. Compare the actual predicate/filter with the key. Occupancy remains in its existing authority; no release/reap is needed. Declare only indexes actually created; retention has its own owner.
- (d) Concurrent first upserts may raise duplicate key instead of write conflict. Mark this proved contention through the single driver-label authority so managed retry re-runs the unit. If the label cannot be attached, raise the error untouched rather than guess.
- (e) Raise or skip inside the fenced unit; a full conflict list writes every fence before evaluation. Only the claim may construct its typed rejection. A pre-unit advisory result cannot be sealed; mutable-state refusal releases the claim under IDEMP-M7.
- (f) Every write that adds an occupant to the fenced resource or moves one into it — never-refused moves, re-homes and identity re-keys that change the resource key included — **MUST** touch the destination fence in its own transaction; otherwise a concurrent claim decides on a snapshot that misses the occupant. A re-key spanning an unbounded history **MAY** bound its fences to the resources a refusing claim can still decide on, stating the bound; the fences count toward the unit's write-set accounting.
- (g) When one resource is stored under several identity forms (a subject under a directory-record id and a linked account id, split while a multi-unit re-key runs or named by a stale caller), the occupancy read **MUST** filter on every stored form of the resource and the fence **MUST** be keyed by its canonical identity, both from the one identity authority; otherwise a writer naming the other form decides without seeing, or without serializing against, the occupant. A claim **MUST** also write the identity document whose change re-keys the resource (the directory record a link, unlink or account change writes); otherwise a claim keyed from the old identity and one keyed from the new touch different fences and both commit.

A focused check, using the enforcement mechanism the adopting project documents, covers direct predicate-result rejection and copied filters; record its actual scope and limits. Required context types prevent omission. Values passed through helpers/object fields and cross-file rejection remain review-held, as does semantic equality between the fence key and occupancy filter. (f) and (g) are review-held: which writes move occupants into a resource, and which stored forms name one resource, are cross-file facts.

# Joining a read to the atomic unit's session

```kit-cover
type: normative
part-of: README.md
binds: ordered session-read participation tests and declared structural disjointness
open-when: shape:backend-heavy, signal:multi-step-write, signal:db-transaction, signal:session-threading
skip-when: signal:client-only, signal:single-document-write
owns: TX-M-20
```

Part of [the topic index](README.md).

References: [Transaction policy](transaction-policy.md); [transaction-write-context.md](transaction-write-context.md); [transaction-contention-and-unit-scope.md](transaction-contention-and-unit-scope.md); [transaction-decision-gates.md](transaction-decision-gates.md); [repository-boundary-and-atomic-claims.md](../repository/repository-boundary-and-atomic-claims.md); [Mechanism selection — FP-MS1](../false-positive/mechanism-selection.md); [Check design — FP-M18](../false-positive/check-design-rules.md).

---

<a id="must"></a>

## Snapshot read participation — [TX-M-20](transaction-read-session-join.md)

**TX-M-20**: While a usable unit session is available, reads **MUST** join it unless deliberately outside with a countable call-site declaration. Apply these tests in order; the first match decides, and only (d) permits omission:

- (a) A sessionless branch using cache/replica/secondary/provider instead of the same store requires forwarding, independently of writes; no outbound/cache work belongs in the callback (TX-M-12).
- (b) Structurally intersecting read/write result sets (same collection/keyspace) require the session. Incidental caller ordering is not disjointness.
- (c) Every read deriving a persisted multi-read value joins one snapshot.
- (d) Only structural query disjointness or post-commit/post-abort reads may omit it, with measured reason declared where the call is written. Absence of a declaration is not exemption.

Writes remain mandatory-session under TX-M-3/TX-M-19. A response builder moved into a sealed unit brings its callees: hoist cache/provider derivation and own-unit read-path writes before the unit only with structural disjointness and proof that hoisted writes commute. Plain/in-unit forms share one phased reader authority. Identity re-keyed lookups cannot hoist; see TX-M-12's transfer boundary.

A type-aware project check, using the enforcement mechanism the adopting project documents (record its actual scope and limits), enforces this row. A direct session-accepting parameter/options call must receive the usable visible session. Declaration position and falsy/early-return narrowing exclude unavailable bindings; a locally opened session is active only inside its runner callback, including assignment-opened sessions. Do not restrict this to callback lexical location: session-receiving helpers also hold the obligation. Shared readers with legitimate sessionless callers cannot universally make the parameter required.

Driver/query chaining is outside the argument predicate and belongs to repository seams. Semantic disjointness remains declared/review-held. The cost prefilter reads declaration name/annotation/initializer or callback callee session vocabulary; inferred sessions with unrelated names require review/naming discipline.

Store-reaching helpers lacking a session signature **MUST** add and forward one through every read. Where callers are few, require an explicit session-or-empty parameter: types prevent omission and the lint predicate rejects empty while a session is available. Session-mode cache readers neither read nor fill shared cache from uncommitted data. Provider/lineage branches resolve before the unit; reaching one inside fails loud rather than issue outbound work or sessionless writes.

The transitive arm uses resolved declaration bodies, memoized per declaration, to identify ODM model or in-tree session-seam reach. It skips a direct callee's absent-parameter read when the supplied argument type excludes absence (`p ?? read()`, ternary, `if (!p)`); options-property guards conservatively count as reach. A closure sees its enclosing usable binding. Raw driver access and document-instance `save()` are outside this reach definition. These boundaries, rather than suppressions, exclude correct parameter-supplied/post-commit shapes.

The driver marks only commands carrying the session; implicit ODM async-local propagation is not assumed. Explicit empty `session: undefined` means no session and counts as omission.

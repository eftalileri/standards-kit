# Idempotency — key, record scope and the replay contract (IDEMP-M1–IDEMP-M6, IDEMP-M29)

```kit-cover
type: normative
part-of: README.md
binds: key and normalized scope, live uniqueness, replay projection and per-status retention
open-when: shape:backend-heavy, signal:mutation-endpoint, signal:idempotency, signal:duplicate-suppression
skip-when: signal:client-only, signal:read-only-endpoint
owns: IDEMP-M1, IDEMP-M2, IDEMP-M3, IDEMP-M3b, IDEMP-M4, IDEMP-M5, IDEMP-M6, IDEMP-M29
```

Part of [the topic index](README.md).

---

<a id="must-normative--idemp-m1-to-idemp-m6-idemp-m29"></a>

## Key scope and replay — [IDEMP-M1–6/M29](key-scope-and-replay-contract.md)

**IDEMP-M1**: In-scope mutations **MUST** require a documented client key at HTTP boundary, except an exact route-local or policy-record decision stating both `idempotencyKey: optional` and `clientMayRetry: false`, or all temporary IDEMP-M15 conditions. The exception lifts only the retry duty: a route a user can submit twice (a button, a form) still **MUST** suppress the second submit and prove it ([GIDEMP4](idempotency-decision-gates.md)), because a double tap is a retry the client never chose.

**IDEMP-M2**: The key **MUST** have validated trimmed length ≥ IDEMP-T-KEY-MIN, or a route-registration comment or policy-record format with equivalent entropy/length (UUID/ULID/prefixed opaque) enforced by schema/predicate.

**IDEMP-M3**: Records **MUST** bind stable `routeId`, key, normalized authorization subject and every tenant discriminator changing the target. Scope may enter unique identity or canonical fingerprint; a same-key different tenant must conflict, never replay another tenant. Query/path/trusted-context selectors count even with equal bodies. Idempotency and handler consume one schema-normalized authority; a configured field absent there fails loud without fallback. Reject duplicate/multi-value tenant query selectors.

**IDEMP-M3b**: Literal route placeholders are not substituted fingerprints. Every path placeholder **MUST** bind its concrete value from the validated parameter authority, not raw params or a query tenant surrogate. An unresolved nonliteral routeId needs explicit proof, never assumed coverage. Any project check on the literal registration shape holds only that local shape; record its actual scope and limits.

**IDEMP-M4**: Completed control/cache records **MUST** have positive integer `recordTtlSeconds` per environment/route class, or IDEMP-T-RECORD-TTL-DEFAULT-SEC; a global override has one documented authority. Expired records are absent for replay and purged/ignored. Only the fully qualified IDEMP-M18 immutable financial ledger has no TTL. A separate positive-TTL transport record may serve byte-identical replay, but its miss/expiry re-enters current authorization and ledger reconciliation rather than make the financial action absent.

**IDEMP-M5**: One scoped key **MUST NOT** apply twice concurrently. Linearization uses exactly one of (a) Redis `SET NX`/cluster-safe equivalent with `EX`/`PX` and documented lease or default; (b) database scope+key uniqueness in a transaction; (c) named distributed-lock algorithm/library version; (d) exactly one queue consumer per documented route/scoped-key partition. Durability always additionally uses (b); cache/lock/broker are accelerators, never sole authority (RDS-M9). No live durable constraint means STOP.

Read exact deployed constraint topology and migration markers through one authority, not model declaration alone. Separate current claim/read preconditions, fail-closed before each claim, from future-phase indexes/retention/markers, which are measured/reported but cannot gate current traffic. Memoize successful checks per process; a rejected read must not pin the replica closed. Replacement of stale claims requires completion/release to match immutable acquired claim id or monotonic fence plus still-pending state; old workers cannot delete/complete successors.

**IDEMP-M6**: Exact canonical body/subject/target replay **MUST** return original status and byte-identical JSON (or documented canonical serialization). Over IDEMP-T-REPLAY-MAX-BYTES requires a route-local or policy-record replay-by-reference resourceId+GET contract. Canonical object keys sort recursively; arrays retain order. Insertion-order serialization is admissible only when every argument is an inline object literal fixing order; provenance itself is not locally checkable.

IDEMP-M6 durable first-wire projection clarification: Freeze/seal the complete unit-derived first wire projection in the mutation's unit and return it on first delivery/replay, rather than mutable post-commit re-read. Current preflight still precedes replay. Legacy rows lacking it fail loud without reconstruction/re-execution. State both mixed-cohort refusals: older strict readers may reject the new envelope; newer readers cannot invent a response old writers never retained. Both preserve completion. Finish live reader/writer rollout before claiming availability; the sealed API is stronger than a syntax fence.

IDEMP-M6 stored-body-at-rest clarification (normative): A general replay store **MUST** keep every completed body only as an AEAD envelope sealed with a key derived from a secret held outside the database and bound to the record's identity; replay opens it and returns the original bytes. A replay body can carry a bearer session token or a capability that its primary store keeps only hashed, so plaintext storage turns read access to the collection into account takeover. Stripping the credential instead breaks byte-identical replay, and a per-route opt-in misses the next credential-bearing route. A failed open is a SYSTEM error, never a miss that re-runs the mutation. Changing the stored form follows IDEMP-M31's dual-form read and sunset.

IDEMP-M6 envelope-shape clarification (normative): A replay store that checks a body it completes or replays **MUST** check it with the response envelope authority's one shape guard, and **MUST NOT** require a field the envelope type leaves optional. A stricter local copy refuses a valid first answer inside the unit, so the whole mutation rolls back and every retry fails the same way.

IDEMP-M6 fingerprint-provenance and stored-body clarification (normative): Fingerprint request values as sent, never server-assigned clocks/generated ids/defaults from schema parsing. Replay fields derive from the unit's own writes. A post-commit best-effort outcome may decorate first delivery only when every client treats it as optional and it is documented as first-delivery-only; it cannot abort the unit or alter replay facts. Schema transform/response provenance remain cross-file review-held.

**IDEMP-M29**: Every claim status **MUST** name a reclaim mechanism with no gap: either (1) durable fenced lease takeover (IDEMP-M26), or (2) absolute store-enforced expiry written at claim and removed at terminal transition. Derive expiry from staleness/lease horizon, not an independent number that may expire active work. Terminal-only TTL leaves nonterminal rows immortal. Request `finish`/defer, fire-and-forget close or lazy same-key self-heal may accelerate but never bound retention, because abort/restart/fresh-key callers bypass them.

Measure/report mechanism presence from the live store under M5's future-topology arm, without gating the current writer, and expose past-horizon row count. Missing mechanism is SYSTEM/error; residue of abort/restart is metric. State sampling limits at measurement. Status/column/reclaim ownership is not a schema-only fact; the per-status table and review hold coverage because a syntactic proxy also flags valid fenced leases.

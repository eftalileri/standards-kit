# Idempotency — prohibitions (IDEMP-N1–IDEMP-N20)

```kit-cover
type: normative
part-of: README.md
binds: every idempotency MUST NOT row — missing or misrouted keys, silent duplicate handling, ad-hoc error bodies, unbounded control records, bypass switches, stale-authorization replay, ledger TTL misuse, hand-maintained membership lists, over-limit or uncaptured response sealing, and schema-strict replay
open-when: shape:backend-heavy, signal:mutation-endpoint, signal:idempotency, signal:duplicate-suppression
skip-when: signal:client-only, signal:read-only-endpoint
owns: IDEMP-N1, IDEMP-N2, IDEMP-N3, IDEMP-N4, IDEMP-N5, IDEMP-N6, IDEMP-N7, IDEMP-N8, IDEMP-N9, IDEMP-N10, IDEMP-N11, IDEMP-N12, IDEMP-N13, IDEMP-N14, IDEMP-N15, IDEMP-N16, IDEMP-N17, IDEMP-N18, IDEMP-N19, IDEMP-N20
```

Part of [the topic index](README.md).

---

<a id="must-not-normative--idemp-n"></a>

## Prohibited replay and storage forms — [IDEMP-N1–20](idempotency-prohibitions.md)

**IDEMP-N1**: **MUST NOT** accept in-scope mutation without a valid scoped key outside the fully compliant route-specific M15 window (M1/M2).

**IDEMP-N2**: **MUST NOT** require keys on safe read-only GET/HEAD/OPTIONS without an exception recording handler path and an accountable review reference in the route registration or policy record.

**IDEMP-N3**: **MUST NOT** silently ignore duplicates; replay or explicit M10 error.

**IDEMP-N4**: **MUST NOT** assign unknown server-random keys to client mutations; clients must retain retry identity.

**IDEMP-N5**: **MUST NOT** make process memory duplicate authority; single-instance deployment is no exception (RDS-N1).

**IDEMP-N6**: **MUST NOT** replay success for same scoped key with changed normalized payload/target/tenant. Return registry semantic `4xx` conflict; body-only hashes cannot omit external selectors (M3).

**IDEMP-N7**: **MUST NOT** omit positive store/read-enforced control/cache TTL outside fully qualified M18.

**IDEMP-N8**: **MUST NOT** linearize outside M5's closed mechanisms, including memory mutexes or unbounded wait without lease/partition.

**IDEMP-N9**: **MUST NOT** ACK asynchronous callbacks before durable validated acceptance or complete inbox before required effects.

**IDEMP-N10**: **MUST NOT** hand-build idempotency error status/body. Preserve canonical registry category/retryability/trace; direct output is only successful byte-identical M6 replay.

**IDEMP-N11**: **MUST NOT** use general legacy/mobile/rollout switches, malformed-supplied-key bypass, expired removal windows or irreversible provider endpoint exceptions (M15).

**IDEMP-N12**: **MUST NOT** replay before current auth/membership/capability or substitute stored subject/tenant/prior success for authorization (M16).

**IDEMP-N13**: **MUST NOT** replay narrow-key domain/legacy rows without exact subject+canonical intent at every seam; no missing-metadata compatibility, raw JSON or incomplete input subset (M17).

**IDEMP-N14**: **MUST NOT** TTL/purge/shadow a qualifying immutable ledger to imitate a cache. Separate positive-TTL HTTP records serve only byte-identical transport replay and re-enter auth+ledger reconciliation on miss. Generic stores/mutable resources/incomplete proofs do not qualify for no TTL (M18).

**IDEMP-N15**: **MUST NOT** use random/optional/client-shaped/timestamp/process fallback scheduler keys or turn ineligible/no-op into incident/completed mutation (M19).

**IDEMP-N16**: **MUST NOT** trust storage by assertion/permissive object/date-string/defaults or rerun after decode/schema failure (M20).

**IDEMP-N17**: **MUST NOT** use a literal unsubstituted route placeholder alone as fingerprint, substitute query scope for path binding or read raw params (M3b/M3).

**IDEMP-N18**: **MUST NOT** make catalogs/sweeps/commits membership authority or excuse missed server-minted creates. Alternatives need verified registration proof. **MUST NOT** tighten new request fields before released supported clients send them, or treat the current source tree as release evidence. Interim suppression must name stage/removal condition, never file/directory exclusions (M21, [DCD-M8](../dead-code/dead-code-rules.md)).

**IDEMP-N19**: Completion **MUST NOT** be partial over possible captured responses. Over-limit bodies terminalize as distinct completed-but-nonreplayable state with no body and a registered condition on replay; never truncate, abandon or reuse outcome-unknown semantics. Contract replay ceiling and physical store capacity are separate: derive from promise versus store record maximum minus stated envelope reserve, and measure saturated legitimate route responses. Use UTF-8 bytes, never UTF-16 string length.

Capture absence **MUST** use a marker outside legal wire values, not `null` or another valid payload. Unhooked raw send/stream/end/status/redirect/download paths terminalize honestly, never fabricate an empty body or replay another media type. Routes unable to offer contracted serialization require replay-by-reference. Cross-module totality/capacity/capture dataflow remain review-held: establish what one byte over records/returns, and what is sealed when the handler never calls the captured writer.

**IDEMP-N20**: **MUST NOT** check stored HTTP replay against the route's current response schema at seal/replay. Rolling releases may legitimately retain older response shapes; validate canonical envelope for corruption, preserving byte identity. Domain reconstructed results still obey M20. Schema provenance remains cross-module review-held.

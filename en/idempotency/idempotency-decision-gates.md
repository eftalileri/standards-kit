# Idempotency — decision gates (GIDEMP1–GIDEMP9)

```kit-cover
type: normative
part-of: README.md
binds: the GIDEMP routing index — which endpoint classes owe an idempotency key, which must not be given one, and the order in which the gates are evaluated
open-when: shape:backend-heavy, signal:mutation-endpoint, signal:idempotency, signal:http-handler
skip-when: signal:client-only, signal:read-only-endpoint
owns: GIDEMP1, GIDEMP2, GIDEMP3, GIDEMP4, GIDEMP5, GIDEMP6, GIDEMP7, GIDEMP8, GIDEMP9
```

Part of [the topic index](README.md).

---

## Decision gates (normative index) — GIDEMP

**GIDEMP1**: Durable mutations apply M1/M3/M5; key absence requires an exact M1 exception or every M15 rollout condition.

**GIDEMP2**: Read-only GET/HEAD/OPTIONS requires no key. A proposed exception needs handler path and an accountable review reference under N2 before proceeding.

**GIDEMP3**: External irreversible effects require linearization/partial-failure guarantees (M5/M7) and shared crypto keys (M12); otherwise STOP.

**GIDEMP4**: Both retry and double-submit require same-key replay status/body equivalence under M6. Verify through authorized real-route non-production measurement without repository artifacts (M12), never authored tests. A `clientMayRetry: false` exception narrows to double-submit, never removes proof.

**GIDEMP5**: Quick callback ACK requires validated durable immutable-event inbox before `2xx`, atomic lease, bounded terminal failure and restart recovery (M14). Without immutable event id, define a natural key before ACK.

**GIDEMP6**: Current auth/normalized access/capability precedes replay; handler reuses the exact request-local verified context (M16). Otherwise STOP and reorder.

**GIDEMP7**: Every narrow-key domain/legacy record stores exact subject+versioned canonical intent checked at all seams (M17). Missing proof stops replay; backfill only durable audited facts.

**GIDEMP8**: No TTL requires all immutable financial ledger M18 proofs. A separate positive-TTL transport record cannot bypass current auth/ledger reconciliation. Otherwise enforce control-record TTL.

**GIDEMP9**: Membership uses the enabled build-time route predicate and verified alternate-authority exceptions (M21), rather than a route list/sweep/memory. If required-field rollout is incomplete, ship optional server stage alone with precise suppression, then mount guard only after embedded floor reaches field-sending release.

GIDEMP9 application note — header-dependent floor: A header-enveloped floor covers only that envelope. For older headerless bundles, route introduction after the interceptor can prove shipped-UI unreachability only with both history commits and the introducing commit's actual interceptor. It does not prove zero production headerless traffic. If native-version telemetry cannot count it, record that limit and missing-key answer at registration or policy record. The current source tree cannot prove released ancestry.

GIDEMP9 application note — key presence versus stable intent: Embedded key presence proves schema compatibility, not same-intent retry. Read the embedded caller's key lifecycle: per-call regeneration permits duplicate provider work after timeout despite disabled transport retry/pending-button state. Full closure needs an embedded store floor carrying stable intent keys and proved first-launch behavior; an over-the-air update alone is insufficient. Do not substitute a target-derived key when another same-target action is legitimate. Record the remaining release condition at registration or policy record.

Evaluate GIDEMP2 → GIDEMP9 → GIDEMP1/GIDEMP3 → GIDEMP6 → GIDEMP7 → GIDEMP8 → GIDEMP4 → GIDEMP5 → [GIDEMP10](effect-fence-and-atomic-sealing.md).

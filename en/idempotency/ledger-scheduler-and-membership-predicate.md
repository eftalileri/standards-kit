# Idempotency — financial ledger, scheduler keys, untrusted replay input, the membership predicate and provider-callback business identity (IDEMP-M18–IDEMP-M22)

```kit-cover
type: normative
part-of: README.md
binds: immutable financial retention, deterministic scheduler identity, stored-domain decoding, route membership and exact sub-effect acknowledgment
open-when: shape:backend-heavy, signal:commission, signal:mutation-endpoint, signal:idempotency, signal:idempotency-coverage-predicate, signal:webhook, signal:provider-integration, signal:scheduled-job
skip-when: signal:client-only, signal:read-only-endpoint
owns: IDEMP-M18, IDEMP-M19, IDEMP-M20, IDEMP-M21, IDEMP-M22
```

Part of [the topic index](README.md).

---

<a id="must-normative--idemp-m18-to-idemp-m22"></a>

## Financial retention, scheduler and sub-effects — [IDEMP-M18–22](ledger-scheduler-and-membership-predicate.md)

**IDEMP-M18**: Only an immutable financial action ledger may omit M4 TTL, with all proofs:

1. Retained append-only financial authority under accounting/audit policy, not mutable resource/control cache.
2. Exact route-scoped durable unique action key including normalized tenant and client key.
3. Stored exact subject and versioned canonical intent (M3/M17).
4. Current authorization before each replay (M16).
5. Exact subject/fingerprint at every early/in-unit/race seam; missing/mismatch fails registered conflict/invariant.
6. Deterministic result reconstruction from ledger's immutable facts after cache miss/expiry.
7. The adopting project's policy record names route, ledger/table, unique key, fingerprint, subject, reconstruction, no-TTL classification and any separate control layer.

A distinct positive-TTL HTTP record may only preserve byte-identical transport replay, never authorize/write/reconcile/replace financial action. Its miss/expiry re-enters current auth+ledger reconciliation. **MUST NOT** age/key-expire the ledger or add parallel financial action/reconciliation records. Whole-account/tenant deletion or proved orphan cleanup may remove it only under domain retention cascade after active authority is removed and scope is inaccessible to mutation; that is not expired-key-as-absent replay. Ordinary financial governance owns growth. Generic caches/mutable resources/incomplete proofs do not qualify.

**IDEMP-M19**: Scheduler mutations without client keys **MUST** use one deterministic builder over stable job/route plus normalized durable scope and recurring window. Retries/replicas consume exact output; no random/optional/current-clock/process/generate-if-missing fallback. Versioned domain separation, ambiguity-free canonical serialization and collision-resistant digest must satisfy consumer schema for every legal input length; no truncation/raw concatenation/alternate builders.

Durable observation/skip/block rows before the mutation gate use occurrence plus distinguishing fact, never write-time identity or random suffix. Keep the key persistence-only. Ineligibility is typed no-mutation (`skipped`), not incident or completed mutation. Access suspension leaves intent unconsumed; restoration starts at first valid future occurrence without catch-up burst. Clock-derived identity through variables remains review-held; any clock-alone collision check holds only its stated shape.

**IDEMP-M20**: Stored completed JSON **MUST** pass the exact strict runtime result schema with explicit temporal rehydration. Missing/malformed/extra/invalid values raise registered idempotency error, never defaults/casts/re-execution. Storage remains untrusted.

**IDEMP-M21**: Requirement membership **MUST** come from a build-time route-shape predicate, not catalog enumeration. Server-minted durable creation is nonconvergent and needs duplicate suppression before handler. Client-named state-setting item writes do not inherit membership from verb alone. Alternative domain records/natural uniqueness/window require verified registration proof; catalogs may record configuration only. Enable the measured-clean subset and explicitly stage remaining debt.

New required fields **MUST** stage: (a) server optional schema field, malformed supplied values rejected, guard unmounted; (b) released client sends; (c) supported embedded client floor reached, separate later guard-mount change. Strict schemas prevent client-first; released bundles prevent server-first enforcement. Use precise reasoned registration suppression naming stage/removal condition, never file exclusion. Per-intent random keys are mandatory where identical repeat is legitimate; body derivation otherwise freezes a new action for retention. If key presence enables transport auto-retry, stage (b) suppresses that retry until the same change mounting the guard removes suppression. A project check on the registration class evaluates only that local class; it cannot prove released-bundle reachability. Record its actual scope and limits.

**IDEMP-M22**: Mutable sub-effects **MUST** acknowledge their exact claimed attempt, never generic parent completion. Registration advances a monotonic generation/immutable discriminator; claim snapshots it plus observed token. Finalization matches parent lease owner and claimed generation, removing/acknowledging only that token so later registrations remain. Same-store parent completion and acknowledgment commit on one session. Model/repository/worker pairing requires cross-file review.

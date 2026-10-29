# Idempotency (backend SSOT)

```kit-cover
type: normative
part-of: README.md
binds: scope, numeric constants, topic contract and durable duplicate-store authority
open-when: shape:backend-heavy, signal:mutation-endpoint, signal:idempotency, signal:duplicate-suppression
skip-when: signal:client-only, signal:read-only-endpoint
owns: IDEMP-C*
```

The [topic index](README.md) routes the rule families; IDEMP-T thresholds are defined here.

Scope: HTTP mutations of durable state/external effects, keys/scope/replay/retention, concurrent duplicate suppression, durable store consistency and partial failure. In-scope consumers use `routeId = consumer name + version`. Client intent/key rules apply where specified; full HTTP error taxonomy remains [error policy](../error-policy/error-policy.md).

References: [README.md](README.md); [error policy](../error-policy/error-policy.md); [decision function](../decision-function/decision-function.md); [logging policy](../logging-policy/logging-policy.md); [transactions](../transactions/transaction-policy.md).

Code samples (non-normative): [`../_meta/examples/idempotency-code-samples.md`](../_meta/examples/idempotency-code-samples.md).

---

## Normative constants

These four **IDEMP-T** identities are required policy values, not universal numeric defaults. The consuming project MUST define their resolved values and derivation in one authoritative API/storage policy. That policy may provide a global value and registered route/class overrides; route code MUST NOT invent a local value. Every resolved value MUST be positive, finite, and validated before the relevant key, record, replay, or lease is accepted. If neither the shared policy nor an applicable registered override supplies a value, fail closed before the mutation/effect; do not substitute a guessed default. Re-evaluate derived values when the API contract, key generator, durable-store limits, retry/replay horizon, or transaction limits change.

IDEMP-T-KEY-MIN: The adopting project defines the minimum accepted key length/format and its required entropy or equivalent collision-resistance property from the API contract and the key-generation profile; see IDEMP-M2. A character count alone does not prove entropy. A registered format such as UUID/ULID may define the validation rule, but must not bypass its documented generator/entropy requirement.

IDEMP-T-REPLAY-MAX-BYTES: The adopting project defines the maximum serialized response size for which its API promises byte-identical body replay; see IDEMP-M6 and IDEMP-M7. Derive it from the documented replay contract and response/transport budget. Measure serialized bytes using the canonical wire encoding. The durable store's physical per-record limit is a separate ceiling, derived from that store's actual limit after reserving space for the idempotency envelope; IDEMP-N19 governs the terminal outcome when that physical limit is exceeded. Do not merge the contract threshold and physical ceiling into one constant.

IDEMP-T-RECORD-TTL-DEFAULT-SEC: The adopting project defines the positive finite control-record TTL policy from the longest supported client retry, replay, and reconciliation horizon, with an explicit safety margin, and checks that it fits durable-store retention/capacity; see IDEMP-M4. A route or class may use a different value only through the same registered policy authority. Expiry MUST NOT reopen a key while a supported retry may still arrive. This does not apply to an IDEMP-M18 immutable financial ledger or replace any separately documented positive-TTL transport-response layer.

IDEMP-T-LEASE-TTL-DEFAULT-SEC: The adopting project defines the positive finite lease policy from the maximum in-flight operation/transaction duration, renewal cadence, and store lease semantics; see IDEMP-M5(a). A lease MUST NOT permit takeover while the prior owner may still commit or perform the effect. If a lease cannot be safely bounded and fenced for a route, select a durable linearization path that does not depend on that lease or fail closed. Whatever lease a store uses, a claim whose completion is sealed inside a business transaction MUST lease for longer than the store's server-side transaction lifetime limit, or use a separately proven fencing/renewal protocol that preserves the same safety, so a same-key retry cannot reclaim the row while the unit may still commit. That limit is deployment configuration, not source: treat it as a required external policy input, re-measure both whenever either changes, and when it is unavailable the lease-using path is unresolved and cannot be enabled.

---

## Rule identifiers (normative)

IDEMP-C*: Agent execution contract. IDEMP-C2/C3/C4 are unassigned and **MUST NOT** be back-filled.

IDEMP-M*: **MUST**.

IDEMP-N*: **MUST NOT**.

GIDEMP*: Decision gates (normative index).

IDEMP-T-*: Numeric / size thresholds (this file only).

---

## Agent execution contract

The shared [agent execution contract](../_meta/agent-contract.md) applies; the rows below are this topic's own.

**IDEMP-C1**: This topic is mandatory for in-scope mutation entrypoints (Scope).

**IDEMP-C5**: Precedence: error policy wins on HTTP status and semantic error codes; this file adds idempotency shape and routing minimums only.

**IDEMP-C6**: Change impact: a change to idempotency storage or key rules names the standards it affects; a per-route decision is stated in a code comment at the route's registration or in its policy record.

Verification follows [M12](../agent-planning/agent-planning-obligations.md); authored test artifacts remain prohibited.

---

## Technology

Duplicate store: the durability authority is a database unique-constraint claim (IDEMP-M5(b)) documented in project architecture. Redis — or any other distributed cache, lock or queue — is a non-authoritative accelerator over that claim and never the sole guarantee ([RDS-M9](../redis/redis-connection-keys-and-authority.md)); on its unavailability the operation continues via the database claim. In-memory-only → violates IDEMP-M5 (no single-instance escape).

Redis client: when Redis is selected, use a supported client version whose behavior matches the APIs required by the implementation; record the dependency in the consuming project's manifest (mismatch → STOP or amend standard, IDEMP-C6).

# Idempotency — subject/recipient identity migration as one unit (IDEMP-M23, IDEMP-M27, IDEMP-M31)

```kit-cover
type: normative
part-of: README.md
binds: fenced identity projection migration, digest-form compatibility and directional provider proof
open-when: shape:backend-heavy, signal:idempotency, signal:identity-migration, signal:outbox-recipient, signal:natural-key-change
skip-when: signal:client-only, signal:no-identity-migration
owns: IDEMP-M23, IDEMP-M27, IDEMP-M31
```

Part of [the topic index](README.md).

References: [README.md](README.md); [idempotency.md](idempotency.md); [key-scope-and-replay-contract.md](key-scope-and-replay-contract.md); [boundary-stores-and-provider-callbacks.md](boundary-stores-and-provider-callbacks.md); [backend-dispatcher-audience-and-egress.md](../expo-notifications/backend-dispatcher-audience-and-egress.md); [ssot-principles-and-precedence.md](../ssot/ssot-principles-and-precedence.md); [ssot-must-authority-and-derivation.md](../ssot/ssot-must-authority-and-derivation.md).

---

<a id="must-normative--idemp-m23-idemp-m27-idemp-m31"></a>

## Identity and digest migration — [IDEMP-M23/M27/M31](identity-migration-unit.md)

**IDEMP-M23**: A live identity migration changing a subject/recipient embedded in a durable natural key, canonical intent fingerprint, outbox recipient or opaque downstream digest **MUST** move those projections in one same-store transaction. First acquire the durable real-write fence every producer consumes; then validate and exact-CAS the subject/recipient, canonical key, versioned canonical preimage/digest and every replay-capable same-store outbox/campaign recipient/key projection. Immutable provider/event identity, tenant scope, attempt and provider-correlation evidence **MUST NOT** change. Rebuild mutable projections through their canonical builder; change opaque/external identity only from a durable mapping its owner writes in that transaction. An active lease blocks migration with retryable contention unless its exact owner participates in the unit. Partial/malformed proof, unverifiable legacy fingerprint, target-key collision or no-op CAS aborts the unit; missing proof is never a wildcard. Process memory cannot order replicas. Local authority checks do not prove the shared transaction/fence call graph.

**IDEMP-M31**: Digest consolidation **MUST NOT** silently change serialization. Before delegation, classify every site from actual reader `file:line` evidence on two axes: (a) durable lookup key versus stored-value comparison; (b) egress to operators, recovery queries, support, URLs, released clients or external consumers. A changed key can repeat the mutation; a changed comparison rejects old rows; a tree search cannot establish external readership ([DCD-M8](../dead-code/dead-code-rules.md)). Prefer an existing byte-equivalent authority over canonicalization. Prove equivalence by executed measurement over the whole admitted input type, including empty, non-ASCII, quotes/backslashes and astral characters, rather than only today's callers.

Only when no byte-equivalent form exists may a form migration use dual-form reads, single-form writes and an in-code sunset condition derived from the surface's retention horizon. The horizon begins at the first production deployment of the new form. Before branch deletion, count pre-deployment rows in the live store: rows predating a retention index may outlive nominal TTL. Such a row permits removal only when its lookup key can no longer be presented, with that boundary and count stated. Remove the branch, its optional input and exclusive helpers together. External readership and deployment/retention evidence are review-held; a lock-in fence is not established by recurrence alone.

**IDEMP-M27**: A provider-owned durable proof **MUST** admit the direction of legitimate movement rather than require equality that the operation itself falsifies. Measure the real provider operation before trusting immutability. After the operation, refresh the durable proof from the provider under the same fence through a CAS accepting only the non-violating direction. Refresh belongs to the migration writer, never a read path.

A retry observing a moved proof **MUST** prove the outcome: all source provider-native resource identifiers durably captured before the operation are accounted for at the target, with nothing lost. Movement alone cannot distinguish successful transfer from subject re-creation. A read path unable to afford provider reconciliation may admit the legitimate direction only against a durable transfer marker; unexplained movement fails loud. Post-operation read-back uses a bounded wait/re-read inside the fence; expiry fails loud rather than fabricating success. A comparison-syntax fence is insufficient because it would flag legitimate equality without establishing provider ownership semantics.

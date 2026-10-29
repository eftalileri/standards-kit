# Push credential binding and stale-token cleanup — NOTIF-RCP-M8–M10

```kit-cover
type: normative
part-of: README.md
binds: NOTIF-RCP-M8 to NOTIF-RCP-M10 -- the cross-collection push-credential binding authority, the exact-correlation cleanup of a rejected credential, and the closed success-status authority every business decision about a successful PUSH must consume
open-when: shape:backend-heavy, signal:push-notification, signal:push-token-lifecycle, signal:device-not-registered, signal:credential-binding
skip-when: signal:client-only-notification-change, signal:no-token-lifecycle-change
owns: NOTIF-RCP-M8, NOTIF-RCP-M9, NOTIF-RCP-M10
```

Scope: The credential band of the NOTIF-RCP-M family — the three highest-consequence rows of the receipt path: what happens to a rejected push credential, which status set counts as a successful PUSH, and the single cross-collection binding authority that owns a raw credential.

Document type: Normative part — NOTIF-RCP-M8–NOTIF-RCP-M10.

References: [README.md](README.md); [receipt-and-delivery.md](receipt-and-delivery.md) (NOTIF-RCP-M1–NOTIF-RCP-M7, NOTIF-RCP-N1–NOTIF-RCP-N2, the notification status model); [decision-gates.md](decision-gates.md) (GNOTIF2); [backend-dispatcher.md](backend-dispatcher.md); [security](../security/README.md) (SEC-M-LOG-2 — the credential-aware logging boundary).

---

## **MUST** — NOTIF-RCP-M (credential band)

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **NOTIF-RCP-M8** | When the provider returns a structurally validated invalid/unregistered-credential result, invalidate only the exact credential binding used for that send. Bind the notification intent to the credential owner identity and version before the provider call. Ticket and receipt cleanup **MUST** recheck that exact binding at write time so a concurrent credential rotation is preserved. If cleanup is asynchronous, persist a cleanup-pending outcome and reconcile it durably. Keep raw credentials and fingerprints inside the credential-protection boundary. | Stale-credential spam, deletion of a rotated credential, lost cleanup work, or credential disclosure. | Review the send-time owner binding, exact cleanup comparison, durable pending cleanup behavior, and redaction of logs/telemetry. |
| **NOTIF-RCP-M9** | Any rate-limit, cooldown, campaign-success, or similar decision about successful push delivery **MUST** consume the canonical status authority and the persisted provider-acceptance timestamp. Intent creation time **MUST NOT** stand in for provider acceptance time. A successful push record with missing or malformed acceptance time is an invariant failure; do not ignore or default it. | Inconsistent rate decisions or data drift. | Review the canonical success-state and acceptance-time derivations and confirm consumers do not carry duplicate success lists. |
| **NOTIF-RCP-M10** | If a credential is represented in more than one recipient record or index, maintain one binding authority that uniquely connects a protected credential fingerprint to its owner identity. Lifecycle changes such as registration, rotation, unregistration, invalidation, identity merge, and deletion **MUST** update the owner projection and binding atomically. A rebind **MUST** remove only the exact prior owner and **MUST** preserve a concurrently rotated credential. Reads that decide whether a recipient can receive push **MUST** use the validated binding, not mere raw credential presence. A binding **MUST** exist only while the client's single OS-permission reader last observed notification permission `granted`: the client acquires and binds a credential only after such a read, releases its own binding when a read is not granted (including a revocation seen on return to the foreground), and an anonymous-to-authenticated merge releases the installation's credential instead of adopting it. Provider acceptance without display permission is not delivery, and every capability, cap and channel decision reads the binding, so no second permission state exists. Do not expose raw credentials in public responses or logs. Retention **MUST** remove the owner record and binding together; independent expiry mechanisms that can orphan one side are forbidden. Migrations **MUST** support a non-mutating preview, reject ambiguous ownership, apply only exact recognized transformations, and verify the resulting binding invariants. | Security/architecture bug — duplicate owners, stale mutations, orphan bindings, or credential disclosure. | Review uniqueness constraints, lifecycle transaction boundaries, read authority, retention cleanup, and migration conflict handling for the selected database. |

Stated enforcement limit for NOTIF-RCP-M10: a stale-safe clear filter, the explicit session option, the lifecycle call before an owner-document delete, an object-assign credential write on a hydrated document and a hydrated single-document delete are generally not mechanically checkable without pinning the binding authority's internal shape; the single binding authority plus review hold them. A birth-time `null` initialization of the owner credential field writes no credential and should be exempted with that stated reason.

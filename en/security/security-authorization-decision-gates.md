# Security — authorization decision gate (SEC-D3)

```kit-cover
type: normative
part-of: README.md
binds: the SEC-D3 authorization decision and its SEC-D3-M rows -- server-side authz before a protected handler ships, proof before an irreversible identity act, ownership-gated retraction, a delete path that really deletes, and the scope resolver's verdict discriminant
open-when: shape:backend-heavy, shape:frontend-heavy, signal:security-gate-routing, signal:token-storage, signal:authorization
skip-when: signal:no-security-surface
owns: SEC-D3, SEC-D3-M1, SEC-D3-M2, SEC-D3-M3, SEC-D3-M4, SEC-D3-M5
```

**Keywords:** authorization, authz, erasure, retraction, delete, scope resolver, irreversible identity act

Scope

- Included: SEC-D3 authorization: SEC-D3-M1 documented server-side authz, SEC-D3-M2 proof before an irreversible identity act, SEC-D3-M3 ownership-gated retraction, SEC-D3-M5 a path labelled *delete* deleting the record it names, SEC-D3-M4 the scope resolver's verdict discriminant.
- Excluded: token validity, refresh-vs-logout and the GSEC1–GSEC6 gate index, which stay in [security-decision-gates.md](security-decision-gates.md) — the two files are the complete SEC-D band set.

Environment: Applies to authenticated client-server flows (mobile, web, API handlers deciding who may read, write or withdraw a record).

Document type: Normative — the SEC-D3 table and its SEC-D3-M rows.

References: [Decision gates](security-decision-gates.md) (SEC-D1, SEC-D2, GSEC1–GSEC6; GSEC3 routes here); [Governance](security-governance.md); [Backend controls](security-backend-controls.md); [Actor-class gates](security-actor-class-gates.md) (SEC-M-ZT-6); [Retention-window authority](../repository/repository-retention-and-irreversible-operations.md) (REP-M-22 and its reading note); [Irreversible-operation evidence](../repository/repository-irreversible-operation-evidence.md) (REP-M-23).

---

## SEC-D3 — Authorization (authz)

| Question | If YES | If NO |
|----------|--------|-------|
| Server-side role, tenant, or resource-ownership check defined for this resource? | Client is UX only; the server decision is authoritative | STOP — endpoint **must not** ship without authorization |
| A delegated actor accessing a subject-owned resource? | Apply the project's single delegated-access decision ([SEC-M-SUBJ-1](security-subject-owned-resource-access.md)) | Deny with a documented authorization outcome and record the attempt where policy requires — [backend controls](security-backend-controls.md) |

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-D3-M1** | **Must not** release a protected resource handler without documented server-side authorization matching the SEC-D3 table. | Release blocked / security defect. | Route-to-handler review and runtime evidence. |
| **SEC-D3-M2** | Before an irreversible identity act, **MUST** call the new identifier's possession-proof authority on the same request path, bind its result and raise on failure before acting. A caller-supplied `verified:true` or an unread verification result is not proof. If the old identity is resolved through email, recovery code or operator input rather than the session, **MUST** consume that channel's proof too. The type documents a precondition; it cannot manufacture runtime evidence. | Security bug — account takeover; the act is irreversible and the legitimate owner's channel is gone | Single-file AST rule over the *call sites* of each irreversible act (never its declaration): a verification call whose result is bound and whose falsy branch raises, positioned before the act by source order; enclosing-function proof accepted; the second-channel proof required whenever the identity is resolved by that channel. |
| **SEC-D3-M3** | Withdrawal of the subject's own rating/review/report/consent **MUST** depend only on ownership, never on the present relationship that governed creation. Otherwise the counterparty can remove that relationship and lock the author's record. A natural-key delete whose subject is resolved from the authenticated session is an ownership gate; absence retains the registered not-found result. Removing eligibility **MUST NOT** remove identifier validation: lift any embedded shape validation to one exported definition shared by create and withdraw. Client controls **MUST** offer withdrawal whenever the subject's record exists, even when creation is no longer eligible. For per-read aggregates, deleting the row is the correction; **MUST NOT** add a second counter writer (SSG-M17). | Bug — a person loses control of their own data (erasure right), and a counterparty gains a lock over a record they did not author | Review. |
| **SEC-D3-M4** | A scope resolver **MUST** return a discriminated denied-or-scope result; an empty filter may mean unrestricted scope and **MUST NOT** imply denial. Translate impossible-match predicates to denied once at the same authority, never by a caller's array/object/emptiness heuristic. The tagged type rejects the old inference. A 200 empty response with no failure signal can still be an access defect; compare the authority with the contradictory screen consumer rather than fabricating display data. | Bug — the most privileged actor silently sees the least data, and one screen states two different truths | Type-level: the resolver's return type is a discriminated union, so an emptiness-inferred verdict fails to compile. Review covers the boundary translation in (b). |
| **SEC-D3-M5** | A path labelled delete **MUST** destroy its content record; a hide/archive/dismiss path **MUST** use the matching verb in surface, route, handler and persistence function. Before retaining a row as operational/idempotency evidence, **MUST** measure its current readers, predicates and selected population; a stale reader is not justification. A native retention window is not permanence ([REP-M-22](../repository/repository-retention-and-irreversible-operations.md)). If evidence has a live reader, separate it into its own authority/shape/window so the subject can delete content (SSG-M8). Real deletion removes obsolete visibility predicates, fields and wrappers in the same change (DCD-M2); hiding **MUST NOT** destroy the row either. | Bug — a person believes their data is gone while every derivation still reads it; the erasure right is defeated with no failure anywhere, and the unmeasured evidence claim outlives the reader it was written for | Static: a single-file AST rule reports a function whose name carries a deletion verb and whose body only delegates to a hide/archive-named callee or writes a visibility-marker field, with no deletion call anywhere in it. Evidence: the reader count in (a) and the population behind it are measured against the live store and recorded as an observation, never used as a gate ([REP-M-23](../repository/repository-irreversible-operation-evidence.md)). |

Verification boundaries: SEC-D3-M4's tagged type prevents emptiness-based inference; resolver purpose and denied-filter translation require semantic review. SEC-D3-M3's authorship and client/server eligibility alignment are cross-flow semantics, not delete-call shapes. SEC-D3-M5's single-file deletion-name/hide-only predicate does not cover route/catalogue/wire labels, live reader populations or whether a record is system evidence; review those boundaries separately.

---

Part of: [README.md](README.md).

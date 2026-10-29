# Appointment state machine (normative)

```kit-cover
type: normative
part-of: README.md
binds: TR-1 to TR-3, TR-5 and TF-1 to TF-2 -- the two lifecycle states, every named transition and forbidden pair, what an extension amendment must define before new states ship, and the one sanctioned human reopen path
open-when: shape:backend-heavy, signal:appointment, signal:recurrence-group, signal:customer-package, signal:appointment-lifecycle, signal:appointment-status, signal:state-machine
skip-when: signal:no-appointment-write, signal:client-only
owns: TR-1, TR-2, TR-3, TR-5, TF-1, TF-2
```

Scope: The lifecycle state machine of an appointment — states in scope, named transitions, forbidden transitions, the contract an extension amendment must satisfy, and the documented human transitions.

Document type: Normative part — TR-\*, TF-\*.

References: [README.md](README.md); [appointment-lifecycle-standard.md](appointment-lifecycle-standard.md) (APL-C\*, APL-D\*, APL-F\*, GAPL\*); [appointment-lifecycle-must.md](appointment-lifecycle-must.md) (APL-M\*); [appointment-lifecycle-must-not.md](appointment-lifecycle-must-not.md) (APL-N\*).

---

## Appointment state machine (normative)

### States (in scope)

| State | Meaning |
|-------|---------|
| pending | Not yet completed by lifecycle rules; eligible for Expired transition. |
| completed | Terminal for lifecycle automation in this standard. |
| cancelled (optional) | A product-defined terminal cancellation state. Its economic and resource effects are owned by the product's corresponding domain rules. |

### Transitions (named)

| ID | From | To | When | Rule IDs |
|----|------|-----|------|----------|
| **TR-1** | pending | completed | GAPL2 YES and GAPL4 YES and GAPL6 YES (when cancelled exists in schema ) | APL-M5, APL-M6, APL-M7 |
| **TR-2** | pending | completed | GAPL1 is YES at create time (initial persist) | APL-M2 |
| **TR-3** | completed | completed | Any trigger fires again for already completed | APL-M7 (idempotent no-op) |

### Forbidden transitions

| ID | From | To | Rule |
|----|------|-----|------|
| **TF-1** | completed | pending | APL-N2 — **MUST NOT** demote completed → pending via automation or silent repair. |
| **TF-2** | completed | completed with duplicate side effects (e.g. second notification for same create event) | APL-N5, APL-M7, APL-M13 |

### Extension amendments (normative)

Amendments referenced by APL-C3 **MUST** be written artifacts (architecture doc or addendum to this standard in the adopting project) that define all of the following before new states or transitions ship :

| Requirement | Content |
|-------------|---------|
| State set | Every lifecycle state in scope (including terminals ). |
| Allowed transitions | Explicit from → to rows (or table equivalent ). |
| Forbidden transitions | Explicit forbidden pairs (e.g. completed → pending remains forbidden unless amendment documents a human / admin -only path ). |
| TR-1 interaction | For each non-pending terminal , whether TR-1 auto-complete is suppressed (same role as GAPL6 for `cancelled` ) and any additional gates. |

APL-N8 remains : must not infer extension behavior from this file alone.

Cancelled (example ) : TR-1 **MUST NOT** run when GAPL6 is NO (APL-N7). `cancelled` → `completed` is not defined here unless an amendment adds named transitions (e.g. TF-3 / TR-4 ).

### Human transition matrix (product-specific)

For a human-edit endpoint, define a complete directed transition matrix for the adopted lifecycle states. Include no-op pairs, forbidden pairs, actor permissions, and any related resource or financial effects; the diagonal is a no-op, and every rejected pair returns a registered business-class refusal before persistence. Keep client choices derived from the same contract while the server remains the write authority. Terminal states stay terminal for the ordinary edit path, so a terminal record cannot silently regain a slot, an entitlement or a payout. TR-1 applies only to `pending`. The matrix decides transitions only; the economic columns of each transition belong to the product's domain rules, not a second copy here.

If an edit changes the status or the scheduling fields of a completed item, document whether the new start must remain in the past and enforce that rule atomically with the write: compare the resulting start against the owning timezone and the single `nowUTC` source (APL-D5/GAPL1) in the same transaction, so a historical correction stays distinct from a dedicated future reschedule. A date picker does not silently change status. Group operations must apply the same checks to every affected item, not only the initiating one: a pending initiating member does not exempt a completed sibling, and the read of completed siblings and the group write share one transaction snapshot.

Implementation guidance: A system adopting this amendment should identify one exhaustive transition authority and apply it at every write boundary before persistence, including before an idempotency claim where one is used. When a transition has temporal preconditions, enforce them in the same atomic unit as the write. Keep same-state edits distinct from transitions: the diagonal permits non-status edits without inventing a transition.

### TR-5 — Optional amendment: human reopen

A product may define a named human-initiated transition that reopens a completed item (TR-5). Document the actor authorization, required scheduling changes, effects on dependent entitlements or financial records, idempotency, and interaction with automatic completion. Keep it on a clearly designated write path; do not let background automation or ordinary edits silently reverse completion (TF-1, APL-N2: this is the documented human workflow that APL-N2 Verify names, never automation). The reopen reschedules the item to a strictly future start (an unexpired end is insufficient: an item that has started cannot become future pending), reverses any dependent side effects in the same atomic unit, and after it GAPL2 is NO until the new end instant passes, so TR-1 re-completes it normally with no suppression flag.

- Slot occupancy: a reopened item is new occupancy and MUST pass the same atomic slot claim as every other writer entering a blocking status ([transaction conflict materialization](../transactions/transaction-conflict-materialization.md)); a user-acknowledged conflict skips the claim like everywhere else.
- Other edits: the reopen request MUST also carry the record's other edits it can write atomically through the ordinary field writers in the same unit; fields it cannot write MUST be named to the user before confirming. A save path that reports success while discarding edits is a defect.
- Confirmation text: it MUST match the real effect. Wording about reverting a dependent period is conditional on that period existing, and the client never derives its existence itself (the server does).
- Shared state: if state is shared across application tiers, derive all accepted values from one runtime schema ([monorepo MRP-M13/MRP-N9](../monorepo/monorepo-rules.md)); persistence, input and UI consumers MUST NOT restate the set.
- Client preflight: a client choosing between the reopen endpoint and ordinary edit by whether a proposed slot is future MUST convert the local date and time through the owning IANA timezone and the same UTC conversion authority as the server (APL-D3). Device-local `Date` parsing is not a valid decision input.

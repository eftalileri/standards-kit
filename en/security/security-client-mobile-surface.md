# Client mobile surface (screenshot / recording, secret-store access class) -- normative

```kit-cover
type: normative
part-of: README.md
binds: SEC-M-MOB-S1 and SEC-M-MOB-N1 -- the optional screenshot and screen-recording hardening for screens that display tokens or PII, and what it must not be used to replace; SEC-M-MOB-M1 -- the dismissal surface of a client consent gate that is the only capture point for a regulated decision, and how a once-per-device decision survives on a platform whose secret store is memory only; SEC-M-MOB-M2 -- how an exported OS entry point authenticates a code or credential another app hands in; SEC-M-STORE-4 -- the at-rest access class every platform secret-store entry carries, its single authority, and how an entry written without it is migrated, and which binary's runtime behaviour counts as evidence about the store; SEC-M-STORE-5 -- the gate a persistent device identifier is written under, why a transfer rule does not discharge it, and what a closed gate must not substitute
open-when: shape:frontend-heavy, signal:sensitive-screen, signal:screenshot-protection, signal:token-storage, signal:analytics-attribution, signal:consent-capture
skip-when: signal:backend-only, signal:no-sensitive-screen
owns: SEC-M-MOB-S1, SEC-M-MOB-N1, SEC-M-MOB-M1, SEC-M-MOB-M2, SEC-M-STORE-4, SEC-M-STORE-5
```

Scope: Optional hardening for screens showing sensitive data (tokens, PII ) — extends [security-governance](security-governance.md) threat model without replacing [SEC-M-STORE-1](security-secrets-and-logging.md) (token storage ). Also the device-bound access class of the platform secret store that SEC-M-STORE-1 names as the token's home (SEC-M-STORE-4), and the gate under which a persistent device identifier may be written to that store at all (SEC-M-STORE-5) — SEC-M-STORE-4 governs *how* an entry is written, SEC-M-STORE-5 *whether* it may be written yet. And the client surface that captures the decision those gates read (SEC-M-MOB-M1): where the subject's yes or no is recorded, a dismissal is not an answer.

Document type: Normative part file under [README](README.md).

References: [security-secrets-and-logging.md](security-secrets-and-logging.md); [security-client-transport.md](security-client-transport.md); [security-outbound-data-transfer.md](security-outbound-data-transfer.md) (SEC-M-XFER-1 — the *transfer* leg SEC-M-STORE-5(b) says does not discharge the storage leg).

---

## **MUST**

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-M-MOB-M1** | A consent surface that is the only capture point for a regulated decision offers no way past it except an answer, and no dismissal writes the record. (a) What it covers: a client surface whose purpose is to record a subject's yes or no about a regulated act — sharing personal data with a third party, tracking, profiling — and behind which the product continues. (b) A dismissal that writes the record is the mirror image of a silent write, and the same defect. Back gesture, swipe-to-dismiss, tap-outside, a close affordance: none of them is a choice, so whatever the handler writes — *including the protective value* — the stored record then states a decision the subject never made. The direction does not redeem it; the record's only job is to say what the subject chose. (c) Removing the dismissal path does not lose the safe default, because the absence of a record **must** already read as the protective value at every consumer. If closing the path would lose it, the dismissal handler was carrying the default and the default belongs at the readers, not at the surface. (d) Both answers are reachable and each says what it does. A surface carrying only the permissive action is not a decision point but a toll gate. A label promising deferral while writing a permanent answer is the dark pattern inverted and is equally forbidden — unless the answer is genuinely reversible elsewhere and the surface says so. (e) Blocking **must not** become locking. The write can fail; the surface then shows the failure and lets the subject retry or choose the other answer. A refusal whose write failed **must** still let the subject past for the rest of the process: the subject did answer, nothing is written, the absence of a record already reads as the protective value (c), and the surface asks again on a later opening — so a lost network can never trap the subject behind a "no". A permissive answer is never let through on a failed write. The surface never fabricates a local or session answer to let the user through — that is SEC-M-STORE-5(d)'s forbidden substitute applied to a decision — and it never leaves the subject facing a surface that looks frozen: the wait is bounded by a transport timeout and is visible while it lasts, and every failure shown on the surface reaches the crash channel (COB-RN-N8). (f) Blocking raises the accessibility floor, it does not lower it. The surface takes screen-reader focus on open and keeps it within itself; a gate that cannot be dismissed *and* cannot be reached by a screen reader is not strict, it is broken. (g) A decision asked once per device **must** be asked once on every platform the surface ships on, a browser included: a surface that asks again on every page load because its proof lives in page memory treats a made decision as never made. The "asked" marker identifies no one and lives in the platform's plain persistent storage; a credential-class proof that page storage may not hold (SEC-M-STORE-2(a)) is read back at load from the server, which keeps it in a server-set HttpOnly cookie — never from a page-readable copy — and nothing is read back while a sign-out still waits for the server, since the cookie may be the previous person's. Check reach: a single-file check proves the surface's own dismissal props are absent and that its visibility is a constant rather than local state; it cannot prove that no *other* path hides the surface, because that is data flow through the component's early return, nor that both answers are reachable, which is a property of the rendered labels. Those halves are review, as is (g), a property of where each platform's decision lives. | Critical privacy bug; the stored record states a decision the subject never made, or the subject cannot reach the decision at all. | Where a static source check can safely recognize dismissal props and a non-constant visibility flag on the capture surface, use it for those shapes and state its limits; reachability of both answers, the bounded wait and the focus behaviour are review. |
| **SEC-M-MOB-M2** | An exported OS entry point (Android broadcast receiver or activity) that accepts a code or credential from another app accepts it only when (a) the sender is identified by an OS-attested value — the creator package of a `PendingIntent` the sender created and attached, or an unguessable per-request id (a random UUID) the app sent only to the expected package through a package-scoped intent and that comes back unchanged — never by a static or guessable extra, and never by a check the provider's documented contract does not deliver (that check rejects every genuine answer), and (b) the app itself opened that request and it is still within its validity window, each request yielding at most one accepted value; anything else is dropped without effect, and a refusal while a request is open is reported with a closed reason. Where the provider ships an official client library for that handshake, the request and the per-request id check go through it rather than a hand-made copy of its intent contract, and every library error maps into the closed reason set. A `PendingIntent` the app hands to another app as its identity is `FLAG_IMMUTABLE` on every API level, also when that library builds it (override the library's builder). Reason: every installed app can address an exported component, so an unauthenticated entry point lets any app write into the app's input; a hand-made copy silently drifts when the provider changes or deprecates the contract; a mutable identity lets its holder fill in a data URI and URI-grant flags and start its own activity as the app. | Security bug; another app can inject values into a verification input or replay a stale one. | Review of the entry point's validation function against the provider's current contract; device check that an intent with a wrong or missing request id, without an open request, or a second one for the same request fills nothing. |
| **SEC-M-STORE-4** | Every platform secret-store call carries one device-bound access class, read from one authority. (a) Class: readable after first unlock, this device only — never a library default when that default is backup-migratable (a "when unlocked" default on iOS is), because a replayable credential restored from a backup onto another device is the threat model's named *backup* theft vector (TM-2). "After first unlock" keeps background wake-ups working; "when unlocked" would not. (b) One authority: the options value lives in one module and every read, write and delete passes it; a per-store copy of the class decision is a parallel authority (SSG-M8). (c) An existing entry is not re-classed by passing the option later: a store may apply the class only when it *adds* an item and only update the *value* of an existing one (verify the actual platform and library behavior: add carries the class, a duplicate may fall back to a value-only update, lookup may ignore the class). An entry written without it therefore needs an explicit, versioned one-time migration — confirm the entry still holds the hydrated value, delete, add with the class, read back, record a marker; on failure re-add the same value and leave the marker unset so the next launch retries — never leave the user without the credential. (d) A hydration read that fails is not "absent": until the persisted record was actually read (or a new credential written) in this process, a persist write carrying a null credential **must not** delete the stored credential nor overwrite the persisted profile, and the terminal logout step then clears both with proof. (e) Runtime evidence about the store, and about every surface keyed by it (encrypted at-rest stores, the session credential, scope-retirement purge proofs), counts only from a binary that carries its entitlements: a physical device, or a simulator build signed to run locally (its executable has a `__TEXT,__entitlements` section). A build made with code signing disabled has no keychain — every call fails with the missing-entitlement status (iOS `-34018`) — so its failures are not product defects, and neither its passes nor its failures are evidence. Platform limit: the access class is iOS-only; Android's store does not model it. Check reach: static analysis proves only that each call passes the imported authority constant; that the constant's value is correct, and that migrations ran on devices, are review and runtime evidence. | Security bug; a replayable credential migrates with device backups, or a transient read failure silently destroys the session. | Static call-site check where the adopting project has one, platform documentation review, and migration review/runtime evidence. |
| **SEC-M-STORE-5** | A persistent device identifier is written to durable storage only under the gate that makes the writing lawful, and that gate is one authority every call site asks. (a) What it covers: a value that outlives both the process and the session — an installation id, a device id, a measurement key — and that can later be joined to an account or to a person. *Producing* the value is not the regulated act; persisting it is, because persistence is what makes the later join possible and what survives the user's next decision. (b) A transfer rule does not discharge a storage obligation. Where the rule in force governs what may be sent to a third party and is silent on what may be kept on the device, the storage leg is unwritten: a path that is correctly gated on dispatch and ungated on write satisfies one rule and breaks the other, and the audit that only follows outbound calls will never reach it. When a jurisdiction gates storage separately, the storage gate is written separately — pointing at the transfer rule is not a substitute. (c) One authority, asked — never re-derived at the call site. The predicate (feature state, jurisdictional regime, recorded permission) lives in one policy authority and every writer calls it; the same question answered in three files is the classic parallel path and drifts on the first file someone forgets (SSG-M8) — the measured failure mode is not a wrong answer but a missing one, a third call site that never asked. The gate is not folded into the producing function: that function's contract is "produce or read the value", and putting policy inside it turns one function into several silent behaviours. (d) Gate closed means no value. The identifier is neither produced nor transmitted. A session-scoped or otherwise substituted identifier is a fabricated value and is forbidden: it is still an identifier at the receiver, and it destroys the very counting it claims to preserve, since each launch invents a new one. (e) The price of (d) is declared where the gate is defined, not discovered later. Where closing the gate loses a signal that can only be captured at one instant, write that loss down next to the gate: the later symptom is a metric that reads zero, which is indistinguishable from "it never happened" and will be diagnosed as a bug in the wrong subsystem. The same applies to a fail-safe default — if an unreadable jurisdiction closes the gate, say so, or the safe direction becomes an unexplained outage. Check reach: static analysis proves that a call site asked the gate; it cannot prove the gate's predicate is the right one — that the boolean really derives from the regime authority instead of a copy of it. That half belongs to the rule forbidding a parallel regime table, and neither half is sufficient alone. | Critical privacy bug; a regulated identifier is created on the subject's device before anything authorised it, and every later join is built on that record. | A call-site check that forbids calling the persisting authority from a file that does not ask the gate, where the adopting project has one, plus a check against a parallel regime table for the predicate; the predicate's correctness is review. |

---

### SEC-M-STORE-5 application — durable purpose proof and timing

Where a persistent identifier has its own purpose permission, that permission is not inferred
from advertising consent, a system permission, a jurisdiction's notice regime or the feature
flag. One persisted read authority supplies validated purpose/version/lifetime evidence to
the single policy gate; its asynchronous read failure closes the gate. The producing function
keeps its separate produce/read contract and takes no hidden policy branch. A closed gate
applies before generation, durable write, transmission and account join; a pending withdrawal
closes the local gate before the remote write, and a failed write never reactivates permission.

An automatic lifecycle effect never asks and never treats a missing answer as permission:
without proof it skips silently. The question is asked only on a dedicated decision surface
before the first identifier operation — a concrete user-initiated flow that needs the
identifier, or, where the product owner chooses it, a one-time launch question. A launch
question offers two answers of equal visual weight, restricts nothing on refusal, says where
the choice is changed later, records through the same single decision writer, and is asked
again only when no explicit choice was ever settled on that device. A refusal never traps the
user: it closes the question even when the write cannot reach the server, because the local
gate is already closed; an unsent grant reopens the question so the same pending command is resent (a "this device answered"
marker carries no identity, so scope retirement keeps it). A grant made there lets the
automatic effect retry in the same session; the effect still asks the single gate. The proof's purpose,
version and lifetime are explicit; expiry never renews permission automatically. A delayed
grant cannot overwrite a later refusal: decision writes compare a durable revision. A lost
response is reconciled by a read, never by fabricating a decision. The identifier's ownership
is bound both ways to the permission capability, and that ownership survives any measurement
record whose later account join remains possible; a fresh grant does not authorize claiming
a known identifier with someone else's installation context.

The shared contract, runtime gate, immutable ownership and database constraint already reject
an unproved join, so a second checker fails ENA-A1(c). Existing producer-call gate checks cover
only their stated syntax and are not proof of these semantics.

Withdrawal and activation ordering: an ingress permission read is not the authority for a
later database effect. The effect's actual atomic unit reads and claims the same proof row, so
it serializes with the explicit withdrawal command; every joined read/write carries that unit's
session. A contextual enable that promises account-linked measurement joins the existing account
writer in that same unit and resolves the current actor there. An absent real relationship is a
readiness refusal before capture, never a fabricated tenant or actor class. Repeating an already
linked capture preserves the original event and fixed account; another account cannot relabel it.
A saved permission and successful activation are separate facts, and the UI reports them honestly.
Credential-bearing decision endpoints apply no-store before early auth/rate/replay exits.
There is no atomic transaction across database effects, rate budgets and already-started native
calls: accepted in-flight work may finish. Declare that boundary instead of promising reversal.

Retirement is not a preference keep: a purpose capability or identifier tuple that can
reidentify an account is personal scope data even under a constant storage key (MMR-M8/M13).
The central retirement entry synchronously closes its generation before any await, rejects
new choices while purging, drains queued native writes, then deletes and reads exact absence
of proof and identifier. A protective negative marker is deleted last, only after those
absence proofs. Failure remains blocked and returns the existing proven-purge failure shape;
success permits a new explicit choice, never restores permission. Declare the resulting new
measurement-context cost and preserve historical identities/server decisions. Existing
disposition enforcement proves reachability; asynchronous ordering and native absence remain
review/runtime obligations, not a new checker or cross-system atomicity claim.

## SHOULD

| ID | Rule |
|----|------|
| **SEC-M-MOB-S1** | When the product requires it, use platform APIs (e.g. Android `FLAG_SECURE`, iOS privacy patterns ) to reduce screenshot / screen recording exposure on designated screens — document the affected surfaces and platform limits in the project's security or architecture documentation. |

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **SEC-M-MOB-N1** | **Must not** claim “ screenshot-proof ” without platform review (OS / MDM ) — document limitations. |

# Idempotency — what a replay must re-prove before it returns a stored success (IDEMP-M16–IDEMP-M17)

```kit-cover
type: normative
part-of: README.md
binds: current replay authorization, stored subject and intent, client intent-key lifecycle
open-when: shape:backend-heavy, signal:mutation-endpoint, signal:idempotency, signal:webhook, signal:provider-integration
skip-when: signal:client-only, signal:read-only-endpoint
owns: IDEMP-M16, IDEMP-M17
```

Part of [the topic index](README.md).

References: [Idempotency SSOT](idempotency.md); [key-scope-and-replay-contract.md](key-scope-and-replay-contract.md); [boundary-stores-and-provider-callbacks.md](boundary-stores-and-provider-callbacks.md); [idempotency-prohibitions.md](idempotency-prohibitions.md).

---

<a id="must-normative--idemp-m16-to-idemp-m17"></a>

## Replay authority and intent — [IDEMP-M16–17](replay-authorization-and-intent-binding.md)

**IDEMP-M16**: Every authenticated mutation request, including completed replay, **MUST** pass current authentication, tenant access/membership and route capability before stored success returns. Order: authentication → schema-normalized target → current authorization preflight → claim/replay → handler. Publish one typed request-local verified actor/scope context and reuse it exactly; the prior record is never current authorization.

IDEMP-M16 credential-response recovery clarification: A retired signed token plus old key/fingerprint cannot authorize stored credentials. Immediately before credential-bearing replay, freshly re-prove the initiating current session through the existing authentication authority; a stale auth cache or validating the stored credential is insufficient. Use its session policy and one opaque request-local proof, never a parallel JTI/status map. Without a current initiating session or existing independent current recovery proof, reject the old request and use the existing fresh-auth flow without rerunning mutation/provider work; state automatic versus fresh-login recovery. A recycled original identifier's fresh session does not prove ownership of transferred-target credentials. Without independent target-bound proof, reject credential-bearing origin-scope success with registered business conflict while preserving its legitimate current session and noncredential error replay. **MUST NOT** infer target ownership or invent a taxonomy. The auth-policy/proof API is stronger than a syntax fence; trace producer → guard → stored return across modules.

**IDEMP-M17**: If the physical unique identity omits subject/intent facts, completed records **MUST** persist exact normalized subject plus versioned canonical mutation-intent fingerprint. Use schema-validated side-effect inputs after canonical trimming, omission/null/enum/note/money normalization, including selectors outside the unique key. Raw JSON order or a selected body subset is insufficient; a digest needs at least SHA-256 strength. Early, in-unit and duplicate/race replay all recompute through one authority and exact-match both. Missing legacy metadata fails registered conflict/invariant unless an audited durable migration proves the exact facts; **MUST NOT** fabricate/backfill guesses.

IDEMP-M17 client intent-identity clarification (normative):

- (a) Body-derived keys identify payload rather than user intent. A create after deletion or a transition returning to a prior value can be a legitimate new action inside retention. Creates and transitions therefore use the shared random per-intent issuer; **MUST NOT** use subset/body digests, counters, nonces or screen/process suffixes as a substitute.
- (b) Per-call keys defeat retry/double-submit protection. Mint once per intent and reuse unchanged for retries. Retire only when the response proves completion, including acknowledgeable non-success statuses that seal. An acknowledged amended body is a new intent/key even when refusal released the row, because some stores compare retained fingerprints before state. Inspect that actual claim order; only unchanged-body retry retains the key.

Any project check on local key-construction shapes does not cover the full lifecycle; record its actual scope and limits.

IDEMP-M17 fingerprint-blindness clarification (normative): For aggregate-scoped keys, enumerate every fact that can distinguish legitimate events; each **MUST** be in the scope or canonical fingerprint. Omission from both silently drops later events. Every emitter uses one scope producer. An aggregate→event key change is a migration: state which producers can re-emit and evidence bounding one-time duplication; explicitly state an unmeasurable population. A project check on the named scope authority covers only that authority.

IDEMP-M17 outbox key migration clarification (normative): Retrying stored rows **MUST** preserve their originally applicable notification-key form until an IDEMP-M31 sunset proves old lookup paths unreachable. Where forms coexist, carry a durable discriminator outside the immutable payload digest; missing form has an explicitly defined legacy interpretation. Deploy compatible readers first and prove old workers exited before enabling new writers. New event-form rows use one event identity for outbox/notification scope; an aggregate gate **MUST NOT** override recipient/event identity. Payload/event equality and worker overlap require live evidence. A completed form migration does not require retaining its obsolete discriminator.

IDEMP-M17 client canonical-intent lifecycle clarification (normative): Compare normalized JSON body and exact target synchronously before sending; send that exact parsed body. Use the server's canonical key ordering, preserving array order. Changed body/target starts a new random intent. ACK retires only its matching intent/key, never newer in-flight work; released wire keys and server fingerprints retain their format. Exception: where the server derives the created record's identity from the key, a failure that may have left a record born under it (no response, a SYSTEM code, a born-but-incomplete code, a competing in-flight claim) **MUST** keep the exact sent body and key, bound to its subject, beyond the screen/hook lifetime, and the next attempt **MUST** resend that body rather than an edited one; only a sealed success or a registered permanent refusal of the intent itself retires it — a new key would birth a second record. A transient (`retryable`) or unauthenticated refusal **MUST NOT** retire it: it describes only that attempt, not an earlier one under the same key. When the resent body differs from what the user submitted, the success feedback **MUST** say the record was completed with the earlier details — never diverge silently. Where the kept intent does not survive a process restart, the server **MUST** recognise the subject's unfinished record from stored facts (not timing) independent of the key, inside the birth unit as a TX-M-23 claim, complete it instead of birthing a second one, and tell the client it was completed with earlier details: a restarted client's new key otherwise derives a new identity.

A dependent multi-command operation gives each sub-command a scoped key and retains completed keys until whole-batch success. Destructive removal needs same-unit durable target-scoped claim/replay or server version predicate: after an unknown outcome a recreated target **MUST NOT** be deleted by unkeyed retry. Carry original keys until whole-batch success. Trace route/store order through the client; no local AST proves that relation.

Independent parallel creates instead discriminate each semantic row before its first request-side await, even when sharing a hook. The shared random issuer supplies keys bound to that row's normalized body/exact target. ACK clears only that row/intent/key; preserve prepared keys while other rows complete, and never let old ACK clear newer intent. **MUST NOT** use body-digest row identity, mint per-submit keys or expose private row identity in logs/storage/wire. The typed command/issuer API is stronger than an additional syntax fence.

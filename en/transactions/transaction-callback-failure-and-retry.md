# Transaction callback failure and retry ownership

```kit-cover
type: normative
part-of: README.md
binds: callback versus commit failure, transient retry ownership and request deadline
open-when: shape:backend-heavy, signal:multi-step-write, signal:db-transaction, signal:session-threading
skip-when: signal:client-only, signal:single-document-write
owns: TX-M-11
```

Part of [the topic index](README.md).

References: [Transaction policy](transaction-policy.md); [Security logging](../security/security-logging-core.md); [Repository contract](../repository/repository-contract.md); [Error policy](../error-policy/error-policy.md).

---

<a id="must"></a>

## Driver failure and retry — [TX-M-11](transaction-callback-failure-and-retry.md)

**TX-M-11**: Driver-retried callbacks and their owner **MUST** retain these boundaries; the driver retries only its native error identity carrying its transient marker:

- (a) Bind every caught driver failure (`catch (error)`, never a parameterless catch), preserving numeric code, code name and transient marker; never swallow it.
- (b) When wrapping a driver failure, carry its transient/retryable marker forward as an allowlisted structural fact on the typed result, never raw `message`/`stack`/`cause`. Recognize the marker through the single driver authority, never text heuristics.
- (c) If conversion to an application-typed error removes driver-owned retry, the caller owns bounded whole-unit retry below its client timeout, carrying the structural classification from (b).
- (d) Retry fresh snapshots with repeat-safe work; no stale attempt state.
- (e) Exhaustion has a distinct registered retryable class, not persistence-defect noise.
- (f) Distinguish callback-thrown failure from managed commit/abort failure; reset the callback failure marker on every invocation and sanitize only the owned boundary.
- (g) A raw preserved marker gives retry to the driver, without a second caller budget. Classify escaping failures at the unit owner through the shared driver-marker authority, never local code lists.

A session-bound shared seam propagates raw transient failures, including proved same-key insert contention, so the whole callback retries; it **MUST NOT** reconcile by querying an aborted session. Its explicit named no-transaction path keeps its registered wrapping; non-transient errors wrap on either path. One helper owns raw-versus-wrapped selection; a known wrapped carrier retains its driver fact for the unit classifier.

The service uses one managed runner, not manual commit retry. Use the enforcement mechanism the adopting project documents to reject manual `commitTransaction` calls and direct driver-runner use outside the managed runner's own module; record its actual scope and limits, since a reference to a check is not evidence that it exists or covers the full rule. The runner owns body/commit provenance and request deadline. Unknown commit classification precedes transient-exhaustion mapping; unknown outcome cannot be guessed rolled back.

Request retry budget uses the shared monotonic request start. The adopting project MUST choose and document a finite retry budget kept below the client transport timeout; background work without that clock retains the driver budget. The bound prevents starting a further callback, not a legitimately long first attempt or the driver's internal unknown-commit retry. A whole-operation timeout is not used as the bound because it can terminate a legitimate long attempt. A flow needing its own error mapping passes a typed hook to the runner rather than opens another lifecycle owner. Per-item plan CAS misses may remain item results; raw transient failures still leave the callback.

Best-effort steps: a result affecting persisted state or response joins the unit and cannot catch driver failure. Independent effects run after commit; an inner unit cannot nest inside the callback. Only registered typed application failures may use an intentional in-callback fallback; raw driver failures propagate. Existing published flow codes remain only where actual clients depend on them, rather than introduce a redundant mapper. Nonthrowing owners may use the same classifier's return form.

Where the adopting project documents a check, it holds marker authority. Whether an owner maps every escaping failure and whether a callee is independent require call-graph review.

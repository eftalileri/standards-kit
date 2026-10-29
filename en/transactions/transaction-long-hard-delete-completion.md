# Long hard delete: resume and completion (TX-M-12 application)

```kit-cover
type: normative
part-of: README.md
binds: server-owned resume, identity-only completion, actor receipt and final-unit child cleanup
open-when: shape:backend-heavy, signal:multi-step-write, signal:db-transaction, signal:session-threading
skip-when: signal:client-only, signal:single-document-write
owns: none
```

Part of [the topic index](README.md).

References: [transaction-contention-and-unit-scope.md](transaction-contention-and-unit-scope.md); [transaction-policy.md](transaction-policy.md); [transaction-long-hard-delete.md](transaction-long-hard-delete.md); [redis.md](../redis/redis.md); [repository-boot-readiness-prerequisite-proof.md](../repository/repository-boot-readiness-prerequisite-proof.md); [scheduled-work-liveness-and-outcome.md](../logging-policy/scheduled-work-liveness-and-outcome.md).

---

## Resume and completion of a long hard delete

The persisted closing decision **MUST** be eligible for a server-owned resumer even when the released client cannot retry. Worker and request share the executor. Use bounded indexed due scans, durable retry/backoff and renewable multi-instance leases; check loss before every write/effect. Malformed counters raise a system-class defect and receive a bounded durable next-retry time so they cannot starve later work. Partial batches never report success. Verify the exact due index at boot and every sweep: absence blocks that worker with a terminal named outcome while unrelated traffic stays available. Explicit migration installs it; boot must not create indexes. Existing scheduled-work/boot-readiness checks hold their own prerequisites, not the entire cascade.

Completion **MUST** be one identity-only parent predicate. Only actual absence proves success, because the final deleter owns removal. Owner/marker-filter miss is drift, never completion; ownership may change while closing. Report registered incomplete and resume from fresh parent. Authenticate requests before reading recovery state so unauthorized callers learn nothing. A project check may give the final parent delete solely to the closure repository; variable-carried models remain outside such a local predicate.

Lost response after final deletion **MUST** remain recoverable by the same actor without the removed ownership/role link: persist an actor-bound receipt of parent identity/time in the same final unit. Check it before ordinary role gate and at executor gate miss. Exact actor receipt returns original success; others retain ordinary forbidden/not-found. Keep receipts on the actor's own identity so privacy deletion cascades without another collection. Their window derives from the existing retention authority of the idempotency topic (IDEMP-M4); expired receipts are absent on read and removed on next write, with a per-row cap. Do not migrate them across actor identity changes: that boundary returns ordinary not-found.

Parent-fenced children **MUST** delete in the final parent unit rather than earlier. A racing creator then conflicts on the same parent and forces a fresh retry read. Child size remains bounded by TTL/per-parent maximum under TX-M-13. No second sweep/delete authority.

Five corollaries bind that final unit:

1. Audit/diagnostic child creators use the same fence. Missing parent is a named skip rather than SYSTEM; final deletion includes those rows.
2. Parent identity embedded in another record's recipient array is still a child. Remove that element in the final unit; a derived phone/pseudonym remains enumerable personal linkage.
3. Fence eligibility follows the parent's persisted identity shape, never a stricter mutable phone-validity predicate.
4. A multi-step bond-removal sequence that cannot join the final unit scans before it. Final snapshot asserts absence before its first write; if present, write nothing, rerun removal under a finite round budget, then report registered incomplete on non-convergence. Every creator increments a real shared parent fence on every attempt; conditional role promotion is not a fence. Account erasure and invitation acceptance share one identity-bond claim authority and fence counter, with a finite round budget the adopting project documents.
5. Single-write bond unlink joins the final unit. Every creator reads parent and bumps its shared fence inside its own unit only when the link changes; a sessionless creator gains a unit. Re-read pre-unit probes inside, treating missing parent as named skip. A hot sign-in probe with identical filter may skip opening an unnecessary unit, never authorize its write; a newly born row after an empty probe is handled on a later pass. Best-effort unit failure follows its actual registered log category. All bond classes share one counter, unchanged links do not bump it, and hot-creator contention is measured under TX-M-23(d).

Subject erasure deletes subject-bound notification rows, validation-log rows and batch-recipient array elements under the recipient identity fence, whose recipient predicate derives from the subject identifier's own shape authority. Removal of a directory record checks, in the same session, whether any record remains bound to the subject; unlinking a subject from a linked record goes through one de-identification authority, and every link writer consumes the shared identity-bond fence. The bond authority also orders identity migration. A field-name fence is not required: same-identity linkage already present on the row adds no personal data if the bump is missed, while helper/bulk/cross-file writes defeat the proxy. The shared authority and review retain the ordering obligation.

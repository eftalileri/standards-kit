# Execution: async batch, logging, idempotency (editable persistent attributes)

```kit-cover
type: normative
part-of: README.md
binds: EXE-C, EXE-M and EXE-N -- chunked bulk writes against the EPA-T thresholds, the ban on unbounded parallel batches, the non-awaited async trigger, logging minimums and idempotent replay
open-when: shape:backend-heavy, signal:editable-attribute, signal:mongo-cascade, signal:bulk-write-chunking, signal:async-job
skip-when: signal:no-denormalized-copy, signal:client-only
owns: EXE-C1, EXE-C2, EXE-C3, EXE-C4, EXE-M1, EXE-M2, EXE-M3, EXE-M4, EXE-M5, EXE-M6, EXE-N1, EXE-N2
```

Scope

- Included: Chunked bulk updates (**EPA-T1**, **EPA-T2**); forbidden unbounded parallel batch storms; async cascade trigger from HTTP or controller path (no await on cascade completion); logging minimums; error policy (SSoT not rolled back on cascade failure); idempotent replay job documentation.
- Excluded: Provider-specific logging configuration — see [logging policy](../logging-policy/logging-policy.md); application error taxonomy — see [error policy](../error-policy/error-policy.md).

Document type: Normative — part of `editable-persistent-attributes/` hub.

Decision gates: Applies — [decision gates](decision-gates.md) (GEPA3, GEPA4).

Environment: Applies to server-side batch execution, asynchronous work queues, and document-store write load.

References: [README](README.md) (**EPA-T1**, **EPA-T2**); [cascade engine](cascade-engine.md).

---

## Rule identifiers (normative)

| Prefix | Meaning |
|--------|---------|
| **EXE-C**\* | Agent execution contract. |
| **EXE-M**\* | **MUST**. |
| **EXE-N**\* | **MUST NOT**. |

---

## Agent execution contract

| ID | Rule |
|----|------|
| **EXE-C1** | This file is mandatory when implementing batch, async, logging, or failure behavior for cascade. |
| **EXE-C2** | Apply [shared **C4**](../_meta/agent-contract.md). |
| **EXE-C3** | Apply [shared **C2**](../_meta/agent-contract.md). |
| **EXE-C4** | STOP if cascade is awaited inside the HTTP request handler that serves the user edit (**EXE-N2**). |

---

## **MUST** — **EXE-M**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| EXE-M1 | When the estimated affected set exceeds the adopting system's **EPA-T2**, or a single bulk write exceeds its **EPA-T1** limit, cascade MUST use bounded chunks. Process chunks sequentially or with an explicit concurrency cap satisfying **EXE-N1**. | Timeout or write lock — bug / operational risk. | Review configured limits and ensure the bulk-write strategy respects both. |
| **EXE-M2** | Cascade triggered from the HTTP request path (controller or route handler) **MUST NOT** block the HTTP response on cascade completion — use fire-and-forget dispatch, detached promise with error logging, or job queue (**EXE-N2**). | User-facing timeout — bug. | Static review: no `await cascade(...)` in handler; optional lint rule. |
| EXE-M3 | Each cascade run MUST log through the application's established logging boundary ([logging policy](../logging-policy/logging-policy.md)), with the entity or attribute key, tenant identifier when applicable, and count of updated documents. | Unobservable failures — bug. | Review representative logs for the required context. |
| **EXE-M4** | If cascade throws or partially fails, the SSoT update **MUST NOT** be rolled back solely because cascade failed (align with [error policy](../error-policy/error-policy.md)). | Inconsistent policy — bug. | Test: forced cascade failure leaves SSoT commit intact. |
| **EXE-M5** | Incomplete cascade **MUST** be recoverable via an idempotent replay job or documented manual procedure (same logical inputs safe to retry without double-semantic harm). | Permanent drift — bug. | Runbook or job spec exists; replay tested once on fixture. |
| **EXE-M6** | A chunk loop whose own writes can change which documents its filter selects (the cascade selects by the OLD value and the write replaces it) **MUST** page by a total-order cursor — sort by a unique key and continue from `{ key: { $gt: lastKey } }` (for example `_id` ascending), keeping the caller's filter intact (`$and`). The key needs uniqueness and one total order shared by the sort and the `$gt` comparison; it need not be monotonic in insertion time. It **MUST NOT** page with `skip` / `offset`: each write shrinks the selected set, so the next offset jumps over documents that slid into the already-passed range and roughly half of a set larger than one chunk is silently never processed, with no error and a normal-looking updated count. The cursor also processes each document exactly once within one run, even when the new value still matches the filter (the new label contains the old one). It does not make a re-run safe: replaying the whole run after a partial failure is governed by **EXE-M5**, and a transform whose output still matches its own selector is not idempotent under replay. | Silent partial cascade — stale denormalized text, a user-visible defect with no signal. | Code review of the chunk loop: sort on a unique key + `$gt` cursor, no `skip(` / offset in the loop. |

**EXE-M6** check declined: the offset, the loop, the filter and the write sit in different files under the repository pattern, so no single file decides it, and a "no `skip` anywhere" lint is red on correct single-request list endpoints (**ENA-A1**(d)). It is a review obligation: for every chunk loop ask "does my write remove the document from my own filter?". A cascade that needs chunked paging reuses its domain's single chunk writer, never a second loop ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md)).

---

## **MUST NOT** — **EXE-N**

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **EXE-N1** | Must not schedule all chunks with unbounded `Promise.all` (no concurrency cap) when more than one chunk exists. | Write contention — bug / ops risk. | Code review: sequential `for` loop over chunks, or pool with documented max concurrency (for example 1). |
| **EXE-N2** | Must not await cascade completion inside the HTTP request handler that serves the user edit (**EXE-M2**). | Timeout — bug. | Grep handler for `await` on cascade function. |

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|-------------------|
| Cascade fails after SSoT success | **EXE-M4** + **EXE-M5**; log error per [error handling](../error-handling/error-handling.md) and [error policy](../error-policy/error-policy.md). |
| Affected document count unknown before run | Treat as above **EPA-T2** unless a count query proves otherwise — use chunking (GEPA3) or run count query first. |

---

Part of: [README.md](README.md).

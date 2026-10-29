# Logging policy (backend)

```kit-cover
type: normative
part-of: README.md
binds: the backend logging core — the agent execution contract, the selected structured logger, every MUST NOT prohibition, the level/routing table, the message and metadata shape, and the hosted-runtime rows
open-when: shape:backend-heavy, signal:log-write, signal:logger-wrapper, signal:hosted-runtime
skip-when: signal:client-only, signal:no-logging-change
owns: C1, C3, C4, C7, C8, C9, C10, N1, N2, N3, N4, N5, N6, N7, N8, N9, N10, N11, N12, N13, N26, N27, R1, R2, R3, R4, R5
```

**MUST** rows of this topic (the M family, banded): [logger-surface-and-levels.md](logger-surface-and-levels.md) (**M1**–**M14**, **M20**); [failure-level-and-channel-routing.md](failure-level-and-channel-routing.md) (**M15**–**M19**); [background-boundaries-and-sink-safety.md](background-boundaries-and-sink-safety.md) (**M21**–**M25**); [request-identity-and-bootstrap.md](request-identity-and-bootstrap.md) (**M26**–**M31**); [caught-error-text-proof.md](caught-error-text-proof.md) (**M32**). The **M21** watchdog/terminal-evidence/settlement clarifications are banded in [shutdown-watchdog-clarifications.md](shutdown-watchdog-clarifications.md) and define no new identifier. They are cited from here by ID, never restated. Non-binding tail: [logging-policy-appendix.md](logging-policy-appendix.md).

Bare-ID scope: an unlinked `C*` / `M*` / `N*` / `R*` id cited anywhere in this topic always means a logging-policy row, never a same-named id from another topic; the band that defines each one is listed in [README.md](README.md). Where another topic's bare id is meant, it is named with its topic (for example error-policy **M16** at **M15**/**M19**).

Scope: Backend operational logging: select one structured logger facade, choose levels, define safe structured fields, configure platform-compatible output (stdout/stderr, JSON), and integrate with [error policy](../error-policy/error-policy.md) failure paths. Client logging uses the same discipline (application logger, no raw `console.*` on operational paths) but browser transport is defined by the client stack — see [error handling](../error-handling/error-handling.md).

Environment: Applies to backend runtime logging and any hosted environment that consumes these rules (**M4**, **R1**–**R5**). Each consuming system documents its logger implementation, version baseline (**M1**, **M11**), output format, and platform-specific transport requirements.

Binding principle: This document is the single correct backend logging model for this kit. Standard = one valid path. Deviation = bug. Remedy: fix code or update standards first.

References:

- [Error policy](../error-policy/error-policy.md) — `rootCause`, `solution`, failure boundaries
- [Decision matrix](../decision-matrix/decision-matrix.md)
- [Gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md)
- [Editable persistent attributes](../editable-persistent-attributes/README.md) — cascade logging (entity, tenant, counts) where applicable

Code samples: [`../_meta/examples/logging-policy-code-samples.md`](../_meta/examples/logging-policy-code-samples.md) (non-normative).

---

## Agent execution contract

The shared [agent execution contract](../_meta/agent-contract.md) applies; the rows below are this topic's own. **C2**, **C5** and **C6** are not defined; the gaps are never back-filled.

**C1**: This document is mandatory for backend logging in repos that adopt this kit.

**C3**: Precedence when standards conflict: REPOSITORY > TRANSACTION > ERROR > LOGGING (same as error policy **C3**).

**C4**: No alternate logger is introduced without a documented standards change.

**C7**: The consuming system selects and documents one maintained backend logging implementation and supported version baseline (**M1**, **M11**).

**C8**: Rules must not be softened locally without a documented change (**M15** bar in gray-situation).

**C9**: Refactor / feature / delete: never ship console.* on runtime operational backend paths — use the application logger facade (**M2**, **N5**).

**C10**: If the selected logging library fails its documented baseline (**M11**) or `logger.error` cannot carry the **M12** fields truthfully, the dependency is upgraded, the standard amended or the failure path fixed before dependent work proceeds.

Testability: dependency manifest and deployed runtime baseline (**M11**); log line review (**M12**, **M14**); runtime log sink (**M4**, **R1**); facade wiring review + adversarial structured-meta/cursor sample (**M23**, **M26**); malformed request-id probe (**M27**); access-log allowlist + raw-request-target negative probe (**M28**); where instrumentation must be preloaded, start-authority parity across process command / container / PaaS launch plus a clean runtime instrumentation diagnostic (**M29**).

---

## Technology

| Topic | Rule |
|-------|------|
| Library | One maintained structured logging implementation, selected and documented by the consuming system — **M1**. Do not replace it, or add ad-hoc loggers, without updating the documented selection. |
| Transports | Configure transports only through the logger authority; they must match the deployed runtime's output and retention requirements (**M4**); file-rotation transports only if not contradicting **M4**. |
| Module | Exactly one exported application logger surface — **M10**. |
| Version | The dependency manifest must satisfy **M11** before implementation work proceeds. |

---

## **MUST NOT**

**N1**: console.* on runtime backend request, job, or service paths (**M2**).

**N2**: **MUST NOT** log secrets; credential-bearing connection errors follow [**SEC-M-LOG-2**](../security/security-logging-core.md).

**N3**: Skip logger.error on caught errors that indicate defect or blocking failure (must re-raise a typed carrier, or map per error policy; the single boundary logs once — **M15**).

**N4**: Rely on local-only log files as the primary sink in managed/container environments (**M4**).

**N5**: console.* MAY be used only in test code, one-off local scripts, or documented migration utilities — never on runtime backend paths that serve traffic or process jobs.

**N6**: Forward expected (`warn` — `OPERATIONAL` / `BUSINESS`) errors to crash reporting (**M17**). It is noise that hides real `SYSTEM` incidents; expected-error signal belongs on the metric channel (**M18**).

**N7**: Log the same failure at more than one layer when a downstream boundary will log it (**M15**). The only exception is a standalone entry point with no outer boundary (CLI / cron / job), which logs at its own outermost catch.

**N8**: Do not export, import, or call the raw underlying logger instance — use only the single facade (**M20**). Never pass a `(message, error, meta)` triplet to a raw logger whose signature is `(message, ...meta)`: the `meta` is dropped (lost `rootCause` / `solution` / ids / crash-report context). Enforce both structurally (do not export the raw instance → the type checker blocks references from typecheck-included code) and, where the adopting project uses lint rules, with a lint rule (covers scripts / CLI that sit outside the typecheck scope, and gives a clearer message than a bare `Cannot find name`).

**N9**: Do not forward unsanitized structured metadata to an underlying logger/transport, apply credential scrubbing only to selected levels/transports, or copy a transport-local credential denylist. Do not describe a key-based scrubber as proof that arbitrary message/stack text is secret-free (**M23**).

**N10**: Do not log, attach, hash, truncate, partially decode, or otherwise forward raw pagination cursor/continuation values. Do not create a feature-local cursor denylist parallel to the shared scrub authority (**M26**).

**N11**: Do not use raw URL, `originalUrl`, request target/path/query, params, body, or headers in an access/latency message or metadata; stripping the query string is not the server route-template authority (**M28**).

**N12**: Do not copy an inbound request-id header directly to logs, tags, response trace id, or request-local state without the canonical request-id validation gate; do not echo or diagnose a rejected raw value (**M27**).

**N13**: Do not treat “the instrument module is the first textual import in the entry file” as SDK preload proof, and do not maintain direct container/PaaS launch commands parallel to the canonical package start command (**M29**).

**N27**: Close a duplicate failure write by deleting it when that call carried diagnosis the surviving report cannot rebuild. Where a layer's failures already rise to a global classified net (a framework-level error hook that hands every failure to the single classification authority), a crash-level write at the call site is a second record of one failure (**COB-RN-M11**) — but that licenses deleting the *record*, not the *facts*. Decide per site, from the code, not by pattern: (a) the call logs the same object that is thrown and its metadata adds nothing the boundary cannot derive from that object → delete; (b) the metadata holds a fact the boundary cannot rebuild → hand it to the classification authority, which marks the error owned and so silences the net, or fold the fact structurally into the thrown error's message; (c) the thrown error is not the caught one (a translated or wrapped rethrow) → deleting the write orphans the original cause, so report that cause through the authority and mark the wrapper owned. When folding a fact into a message, fold the field name, never a raw response body or a personal identifier — the diagnosis is *which* field was absent, not its value. A write whose metadata was already empty is a pure duplicate with nothing to preserve. Once the call-site writes are gone, a `try/catch` that only logged and rethrew has no remaining effect and is dead structure (**DCD-M2**) — but one that also consumes an expected branch is not. [Consequence: STOP — the cleanup that ends double reporting ends the only evidence of what failed] [Verify: per removed call, name the channel the failure still reaches and the field carrying the old metadata's diagnosis]

**N26**: Rely on failure logging to reveal that a scheduled job never ran (**M21**). A catch boundary records only a run that *started*; when the process died, the scheduler was never registered, or a deploy stopped half-way, no code path executes, so there is nothing to catch and nothing to write — and a fire-and-forget registration discards the returned status too, leaving the two states “ran and found nothing to do” and “never ran at all” indistinguishable in every sink. A recurring job whose non-occurrence loses a guarantee **MUST** therefore register an execution-presence signal the monitoring side expects on a declared schedule, so that absence is itself an event; the schedule that signal declares and the one the runner is bound to **MUST** be the same value ([**TZ-M16**](../timezone/timezone-recurrence-and-due-window.md)). *(Numbering: this row is **N26**, not **N14** — the bare `N` family is shared across topics and every number up to **N25** is already a definition site somewhere in the kit; a back-fill would re-point existing citations, which [**KIT-ADD-5**](../authoring/kit-rule-addition.md) forbids.)*

---

## Log levels

| Level | Use | Routing |
|-------|-----|---------|
| `error` | `SYSTEM` failures, exceptions, defects, unmapped codes | → crash reporting (**M17**) |
| `warn` | Expected (`OPERATIONAL` / `BUSINESS`) errors by category (**M16**); degraded behavior, retries, recoverable anomalies | → metric channel, not crash reporting (**M18**, **N6**) |
| `info` | Significant lifecycle / business events (bounded volume) | — |
| `http` | HTTP request/response summaries where the stack uses this channel | — |
| `debug` | Development / deep diagnosis only (**M9**) | — |

> A defect detected at runtime without a throw (for example a repeated-read N+1) reaches the `error` row only through a registered `SYSTEM` code and the non-HTTP classification authority — never by picking a row here ([**M17**](failure-level-and-channel-routing.md) corollary).

> Category → level → channel is the spine: category ([error policy](../error-policy/error-policy.md)) decides level (**M16**), and level decides channel — `error` → crash reporting, `warn` → metric counter. The two channels are independent so suppressing expected-error noise never blinds you to an expected-error flood.

---

## Message and meta shape (normative)

- [**M14**](logger-surface-and-levels.md) — bracketed module prefix on the message string.
- [**M5**](logger-surface-and-levels.md), [**M13**](logger-surface-and-levels.md) — every meta object must be valid for JSON serialization.
- `logger.error` — [**M12**](logger-surface-and-levels.md) (and [**M7**](logger-surface-and-levels.md) where error policy applies).
- Meta **MUST** reach the record regardless of call form (**M20** corollary). The single facade's `error(message, error?, meta?)` **MUST** route a non-`Error` object passed as the 2nd argument (a `(message, meta)` call) to the meta path — not bury it under the exception field. Otherwise the whole structured meta (`rootCause` / ids) lands under the carrier's `error` key and the crash-report sink (which extracts only `message`/`stack`/`name` from that field and strips the key from the structured extra) drops it — the crash event arrives with no body (no `rootCause`, no ids). The fix is at the single facade authority (covers every call site at once + future ones), not per-call-site. A meta key literally named `error` is reserved by the carrier slot — use `errorText` / `errorMessage` for an error string inside meta.
- The single boundary **MUST** propagate the typed carrier's structured context (error-policy **M1**/**M9**). When the one boundary handler logs a typed carrier (an application error carrier constructed with a code, `rootCause` and ids) whose message is the stable code, it **MUST** merge the carrier's structured `context` (`rootCause` + ids) into the one failure log. Logging only the carrier (whose `message` is the code) sends the crash report the code with no operator detail — the `rootCause` supplied when the carrier was raised is otherwise never logged anywhere. The merge happens once, in the logger facade's error path, for every call site — not copied by each boundary: a copy that only the HTTP boundary made left the process boundary and background paths without the carrier's stage/resource/root cause. Caller-written meta keys override the carrier's; a carrier key that collides with a boundary snapshot key (`params`, `body`, `query`) is renamed at the carrier, never shadowed silently. Nested carriers keep their context inside the rendered cause chain. A boundary whose record has no error object (`warn` path) reads the context through the same single resolver.
- The safe request snapshot **MUST** be attached at the request SCOPE, not only at boundary handlers. The crash SDK's own HTTP body collection **MUST** stay off regardless of the PII policy: a raw body bypasses route-scoped field masks (a field whose meaning depends on the route, such as a one-time `code`, is invisible to a key-only scrubber) — so the safe, redacted request snapshot (`body` / `params` / `query`) is the only body carrier and reaches the crash report only if code attaches it. Attaching it solely inside the boundary handlers (which run only for errors that reach them) leaves every error logged off the boundary path — fire-and-forget notifications, deep service `error` logs captured by the log→crash transport — with no body / missing parts. Attach the snapshot once at the request scope (the same per-request hook that sets the correlation id), preferably via a lazy scope event-processor (computed only when an event is actually captured, not on every request), so every crash captured during that request carries it. The snapshot must consume the shared scrub authority, including **M26** cursor/continuation keys; route identity is the server template/fixed sentinel, never raw URL/query. Background/job contexts (no request) legitimately have no snapshot.

Illustration: [`logging-policy-code-samples.md`](../_meta/examples/logging-policy-code-samples.md).

---

## Hosted runtime

**R1**: Route errors and other levels to the output streams or sinks configured for the hosted runtime (for example errors to stderr, other levels to stdout); verify actual transport routing.

**R2**: Structured JSON lines — one event per line where the platform expects line-delimited logs.

**R3**: Do not depend on writable app disk for required log retention — use platform logs or external sink.

**R4**: A released deployment that trails the pushed head of its deployed branch past a stated tolerance, with no deployment since the oldest pending push, **MUST** raise one registered `SYSTEM` event per stall naming the running commit, the expected commit, the lag and where to look; the expected head **MUST** come from a signed push notification, never from a credential that reads the source repository, and a released process that boots without that source **MUST** say so once per boot instead of refusing to start. Reason: a stalled or paused deploy pipeline leaves the old release serving with no failure anywhere in the process, and a missing secret must not take production down before the owner sets it. [Verify: review; runtime evidence — a stale pushed head yields one event, the next turn none]

**R5**: A released process **MUST** leave a durable record at boot that only a completed graceful shutdown removes, and a successor **MUST** report every superseded record once as a registered `SYSTEM` event naming the dead process's commit, boot time and exit context — only after the predecessor's drain window has passed. Reason: SIGKILL, a heap abort or a shutdown past the drain window runs no handler, and the platform restarts the process silently; checking at boot would flag a predecessor that is still draining. [Verify: review; runtime evidence — `kill -9` yields one event on the successor, SIGTERM none]

# Logging policy — appendix (non-normative)

```kit-cover
type: reference
part-of: README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Part of [Logging policy](logging-policy.md). This file carries the implementation checklist only: it defines no rule ID, adds no obligation, and is not part of the reading path. Every row it names is defined in [logging-policy.md](logging-policy.md), [logger-surface-and-levels.md](logger-surface-and-levels.md), [background-boundaries-and-sink-safety.md](background-boundaries-and-sink-safety.md), [request-identity-and-bootstrap.md](request-identity-and-bootstrap.md) or [caught-error-text-proof.md](caught-error-text-proof.md).

---

## Implementation checklist

- [ ] **M11**: selected logger implementation and supported version verified in the consuming system's dependency manifest before changes
- [ ] **M10**: one application logger facade; no direct logger-library use outside its authority
- [ ] **M2** / **N5**: no `console.*` on runtime paths
- [ ] **M14** on applicable messages; **M12** on every error-level record
- [ ] **M8** on critical / blocking / integrity events
- [ ] Failure logged once at the boundary (**M15**, **N7**); no inner `warn`/`error` record ahead of a certain typed raise in any scope (not only `catch`), and its meta moved into the carrier's context before deletion; level chosen by category (**M16**)
- [ ] `error` → crash reporting only; expected (`warn`) → metric channel, not crash reporting (**M17**, **M18**, **N6**)
- [ ] Every tier with a crash channel has one classification authority; its capture sink is not called directly (**M21**, **M22**)
- [ ] Same `traceId` in log + response + crash report (**M19**)
- [ ] Levels and structured output match the consuming runtime's documented transport requirements (**M4**, **R1**–**R3**)
- [ ] **M7** / **M12** `rootCause` (and `solution` when required) include the error-policy context required for diagnosis
- [ ] **M20** / **N8**: one facade surface; raw logger instance kept module-private (no `raw.error(msg, error, meta)` silent meta-drop)
- [ ] **M23** / **N9**: every facade level scrubs structured metadata through the shared bounded credential authority before every transport; opaque message/stack text is contained at its source boundary
- [ ] **M25**: error text is value-scanned (live credentials masked), not replaced by a fixed-message boundary error; the process-level crash writer and each client and backend crash-report sink apply the same scan
- [ ] **M24**: durable worker attempt failures log once with safe id + attempt + resulting state; terminal exhaustion remains visible and raw payload/credentials never enter logs
- [ ] **M26** / **N10**: shared cursor/nextCursor key parity redacts opaque continuation state in every request snapshot and observability sink
- [ ] **M27** / **N12**: one canonical UUID request-id writer; malformed/duplicate header values are discarded without raw egress and replaced server-side
- [ ] **M28** / **N11**: one access/latency summary with exact normalized/bounded fields plus fixed action/slow-tier/root-cause/solution literals; no raw request target/query/body/headers/identity/client text
- [ ] **M29** / **N13**: where the runtime requires instrumentation to be preloaded, initialize it before application modules; the package start is the single launch authority, every supported launcher consumes equivalent ordering, and production logs contain no framework-instrumentation warning
- [ ] **M30**: credential-bearing connection/bootstrap/migration failures follow [**SEC-M-LOG-2**](../security/security-logging-core.md).
- [ ] **M31**: one portable-text rule for every layer — only application-authored literals/registry codes and closed-set/validated-shape values leave a containment boundary; the runtime's own failure facts (validated class identity, runtime-enumerated system error code, errno, syscall name token, signal) are carried, not discarded with the message; helpers that return a derived diagnostic string obey the same rule; facts survive the transport hop into the crash sink
- [ ] **M32**: the raw-error-text source model is bounded by a type-annotation proof, not by containment scope and never by variable name or the top type; one shared throwable predicate is imported by every rule asking that question
- [ ] **N2** — no secrets in logs

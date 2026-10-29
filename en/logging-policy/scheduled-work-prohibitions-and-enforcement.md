# Scheduled work — prohibitions and the enforcement split (**SJO-N1**–**SJO-N3**)

```kit-cover
type: normative
part-of: README.md
binds: the three prohibitions of the scheduled-work observability family and the declared split between what a check decides and what stays a review obligation
open-when: shape:backend-heavy, signal:scheduled-job, signal:background-worker, signal:crash-sink
skip-when: signal:client-only
owns: SJO-N1, SJO-N2, SJO-N3
```

**Keywords:** scheduled job, cron, prohibition, supervisor alert, enforcement limit, stated limit

Scope

- Included: The SJO family's **MUST NOT** rows, the mechanism chosen for the one fenced obligation, and the enforcement seam with its declared limits.
- Excluded: The **MUST** rows themselves, which are defined in the sibling band and cited here by identity.
- Document type: Normative — the **SJO-N** rows; the enforcement section below defines no rule ID.


References: [scheduled-work-liveness-and-outcome.md](scheduled-work-liveness-and-outcome.md); [failure-level-and-channel-routing.md](failure-level-and-channel-routing.md) (**M18**); [check-verification-rules.md](../false-positive/check-verification-rules.md) (**FP-M20**); [mechanism-selection.md](../false-positive/mechanism-selection.md) (**FP-MS5**); [evidence-and-predicate-rules.md](../false-positive/check-design-rules.md) (**FP-M22**); [kit-structural-invariants.md](../authoring/kit-structural-invariants.md) (**KIT-INV-8**).

---

## **MUST NOT** (normative) — **SJO-N1** to **SJO-N3**

**SJO-N1**: Raise the supervisor's finding outside the adopting project's registered error path — a direct crash-SDK call, an ad-hoc message, a bespoke channel — or raise it once per evaluation instead of once per episode (**SJO-M4**). [Consequence: An alert that no boundary can classify, level or correlate, or a flood that buries the one occurrence that mattered.]

**SJO-N2**: Treat the absence of failure records as evidence of liveness. "No errors from this job" is produced identically by a healthy job, a stopped job, a job whose process never started, and a job whose declaration was never registered. Only a positive durable trace (**SJO-M2**) is evidence; inferring health from an empty query is the inversion this whole family exists to prevent. [Consequence: A stopped job is reported healthy for as long as it stays stopped.]

**SJO-N3**: Widen a declared cadence, grace or output window so that an existing alert stops firing. The declaration states what the product requires; a job that cannot meet it is either fixed or its requirement is changed as a deliberate, recorded product decision with the new value measured. Editing the threshold to silence a true finding is the same defect as editing a check to silence a genuine violation ([**FP-M20**](../false-positive/check-verification-rules.md)). [Consequence: The guarantee is withdrawn without anyone deciding to withdraw it, and the registry still claims it.]

---

## Enforcement and its stated limits

Mechanism choice ([**FP-MS5**](../false-positive/mechanism-selection.md)). **SJO-M1** is the fenced half, and where the adopting project uses source checks the fence is a single-file lint rule, not a script guard: a registration is a call expression whose schedule argument, handler and declaration object sit in one file, so a single-file syntax tree decides "was this registered without a declaration?" without cross-file reasoning. Such a rule resolves the actual scheduler binding rather than any object carrying a method of that name, and requires the callback's reachable same-file chain to enter the canonical declared runner. A runner inside an uncalled nested function is not reachability. It also flags a canonical runner called without its declaration argument; its proof is the ordinary three-part measurement (**FP-M20**). The covered surface — runners, scheduler package, its registration members and object exports — is one module that the rule and the cross-file guard both import; a member that module does not name is an undeclared exemption. The rule anchors on the binding's identity, so a reference that is not a direct registration call is rejected, not passed over, and the same rule fences a raw periodic timer on ownership: a handle discarded, or kept and never handed to a disposer, is either an undeclared job the supervisor never sees or a timer shutdown cannot stop. Both obligations, and what this cannot reach, are [**FP-M22**](../false-positive/check-design-rules.md)(f). Any implementation identifies its supported registration shapes and limits; an absent finding is not proof that unsupported dynamic registrations were checked.

External monitoring has one authority, not one seat per ordinary job. Where the platform health-checks only at deploy time, every running instance **MUST** report its ongoing readiness to that one external monitoring authority, and readiness lost past a threshold **MUST** raise an alert naming the instance; a passed deploy check is not liveness. Prefer alerting over self-termination where the platform's restart policy is capped, because a capped restart policy leaves a terminated instance down for good. Review-held (the platform check mode and restart cap are deployment facts). After the supervisor of **SJO-M4** is active, a lint rule that requires every ordinary job to carry an external-provider heartbeat contradicts **SJO-M5** and creates a parallel liveness contract. Ordinary jobs are made visible instead by declaration/trace reconciliation. The inverse is fenced, and must be: a single-file rule rejects the provider's check-in call outside the one canonical producer module. A check-in can upsert its monitor object, so while any ordinary job still sends one, a monitor deleted in the console returns on the next tick — source removal comes first, console deletion second, and the reverse order cannot stick.

Registration, startup and declaration parity is one cross-file fence ([**SJO-M1**](scheduled-work-liveness-and-outcome.md)). A single-file rule proves the local registration shape; it cannot prove that the exported producer is reached exactly once from the central startup graph or that the job-name set derived from all registrations equals the declaration set. A repository-level guard therefore derives all three sets from source ASTs: real scheduler bindings and their nearest exported producers, the central startup graph, and the declarations reached by each callback's same-file call graph. It fails loud on missing/duplicate/unknown starters, duplicate or unmatched job names, and every unsupported use of a scheduler binding, reading the same closed surface as the rule. It keeps no manifest and is not a runtime-activation proof: reflection, environment branches and process execution remain outside a static graph.

The episode-closing decision is fenced by a STOCK mechanism, not a new rule. **SJO-M4**'s "only a recorded completion may close it" has a structural half a check can hold: when the closing decision is an exhaustive branch over the health states with no catch-all, a state added later cannot silently inherit the recovery branch — the language's own exhaustiveness check and the function's declared return type both point at the decision site. No custom rule is written for this, because a stock check already decides it and a second mechanism for one question is one too many ([**FP-MS5**](../false-positive/mechanism-selection.md)); the obligation on the author is to write the decision in the shape that the stock check can see, since a catch-all branch defeats it.

Episode persistence is conditional, and the receipt is the only success evidence. Opening uses an absent-episode predicate and treats a concurrent winner as expected contention; continuing and closing use the exact episode identity plus its observed evaluation counter, and a zero-match result is a typed failure rather than a successful transition. The write seam returns an immutable transition receipt only after the durable store reports the expected match and modification. A supervisor lease stored on another record cannot be made atomic with this target-row write by adding the lease token to the target filter: the honest boundary is owner assertion immediately before the target conditional write. Cross-document ownership and the target transition remain two operations unless a shared transaction encloses both. This event-to-event guarantee is not a lint claim; it is proved by controlled concurrent writes and stale-identity writes against the persistence seam.

A pre-trace supervisor log is an evaluation fact, never a completion fact. The processor callback may record an in-memory outcome for the shared runner, but before that runner persists the durable trace it may emit only an evaluation-finished event carrying an explicit pending terminal-trace status. A `completed` action or message at that point is forbidden: a later trace CAS failure would leave a success claim for a run that **SJO-M2** requires to fail. The single-file terminal-order rule locks this event shape; durable trace and external `ok` remain owned by the shared runner.

Declaration/trace reconciliation is activated through the canonical three-way derivation. A missing/stale snapshot is repaired through the canonical write seam and its real receipt is observed before a `trace_missing` episode intent may open; an orphan is reported but never judged late or output-starved. A lint rule asserting that the supervisor reads the declaration set would lock one module's shape and prove no set semantics; bidirectional reconciliation is proven by driving the supervisor against a declaration with no trace. The supervisor's own delivery seam and its stated limits are written beside the alarm they protect ([crash-report-delivery-receipt.md](crash-report-delivery-receipt.md)).

Alarm delivery is per intent, never a run terminal ([**M21** permanent-candidate corollary](shutdown-watchdog-clarifications.md)) — what that requires of a row is stated once, with the alarm itself ([crash-report-delivery-receipt.md](crash-report-delivery-receipt.md)).

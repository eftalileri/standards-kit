# Dead code — reachability horizon for published wire surfaces

```kit-cover
type: normative
part-of: README.md
binds: the reachability-horizon reasoning behind the wire-surface rows — why a source-tree scan cannot decide a published surface, which consumer classes it cannot see, how the deletion and activation directions differ, and which half of that obligation is mechanically enforceable
open-when: shape:refactoring, shape:backend-heavy, signal:source-file-change, signal:dead-code-removal, signal:wire-surface-removal, signal:wire-surface-activation, signal:unused-report
skip-when: none
owns: none
```

Part of [dead-code-rules.md](dead-code-rules.md). The rows this reasoning binds — **DCD-M8** (the released-consumer check before removing a wire surface) and **DCD-N5** (the prohibition on deleting one from a source-tree scan) — together with **DCD-M2**–**DCD-M7** and **DCD-N1**–**DCD-N4** are defined there and bind this band; this file defines no rule row of its own. The complete band set for this topic is [dead-code.md](dead-code.md) (**DCD-C**, **DCD-M1**, GDCD1–GDCD4, Verify), [dead-code-rules.md](dead-code-rules.md) (**DCD-M2**–**DCD-M8**, **DCD-N1**–**DCD-N5**), [knip-usage.md](knip-usage.md), [knip-optimization-playbook.md](knip-optimization-playbook.md) and this file.

Document type: Normative part — reasoning and stated enforcement limits for **DCD-M8** / **DCD-N5**; defines no identifier.

References: [README.md](README.md); [dead-code-rules.md](dead-code-rules.md) (**DCD-M6**, **DCD-M8**, **DCD-N5**); [dead-code.md](dead-code.md) (GDCD4); [ssot governance](../ssot/README.md) (**SSG-M8**); [false positive prevention](../false-positive/mechanism-selection.md) (**FP-MS1**–**FP-MS4**); [**FP-M19**](../false-positive/check-design-rules.md); [**BE-M15**](../build-environment/build-environment-config-and-runtime-floor.md).

---

<a id="reachability-horizon--the-source-tree-is-not-the-whole-consumer-set-dcd-m8"></a>

## Reachability horizon — the source tree is not the whole consumer set; [**DCD-M8**](dead-code-rules.md) reading

Both detection layers reason over one snapshot of one repository. That is sufficient for internal symbols, but not for a wire surface — anything published across a process or release boundary: an HTTP route/endpoint, a response field, a request parameter, an event or message name, a persisted schema key, any versioned contract.

A wire surface can be consumed by code that is absent from the snapshot:

| Consumer class | Why the source tree cannot see it |
|----------------|-----------------------------------|
| Independently released client whose bundle is frozen at an older commit (installed mobile binary, cached or pinned web bundle, desktop app) | Its code is the old release, not HEAD; it keeps calling what HEAD no longer references |
| Third-party / partner integration | Its source is not in this repository at all |
| Scheduled external job, webhook subscriber, operator tooling | Calls by URL or contract name, never by import |

For these, "zero callers in the source tree" measures only the newest client. Deleting on that measurement removes a surface that is still being called.

**The failure mode may be silent during deletion and severe for consumers.** Local checks can pass because the current source snapshot has no caller. A released consumer may then receive an incompatible or missing response, and monitoring may classify the resulting failures as unexpected. The impact depends on the surface and the consumers still using it.

Therefore the removal decision is gated on the oldest consumer release still in the field, not on HEAD.

A consumer class that leaves no release record — a web bundle running in an open tab, operator tooling run from a local build, an external caller — cannot answer **DCD-M8** (a)/(b) from distribution data. For a route, the released-consumer check is then a production request-log measurement, and it **MUST** satisfy four conditions: zero requests to the path over a window that starts after the last known calling release was replaced; the window covers every deployment that served traffic in it (a query scoped to the latest deployment misses what its predecessors served); it lies inside the log retention; it is at least as long as the consumer's normal reuse interval. **MAY**, as the one exception to that forward window: a surface whose only consumer without a release record is an operator-only web bundle used by a known, small operator set (admin tabs) is removed once the deployed commit of that bundle — and of every other consumer repository — has zero callers and the request logs already retained for the past days show no caller other than that bundle or in-repo operator tooling; no window is waited out after the replacing deploy, because the worst case is one operator tab failing until it is reloaded. A surface that any independently released client calls (installed mobile binary, public web bundle, external integration) **MUST NOT** use this exception; it keeps the full horizon. A request found in the window keeps the route (**DCD-M6**) until its caller is identified and moved; a caller deleted in the same change does not block it, but its locally built copy is rebuilt with the release. Traffic proves a route idle, never a response field unread — every request to a surviving route returns the field. A field is decided by **DCD-M8** (b) against the consumer's deployed commit, its response-validation schema included: a schema that requires the key fails the whole response once the server stops sending it.

The same horizon binds ACTIVATION, not only deletion. Enabling a wire-surface protocol whose payoff depends on the client's half — conditional reads, compression negotiation, an opt-in header, a new cursor — is gated on the same unseeable consumer set, read in the opposite direction: the tree cannot prove the consumer is absent either. "No client code sends the header" is therefore not evidence that none does — a platform HTTP cache or a browser revalidates on its own — and it is equally not evidence that one does. The asymmetry is what makes this dangerous: a wrong activation's risk lands at once on every viewer, while its benefit lands only if a consumer exists. Activate on a live measurement of real traffic, never on a source scan; where that measurement returns zero, make the dormant path safe rather than enabling it for a benefit nobody can collect. *Stated enforcement limit:* not mechanically checkable — a check would need released clients' request headers, which no artefact in a source repository carries.

### A persisted operator configuration is a consumer class of its own

The table above lists consumers whose *code* is outside the snapshot. A fourth class has no code anywhere: a row an operator authored through an admin UI and the system stored. A notification rule keyed by an event name, a saved report filtered on a field, a workflow whose trigger is a string selected from a dropdown — each is a live dependency on a wire surface, and it exists only as a document in the database.

Scanning either repository for such a name returns the *option list* and the *label map* that render the dropdown, never the saved selections. Both look like presentation code, so the honest reading of a two-repo grep is "nobody selects this in source", which is not the question. The question is whether an operator already did.

**These dependencies must be measured separately.** A schema field and a persisted operator-selected name can have different consumer lifetimes:

| Leg | What decides it |
|-----|-----------------|
| The **stored field** the surface writes to | Reader count across every system that shares the type, plus persisted data that still contains the field. |
| The **enumerated name** an operator selects | Whether an administrative or configuration surface lets operators save the choice. If persisted records still name it, keep the name or migrate those records before removal. |

Removing the producer while keeping the name is a legitimate, and often the correct, end state. The option then stays selectable but can never fire. That is a declared gap and must be reported as one — an operator can still configure it and get silence. It is not a defect of this procedure; it is the residue of a cascade-stop, and it needs an explicit owner decision to close (retire the name in both repos, or leave it inert).

### Renaming a misleading signal is not a fix

When a surface's name asserts something its trigger condition contradicts, the tempting repair is to rename it to what it actually measures. Where the surface has real consumers that is right. Where the consumer count is zero, it is a trade down: it spends a cross-repo mirror edit, an enum change and a migration to keep alive a signal nobody reads, and it leaves the same wrong idea in the tree under a more defensible label. With zero consumers the correct move is to remove the producer chain and record why, so the next reader inherits the measurement instead of re-deriving it.

The diagnostic question generalizes past this case: "under what condition can this event actually be emitted, and is that condition consistent with what its name asserts?" Trace the emit path to the concrete trigger. If the only reachable path to emitting *"the user left"* runs through *"the user came back"*, the surface is inverted, and no rename repairs it. Substituting a new heuristic is a separate decision with its own gate — where a platform rule already forbids inferring the signal indirectly, it is not available at all.

### Enforcement scope — half mechanical, half irreducibly out-of-band

The deciding input for **DCD-M8** is not derivable from the source tree, so it has to be recorded. That record is the published wire-contract record: per released consumer version, the wire surfaces it depends on, an anchor identifying that release's own source (release tag / build commit), and whether the release is still in the field. With the record in place, the rule splits into two halves that enforce differently:

| Half | Question | Enforceable? |
|------|----------|--------------|
| Recorded surface removed | "Is a surface that a still-in-field release depends on missing from this checkout?" | YES — cross-file guard (arm 2). The record, the mount table, and the router modules are three separate files; no single-file AST can relate them, so this is the legitimate guard residue (**FP-MS1**–**FP-MS4**). |
| Record completeness / field inventory | "Does the record list *every* surface the field depends on, and is that release still in the field?" | NO. Release-channel / distribution / crash-reporter data lives outside the repository. No tool in the checkout can derive it. |

The guard is a ratchet, not a proof of deadness. A green guard proves only that no recorded dependency was deleted. It does not license deleting anything: a surface absent from the record is *"not yet measured"*, never *"unused"* — that remains uncertain → kept (**DCD-M6**), and removing an unrecorded wire surface still requires the manual GDCD4 check against the oldest field release.

Populating the record is measurable. The at-risk set for a release is derived by scanning that release's own anchor commit for wire-surface callers and subtracting HEAD's — the difference is exactly "HEAD no longer calls it, but a shipped bundle still does". A release anchor is identifiable in-repo whenever the release version is committed (e.g. the commit that set the app manifest's version field). The row is written by the change that removes the last HEAD caller, not later: a client-only cleanup (dead hook, API method, query key) diffs its own deleted call sites against every in-field anchor and records each surface a shipped bundle still calls in the same commit — otherwise the route silently becomes "unreferenced" and the next server-side sweep deletes it on the source tree's word alone.

The consuming project chooses the record format and enforcement mechanism. If a record is used, validate that it is present, non-empty, well-formed, and aligned with the live route or contract inventory. Mark a release retired only when its distribution or support status is established by the project's release authority.

---

### A retired result code is a published surface decided at the PRODUCER

A published result or error code may have a different reachability horizon from a route. A route stays reachable while a consumer still **calls** it; a produced code stays reachable while the producer can still **emit** it. When the code is defined centrally and consumers only interpret it, the relevant measurement is the set of producer paths that can emit it. Once the last such path is removed, a consumer release cannot receive that code from the updated producer.

**MUST.** Removing a code from its authority requires proving, in that same change, that **no** surviving producer path emits it — a code another path still emits stays, whatever prompted the deletion. With that proof, remove dependent consumer entries such as localized messages or mappings in the same change (DCD-M2); partial cleanup can leave stale text or inconsistent behavior.

**MUST NOT.** Do not keep consumer-facing text or mappings for a code the producer can no longer emit. Stale entries can read as supported behavior even when no producer can reach them; ensure consistency checks cover the relevant direction of the dependency.

**Retired authority, still-called route.** When an authorized decision retires the authority behind a route that a supported consumer still calls, DCD-M8(c) has no delegate. Keep the route as a **terminal** response with no reads or writes, preserve its authorization boundary, and return a documented response that lets consumers handle retirement explicitly. Do not disguise the case as an unrelated not-found or routing mismatch. Retire it after the last calling consumer leaves support, and remove related entries at the same time.

Retired request value, still sent. Narrowing the values a live route accepts — a client may no longer submit an event type the server now owns — is the same case one level down: the route lives, one value's client authority is retired. The answer is again a terminal expected-class refusal with no write, marked in the warning context by a field of its own so the value's field traffic stays measurable, and recorded under each calling release. Measure the old client's response contract before choosing "accept and drop". A success envelope with no record looks gentler but is not when the released client requires the record in the body: its missing-field check becomes an uncategorised failure — a crash-class report — where a registered expected-class refusal is classified as the expected warning it is. Re-opening the write is never the compatibility path: it restores the second writer the narrowing closed ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md)).

**Closing an unused export for a surface not yet released.** An export built ahead of its surface is neither dead nor alive by measurement: the scan can be accurate while the answer still depends on whether the surface will ship. That input is an **authorized product or release decision**; repeating the audit will not produce it, and an audit that deletes on its own authority is deleting on a tool report (DCD-N1). If the decision is not to ship, remove the export and the supporting paths used only by it in one change (DCD-M2). Keep sibling exports with live consumers, and move any still-needed type or constant into an appropriate surviving authority.

**Enforcement limit (stated, not silent — [KIT-LIM](../authoring/kit-stated-limits.md)).** Whether every registered code has a live producer may require a product decision about the rule each code represents; a count alone cannot settle that semantic question. Any mechanical comparison must distinguish executable raisers from comments, message prefixes, and catalog entries. State which direction is checked and what the check cannot decide; do not treat an unmeasured direction as covered.


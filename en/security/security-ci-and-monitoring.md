# Security — CI gates (SEC-C1) and monitoring (SEC-MON)

```kit-cover
type: normative
part-of: README.md
binds: SEC-C1, SEC-M-MON-1, SEC-M-MON-2, SEC-S-MON-2, SEC-S-AUDIT-1, SEC-S-SBOM-1 and SEC-M-MOD-1 -- the CI security gate, what production security monitoring must emit, dependency audit and SBOM expectations, and the module-integrity requirement
open-when: shape:mechanical-enforcement, signal:ci-pipeline, signal:dependency-audit, signal:security-monitoring
skip-when: signal:no-ci-change, signal:no-security-surface
owns: SEC-C1, SEC-M-MON-1, SEC-M-MON-2, SEC-S-MON-2, SEC-S-AUDIT-1, SEC-S-SBOM-1, SEC-M-MOD-1
```

Scope

- Included: SEC-C1-A–SEC-C1-G (as applicable), violation = pipeline FAIL rule, SEC-M-MON-1, SEC-M-MON-2, SEC-S-MON-2, SEC-S-C1-G, SEC-S-AUDIT-1, SEC-S-SBOM-1, modular security helpers vs COD-M3.

Document type: Normative — SEC-C1-\*, SEC-M-MON-1 and SEC-M-MON-2 rows; SEC-S- rows are SHOULD.

Environment: CI and production observability; N/A for each SEC-C1 row **must** use [SEC-NA-1](security-enforcement-and-na.md) when disabled.

References: [Governance](security-governance.md); [Decision gates](security-decision-gates.md) (GSEC6); [Enforcement and N/A](security-enforcement-and-na.md) (SEC-NA-1); [Secrets and logging](security-secrets-and-logging.md); [Client transport](security-client-transport.md); [Code modularity](../code-modularity/code-modularity.md) (COD-M3).

---

## SEC-C1 — CI enforcement (normative)

Rule: If a listed control is in scope for the repo and detects a violation, the pipeline **must** FAIL — merge/deploy blocked until fixed or standard amended (SEC-GC-6).

| ID | Control | On violation | Verify by |
|----|---------|--------------|-----------|
| **SEC-C1-A** | Secret scanning (e.g. gitleaks, GitHub secret scan) in pipeline | FAIL | CI logs |
| **SEC-C1-B** | Dependency high CVE threshold per written policy on production path | FAIL or documented exception approval | Audit trail |
| **SEC-C1-C** | Pattern / lint that blocks writing tokens to AsyncStorage (or equivalent forbidden store) | FAIL | CI grep / ESLint |
| **SEC-C1-D** | Production code: `console.log` + sensitive fields — FAIL | Per documented policy | CI rule |
| **SEC-C1-E** | Web security headers validation (build output or configuration inspection) — when web UI exists | FAIL | CI configuration inspection |
| **SEC-C1-F** | Dependabot or Renovate enabled; security PR SLA or merge rule written (Node / package repos) | FAIL | Repo settings + doc |
| **SEC-S-C1-G** | Snyk / OSV-Scanner / `npm audit` (or equivalent) in pipeline; threshold + exception process written | WARN or FAIL per policy | CI + doc |

| Repo class | Mandatory FAIL gates (minimum) | Notes |
|------------|--------------------------------------|--------|
| Backend API (HTTP server, deploys dependencies to prod) | SEC-C1-A + SEC-C1-B; apply SEC-C1-C only if the repository contains a client token-persistence surface, and SEC-C1-F only for a Node/package ecosystem | CVE policy (B) is material supply-chain risk — **must not** ship without scan or SEC-NA-1. |
| Other Node/package application repos (e.g. SPA, mobile bundle) | SEC-C1-A + SEC-C1-F; apply SEC-C1-C only if the repository contains a token-persistence surface | SEC-C1-B follows the production dependency surface and **must** be on or N/A per SEC-NA-1 (e.g. no lockfile surface — justify). |

These are minimum profiles for the named repository classes, not a universal profile for every adopter. SEC-C1-A applies to repositories with CI; B follows deployable dependency surfaces; C follows token-persistence code; and F applies to Node/package ecosystems. Register any control that is out of scope as N/A under SEC-NA-1.

SEC-C1-D, SEC-C1-E, SEC-S-C1-G **must** be on or N/A per SEC-NA-1 in the project security scope register.

SEC-C1-B package-root coverage: In a repository with multiple package roots or
lockfiles, the production dependency scan **must** run against the own package root
and lockfile of every independently deployable production service. A root-only scan
is not evidence for a nested deployable backend; an omitted deployable package is an
unscanned production path and therefore a pipeline violation.

SEC-C1-B dependency-role integrity: Moving a package from `dependencies` to
`devDependencies` is not a vulnerability remediation by itself and **must not** be
used to evade the production scan. Reclassification is valid only when code/config
evidence proves the package is build-, lint-, or test-only; the shipped artifact
does not execute it; and the documented production build installs the required
development tool before artifact creation. A runtime package remains in the
production graph even when reclassification would make an audit green.

SEC-S-C1-G full-lockfile closure: A release/security review that surfaces a
critical or high advisory in the committed build, lint, or test tool graph **must**
resolve it or carry a written, time-bounded exception; production-only audit success
does not make the full-lockfile finding disappear. First remove a redundant direct
tool declaration when the stack's canonical package already owns that tool. When the
parent range already admits a patched version, keep the remediation within the same
major and verify the regenerated lockfile with a full-tree audit plus dependency-tree
resolution. The full-tree audit complements, and never replaces, each deployable
service's own production-root audit required by SEC-C1-B package-root coverage.

SEC-S-C1-G selected-advisory closure and transitive compatibility: When a specific advisory is selected
for remediation, its configured audit threshold does not establish whether that
advisory is closed. Inspect the full audit result for every affected package
root, resolve the installed version in each independent lockfile, and verify the
parent dependency paths still resolve to the patched package. Do not remove a
direct declaration solely to silence an advisory while source still imports its
API or types; removal alone does not repair a transitive vulnerable copy.
Assess reachability from actual callers, but a vulnerable package being unreachable
from current code **MUST NOT** be treated as closing the advisory: an installed
vulnerable package is not itself proof of an exploitable path, and an unreachable
current path is not evidence that the advisory disappeared.
When a patched transitive package lies
outside its parent's declared range, do not force that leaf version before checking
its module format and callable API against the parent's actual import. Prefer a
compatible maintained version of the existing parent that removes the vulnerable
edge; inspect its resolved dependency closure, peer requirements, runtime floor,
and legitimate caller behavior. Keep one manifest authority for any necessary
version constraint and regenerate the lockfile from it. The existing full-tree audit
mechanically rejects a surviving advisory, while dependency-tree inspection and
focused caller execution are still needed to establish compatibility: an audit
cannot determine whether a module-format or API change breaks the caller.
This decision depends on the externally selected advisory and the package registry's
current advisory data, which a static single-file lint rule or repository-only
guard cannot know.

No static advisory fence is admitted here: current external advisory data and dependency graphs are already checked by the package-root audit and lockfile integrity (ENA-A1(c)).

Alert identity and stale-exception review: A withdrawn repository alert closes
only that alert identity; it does not clear a different live advisory against the
same package. Before changing a dependency or retaining an exception, compare the
alert's advisory identity with the current package audit and the advisory's patched
version, then trace the installed parent range. Advisory metadata can lag a published
fix: when its patched-version field conflicts with a claimed release, inspect the
publisher's tagged source and the package artifact before calling that release safe.
If a patch is now available, remove or revise any record claiming that no patch
exists and resolve through a compatible parent when possible; do not force an
incompatible transitive major. This comparison
requires current external advisory and registry state, which a repository's static
lint/guard inputs cannot establish; the audit gate still enforces its declared
threshold and dated exceptions at each run.

SEC-C1 workflow dependency integrity: A remote CI action that executes code
**must** be pinned to an immutable full commit SHA. A readable release tag may be
recorded as a comment but **must not** be the execution reference; the action
dependency **must** remain visible to the platform's dependency updater. A
`docker://` action has no repository commit ref and therefore **must** use an
immutable `sha256` image digest; a mutable image tag is not compliant.

SEC-C1-B deployment-boundary integrity: The production dependency scan **must**
be fail-closed at the merge/push boundary and **must not** be fail-closed at the
deploy boundary. Both halves are binding; satisfying one does not excuse the other.

*Merge/push boundary — required.* Every independently deployable production package
root **must** be scanned by a blocking gate before its code can enter the mainline.
The canonical audit command **must** run in the pre-push gate chain and, where hosted
CI exists, in the CI workflow. A superset run of the same command — same threshold and
exception file, development dependencies included — satisfies this; running both the
production-only and the superset scan is a duplicate step ([ENA-PL2](../enforcement-architecture/enforcement-gates-and-lifecycle.md)). An advisory published after merge **must** still be
detected: by a scheduled scan, or — where the repository has no hosted CI — by the
platform's advisory alerts covering every lockfile root. Alert enablement is a
repository setting no in-tree check can read, so it needs a SEC-NA-1 record.
An advisory-only run, or one a developer can skip, is not a gate.

*Deploy boundary — forbidden.* Running that same scan as a fail-closed pre-deploy
hook — or otherwise aborting deployment on audit exit code — is an anti-pattern.
The artifact being deployed is code that already passed the merge-boundary scan, so
the deploy-time run makes no new security decision. What it adds is a failure mode:
a newly published advisory against an unchanged lockfile blocks every deployment,
including the deployment carrying the remediation. That converts a dependency
advisory into an availability incident and simultaneously blocks shipping security
fixes — availability cost with no security gain. Softening the hook with a shell
success operator is not a remedy either, unless the platform documents that the hook
value is shell-interpreted; an unverified escape does not belong under a deploy gate.

*Residual risk — accept explicitly.* Leaving the deploy boundary open means a CVE
published between merge and deploy does not stop that deploy. This is the intended
trade: detection continues at the push gate and post-merge detection, while the
remediation path stays open. Removing a FAIL gate is a GSEC6 event and
**must** carry a SEC-NA-1 register entry.

For an infrastructure-as-code change, verify the parsed configuration that will
actually be applied, not comments or unrelated source text. A check must bind the
selected service/resource unambiguously and reject alternate or mutable declarations
that could make the checked target differ from the applied target. When verification
also depends on parity with release gates, workflows, image startup, or routes, it is
a cross-file obligation that a single-file check cannot establish; fail closed on
dynamic expressions the check cannot resolve.

SEC-C1 workflow credential integrity: A workflow that checks out
pull-request-controlled repository code and then executes repository commands
**must not** persist checkout credentials beyond the checkout step unless a
documented later step requires them with least privilege. Read-only workflow
permissions do not replace removing an unnecessary credential from the working
copy. Mechanical enforcement of action references or action inputs **must** inspect
the parsed YAML job/step structure; text presence or indentation regex is not
proof because flow mappings and same-named keys under another YAML scope are
valid but semantically different.

Monorepo-external pure documentation repos: SEC-C1-F may be N/A (SEC-NA-1).

---

## SEC-M-MON-1 — Security-distinguishable logging (**MUST**)

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-M-MON-1** | Security-relevant events (failed auth spikes, sensitive 403 bursts, invalid signature / token format surges, break-glass secret access per SEC-M-SECRET-ACL-2) **must** be logged with distinguishable codes/fields in production log stream; central target (managed logging service or SIEM) documented or N/A per SEC-NA-1 with non-production-only justification (not acceptable for prod long-term). | Bug / blind spot. | Log schema review + drain doc. |

---

## SEC-M-MON-2 — Per-key security alerting (**MUST**)

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-M-MON-2** | Low-volume security events aimed at ONE key **must** raise an alert, judged per key with ABSOLUTE thresholds and no baseline multiplier (a system-wide baseline dilutes one account's attack), for exactly these six classes: (1) failed sign-in / code attempts and per-target limiter refusals per target; (2) any refusal of a password-guess budget; (3) authorization denials on distinct routes per actor; (4) signature failures per webhook provider; (5) distinct superseded sessions per account; (6) repeated write rejections per actor and route. Inputs are the contributor dimensions already counted with each event (no second counter); delivery is the existing alert-episode path (one episode → one alert naming the key and its sources); own-key episodes per class are capped with one shared overflow alert so a sprayed attack opens a bounded number of alerts. Signature failures stay expected-class, never SYSTEM (public endpoint: junk would flood the error tracker). | Bug / blind spot. | Review of the security subject class table and its thresholds (review-held, ENA-GV3). |

---

## SEC-S-MON-2 — Alerting (SHOULD)

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-S-MON-2** | SHOULD: threshold alerts (email/Slack/Pager); SIEM forwarding product decision. The six per-key classes are MUST under SEC-M-MON-2. | Roadmap. | Runbook. |

---

## Medium priority — operational hardening (SHOULD, non-normative list)

Purpose: Enterprise roadmap — not merge blockers unless promoted to **MUST** in a future amendment.

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-S-AUDIT-1** | SHOULD: Immutable audit trail for security- or finance- relevant mutations (actor, target, time, action type) — product schema; aligns with SEC-M-MON-1 visibility. | Maturity gap. | Design review. |
| **SEC-S-SBOM-1** | SHOULD: SBOM export and/or signed release policy for production artifacts — documented in security or release notes (OWASP A08 complement to SEC-M-WH-1). | Maturity gap. | Release doc. |

| Area | Guidance |
|------|----------|
| Anomaly | Multi-country/device signals aligned with SEC-M-MON-1 / SEC-S-MON-2 |
| Login brute force | Stricter limit than global rate limit; lockout/delay documented |
| Session hijack | Align with SEC-M-HIJ-1 — [client transport](security-client-transport.md) |

---

## Modular security helpers (COD-M3)

| ID | Rule | On violation | Verify by |
|----|------|--------------|-----------|
| **SEC-M-MOD-1** | When security helper modules mix concerns, **must** split per [COD-M3](../code-modularity/code-modularity.md) (e.g. a credential-store adapter, a token-lifecycle authority, an API-key validator, and a cryptographic policy module). | Maintainability bug. | PR size / structure review. |

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|---------------------|
| Required SEC-C1 row off without SEC-NA-1 | STOP — enable or register N/A. |
| SEC-M-MON-1 cannot be met in prod | STOP — implement logging codes + drain or document unacceptable gap and escalate (no silent gap). |

---

Migration note: Map prior CI, monitoring, and modularity guidance to these identifiers and remove duplicate definitions.

Part of: [README.md](README.md).

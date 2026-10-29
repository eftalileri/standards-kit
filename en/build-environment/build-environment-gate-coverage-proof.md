# Build and environment — gate coverage proof

```kit-cover
type: normative
part-of: README.md
binds: BE-M25 — proving that registered tool rules are effective across the files in their declared scope
open-when: shape:backend-heavy, shape:mechanical-enforcement, signal:build-config, signal:lint-scope, signal:env-variable, signal:dependency-upgrade, signal:container-image
skip-when: signal:no-build-or-environment-change
owns: BE-M25
```

Scope: Effective gate coverage after configuration composition and precedence. [BE-M17](build-environment-config-and-runtime-floor.md) governs scope declaration; this rule governs whether registered rules actually apply to every intended file.

**References:** [build-environment.md](build-environment.md); [BE-M17](build-environment-config-and-runtime-floor.md); [false-positive check design](../false-positive/check-design-rules.md); [SSoT principles](../ssot/ssot-principles-and-precedence.md).

## MUST — BE-M

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| **BE-M25** | A rule’s registration is not its enforcement. Where a tool-chain configuration resolves rules by precedence, the effective severity **MUST** be measured per file from the tool’s own resolver, and a blanket disable over a subtree answered by a re-enable list **MUST** be fenced by that measurement — a count taken once is a photograph, not a fence. Clauses (a)–(f) [below](#be-m25--registration-is-not-enforcement) bind. | Silent false green — the registration, its scope, its severity and the block comment all read as coverage while the gate never looked; a clean report and an unenforced tree are indistinguishable in the output, and the next author copies the pattern because nothing objected. | Real-gate probes [below](#be-m25--registration-is-not-enforcement); use the enforcement mechanism the adopting project documents and record its actual scope and limits. |

<a id="be-m25--registration-is-not-enforcement"></a>

### Registration is not enforcement — BE-M25 clauses

A profile that switches a whole rule family off over a subtree and re-opens the needed locks afterwards is a legitimate, often necessary shape; what is not legitimate is leaving the re-open list to be maintained by hand.

(a) The re-open list is a hand-written membership and inherits every failure of one ([**BE-M17**](build-environment-config-and-runtime-floor.md)). Every rule registered against that subtree *after* the list was written is silently switched off again: the registration is correct, its scope names the subtree, its severity is blocking, the block comment describes the lock, and the gate reports zero findings — because nothing ran. An inventory closing the class with “N of N re-opened, 0 silent” is true only for the tree of the day it was taken, and says nothing about the next registration.

(b) The measure is completeness, never existence. A fence asking “is this rule effective somewhere inside the scope it declares?” proves the scope is non-empty, not that it is covered: a single file exempted from the disabling block keeps the whole scope reading as enforced. Ask instead, for every file the scope names, whether the rule resolves to a blocking severity there, and report the count of files where it does not.

(c) The counterfactual is computed with the tool’s own resolver, never derived by reading the configuration. Resolve each file twice — once under the production configuration, once under the same configuration with the blanket disable removed — and take the difference as the silenced set. Reading the configuration and reasoning about order is precisely the method that leaves the defect in place, because precedence is what the reader is asked to simulate.

(d) A probe answering “which files does this scope name” **MUST** carry that block’s own exclusions. A probe given the block’s patterns but not its exclusions counts files the block deliberately excludes, so a completeness measure built on it reports silences that were never claimed.

(e) A deliberate silence is declared with a reason, and the declaration expires by measurement. Nothing in a configuration distinguishes an intended disable from an accidental one, so intent is declared in the fence’s own exception record — rule, exact paths, reason, review condition — and a declared entry that the measurement no longer finds silent is itself a finding, or the exception outlives the reason for it and swallows the next, unrelated silence.

(f) A completeness ratio whose denominator is zero is not coverage — it is the same silence one level up. (b) asks, for every file a scope names, whether the rule resolves to a blocking severity there; a scope that names no file satisfies that ratio vacuously and reads as covered, so the completeness measure carries its own blind spot. Two shapes empty the denominator and both are silent: a scope address whose fixed root no longer exists — a directory deleted while its pattern stayed behind, and a pattern matching nothing is not an error in any matcher the author will meet — and a rule identity whose entire registration resolves to no effective file anywhere in the tree. The fence **MUST** therefore carry two further assertions whose denominator is not a single entry: *(i)* every pattern’s fixed root — the path segment before its first wildcard — **MUST** resolve inside the governed tree; *(ii)* every rule identity registered at blocking severity **MUST** resolve effective on at least one scanned file, counted over the whole tree rather than per entry. Bind *(i)* to the root and never to the match count: a pattern matching zero files today whose root is alive is a forward-looking scope declaration, and deleting it is a loss of future coverage, not a cleanup. Both denominators — how many roots were resolved, how many rule identities were measured — **MUST** be printed in the clean output, or the reader cannot tell a measured zero from an unmeasured one ([**FP-M19**](../false-positive/check-design-rules.md)).

**Verify:** Remove one rule from the re-open list, run the real gate command (not a hand-built invocation with overrides), and confirm it fails naming that rule, the block that declares it, and the count of scope files where it resolves to off; restore and confirm zero. Read the exit code without a pipe. Separately confirm the exception record: add an entry for a rule and path that is not silent and confirm the fence reports it as stale. For (f), prove the two assertions are not restatements of (b): point a pattern at a directory that does not exist and confirm the fence names the pattern and its missing root; then point a rule’s only registration at a live directory holding no file of that extension and confirm the fence names the rule while the per-entry completeness measure stays silent — that divergence is the proof, because a measure whose denominator is one entry cannot see an entry with no files. Read both denominators in the clean output and confirm neither is zero.

**Stated enforcement limit:** the fence measures *that* a registration is inert; it cannot decide *whether that is intended*, because no property of the configuration marks a disable as deliberate — that is why (e) exists and why the declaration, not the fence, carries the reason. Nor is this a single-file lint concern: the fact lives in the composed resolution of several configuration modules and their order, which no one file’s syntax tree contains, so it belongs to an aggregate check.

**BE-M25 resolution when the disabling profile is movable:** Apply the subtree’s parser, language options and base-rule changes before its scoped rule registrations, then remove the blanket custom-rule disable and its re-enable roster in the same change. This is valid only after the tool’s resolver shows identical effective rule severities, options, parser, globals and declared exclusions for every affected real file before and after; a green lint run alone cannot prove that. Keep the aggregate scope-parity fence, since future composed modules can still override a registration. The check is cross-file by nature: no one configuration module’s syntax tree contains the final ordered resolution. A deliberate narrower rule scope remains at its original registration with its recorded reason; the profile move does not widen it by assumption.

**BE-M25 scanned tree includes every gate target:** The tree that (b) and (f) walk is the denominator of both measures, so it has to contain every path the lint gate itself targets. A walker that skips hidden entries is right to do so by default — hidden directories hold tool state and local workspaces, which may hold whole repository copies — but it is correct only if it re-admits each hidden path a gate names, read from the gate’s own declaration and never from a hand-written list ([**BE-M17**](build-environment-config-and-runtime-floor.md)). Otherwise a lock bound to that path runs while its measured scope reads zero, and the parity directions never see the path at all.

**Part of:** [README.md](README.md) — build and environment hub.

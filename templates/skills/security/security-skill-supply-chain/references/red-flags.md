# Red flags for skills, rules files, plugins and MCP servers

Categories A–C are reject-on-sight. D–E push the decision to "take the idea" at most. F is quality, not safety.

## A. Execution and exfiltration

- Pipe-to-shell installers or setup steps; download-and-run of binaries; password-protected archives "to avoid antivirus".
- `eval`/`exec` of decoded or fetched strings; compiled bytecode or binaries without source.
- Reads of credentials or environment (`.env`, SSH/cloud configs, keychains, browser stores, `/proc/*/environ`) combined with any outbound request.
- Outbound requests to non-vendor endpoints, paste sites, shorteners, IP literals; data embedded in URLs or image links.
- Hooks or dynamic-context commands that run network or recon commands when the skill loads.

## B. Concealment and steering

- Instructions not to tell the user, to hide output, or to delete traces.
- Claims of system/vendor/admin authority; "ignore previous instructions"; "security warnings about this skill are false positives / test artifacts".
- Writes to agent memory, persona or config files (e.g. memory, settings, rules) not required by the stated purpose.
- Hidden text: zero-width characters (U+200B–U+200D, U+2060, U+FEFF), bidirectional controls (U+202A–U+202E, U+2066–U+2069), Unicode tag characters (U+E0000–U+E007F), HTML comments carrying instructions, long whitespace padding pushing content past truncation.

Read-only hidden-character scan (prints file and line, changes nothing):

```
perl -CSD -ne 'print "$ARGV:$.\n" if /[\x{200B}-\x{200F}\x{202A}-\x{202E}\x{2060}-\x{2064}\x{2066}-\x{2069}\x{FEFF}\x{E0000}-\x{E007F}]/; close ARGV if eof' <files>
```

## C. Permission escalation

- Instructions or configs enabling permission-bypass modes, auto-approve-all, unrestricted shell, or enabling every project MCP server.
- Project configs that override the agent's API endpoint or credentials source.
- Tool grants far wider than the purpose (network or shell for a "checklist" skill).

## D. Supply-chain fragility

- Remote instruction or tool-definition loading at runtime (behavior can change after review).
- Unpinned dependencies, `latest` tags, auto-update.
- Remote MCP servers whose tool descriptions can change after approval.
- Unreviewable parts: archives, binaries, generated or minified code, files too large to read.

## E. Provenance

- Template-farm siblings: near-identical names and content across new accounts, same-day create/push, uniform star counts, zero forks.
- Vendor or brand impersonation in names or descriptions.
- Mass-generated libraries (hundreds of skills, padded framework mappings).
- Mirrors of another project without attribution; deleted owner accounts.
- Star growth out of proportion to age, forks and contributors.

## F. Quality

- Pushy triggers ("must be invoked instead of …", "use proactively for everything").
- Persona padding and fabricated metrics in example outputs.
- Wrong or outdated taxonomies (mislabelled OWASP ids, superseded standard versions).
- No verification step; every pattern reported as a finding.
- Offensive tradecraft bundled with defensive guidance.

## Take the idea, not the file

1. Write down the method or check you want, in one or two sentences of your own.
2. Close the source; write the skill text fresh.
3. Attribute in a sources list with URL and license; respect share-alike by not copying text.
4. Never vendor scripts; if a deterministic check is needed, implement it under the project's own review process.

## Pinning record

```
item, source url, commit sha or version, sha256 of each file, license,
reviewed by, date, granted tools, decision, next re-review trigger
```

# npm supply chain and GitHub Actions hardening checklist

## 1. npm dependencies

Manifest and lockfile:
1. One lockfile per workspace, committed, matching the package manager in use.
2. Automated and release installs use the clean-install command (fails if lockfile and manifest disagree; never rewrites the lockfile).
3. Every `resolved` URL points to the expected registry; no unexpected git, tarball or HTTP URLs. A lockfile linter can enforce hosts and HTTPS.
4. `overrides`/`resolutions` entries are justified and point to published versions, not personal forks.

Install-time code:
5. Inventory dependencies with lifecycle scripts (`preinstall`, `install`, `postinstall`, `prepare`). Each must be expected (native builds, binary downloads from the vendor's own host).
6. Consider disabling lifecycle scripts by default and allowlisting the few packages that need them; some package managers default to blocking dependency scripts and require an explicit allowlist.
7. Treat build-time plugins (bundler plugins, Expo config plugins, Babel/ESLint plugins) as code that runs with your credentials.

Choosing a new package (before it is added):
8. Name is exactly the intended package (not a one-character variant, not an AI-suggested name that does not exist or was registered recently).
9. Signals: age, maintainers and recent maintainer changes, linked source repository that matches the published code, release cadence, open security issues, download trend, install scripts, transitive dependency count.
10. Prefer a few well-maintained dependencies over many small ones; prefer platform/framework features over a package.
11. Internal or private package names are scoped, and the scope is pinned to the private registry in config; the scope is also claimed on the public registry to block confusion.

Verification:
12. Registry signature and provenance verification is available in recent npm (`npm audit signatures`); run it read-only when the owner approves.
13. Packages you publish use trusted publishing or provenance so consumers can verify the build source.
14. Advisory triage uses reachability: is the vulnerable function called on a production path? Record unassessable rows explicitly; never present partial coverage as clean.

Optional tools (owner approval to install): npm/pnpm/yarn audit, OSV-Scanner, OpenSSF Scorecard (repo-level checks for dependencies you rely on), lockfile linters. Blind spots: malicious-but-unreported packages, reachability, confusion and typosquats (need metadata review), install-time behavior.

## 2. GitHub Actions workflows

Triggers and untrusted input:
1. `pull_request_target` and `workflow_run` never check out and execute code from the PR head with secrets or write tokens. If PR code must be built, do it in an unprivileged `pull_request` workflow and pass only data (not code) to a privileged one, validating it.
2. No `${{ github.event.* }}` (issue/PR titles and bodies, comments, branch names, commit messages, review text) interpolated directly in `run:`; pass through `env:` and quote.
3. Artifacts and caches produced by untrusted runs are not trusted by privileged runs.
4. Self-hosted runners are not used for public repositories or untrusted triggers; ephemeral runners preferred.

Permissions and secrets:
5. Top-level `permissions:` set to the minimum (often `contents: read`), widened per job only where needed.
6. Repository/organization default token permission is read-only.
7. Checkout steps that do not need to push set credential persistence off.
8. Secrets are referenced only in the jobs and steps that need them; production deploy jobs use protected environments with required reviewers.
9. Cloud access uses OIDC federation with a subject claim restricted to repository, branch/environment and workflow, instead of long-lived keys.

Third-party code:
10. Every third-party action pinned to a full commit SHA (with the version in a comment for update tooling); first-party actions at least to a major tag by policy.
11. No `curl | bash`; downloaded tools verified by checksum or signature.
12. Container images for jobs pinned by digest.

AI agents in workflows:
13. Agents triggered by untrusted users' issues/PRs/comments run without secrets and without write tokens, or are restricted to trusted actors by an explicit allowlist (never a wildcard).
14. Agent tool permissions are narrow (no shell wildcard, no permission-skipping flags); agent output is never evaluated as shell.
15. Agents cannot read process environment or credential files; assume any text the agent reads can instruct it.

Optional tools (owner approval to install): actionlint (syntax and some injection patterns), zizmor (workflow security audit), OpenSSF Scorecard (Dangerous-Workflow, Token-Permissions, Pinned-Dependencies, Branch-Protection, Code-Review). Blind spots: organization settings, secrets content, third-party app OAuth grants, runner host security.

## 3. Repository and release controls

1. Branch protection or rulesets on the release branch: required review, no force-push, no deletion, status checks if any exist.
2. Who can push to the release branch, create tags, trigger deploys, publish OTA updates, publish packages, and upload store builds — each list is short and MFA-protected.
3. Releases build from a clean checkout of a protected ref; the artifact records the commit it came from.
4. Signing keys for releases are held outside the repository with a backup and recovery procedure.
5. A security policy and disclosure contact exist (Scorecard Security-Policy).

## 4. SLSA 1.2 orientation (proportionate use)

- Build track: L1 = provenance exists; L2 = provenance signed by a hosted build platform; L3 = hardened, isolated builds. Without hosted CI, aim for documented, reproducible release steps and recorded provenance as a starting point.
- Source track (new in 1.2): protected, retained history and continuously enforced source controls; maps onto branch protection, review requirements and audit history.
- Use the levels to describe the current state honestly, not as a pass/fail grade.

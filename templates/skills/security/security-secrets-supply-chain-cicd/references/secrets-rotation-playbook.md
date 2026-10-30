# Secret scanning scope and rotation playbook

## 1. Where to look

| Scope | How (read-only) | Note |
|---|---|---|
| Working tree | pattern + entropy search over all files except vendored dependencies | include dotfiles, config-as-code, app config, example env files |
| Git history | history-mode scan over all refs (branches, tags) | a deleted file is still in history and in every clone and fork |
| Web build output | search exported static files and source maps | public-prefixed env values land here |
| Mobile JS/OTA bundles and binaries | search bundle strings, app config, native resources | see `security-mobile` binary review |
| Container images | scan layers, not only the final filesystem | build args and copied files persist in layers |
| CI logs and artifacts | search retained logs and uploaded artifacts | masked-secret features miss transformed values (base64, URL-encoded) |
| Error tracking and logs | ask `security-privacy-logging` to check events for tokens and headers | |

Useful pattern families (adapt to the providers in use): cloud access keys, payment secret keys, messaging/SMS/WhatsApp provider tokens, push-service credentials (APNs `.p8`, FCM service accounts), database and cache URIs with embedded credentials (`mongodb+srv://user:pass@`, `redis://:pass@`, `rediss://`), JWT signing secrets, private key blocks, OAuth client secrets, error-tracking auth tokens, store API keys, generic `*_SECRET`/`*_TOKEN`/`*_KEY` assignments with literal values.

## 2. Scanner trade-off (optional tools, owner approval to install)

| Tool type | Strength | Weakness |
|---|---|---|
| Pattern scanners (e.g. gitleaks) | fast, offline, good for hooks and history sweeps, custom rules | no liveness check; noisy on high-entropy test data; custom token formats need rules |
| Verifying scanners (e.g. TruffleHog) | can tell live from dead by calling the issuer; many detectors; scans more sources | sends candidate credentials to issuers (needs owner approval); heavier; verification only for supported types |
| Code-host secret scanning with push protection | blocks known formats at push time | availability depends on plan; only known partner formats; does not cover local-only repos |

Run verifying mode only with approval; otherwise treat every real-looking secret as live.

## 3. Rotation playbook (owner executes; the agent recommends)

1. **Contain first.** Treat as live. Identify what the secret grants and who could have seen it (repo visibility, collaborators, forks, CI log readers, app users for bundled secrets).
2. **Issue a replacement** at the provider with the least privilege that works (narrower scope, restricted origin/app, expiry where possible).
3. **Deploy the replacement** to every consumer (platform variables per environment, build service, CI, local developer configs). Prefer reading from the secret store over copying values.
4. **Verify** consumers work with the new value (read-only health checks, not ad-hoc production writes).
5. **Revoke the old secret** at the provider. Rotation without revocation is not rotation.
6. **Review usage logs** at the provider for the exposure window: unusual IPs, regions, API calls, spend. Escalate to incident handling if misuse appears.
7. **Clean up** after revocation: remove from the tree; optionally rewrite history (coordinate with every clone owner; forks and caches may retain it); purge CI logs/artifacts that contain it; remove from bundles by moving the call server-side.
8. **Prevent recurrence:** move the use server-side if it was client-side; add the pattern to the project's scanning; record the rotation (date, secret name, reason — no value) in the project's secret inventory.

Special cases:
- **Signing keys** (mobile, OTA, package, container): rotation may require new app versions, new runtime versions or store-side key reset procedures; plan before revoking.
- **Database users:** create the new user, switch consumers, then drop the old user; check that no long-running job still uses it.
- **JWT signing secrets:** rotating invalidates all sessions unless multiple keys are accepted during a transition (`kid`-based); decide deliberately.
- **Webhooks shared secrets:** most providers support two active secrets during rollover.

# Client observability (React Native / Expo)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** client crash reporting, session diagnostics, breadcrumbs, performance traces

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) -- **P1-P8** when this topic is in scope (P8 verification when implementation-bound); cite in deliverables per [markdown-authoring **M16**](../authoring/markdown-authoring.md).

Purpose: Normative single source of truth for crash and session observability on React Native / Expo. Apply provider-specific setup only when that provider is selected; verify the supported SDK integration against the project’s Expo and native-runtime versions.

Normative core: [`client-observability-rn.md`](client-observability-rn.md) -- definitions, agent contract and the **MUST NOT** rows. This README routes; it defines no rule rows.

---

## Scope (hub)

- Included: SDK initialization, environment separation (development vs production), release/build identity mapping for the project’s build service, and PII minimization. On-device logs have no transport by default and are never a failure’s sole handling (**COB-RN-M11**); paths that absorb failures by returning defaults still reach the single classification authority (**COB-RN-M12**).
- Excluded: Backend logging -- [logging policy](../logging-policy/README.md). Do not assume client and server helpers with similar names have the same transports (**COB-RN-M11**). Product analytics vendor selection is outside this topic; keep crash telemetry distinct from analytics events.

Decision gate: A production client needs a verified crash-reporting path appropriate to its support and incident-response requirements.

Environment: Configure DSN and release/build identity through the project’s documented environment and build configuration; never assume a particular hosting or build provider.

---

## Reading order (routing)

Each entry names the file that defines those rule IDs; the obligation is in that file, not in this list.

1. [client-observability-rn.md](client-observability-rn.md) -- Definitions (**COB-RN-D1-COB-RN-D4**), agent contract (**COB-RN-C1-COB-RN-C2**), **MUST NOT** (**COB-RN-N1-COB-RN-N8**).
2. [sdk-setup-and-pii-scrubbing.md](sdk-setup-and-pii-scrubbing.md) -- **COB-RN-M1-COB-RN-M4**, **COB-RN-M14**, **COB-RN-M17-COB-RN-M19**, **COB-RN-M21** -- every client failure class's reporting path and the release/dist/OTA identity (with OTA source maps) each event carries, SDK initialization in shipped builds and before the application graph evaluates, PII stripping, the single credential denylist, the global event context, the per-artifact build identity, the environment split that keeps simulator runtimes out of production, and native error codes that survive the release optimizer.
3. [classification-authority-and-outbound-links.md](classification-authority-and-outbound-links.md) -- **COB-RN-M6** -- the one authority resolving category to severity to channel, which lifecycle seam may own a mutation failure, and what a report must still carry when it reaches the channel.
4. [outbound-link-ownership-and-visibility.md](outbound-link-ownership-and-visibility.md) -- **COB-RN-M5**, **COB-RN-M7**, **COB-RN-M15** -- what a call site owes when it asks the platform for something it may not be able to do: `Linking.openURL` promise ownership through one schema-validated authority helper, the platform package visibility a capability probe depends on, and reading a runtime capability from the layer that owns it so an impossible operation is never filed as a failure.
5. [credential-masking-and-build-secrets.md](credential-masking-and-build-secrets.md) -- **COB-RN-M8**, **COB-RN-M9**, **COB-RN-M16** -- the shared credential-key predicate and masking criterion, and the shared event sanitizer.
5a. [build-symbol-upload-credentials.md](build-symbol-upload-credentials.md) -- **COB-RN-M10** -- build-runner resolution of the source-map / debug-symbol upload credential.
6. [silent-failure-paths.md](silent-failure-paths.md) -- **COB-RN-M11** -- a failure the code catches: caught failures still need a delivered reporting channel; preserve the original failure identity and avoid duplicate records. Use a mechanically enforced check where the code shape supports one, and state any remaining review-only limit.
7. [absorbed-defaults-and-global-nets.md](absorbed-defaults-and-global-nets.md) -- **COB-RN-M12**, **COB-RN-M13**, **COB-RN-M20** -- a failure nobody owns: degraded-default paths must still be reported, a global failure net must name the operation, and every promise has an owner of its rejection (`no-floating-promises` on the client profile).
8. [client-observability-rn-appendix.md](client-observability-rn-appendix.md) -- non-normative explanation of recurring failure patterns for **COB-RN-M11-COB-RN-M13**; defines no rule ID and is not part of the reading path.

---

## Rule identifier prefix (normative index)

| Prefix | Meaning |
|--------|---------|
| **COB-RN-C**\* | Agent execution contract |
| **COB-RN-D**\* | Definitions |
| **COB-RN-M**\* | **MUST** |
| **COB-RN-N**\* | **MUST NOT** |

---

## Related

- [Analytics RN](../analytics-rn/README.md) -- product behavior (PAN-\*), not crash telemetry.
- [Build environment](../build-environment/build-environment.md) -- env vars and CI.
- [Security](../security/README.md) -- secrets, token handling in breadcrumbs.
- [Error handling](../error-handling/error-handling.md) -- user-facing errors vs telemetry.

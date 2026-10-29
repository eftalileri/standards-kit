# Client observability -- build-time symbol upload credentials

```kit-cover
type: normative
part-of: README.md
binds: build-time source-map / debug-symbol upload credential resolution
open-when: shape:frontend-heavy, signal:pii-scrubbing, signal:credential-masking, signal:source-map-upload
skip-when: signal:backend-only, signal:no-telemetry-change
owns: COB-RN-M10
```

Scope: Resolve the credential used by a selected crash-reporting provider to upload source maps or debug symbols. The applicable secret name, runner injection, generated native configuration, and local credential mechanism depend on the provider and build system; verify each against their supported documentation.

Document type: Normative part -- **COB-RN-M10**.

Related rule placement: Runtime credential classification and masking are defined in [credential-masking-and-build-secrets.md](credential-masking-and-build-secrets.md). This document covers build-time source-map/debug-symbol upload credentials, when that upload feature is used.

References: [README.md](README.md); [credential-masking-and-build-secrets.md](credential-masking-and-build-secrets.md) (**COB-RN-M8**, **COB-RN-M9**, **COB-RN-M16** -- the runtime masking criterion this rule's credential must never reach); [build-environment-config-and-runtime-floor.md](../build-environment/build-environment-config-and-runtime-floor.md).

---

## **MUST**

| ID | Rule |
|----|------|
| **COB-RN-M10** | Treat source-map/debug-symbol upload credentials as properties of the actual build runner and selected provider integration, not as values guaranteed by a project profile. Verify that the required credential is present in the runner process that invokes the upload tool; a value stored in a provider dashboard but absent from that process is unavailable. Generated native configuration may omit secrets or be regenerated from plugin options, so do not assume a repository-root properties file is read by the native build; confirm the selected integration’s documented source of truth. A hosted-only secret may not be available to local builds, and changing its visibility in place may not be supported; use the secret store’s documented recreation or migration path. For local uploads, use the provider CLI’s supported user-level credential store outside the repository, with owner-only permissions where applicable. Never write the credential to tracked files, build-profile configuration, documentation, command text, or shell history. Verify with a safe provider-supported authentication/info command or test upload using the same runner/config path; do not print the credential. |

Provider-specific upload endpoint (**COB-RN-M10** application). If the selected provider uses regional upload endpoints, configure the build integration for the organization’s current region using its authoritative provider settings. Event-ingest configuration does not necessarily configure build-time upload tools, and source maps and native symbols may use different endpoints. Verify generated configuration and perform a provider-supported upload check before changing credentials or disabling symbol upload. Treat region as external provider state: do not duplicate it as a hard-coded value in a separate guard.

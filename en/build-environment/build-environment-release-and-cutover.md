# Build and environment — durable release and cutover

```kit-cover
type: normative
part-of: README.md
binds: BE-M19 and BE-M22 — durable evidence for cross-version release and separating stable target identity from per-release attestation
open-when: shape:backend-heavy, signal:writer-cutover, signal:deployment-cohort, signal:release-gate
skip-when: signal:no-cutover-or-release-change
owns: BE-M19, BE-M22
```

**Scope:** Durable release proof for a cutover where old and new runtime versions may overlap, including work that gates irreversible writes. Use only when the application needs a staged rollout or cohort-convergence barrier.

**References:** [build-environment.md](build-environment.md); [runtime floor](build-environment-runtime-floor.md); [SSoT principles](../ssot/ssot-principles-and-precedence.md); [security zero-trust authority](../security/security-zero-trust-authority.md).

## MUST — BE-M

| ID | Rule | Consequence | Verify |
|----|------|-------------|--------|
| BE-M19 | A cross-version production cutover **MUST** be released from durable attestation of the exact build and complete expected runtime cohort. Stage an immutable generation with the deployment/build identity and a canonical expected cohort. Each eligible new-runtime instance independently attests only after local identity and readiness prerequisites pass. Release **MUST** be a compare-and-set over the same generation and exact expected/attested cohort; an operator confirmation string or feature flag alone is not release proof. Writer boundaries **MUST** verify the durable released state before irreversible effects. | Split-cohort effects, old-runtime writes, or a false release. | Review stage schema, per-instance attestations, exact cohort comparison, and writer checks. Cohort membership and deployment state require operational evidence. |
| BE-M22 | Keep stable deployment-target identity separate from per-release attestation identity. The stable target (such as service or environment) **MUST** remain authorized at every writer boundary. Build revision, deployment ID, or instance IDs used to prove cohort convergence are terminal release evidence and **MUST NOT** be re-compared at every writer boundary after release; those values may change during a later deployment. Use one named predicate for the stable identity comparison. | Either an unauthorized target can write, or an authorized later deployment is incorrectly blocked by expired release evidence. | Review that staging/release compares the full cohort identity while runtime writer checks use only durable release state, stable target identity, and required persistence prerequisites. Verify one authorized deployment after release remains operational. |

## Verification limits

The complete cohort, instance identities, and deployment side effects exist in provider/runtime state and cannot be proven by source inspection alone. Retain both static review and operational evidence for the actual rollout. Do not treat a deployment-environment flag as an authorization check.

**Part of:** [README.md](README.md) — build and environment hub.

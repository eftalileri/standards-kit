# Build and environment

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** package manifests, environment variables, build scripts, toolchain configuration, deployment

**Purpose:** Routing hub for JavaScript/TypeScript applications that use package manifests, environment variables, generated build output, or documented deployment configuration. For other stacks, adapt the same principles to the native package and deployment authorities.

## Normative files

[build-environment.md](build-environment.md) defines the topic contract and routes to the rule families:

| File | Rule IDs | Subject |
|------|----------|---------|
| [build-environment-decision-gates.md](build-environment-decision-gates.md) | GBE1–GBE10 | Decisions before changing repository, environment, or runtime inputs. |
| [build-environment-repository-and-scripts.md](build-environment-repository-and-scripts.md) | BE-M1–M14, BE-M20–M21, BE-M26, BE-M31, BE-M33–M36 | Package, script, environment, and repository surfaces. |
| [build-environment-config-and-runtime-floor.md](build-environment-config-and-runtime-floor.md) | BE-M15–M17 | Executable configuration, declaration order, and gate scope. |
| [build-environment-runtime-floor.md](build-environment-runtime-floor.md) | BE-M18 | Runtime compatibility and deployable artifacts. |
| [build-environment-release-and-cutover.md](build-environment-release-and-cutover.md) | BE-M19, BE-M22 | Release and cutover evidence. |
| [build-environment-env-key-declaration.md](build-environment-env-key-declaration.md) | BE-M23, BE-M24, BE-M27, BE-M32 | Environment-key authority and process-specific access. |
| [build-environment-gate-coverage-proof.md](build-environment-gate-coverage-proof.md) | BE-M25 | Effective gate coverage. |
| [build-environment-deployment-config-source.md](build-environment-deployment-config-source.md) | BE-M28–M30 | Deployment configuration ownership and cutover. |
| [build-environment-prohibitions.md](build-environment-prohibitions.md) | BE-N1–N12, BE-F1 | Prohibited build, environment, and runtime patterns. |

## Related

- [Security — secrets and logging](../security/security-secrets-and-logging.md)
- [Monorepo architecture](../monorepo/monorepo-architecture.md)
- [Error policy](../error-policy/error-policy.md)
- [Build environment examples](../_meta/examples/build-environment-code-samples.md) — non-normative.

# Feature flags (React Native / Expo)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** remote config, server flags, TanStack Query, Zod, LaunchDarkly

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) -- P1-P8 when this topic is in scope (P8 verification when implementation-bound); cite in deliverables per [markdown-authoring M16](../authoring/markdown-authoring.md).

Purpose: Normative single source of truth for client feature flags and remote configuration. When flags are server-sourced, use the application’s established server-state cache and runtime-validation authority. A third-party flag SDK is optional and requires a documented project decision.

Normative core: [`feature-flags-rn.md`](feature-flags-rn.md) -- ordinary flag delivery. This README routes; it defines no rule rows.

---

## Scope (hub)

- Included: Schema for flag payloads, cache TTL policy, stale behavior, kill switch UX. Also the blocking app-control / force-update policy -- the one remote decision that can stop an installed client working at all.
- Excluded: Backend flag storage implementation. Commercial SaaS SDKs -- optional layer only with Decisions / facts.

---

## Reading order (routing)

Each entry names the file that defines those rule IDs; the obligation is in that file, not in this list.

1. [feature-flags-rn.md](feature-flags-rn.md) -- Definitions (FFL-RN-D1-FFL-RN-D2), agent contract (FFL-RN-C1-FFL-RN-C2), ordinary flag delivery (FFL-RN-M1-FFL-RN-M2, FFL-RN-N1-FFL-RN-N2).
2. [app-control-policy.md](app-control-policy.md) -- FFL-RN-M3-FFL-RN-M11 -- the blocking policy's server authority, the client decision lease and envelope, release identity, the staleness fence, the server-side API gate, the release-order precondition, and blocked-client behaviour.
3. [app-control-release-evidence.md](app-control-release-evidence.md) -- FFL-RN-M12-FFL-RN-M15, FFL-RN-N3-FFL-RN-N4 -- public-availability proof, the discovery authority, the promotion trace, and the fence-advancement rule.

---

## Rule identifier prefix (normative index)

| Prefix | Meaning |
|--------|---------|
| FFL-RN-C\* | Agent execution contract |
| FFL-RN-D\* | Definitions |
| FFL-RN-M\* | **MUST** |
| FFL-RN-N\* | **MUST NOT** |

---

## Related

- [TanStack Query](../tanstack-query/README.md) -- fetch, cache, staleTime.
- [Forms](../forms/README.md) -- Zod schemas.

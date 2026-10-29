# Redis — appendix (non-normative)

```kit-cover
type: reference
part-of: README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Part of [Redis SSOT](redis.md). This file carries a non-normative verification example only: it defines no rule ID, adds no obligation, and is not part of the reading path. Every row it names is defined in [redis.md](redis.md), [redis-connection-keys-and-authority.md](redis-connection-keys-and-authority.md), [redis-degraded-mode-and-invalidation-ordering.md](redis-degraded-mode-and-invalidation-ordering.md) or [redis-prohibitions.md](redis-prohibitions.md).

---

## Determinism note

Example verification (under the consuming project’s verification policy): with multiple instances, send requests that cross the configured rate-limit threshold through different instances; the shared policy **MUST** be applied consistently (**RDS-M8**). Verify the expected response according to the selected fail-open/fail-closed policy. Send two parallel same-key idempotent mutations to different instances; the durable row count increases by at most one and replay returns the equivalent body (**RDS-M9**, [idempotency **IDEMP-M5**](../idempotency/key-scope-and-replay-contract.md)). For a mutation followed by a same-flow authoritative read, delay the Redis delete and prove that the read does not start before the invalidation promise settles (**RDS-M17**/**N9**). Start a cache fill at generation `n`, atomically invalidate to `n+1` and delete while the authority fetch is still running, then prove the stale fill's compare-set is rejected and its result is not returned; a post-invalidation caller must join only a generation-`n+1` flight or re-read the authority, and the generation TTL must remain alive for the whole flight (**RDS-M19**/**N11**). Where the application caches external-authority evidence, prove its required provenance survives serialization and is rechecked under current policy; an older snapshot missing required fields must miss or fail closed rather than become trusted evidence (**RDS-M18**/**N10**). Make Redis unreachable while valid configuration is present; verify the service follows its documented degraded-mode policy, reports degraded health, and never silently substitutes process-local coordination (**RDS-M2**(b), **RDS-N1**). Missing or invalid required configuration follows the startup-failure policy (**RDS-M2**(a)).

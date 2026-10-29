# Client observability (React Native / Expo) -- appendix

```kit-cover
type: reference
part-of: README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Scope: Non-normative explanation of recurring client-observability failure patterns. This appendix adds no rule IDs; normative obligations remain in [silent-failure-paths.md](silent-failure-paths.md) (**COB-RN-M11**) and [absorbed-defaults-and-global-nets.md](absorbed-defaults-and-global-nets.md) (**COB-RN-M12**, **COB-RN-M13**).

References: [README.md](README.md); [silent-failure-paths.md](silent-failure-paths.md); [absorbed-defaults-and-global-nets.md](absorbed-defaults-and-global-nets.md).

---

## Recurring failure patterns

A client-local log is easy to mistake for reporting because a similarly named server logger may have a transport. Verify the shipped client’s actual delivery, retention, and retrieval path; a local line alone cannot support post-release diagnosis.

A global failure net is useful only if each event identifies the operation it observed. Framework callbacks may treat identity fields as optional, so validate the event produced by a real failure and supply stable, code-owned operation identity where needed.

A failure hidden behind a default return can appear successful indefinitely. Route it through one classification authority while preserving the existing return and throw behavior, and retain enough safe frequency information to distinguish a one-time issue from a repeated failure.

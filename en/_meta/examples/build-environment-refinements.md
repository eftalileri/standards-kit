# Build and environment — future refinements (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Purpose: Quality improvements not normative in [`../../build-environment/build-environment.md`](../../build-environment/build-environment.md) (Scope — see that file ). Adopt per project ; do not treat this list as **MUST** rows.

| Topic | Idea |
|-------|------|
| Runtime env validation | Zod / envalid / custom schema at process startup (fail fast ). |
| Build-time validation | Inject required vars during CI build and fail if missing (e.g. Vite `define` guards ). |
| Naming convention lint | ESLint rule or custom script : `process.env` keys must match `^[A-Z][A-Z0-9_]*$`. |
| Required vs optional | Keep a table of required/optional values, defaults, and where each is set (local, CI, or platform) in the project’s established environment-variable documentation; `docs/environment-variables.md` is only an example path. |
| Secret management (prod ) | Vault / cloud secret manager — see [security-secrets-and-logging.md](../../security/security-secrets-and-logging.md) (normative for secrets ). |
| CI enforcement matrix | Required checks : `build`, `test`, `lint`, `rg` for `.env.example` drift vs `process.env` usage. |

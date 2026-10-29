# Auth (client integration hub)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** login, logout, token, refresh, client state, server-state mutations, token lifecycle

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) — P1–P8 when this topic is in scope (P8 verification when implementation-bound); cite in deliverables per [markdown-authoring M16](../authoring/markdown-authoring.md).

Related: [Architecture core](../_meta/architecture-core.md) (non-normative: client stack map and topic index).

English SSOT for client-side authentication integration. Examples refer to Zustand and TanStack Query where an application adopts them; the [Security](../security/README.md) hub (SEC-D\*, SEC-M-STORE-1, SEC-M-WEB-1) remains authoritative for credential and session security.

This is not a duplicate Security standard. Tokens, crypto, server JWT/password policy, CSRF/CORS, and SEC-D\* tables are authoritative in [Security](../security/README.md).

Server-side session/actor derivation (pointer, not SSOT): when an auth or session response derives a role, access level, or actor/principal for a tenant/organization whose id came from the caller (query, body, param, or an "active context" option), the binding rule is [SEC-M-ZT-5](../security/security-tenant-scope-gates.md) — one membership-validation authority before any authorization derivation, and never an invented access level when membership is absent. Read it before touching login, profile, switch-context, or invite-accept response shaping.

## Agent TL;DR

- Keep client-only authentication presentation state separate from server session authority. Use the app's selected client-state and server-state tools where appropriate; token storage and lifecycle must follow the applicable Security authority.
- Decision gates: GAUTH1–GAUTH3 (in auth-client-behavior.md). GSEC1–GSEC6 when security scope applies.

Security-sensitive token storage, cryptography, and server authentication policy belong to the project's security authority; this hub covers client integration only.

---

## Reading order

1. [auth-governance.md](auth-governance.md) — AUTH-GC-1–AUTH-GC-8, scope and Security precedence.
2. [auth-client-behavior.md](auth-client-behavior.md) — AUTH-M- / AUTH-N-\*, GAUTH1–GAUTH3, AUTH-M-GSEC-1 (GSEC1–GSEC6 when in scope).

Use the enforcement mechanisms documented by the adopting project. A reference to a check is not evidence that the check exists or covers the full rule; record its actual scope and limits in project documentation.


Non-normative samples: [`../_meta/examples/auth-code-samples.md`](../_meta/examples/auth-code-samples.md).

Legacy migration documents are historical references only; use the current topic files as the normative source.

---

## Related standards

- [Security](../security/README.md) — token storage, SEC-D1–SEC-D3, GSEC\*, lifecycle, logging
- [Zustand](../zustand/README.md) — store boundaries, persist
- [TanStack Query](../tanstack-query/README.md) — mutations, cache
- [Forms](../forms/forms.md) — Zod
- [Error handling](../error-handling/error-handling.md) / [Error policy](../error-policy/error-policy.md)

---

Normative text lives only in the two files above — not in this hub page.

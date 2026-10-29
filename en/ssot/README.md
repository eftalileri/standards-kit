# SSoT governance (Single Source of Truth)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: signal:ssot-authority, signal:new-semantic, signal:guard-config
skip-when: signal:no-ssot-surface
owns: none
```

**Keywords:** **KAT-1**, **KAT-6**, SSoT, authority, precedence, registry, derived value

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) — **P1**–**P8** when this topic is in scope (**P8** verification when implementation-bound); cite it in deliverables per [markdown-authoring **M16**](../authoring/markdown-authoring.md).

Normative hub for SSoT categories (**KAT-1** to **KAT-6**), deterministic precedence (**SSG-P1**), enforcement types (**SSG-P2**), guard architecture, and authority registration. Stack-specific detail lives in the relevant client, server, persistence, and routing topics; this hub defines cross-cutting governance.

> Core philosophy (binding): SSoT is not putting everything in one place. It is exactly one authority per protected datum, operation, or canonical derivation. See [principles](ssot-principles-and-precedence.md) (**SSG-M0**, **SSG-M6**–**SSG-M8**), [**MUST** — authority and derived fields](ssot-must-authority-and-derivation.md) (**SSG-M1**), [**MUST** — external provider projections](ssot-must-provider-projection.md) (**SSG-M9**–**SSG-M14**, **SSG-M19**), [**MUST** — read-path integrity](ssot-must-read-path-integrity.md) (**SSG-M20**), and [provider access boundary — inbound callback and outbound reach](ssot-must-provider-access-boundary.md) (**SSG-M21**, **SSG-M22**). Multi-source forms and selection are covered by [SSoT readiness](../ssot-readiness/README.md).

## Agent summary

- Do not create a mega-store per semantic (**SSG-M0**). Read the registry, reuse a sufficient authority, create one only when absent, and consolidate parallel authorities (**SSG-M6**–**SSG-M8**).
- An access authority decides whether materialization is allowed now; it does not own durable intent or existing-resource lifecycle, so denial must not terminate, delete, or rewrite them without a separate terminal-command authority (**SSG-M1**).
- Client preflight establishes permission, not an external provider outcome. External projections require evidence from the owning provider (**SSG-M9**).
- Preserve provider-environment provenance and re-check it before later live operations. Unknown authenticated events remain audit-only (**SSG-M11**).
- Concurrent provider projections use provider-owned ordering and conditional writes; a status built from a live provider snapshot reads provider-owned attributes from that snapshot (**SSG-M12**). Keep independent concepts, such as effective access end and billing-period end, separate when their authorities differ (**SSG-M13**). A provider-verified scheduled lower capacity constrains new durable admissions immediately (**SSG-M14**).
- Read paths do not create, update, or delete the data they return; absence is stated structurally, and a demotion is finished only when every path by which such a subject comes to exist reaches a create of its own (**SSG-M20**).
- Everything needed to reach a third-party provider — endpoint host, SDK module, each credential — has exactly one owner; a credential belongs to the tree of its purpose, not its vendor (**SSG-M22**).
- Measure parallel derivations before removing either; if modes legitimately differ, represent that distinction as an explicitly named mode, and remove the copy in the same change (**SSG-M23**).
- Multiple category constraints combine by logical AND (**SSG-P1-1**). Category definitions are in the part files below.
- Decision gates: **GSS1**–**GSS6** in [guard architecture](ssot-guard-and-agent.md).

## Reading order

1. [Principles and precedence](ssot-principles-and-precedence.md) — **SSG-C**, **SSG-M0**, **SSG-M6**–**SSG-M8**, **SSG-M23**.
2. [Authority and derived fields](ssot-must-authority-and-derivation.md) — **SSG-M1**, **SSG-M2**.
3. [Read integrity and reported aggregates](ssot-must-read-integrity-and-aggregates.md) — **SSG-M3**, **SSG-M18**.
4. [Read-path integrity](ssot-must-read-path-integrity.md) — **SSG-M20**.
5. [Provider projections](ssot-must-provider-projection.md) — **SSG-M9**–**SSG-M12**, **SSG-M19**.
6. [Provider entitlement and capacity](ssot-must-provider-entitlement-and-capacity.md) — **SSG-M13**, **SSG-M14**.
7. [Provider access boundaries](ssot-must-provider-access-boundary.md) — **SSG-M21**, **SSG-M22**.
8. [Actor-class access and schema parity](ssot-must-access-and-schema.md) — **SSG-M15**, **SSG-M16**.
9. [Precedence, enforcement, and failure paths](ssot-precedence-and-enforcement.md) — **SSG-P1**, **SSG-P1-1**–**SSG-P1-5**, **SSG-P2**, **SSG-P2-1**.
10. [Config-driven categories](ssot-categories-config-driven.md) — **SSG-K1**–**SSG-K4**.
11. [Convention-driven categories](ssot-categories-convention-driven.md) — **SSG-K5**, **SSG-K6**.
12. [Guard architecture and agent registration](ssot-guard-and-agent.md) — **SSG-G**, **SSG-A**, **SSG-N11**–**SSG-N17**, **GSS1**–**GSS6**.
13. [SSoT registry](ssot-registry.md) — reusable routing table, row template, and new-project registration procedure; rule identities **SSG-R1**–**SSG-R6** are in [registry rules](ssot-registry-rules-and-protocol.md).

## Parts

- [Principles and precedence](ssot-principles-and-precedence.md) — **SSG-C**, **SSG-M0**, **SSG-M6**–**SSG-M8**, **SSG-M23**
  - [**MUST** — no stand-in data on a production path](ssot-must-no-stand-in-data.md) — **SSG-M17**.
  - [Measured shapes of a duplicate authority](ssot-must-duplicate-authority-applications.md) — **SSG-M8** applications (stored state); no rule identity.
  - [A duplicate authority that is declared, not stored (1/2): closed value sets](ssot-must-duplicate-authority-declaration-shapes.md) — **SSG-M8** applications (a copied closed value set); no rule identity.
  - [A duplicate authority that is declared, not stored (2/2): single values and raw inputs](ssot-must-duplicate-authority-declaration-shapes-2.md) — **SSG-M8** applications (a producer sending a sentinel instead of the value; a consumer recomputing from raw input); no rule identity.
  - [**MUST** — authority, write access and derived fields](ssot-must-authority-and-derivation.md) — **SSG-M1**, **SSG-M2**.
  - [**MUST** — read integrity and reported aggregates](ssot-must-read-integrity-and-aggregates.md) — **SSG-M3**, **SSG-M18**.
  - [**MUST** — read-path integrity (a query path does not write)](ssot-must-read-path-integrity.md) — **SSG-M20**; also hosts the identity-free **SSG-M3** ordered-list and **SSG-M8** analytical-copy applications.
  - [Measured shapes of a wrong derivation source](ssot-must-derivation-source-applications.md) — **SSG-M1** applications (the wrong store is read); no rule identity.
  - [Measured shapes of a wrong derivation source (2/2): the fact supplied by the caller](ssot-must-derivation-source-applications-2.md) — **SSG-M1** application (a parameter carrying a fact another parameter already determines); no rule identity.
  - [Measured shapes of a re-spelled derivation](ssot-must-derivation-respelled-applications.md) — **SSG-M1** applications (the derivation written a second time); no rule identity.
  - [Measured shapes of a re-spelled derivation (2/3): the polymorphic carrier normalised per consumer](ssot-must-derivation-respelled-applications-2.md) — **SSG-M1** application (a value arriving in several representations, normalised again in every consumer); no rule identity.
  - [Measured shapes of a re-spelled derivation (3/3): the seam-row adapter and the named per-record decision written at every call site](ssot-must-derivation-respelled-applications-3.md) — **SSG-M1** / **SSG-M23** applications; no rule identity.
  - [**MUST** — the insufficient classification predicate](ssot-must-insufficient-classification-predicate.md) — **SSG-M1** / **SSG-M8** application (a fact with more than two classes decided by a two-outcome predicate); no rule identity.
  - [**MUST** — the provider cache answering about the wrong subject](ssot-must-provider-cache-subject-mismatch.md) — **SSG-M1** / **SSG-M19** application; no rule identity.
  - [**MUST** — external provider projections](ssot-must-provider-projection.md) — **SSG-M9**–**SSG-M12**, **SSG-M19**.
  - [**MUST** — entitlement lifetime and capacity-gated admission](ssot-must-provider-entitlement-and-capacity.md) — **SSG-M13**, **SSG-M14**.
  - [**MUST** — provider access boundary: inbound callback and outbound reach](ssot-must-provider-access-boundary.md) — **SSG-M21**, **SSG-M22**.
  - [**MUST** — actor-class access and schema parity](ssot-must-access-and-schema.md) — **SSG-M15**, **SSG-M16**.
  - [Precedence, enforcement type, failure path](ssot-precedence-and-enforcement.md) — **SSG-P1**, **SSG-P1-1**–**SSG-P1-5**, **SSG-P2**, **SSG-P2-1**.
  - [Implementation checklist (appendix)](ssot-principles-appendix.md) — no rule identity.
- [Config-driven categories](ssot-categories-config-driven.md) — **SSG-K1**–**SSG-K4**
  - [Consumers of a **KAT-3** authority: operator scripts and identity erasure](ssot-categories-config-driven-2.md) — **SSG-M8** applications; no rule identity.
- [Convention-driven categories](ssot-categories-convention-driven.md) — **SSG-K5**, **SSG-K6**
- [Guard architecture and agent registration](ssot-guard-and-agent.md) — **SSG-G**, **SSG-A**
- [SSoT Registry](ssot-registry.md) — a blank, reusable map; populate it with project authorities following its protocol.
  - [Registry rules (SSG-R)](ssot-registry-rules-and-protocol.md) — **SSG-R1**–**SSG-R6**, failure path, maintainer checklist.
  - [Update protocol and consumer-measurement recipe](ssot-registry-protocol-and-consumer-measurement.md) — Section 4 and Section 5; no rule identity.

Decision routing: for a new semantic or authority refactor, search the project's registry domain routing table, then read the matching registry file (**SSG-R1**). If no entry exists, apply **SSG-M7**, define one authority, and record it following [**SSG-R1**–**SSG-R6**](ssot-registry-rules-and-protocol.md) in the same change. For client cache bridge rows, record cross-entity mutation consumers under **SSG-R4** together with TanStack **MUT-M20**–**MUT-M22**.

Related: [SSoT readiness](../ssot-readiness/README.md); [editable persistent attributes](../editable-persistent-attributes/README.md); [TanStack Query](../tanstack-query/README.md); [error policy](../error-policy/README.md); [agent-gray decisions](../agent-gray-decisions/README.md).

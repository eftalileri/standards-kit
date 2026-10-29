# Editable persistent attributes (MongoDB — denormalization and cascade)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** cascade, denormalization, MongoDB, copy targets, impact matrix, batch

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) — P1–P8 when this topic is in scope (P8 verification when implementation-bound); cite in deliverables per [markdown-authoring **M16**](../authoring/markdown-authoring.md).

Domain: User-editable durable fields stored in MongoDB (for example Atlas collections), including Single Source of Truth (SSoT), denormalized copies, cascade propagation, multi-tenant isolation, batch execution, and async triggering.

Why this hub exists: This standard organizes reusable guidance on SSoT, denormalization, cascade risks, idempotency, and impact analysis into numbered rules and decision gates.

Reading order (normative)

1. [SSoT, denormalization, and copy declaration](ssot-denormalization-and-impact-matrix.md) — **EDM-C**\*, **EDM-M**\*, **EDM-N**\*
2. [Cascade engine](cascade-engine.md) — **CAS-C**\*, **CAS-M**\*, **CAS-N**\*
3. [Execution: async, batch, logging, errors](execution-async-batch-logging.md) — **EXE-C**\*, **EXE-M**\*, **EXE-N**\*
4. [Mongo indexing for cascade](mongo-cascade-indexing.md) — **MCI-C**\*, **MCI-M**\*, **MCI-N**\*
5. [Validation, shared types, migration](validation-types-and-migration.md) — **EVL-C**\*, **EVL-M**\*, **EVL-N**\*
6. [Decision gates (normative index)](decision-gates.md) — GEPA1–GEPA8
7. [Agent procedure and project thresholds](agent-procedure-and-constants.md) — **EPA-T1**, **EPA-T2**, **EPA-P1**–**EPA-P7**, implementation checklist

Related: [SSOT governance](../ssot/README.md) (global KAT and guards — this hub is MongoDB editable-field cascade specifics). [Gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md) (single solution, no competing options). [Error policy](../error-policy/error-policy.md), [Error handling](../error-handling/error-handling.md), [Logging policy](../logging-policy/logging-policy.md). [Forms](../forms/forms.md), [TanStack Query](../tanstack-query/README.md). [Repository](../repository/repository-contract.md) (contracts). [Name consistency](../name-consistency/name-consistency.md). [NoSQL query safety](../nosql-query-safety/nosql-zod-and-sanitizefilter.md).

Non-normative: [Editable persistent attributes explainer](../_meta/examples/editable-persistent-attributes-explainer.md) (rationale and agent workflow gloss).

---

Part of: English standards kit.

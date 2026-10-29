# Editable persistent attributes — non-normative explainer

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Status: Non-normative — training and context only. Normative rules live under `standards-kit/en/editable-persistent-attributes/`.

---

## Why this topic is strong

- Problem domain: Correctly captures SSoT, denormalization, cascade, multi-tenant isolation, and where not to cascade (ID-only).
- Production reality: Addresses N+1-style cascade risks, write lock / batch chunking, idempotency for replay, and async trigger so the HTTP path does not time out.
- Edge cases: `body` string replace with word boundaries, type-based targeting when one field serves multiple entities, and missing ID resolution paths.

---

## How the English SSOT improves agent usability

1. M / N IDs — every legacy must / must not maps to EDM-, CAS-, EXE-, MCI-, EVL- rows.
2. Decision gates (GEPA1–GEPA8) — when cascade is required, forbidden, chunked, async, indexed, etc.
3. Determinism — **EPA-T1** (500) and **EPA-T2** (1000) replace vague “many documents.”
4. Testability — index rule **MCI-M1** names concrete verification methods (`listIndexes`, test, DBA sign-off).

---

## Relationship to global SSOT governance

[SSOT governance](../../ssot/README.md) defines KAT categories and guards. This hub is MongoDB-specific editable-field cascade — complement, not duplicate.

---

## Suggested agent workflow

1. Read [agent-procedure-and-constants](../../editable-persistent-attributes/agent-procedure-and-constants.md) normative constants and **EPA-P1**–**EPA-P7**.
2. Run [decision gates](../../editable-persistent-attributes/decision-gates.md) (GEPA\*).
3. Implement part files in hub order; verify checklist in README.

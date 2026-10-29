# SSOT lint — row shapes (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Status: Non-normative — illustration only. Normative rules: [`../../ssot/`](../../ssot/README.md) — [`ssot-categories-config-driven.md`](../../ssot/ssot-categories-config-driven.md) (**SSG-K1-2**, **SSG-K2-2**, **SSG-K3-2**, **SSG-K4-2**) and [`ssot-guard-and-agent.md`](../../ssot/ssot-guard-and-agent.md) (**SSG-G-1**, **SSG-A-1**). A line-scanning config (a regex pattern plus allowed paths plus context exemptions) is not the expected shape and is not written. Per-member factory registrations (one rule body per field or model) are not used: every member is a row.

---

## **KAT-2** / **KAT-4** — a row of the usage-boundary table rule (illustrative)

One rule asks *"is this SSOT-owned surface used outside its owner files?"*; each surface is a row. Owner globs must each match at least one real file when the rule loads.

```javascript
{
  id: 'SC-NNN',                   // KAT-2 single caller; KAT-4 derivation forms use 'DD-NNN'
  kind: 'call',                   // or 'import' / 'member' / 'model-method' / 'literal' / 'pattern'
  match: { names: ['canonicalFunctionName'] },
  owners: ['path/to/owner/**'],   // narrowest owner globs (SSG-N12)
  files: ['path/to/checked/scope/**'],
  message: 'Use canonicalFunctionName — <registry row>.',
  ref: 'path/to/registry-or-architecture.md <registry row>',
}
```

---

## **KAT-1** / **KAT-3** — a row of the write-ownership table rule (illustrative)

The update-surface predicate and the model write-method vocabulary live once, in shared modules; a row only declares its subject and its closed writer set, derived from an empty-set run of the predicate.

```javascript
// KAT-1 closed-writer field
{
  id: 'SW-NNN',
  fields: ['fieldName'],
  surfaces: ['update', 'hydrated'],               // 'array-mutation' where the field is an array
  owners: ['full/repo/path/to/writerSeam.ts'],    // validated at load
  files: ['path/to/checked/scope/**'],
  message: 'Single writer writerSeam: ...',
  ref: 'SSG-M8; <registry row>',
}

// KAT-3 model mutation
{
  id: 'MA-NNN',
  model: { file: 'full/repo/path/to/models/ModelName.ts', export: 'ModelName' },
  surfaces: ['model-write'],
  methods: ['deleteOne', 'deleteMany'],           // optional subset, e.g. only irreversible deletes
  owners: ['full/repo/path/to/modelSeam.ts'],
  files: ['path/to/checked/scope/**'],
  message: '...',
  ref: '...',
}
```

A verified false positive takes the row-scoped allow comment on the line, never a rule edit: `// <table-rule>-allow [SW-NNN] -- <reason>`. Document birth (`create` / `new Model(...)`) is not an update surface for the **KAT-1** predicate; a field whose birth value must also be fenced states that as its own limit.

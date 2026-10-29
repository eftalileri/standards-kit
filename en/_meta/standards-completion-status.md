# Standards completion status scaffold

```kit-cover
type: reference
part-of: README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Use this optional, hand-maintained tracker only when a consuming project is migrating existing standards into the kit. It is not normative, does not certify that a topic is current or debt-free, and is not the authority for which topics exist. The generated index in [`../README.md`](../README.md) owns the topic list; migration provenance belongs in [`legacy-mapping.md`](legacy-mapping.md).

## Completion criteria

A migration entry may be marked complete when:

1. The destination standard exists and its scope is clear.
2. The project's legacy mapping names the source and destination accurately.
3. The destination hub links to its normative standard, when a hub exists.
4. Any linked examples or supporting files exist and match their references.

Completion records migration coverage only. Track open standards debt in the consuming project's agent-note registry or other designated issue system.

## Migration status

This table is intentionally empty for a new project. Add only verified, repository-specific migration records.

| Topic | Destination standard | Legacy source | Status |
|-------|----------------------|---------------|--------|

## Keeping this file current

Update this table and [`legacy-mapping.md`](legacy-mapping.md) together when a migration is completed. Derive any summary counts from the records; do not copy historical counts from another project.

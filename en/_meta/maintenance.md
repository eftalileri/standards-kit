# Maintenance appendix (not read during ordinary task execution)

```kit-cover
type: reference
part-of: README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Purpose: Pointers for legacy migration, dependency-version policy, and maintenance records. Open this file only when checking one of those subjects; it adds no normative rule.

## Document shape codes

The kit's document-shape codes and their meanings are defined in [markdown-authoring-deliverable-shape.md](../authoring/markdown-authoring-deliverable-shape.md#document-shape-codes). That file is the authority for the current vocabulary; do not keep a duplicate glossary here.

## Legacy sources

When a consuming project migrates existing standards, record the verified mapping in [`legacy-mapping.md`](legacy-mapping.md). That crosswalk is project-local and does not make the legacy documents normative. Use the consuming project's own archive and precedence policy; do not copy another repository's paths, filenames, or migration status.

## Dependency-version policy

Check the consuming project's package manifests, lockfiles, and documented dependency constraints before relying on a library feature. If the project chooses to maintain a version table, keep the source of each constraint explicit and update it with the dependency policy.

This optional table is intentionally empty for a new project:

| Standard or hub | Dependency | Supported version range | Authority |
|-----------------|------------|--------------------------|-----------|

## Migration status

Use [`standards-completion-status.md`](standards-completion-status.md) only when the project needs a migration tracker. It records migration coverage, not whether a standard is current, complete, or free of open issues.

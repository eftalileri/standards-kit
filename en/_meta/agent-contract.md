# Agent execution contract (shared)

```kit-cover
type: normative
part-of: README.md
binds: the shared agent execution contract every hub inherits — violations are bugs, the kit outranks project documents, technical ambiguity is decided from code and rules, a rule is updated before a change that breaks it — and the topic-prefix resolution notation
open-when: shape:floor
skip-when: none
owns: C1, C2, C3, C4, C5, C7, C10, C12
```

Document type: Normative — defines the shared rule rows below and the `<TOPIC-PREFIX>-C<n>` resolution notation. **C6**, **C8**, **C9** and **C11** are not defined; the gaps are never back-filled (**C6** → **C2**, **C8** → **C3**, **C11** → **C4**; **C9** left with the migration tracker it referred to). This file lives under `_meta/` but binds; `_meta/` is a mixed folder and normativity is declared per file ([`en/README.md`](../README.md)).

This is the one place the general agent principles are written. Every normative hub inherits these rows; a hub states only its topic-specific contract rows (scope, precedence between named topics, library baseline) and does not restate a row below.

- **C1**: A topic is mandatory when the work's scope includes its problem class (decision-matrix routing).
- **C2**: A **MUST** / **MUST NOT** is applied as written. A technical ambiguity — soft wording such as "preferably" included — is decided by reading the code and the governing rules and taking the stricter reading, the one that keeps the guarantee the rule protects; only a product or authority question goes to the owner. This governs reading a rule, not acting: every approval, dry-run or consent step the root agent-rule file requires (for example before a destructive data operation or a dependency install) still applies.
- **C3**: On a subject the kit governs, a kit rule outranks a project document (architecture note, plan, analysis); a project document may add a stricter rule, never a weaker one. The full ladder is the root agent-rule file's; a conflict between two kit statements is settled by [precedence.md](precedence.md) **KIT-PRE-2**.
- **C4**: A violation is a bug: it is fixed before the work ships, and dependent work does not build on it.
- **C5**: A change that would break a rule updates that rule first, in the same change, and names the standards it affects.
- **C7**: Library version constraints are in [maintenance.md](maintenance.md), not here.
- **C10**: When a dependency does not satisfy a hub's version precondition, the dependency is upgraded or the rule is amended before dependent work proceeds.
- **C12**: Critical behaviour is stated in the hub's own rules, not only behind a link.

Resolution — how a hub cites a shared row. A hub MAY address any row above under its own topic prefix, written `<TOPIC-PREFIX>-C<n>` (for example `TSQ-C4`). The prefixed spelling denotes exactly the same obligation as the unprefixed `C<n>` row here and creates no separate identity. Where a hub defines its own row for slot `<n>` answering the same question as the row here, that hub's row is the authority for that hub; a hub row on a different question under the same number applies alongside the row here and never switches it off. A citation of a gap slot here resolves to the successor named in the Document type line; a prefixed identity the hub itself once defined and retired stays retired ([retired-identity ledger](../../retired-rule-ids.tsv)) and never resolves to a row here.

Sub-clause pointers. Kit-wide, an ID carrying a trailing lowercase letter points at a lettered clause of the rule with that ID: `COB-RN-D3a` is clause (a) of `COB-RN-D3`. It is a pointer into an existing rule, never a separate rule identity.

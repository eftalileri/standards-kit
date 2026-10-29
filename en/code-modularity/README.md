# Code modularity (runtime modules)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** single responsibility, split, modular, hook file, thin controller


Normative rules for single responsibility, the thin transport adapter, and one helper per repeated derivation in TypeScript / TSX runtime modules. Markdown deliverable limits live under [Authoring](../authoring/README.md). Backend handler efficiency plans (request memo, singleflight helpers): see [Backend HTTP efficiency](../backend-http-efficiency/README.md) (BHE-\*).

- [Code modularity (SSOT)](code-modularity.md) — **COD-C1**, **COD-M3**–**COD-M6**, **COD-N3**–**COD-N4** (**COD-M5** / **COD-N3**: the transport adapter stays thin — the decision belongs to the domain layer)

Related: [Architecture core](../_meta/architecture-core.md) (non-normative: COD-\* index and topic mirror). [Monorepo](../monorepo/README.md) (MRP-\* workspace boundaries); [Imports](../imports/README.md) (IMP-\* paths, barrels, cross-feature); [Dead code](../dead-code/README.md) (DCD-\* — splits leave orphan files if the old path is not deleted); [Name consistency](../name-consistency/README.md) (NCM-\* resolver — not source file naming); [TanStack Query](../tanstack-query/README.md) (**QRY-M4** screen–hook split); [Gray-situation decisions](../agent-gray-decisions/README.md) (M1).

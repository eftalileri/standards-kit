# Name consistency (canonical display names)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** display name, canonical name, company, identifier


Normative rules for canonical person / contact display names in company context: resolver, tier precedence, normalization, create vs read paths, edit / cascade, and scale minimums.

Also covers event-time name snapshots (a record freezing the subject's name at creation / assignment time): the strict read contract (**NCM-M10**), the single write-time derivation authority that every create / re-assign / bulk path must call (**NCM-M11**), removal of any parallel snapshot store such as a delete-time freeze step (**NCM-M12**), and how an unresolvable name is surfaced — absence end-to-end plus a per-surface localized marker, never a shared placeholder (**NCM-M13** / **NCM-N6**).

- [Name consistency (SSOT)](name-consistency.md) — **NCM-C1**–**NCM-C6**, GNC1–GNC9, failure path, checklist
- [Name consistency rules](name-consistency-rules.md) — **NCM-M1**–**NCM-M13**, **NCM-N1**–**NCM-N7**

Related: [Code modularity](../code-modularity/README.md) (file layout — not display names); [SSOT readiness](../ssot-readiness/README.md) (client forms); [Error policy](../error-policy/README.md).

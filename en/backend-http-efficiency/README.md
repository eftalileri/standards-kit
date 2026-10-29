# Backend HTTP efficiency

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** server handler, duplicate reads, cache, singleflight, invalidation, outbound API


Purpose: Normative discipline for server-side HTTP handlers and outbound calls (including Node.js servers such as Express): per-request deduplication, process-local cache coherence, outbound dependency storms, and planning obligations for agents and humans.

## Agent TL;DR

Read the relevant normative part below for duplicate reads, cache invalidation, outbound budgets, set paging and live-document reuse.

Normative body (four bands, one family): [backend-http-efficiency.md](backend-http-efficiency.md) (**BHE-C1**–C3, **BHE-M1**–M8, **BHE-M12**, **BHE-N1**–N3 — deduplication, cache coherence and fan-out sizing), [outbound-call-time-budget.md](outbound-call-time-budget.md) (**BHE-M9**–M11, **BHE-N4** — how long a request may wait on a provider), [set-loading-and-query-fan-out.md](set-loading-and-query-fan-out.md) (**BHE-M13**, **BHE-M14**, **BHE-M16**, **BHE-N5**, **BHE-N6** — how a request path loads a set of entities, which work units the N+1 detector must report, and how a page and its total are cut out of it) and [authority-document-reuse-and-projection-limit.md](authority-document-reuse-and-projection-limit.md) (**BHE-M15** — which entry point of a cached read authority a caller that already holds the document should use, and when reuse is the wrong answer).

Enforcement: Incomplete BHE-backed deliverables are BLOCKER (**BHE-C3**), including non-verifiable **BHE-M2**–**BHE-M4** plan obligations (**BHE-M8**); cross-impact gaps when **XIA-M1** fires are BLOCKER ([cross-impact-analysis **XIA-M4**](../authoring/cross-impact-analysis.md)).

Non-overlap: This topic does not replace [decision-matrix](../decision-matrix/decision-matrix.md) rows for client server state. Client fetch efficiency stays in the consuming project's client data-fetching and performance standards. This topic governs server-side handler and domain call patterns.

Cross-links

- [Markdown authoring](../authoring/markdown-authoring.md) (M6, M14) and [cross-impact analysis](../authoring/cross-impact-analysis.md) (XIA-\*)
- [Error policy](../error-policy/error-policy.md) / [Error handling](../error-handling/error-handling.md) (HTTP + semantic codes)
- [Logging policy](../logging-policy/logging-policy.md) (new server logs)
- [Code modularity](../code-modularity/code-modularity.md) (split helpers, no monolith)
- [Monorepo](../monorepo/monorepo-architecture.md) (when the consuming project uses a monorepo)
- [Idempotency](../idempotency/idempotency.md) (mutation races - orthogonal but often co-reviewed)

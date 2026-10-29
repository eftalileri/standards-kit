# SSOT principles — implementation checklist

```kit-cover
type: reference
part-of: README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Part of: [SSOT principles and precedence](ssot-principles-and-precedence.md). This appendix provides a compact implementation checklist for the normative SSoT rules.

## Implementation checklist

- [ ] **SSG-M0** — not a single mega-module for unrelated data
- [ ] **SSG-M6**–**SSG-M8** — discover / create / refactor authority lifecycle
- [ ] **SSG-M8** — no relation-derived counter persisted into the owning document (recompute; cache only outside the document, invalidated by every relation writer)
- [ ] **SSG-M1**–**SSG-M3** for new SSOT surface
- [ ] **SSG-M9** for client-initiated external projections and authenticated provider-webhook evidence paths
- [ ] **SSG-M10** for stateful third-party client SDK configuration and identity sessions
- [ ] **SSG-M11** for provider environment provenance, later live side effects, and unknown-event audit/no-op
- [ ] **SSG-M12** for out-of-order provider projections, cache-generation response freshness and separate durable provider/epoch fences
- [ ] **SSG-M13** when access expiry and provider billing-period end can diverge
- [ ] **SSG-M14** when a provider-verified scheduled capacity reduction affects durable admissions
- [ ] **SSG-M16** whenever a field's validity is stated in both an input schema and a persistence schema (check the empty value, not only absence)
- [ ] **SSG-M15** when an actor class is barred from a resource class — one derivation read by both the enforcing boundary and every initiating layer, including gate-bypassing fetch paths
- [ ] **SSG-P1-1**–**SSG-P1-4** for multi-KAT touches
- [ ] **SSG-P2-1** enforcement type documented
- [ ] Category part files read for KAT detail

---

Part of: [README.md](README.md).

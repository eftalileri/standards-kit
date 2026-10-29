# Product analytics (React Native / Expo)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** screen views, funnel, product events, data minimization, ad attribution, install referrer, attribution token, install postback, conversions API, click id, app event delivery, attribution mirror

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) -- **P1-P8** when this topic is in scope (P8 verification when implementation-bound); cite in deliverables per [markdown-authoring **M16**](../authoring/markdown-authoring.md).

Purpose: Normative single source of truth for product behavior telemetry (screens, funnels, critical actions) on React Native / Expo, and for attributing app installs and conversions to ad platforms (OS-vendor attribution, ad-platform referrers, web click ids) across client, server and landing page. Does not replace [client observability RN](../client-observability-rn/README.md) (crash / session health); PAN-\* and COB-\* address different problem classes.

Normative part files: [`analytics-rn.md`](analytics-rn.md); [`ad-platform-attribution.md`](ad-platform-attribution.md). Reference (optional provider adapter): [`ad-platform-attribution-provider-reference.md`](ad-platform-attribution-provider-reference.md).

---

## Scope (hub)

- Included: Default SDK, event taxonomy, screen tracking, PII ban, link to routing for screen names; ad-platform install / conversion attribution (provider contracts, capture outcomes, server verdict, web-to-app handoff, verification).
- Excluded: Backend warehouse / ETL. Marketing email / CRM identifiers outside this contract. Ad-spend import and reporting.

Applicable rules: Product-event and consent obligations are defined in [analytics-rn.md](analytics-rn.md); attribution obligations in [ad-platform-attribution.md](ad-platform-attribution.md). Crash and session diagnostics remain with the selected client-observability provider.

---

## Reading order (normative)

1. [analytics-rn.md](analytics-rn.md) -- Definitions (**PAN-RN-D**\*), **MUST** / **MUST NOT** (**PAN-RN-M**\* / **PAN-RN-N**\*), agent contract (**PAN-RN-C**\*), SHOULD (**PAN-RN-S**\*).
2. [ad-platform-attribution.md](ad-platform-attribution.md) -- ad-platform install / conversion attribution: Definitions (**ADA-D**\*), **MUST** / **MUST NOT** (**ADA-M**\* / **ADA-N**\*), SHOULD (**ADA-S**\*); example provider facts and checklists in [ad-platform-attribution-provider-reference.md](ad-platform-attribution-provider-reference.md).

---

## Rule identifier prefix (normative index)

| Prefix | Meaning |
|--------|---------|
| **PAN-RN-C**\* | Agent execution contract |
| **PAN-RN-D**\* | Definitions |
| **PAN-RN-M**\* | **MUST** |
| **PAN-RN-N**\* | **MUST NOT** |
| **PAN-RN-S**\* | SHOULD |
| **ADA-D**\* / **ADA-M**\* / **ADA-N**\* / **ADA-S**\* | Ad-platform attribution: definitions / **MUST** / **MUST NOT** / SHOULD |

---

## Related

- [Client observability RN](../client-observability-rn/README.md) -- crash / session health through the application's selected observability provider (COB-\*).
- [Routing](../routing/README.md) -- screen names for navigation events.
- [Security](../security/README.md) -- no secrets in analytics payloads.

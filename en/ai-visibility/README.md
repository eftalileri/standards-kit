# AI / Chatbot Visibility (GEO / AEO)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** AI visibility, GEO, AEO, GPTBot, ChatGPT-User, Perplexity, Claude, SSR crawlability, **JSON-LD**, sameAs, entity, robots.txt, sitemap, llms.txt, no cloaking, script-stripped visible text

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) — **P1-P8** when this topic is in scope (P8 verification when implementation-bound); cite in deliverables per [markdown-authoring **M16**](../authoring/markdown-authoring.md).

Purpose: Normative, project-independent rules to make a web property discoverable, fetchable, parseable, and citable by AI answer engines / chatbots and classic crawlers. New binding problem class (web property GEO/AEO) — not covered by app-architecture topics.

## Agent TL;DR

- Critical content **MUST** be in server-rendered HTML — no client-only render, no scroll-gated mount, no click-to-expand-only (**AIV-M2** / **M3** / **M4**).
- Bare/canonical URL returns 200 full HTML, not a redirect stub; canonical self-references a 200 (**AIV-M1** / **M6**).
- **JSON-LD**: `Organization` + `sameAs` (entity disambiguation) + product type; Q&A visible on the page, `FAQPage` markup optional; schema is not an AI-citation lever; valid, consistent, no fabrication (**AIV-M7** / **M8** / **M9**).
- One canonical entity sentence, repeated; positive framing > negative; topical cluster cross-linked (**AIV-M10**..**M13**).
- Internal link graph: every entity page reachable via HTML links; none sitemap-only; linked from home / related / comparison / audience (**AIV-M19**).
- Canonical definition verbatim on hero / about / **JSON-LD** / llms, only one (**AIV-M20**); query coverage what / why / who / when-not / alternative (**AIV-M22**); brand disambiguation signals (**AIV-M23**); freshness SHOULD (**AIV-M21**).
- `robots.txt` allows the AI search and answer bots (training bots: explicit, recorded decision), `sitemap.xml` (200 only), optional `llms.txt`, meta + `hreflang` + `x-default` (**AIV-M14**..**M18**).
- Firewall / bot protection never blocks verified search crawlers; no blanket "AI bots: deny"; discovery paths 200 for every client (**AIV-M26**).
- No cloaking / hidden text / fabricated data (**AIV-N1**..**N6**).
- Measure visibility by script-stripped visible text, never raw byte size or `grep -c` (**AIV-C4**, **AIV-N6**, **AIV-V1**).
- Technical gates **GAIV1-GAIV4** (crawler access proved from firewall/server logs and live URL inspection, never from spoofed UAs) + outcome gate GAIV5 (ask an external AI "What is `<brand>`?" — answer must contain the definition). Verification commands **AIV-V1-V7**.

Normative file: [`ai-visibility.md`](ai-visibility.md) — rule IDs `AIV-C1-C4`, `AIV-M1-M24`, `AIV-M26`, `AIV-N1-N6`, `GAIV1-GAIV5`, `AIV-V1-V7`.

Related standards: [authoring/markdown-authoring](../authoring/markdown-authoring.md) (deliverable shape), [build-environment](../build-environment/README.md) (CI), [security](../security/README.md) (headers/CSP/HSTS). Non-normative project application reference: a landing-page content library's GEO/AEO + SEO-meta + internal-linking notes.

# AI / Chatbot Visibility (GEO / AEO) — normative

```kit-cover
type: normative
part-of: README.md
binds: the AIV obligation set as a whole -- server-rendered crawlability, structured data, entity and query coverage, published behavior mirrors, robots/sitemap/llms surfaces, the anti-cloaking prohibitions and the GAIV gates
open-when: signal:ai-visibility, signal:geo-aeo, signal:web-property-content, signal:seo-crawlability, signal:json-ld, signal:robots-txt
skip-when: signal:mobile-app-only, signal:no-web-surface
owns: AIV-C1, AIV-C2, AIV-C3, AIV-C4, AIV-M1, AIV-M2, AIV-M3, AIV-M4, AIV-M5, AIV-M6, AIV-M7, AIV-M8, AIV-M9, AIV-M10, AIV-M11, AIV-M12, AIV-M13, AIV-M19, AIV-M20, AIV-M21, AIV-M22, AIV-M23, AIV-M24, AIV-M14, AIV-M15, AIV-M16, AIV-M17, AIV-M18, AIV-N1, AIV-N2, AIV-N3, AIV-N4, AIV-N5, AIV-N6, GAIV1, GAIV2, GAIV3, GAIV4, GAIV5, AIV-V1, AIV-V2, AIV-V3, AIV-V4, AIV-V5, AIV-V6, AIV-V7
```

Rule IDs: `AIV-C*` (contract), `AIV-M*` (**MUST**), `AIV-N*` (**MUST NOT**), `GAIV1-GAIV4` (gates), `AIV-V*` (verification).

Purpose: Project-independent rules to make a web property discoverable, fetchable, parseable, and citable by AI answer engines / chatbots (ChatGPT/GPTBot, Claude/ClaudeBot, Perplexity, Gemini, Google AI Overviews) and classic crawlers. Goal: when a user asks an AI "what is the best X / how do I Y", the property is retrieved and recommended.

Failure mode (threat model): content that is visually present for human browsers but absent from the server HTML — client-only rendering, scroll-gated mounts, click-to-expand-only panels, redirect stubs — is invisible to AI crawlers that do not execute JS. Symptom: an AI "sees almost nothing" while the human sees a full page.

Binding principle: Visibility is measured by the server-rendered, script-stripped visible text and structured data — never by raw HTML byte size or substring greps. Any change that hides critical content from a no-JS fetch is a bug; fix at root cause (no fallback, no cloaking).

---

## Agent execution contract (**AIV-C**)

| ID | Rule |
|----|------|
| **AIV-C1** | Applies to any web property whose goals include being found/cited by AI engines or search. Project-independent. |
| **AIV-C2** | Apply [shared **C2**](../_meta/agent-contract.md). |
| **AIV-C3** | "Critical content" = anything that must be discoverable/citable: entity definition, positioning, feature/answer copy, FAQ answers, comparison tables, audience definition. Purely decorative/visual sections are exempt. |
| **AIV-C4** | Verify every visibility claim with **AIV-V**\* (script-stripped visible text) — never with raw byte size or `grep -c`. |

## **MUST** — Crawlability and server rendering (**AIV-M**)

| ID | Rule |
|----|------|
| **AIV-M1** | The bare/canonical URL **MUST** return HTTP 200 with the full HTML body. A homepage that returns a redirect (301/302/307/308) to a locale/path with a near-empty body is forbidden — fetchers that do not follow redirects receive nothing. |
| **AIV-M2** | Critical content **MUST** be in the server-rendered HTML (SSR or SSG/prerender). Client-only rendering of critical content (e.g. `dynamic(..., { ssr: false })`, render-after-mount) is forbidden. |
| **AIV-M3** | Lazy/deferred wrappers that gate children on client-side visibility (IntersectionObserver "render on scroll", `useState(false)`-until-in-view) **MUST** render critical children in the initial server HTML (eager). Code-splitting is allowed only when it preserves SSR output (`ssr: true` + dynamic import). |
| **AIV-M4** | Collapsible UI (accordion / tabs / "read more") **MUST** keep all content in the DOM (visually collapsed via CSS), not conditionally render only the open item. |
| **AIV-M5** | No orphaned critical sections — content authored in the codebase but never mounted on a page is a defect (dead code + lost visibility); wire it or remove it. |
| **AIV-M6** | The canonical link **MUST** be self-referential and resolve to HTTP 200 — never point at a URL that redirects. sitemap / llms / hreflang **MUST** list only 200 URLs (no trailing-slash or locale redirects). |

## **MUST** — Structured data (**AIV-M**)

| ID | Rule |
|----|------|
| **AIV-M7** | Provide server-rendered **JSON-LD**: `Organization` (with `sameAs`, `logo`, `name`), the product type (`SoftwareApplication` / `MobileApplication` / `Product`), and `FAQPage` where Q&A exists. Content pages add `Article` + `BreadcrumbList`; how-tos add `HowTo`. |
| **AIV-M8** | `sameAs` **MUST** link the entity to authoritative external profiles (app stores, social, Crunchbase / Wikidata) — the primary disambiguation signal for an ambiguous brand name. Omit the field when no real URL exists (no fabricated or empty values). |
| **AIV-M9** | All **JSON-LD** **MUST** be valid JSON, types correct, and consistent with the visible content (same name/description). Never fabricate ratings/reviews/counts. |

## **MUST** — Entity and authority (**AIV-M**)

| ID | Rule |
|----|------|
| **AIV-M10** | One canonical definition sentence ("X is a `<category>` that `<does Y>` for `<audience>`") used identically across meta, **JSON-LD** `description`, hero, and about. Consistent brand name + category on every surface. |
| **AIV-M11** | Reinforce core entity claims across multiple pages/sections (topical repetition). A claim stated once is weak; AI learns associations from repeated, consistent context. |
| **AIV-M12** | Prefer POSITIVE framing ("X is a `<category>`") over negative ("X is not a `<other>`"). Negative disambiguation is allowed but used sparingly and paired with the positive — AI learns negatives more weakly than positives. |
| **AIV-M13** | Build a topical cluster: dedicated single-topic pages for entity facets (what-is-X, why-no-Y, X-vs-competitor, audience/use-case), cross-linked (pillar to cluster, related links), each server-rendered. No orphan pages; no keyword cannibalization. |
| **AIV-M19** | Internal linking (link graph): every entity page **MUST** be reachable through normal HTML `<a>` links from at least one indexable page. No page may exist only in `sitemap.xml`. Important pages **MUST** be linked from the homepage, related-content blocks, comparison pages, and audience pages. AI crawlers read the sitemap, but the link graph still carries authority and signals topical relationship. |
| **AIV-M20** | Verbatim canonical definition (hardens **AIV-M10**): the one canonical entity definition sentence **MUST** appear verbatim on the homepage hero, the about page, the **JSON-LD** `description`, and `llms.txt`. Only one primary definition may exist. Drift across "platform / business software / CRM / operations software" blurs the entity over time — forbidden. |
| **AIV-M21** | Freshness (SHOULD): a property targeting AI citations SHOULD publish new entity-reinforcing content on a regular cadence. An abandoned property loses topical authority over time. This is entity liveness, not classic SEO ranking. |
| **AIV-M22** | Query coverage: for every core entity claim, at least one page **MUST** answer each of what · why · who · when-not · alternative (e.g. what-is-X, why-no-Y, who-is-X-for, who-should-not-use-X, alternatives-to-X). This maps the entity to the full shape of how users interrogate it in AI retrieval and is one of the strongest citation levers. |
| **AIV-M23** | Brand disambiguation: if the brand name is ambiguous (other real entities share it), the property **MUST** carry disambiguation signals: `Organization` schema, `sameAs` (**AIV-M8**), app-store + social profiles, and a consistent category label on every surface. Resolves the "which X?" problem for AI. |
| **AIV-M24** | Published behavior mirrors follow the source release: when public documentation, rules, FAQ, structured data or another content surface repeats a domain fact owned by source code or a normative source kit, the published content is a mirror, never an authority. The source code / source kit remains authoritative. A source-authority change that would make the mirror false **MUST** update that mirror in the same release slice in which the changed behavior becomes live; a multi-phase plan **MUST NOT** postpone the repair to its final phase. A public anchor whose name asserts the opposite of the live behavior is renamed rather than preserved as a misleading compatibility alias. Stated enforcement limit: deciding this parity mechanically requires a machine-readable claim-to-authority binding plus the source and target repositories' revision hashes or diffs in one check. A repository that does not hold those cross-repository inputs cannot prove semantic parity from natural-language content, so its project authority registry **MUST** name the mirror surface and review owns the remaining synchronization. |

## **MUST** — Discovery infrastructure (**AIV-M**)

| ID | Rule |
|----|------|
| **AIV-M14** | `robots.txt` **MUST** explicitly allow the AI crawlers you want to be cited by — `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot` (+ `anthropic-ai`), `PerplexityBot`, `Google-Extended`, `CCBot`, `Bingbot`, `Bytespider` — and declare the sitemap. |
| **AIV-M15** | `sitemap.xml` **MUST** be current, list canonical 200 URLs (multilingual via `alternates`), and be referenced in `robots.txt`. |
| **AIV-M16** | Provide `llms.txt` at root (concise machine-readable summary + map of the most important pages); optional `llms-full.txt` for a full content dump. |
| **AIV-M17** | Per-page meta **MUST** include unique `<title>`, `meta description`, canonical, OpenGraph, Twitter card, `lang`, and `hreflang` (including `x-default`) for multilingual. |
| **AIV-M18** | For multilingual sites, serve the default locale at the prefix-less root (`/`, `/page`) with HTTP 200; other locales under a prefix (`/tr/...`). canonical, hreflang, sitemap, and llms **MUST** all agree on this one scheme and all resolve to 200. Old prefixed default-locale URLs (`/en/...`) redirect permanently (308) to the prefix-less equivalent. |

## **MUST NOT** (**AIV-N**)

| ID | Rule |
|----|------|
| **AIV-N1** | No cloaking — never serve different content to bots vs humans (User-Agent-based swaps). What AI sees **MUST** equal what humans see. |
| **AIV-N2** | No hidden text for crawlers (`display:none`, off-screen, zero-size) to "feed" bots — discounted and penalized. |
| **AIV-N3** | No critical content reachable only via client-side interaction (click-to-expand-only, JS-mount-on-event) unless it is also in the DOM/**JSON-LD**. |
| **AIV-N4** | No redirect on the primary/canonical URL that yields a near-empty body to non-following fetchers. |
| **AIV-N5** | No marketing fluff substituted for factual content; no fabricated stats/reviews/ratings; no keyword stuffing. |
| **AIV-N6** | Do not claim visibility from raw byte size or `grep -c` over full HTML — frameworks (e.g. next-intl) serialize the entire i18n message catalog into the RSC `<script>` payload, inflating counts with invisible text. |

## Gates (GAIV)

| Gate | Pass condition | On fail |
|------|----------------|---------|
| GAIV1 | Bare canonical URL `curl -s` (no redirect-follow) returns 200 and script-stripped visible text contains the core entity/positioning content. | **AIV-M1** / **M2** / **M3** |
| GAIV2 | Each real bot UA (GPTBot, ChatGPT-User, OAI-SearchBot, Googlebot, ClaudeBot, PerplexityBot) fetching the bare URL gets byte-identical full content (no cloaking, no empty stub). | **AIV-N1** / **AIV-M1** |
| GAIV3 | All sitemap URLs return 200 (no redirects); canonical self-references a 200. | **AIV-M6** / **M15** |
| GAIV4 | **JSON-LD** blocks parse as valid JSON with expected `@type`s; `Organization` has `sameAs` (or the field is omitted pending real URLs). | **AIV-M7** / **M8** / **M9** |
| GAIV5 | External AI validation (outcome gate): ask an external AI system, in a fresh/uncached session, "What is `<brand>`?" The answer **MUST** contain the intended entity definition (**AIV-M20**). If it does not, entity construction is incomplete — iterate **AIV-M10**..**M23**. (Allow for crawler/cache-refresh lag before concluding failure.) | **AIV-M10** / **M20** / **M22** / **M23** |

## Verification (**AIV-V**) — commands

**AIV-V1** — true visible text (script-stripped); the only valid visibility metric:
```bash
curl -s <url> | python3 -c "import re,sys;h=sys.stdin.read();v=re.sub(r'<script[^>]*>.*?</script>',' ',h,flags=re.S);v=re.sub(r'<style[^>]*>.*?</style>',' ',v,flags=re.S);t=re.sub(r'<[^>]+>',' ',v);print(len(re.sub(r'\s+',' ',t)),'chars visible')"
```
**AIV-V2** — bare URL status/size (must be 200, not a redirect stub):
```bash
curl -s -o /dev/null -w "HTTP %{http_code} size %{size_download} redirect '%{redirect_url}'\n" <url>
```
**AIV-V3** — per-bot fetch (no `-L`); confirm full content to each AI crawler:
```bash
for ua in "GPTBot/1.2" "ChatGPT-User/1.0" "OAI-SearchBot/1.0" "Googlebot/2.1" "ClaudeBot/1.0" "PerplexityBot/1.0"; do curl -s -A "$ua" -o /tmp/b.html -w "$ua -> HTTP %{http_code} %{size_download}b\n" <url>; done
```
**AIV-V4** — sitemap all-200 sweep (use a `while read` loop; shells like zsh do not word-split unquoted `$(...)`):
```bash
curl -s <url>/sitemap.xml | grep -oE "<loc>[^<]*</loc>" | sed 's/<[^>]*>//g' | while read -r u; do echo "$(curl -s -o /dev/null -w '%{http_code}' "$u") $u"; done
```
**AIV-V5** — **JSON-LD** validity + `@type`s:
```bash
curl -s <url> | python3 -c "import re,json,sys;[print(json.loads(b).get('@type','?')) for b in re.findall(r'<script type=\"application/ld\+json\"[^>]*>(.*?)</script>',sys.stdin.read(),re.S)]"
```
**AIV-V6** — robots AI-bot allow + sitemap declaration:
```bash
curl -s <url>/robots.txt | grep -iE "GPTBot|OAI-SearchBot|ClaudeBot|PerplexityBot|Google-Extended|Sitemap"
```
**AIV-V7** — external AI validation (outcome gate GAIV5; manual): in a fresh, uncached session of an external AI (ChatGPT, Claude, Perplexity, Gemini), ask `What is <brand>?` and confirm the answer contains the intended canonical definition (**AIV-M20**). Re-run after each entity-content change. Technical gates (**GAIV1-GAIV4**) passing is necessary but not sufficient — GAIV5 is the only outcome-level proof that entity construction landed.

## Rationale (non-normative)

These rules address common crawlability failures: a canonical URL that redirects to a thin page, critical content rendered only after client interaction, orphaned sections that are never mounted, and answers omitted from the initial document. Validate the resulting behavior against the target site's actual rendering and crawler requirements.

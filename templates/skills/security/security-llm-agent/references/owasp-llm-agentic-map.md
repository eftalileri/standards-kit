# OWASP LLM Top 10 (2025) and Agentic Top 10 (2026) — review questions

Titles are paraphrased for review use. The official documents are licensed CC BY-SA 4.0 by OWASP; consult them for definitions. The 2025 LLM list replaced the 2023/24 edition; the Agentic list (ASI) was published in December 2025 as the 2026 edition. ASI06–ASI09 titles below follow secondary summaries and should be checked against the official PDF.

## LLM Top 10 (2025)

| Theme | OWASP id | Review question | Checks |
|---|---|---|---|
| Prompt injection | LLM01 | Which untrusted channels reach the context, and what can a steered model do? | SK-LLM-01 |
| Sensitive information disclosure | LLM02 | Can the model reveal other users'/tenants' data or secrets it was given? Is data sent to the provider justified? | SK-LLM-06, -08 |
| Supply chain | LLM03 | Are models, adapters, prompt packs, MCP servers and SDKs from pinned, reviewed sources? | SK-LLM-09; `security-skill-supply-chain` |
| Data and model poisoning | LLM04 | Can outsiders write content that later becomes training, fine-tuning or retrieval data? | SK-LLM-05 |
| Improper output handling | LLM05 | Does output reach HTML, queries, shell, eval, file paths, fetch URLs or decisions unvalidated? | SK-LLM-03 |
| Excessive agency | LLM06 | Do tools have more functions, permissions or autonomy than the feature needs? | SK-LLM-02, -04 |
| System prompt leakage | LLM07 | Does the system prompt hold secrets or authorization rules that must not leak? | SK-LLM-06 |
| Vector and embedding weaknesses | LLM08 | Are retrieval stores tenant-filtered server-side; can embeddings leak source text? | SK-LLM-05 |
| Misinformation | LLM09 | Does unverified output drive commitments, decisions or package choices? | Do-not-report rule |
| Unbounded consumption | LLM10 | Are calls, tokens, steps and input sizes capped per user and tenant? | SK-LLM-07 |

## Agentic Top 10 (2026)

| Theme | OWASP id | Review question | Checks |
|---|---|---|---|
| Agent goal hijack | ASI01 | Can content the agent reads redirect its objective? | SK-LLM-01, -10 |
| Tool misuse and exploitation | ASI02 | Can tools be called with harmful arguments or chained into harmful effects? | SK-LLM-01, -09 |
| Identity and privilege abuse | ASI03 | Does the agent act under a broader identity than the requester (confused deputy)? | SK-LLM-02, -10 |
| Agentic supply chain | ASI04 | Are tools, MCP servers, plugins and skills composed at runtime from unreviewed or mutable sources? | SK-LLM-09 |
| Unexpected code execution | ASI05 | Can model output become code that runs (eval, shell, generated scripts, CI steps)? | SK-LLM-03, -10 |
| Memory and context poisoning | ASI06 | Can an attacker plant content in long-term memory or shared context that affects later sessions or other users? | SK-LLM-05 |
| Insecure inter-agent communication | ASI07 | Are messages between agents authenticated, scoped and validated? | SK-LLM-09 |
| Cascading failures | ASI08 | Can one agent's bad output propagate through automated steps with no circuit breaker? | SK-LLM-04, -07 |
| Human-agent trust exploitation | ASI09 | Do humans approve agent actions from summaries that the agent itself wrote? | SK-LLM-04 |
| Rogue agents | ASI10 | Can an agent continue acting outside its mandate without detection or a kill switch? | SK-LLM-04, -11 |

## Mitigations that count as controls

- Deterministic authorization at the tool boundary, bound to the requesting user and tenant.
- Allowlisted tools per feature; read-only by default; separate credentials per tool.
- Strict schema validation of structured output before use.
- Human confirmation for irreversible actions, showing the real parameters (not a model summary).
- Per-tenant quotas in a shared store; step and recursion limits; spend alerts.
- Pinned MCP servers and versions; re-review on description or version change.
- No secrets in prompts; provider retention/training settings evidenced.

Mitigations that do not count on their own: "the system prompt tells the model not to", input sanitizers that strip keywords, output length limits, a second model asked whether the first was injected (useful as a signal, not a boundary).

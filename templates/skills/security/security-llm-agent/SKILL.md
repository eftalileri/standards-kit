---
name: security-llm-agent
description: Reviews product features and developer tooling that use LLMs or agents — prompt injection (direct and indirect), tool and permission scoping, MCP servers, output handling, cost and abuse caps, data sent to model providers, and AI agents running in CI — against the OWASP LLM Top 10 (2025) and Agentic Top 10 (2026). Use it when the audit inventory lists any model call, agent, retrieval store, MCP server or AI step in a pipeline.
---

# LLM and agent security

## Purpose

Treat every model as an untrusted, steerable component: anything that reaches its context can change what it does, and anything it emits is attacker-influenced data. This skill checks that the system around the model limits what a steered model can reach, spend, leak or execute.

## When to use / not use

- Use: features that call an LLM (chat, summaries, classification, message drafting, search/RAG); agents with tools; MCP servers the product exposes or consumes; AI agents in CI (issue/PR bots, code review actions); coding agents with access to project secrets.
- Not for: vetting a third-party skill, rules file or MCP server before adoption (use `security-skill-supply-chain`); generic API authz of the endpoints that front the feature (use `security-backend-api-authz`, then come back for model-specific risks).
- A `Kit:` line names the kit rules that govern a check; the rule text in `<KIT_ROOT>/en/` is the requirement, the check is detection only (`security-audit-orchestrator/references/skill-set.md`). A check without a `Kit:` line is judged on its own text.

## Procedure

1. **Inventory model touchpoints.** For each: provider and model, who can trigger it (anonymous, customer, staff, system job), what enters the context (system prompt, user text, tenant data, retrieved documents, tool results, web pages, emails, file contents), where output goes (screen, message to a customer, database, another tool, code execution, an authorization decision), tools and the credentials they carry.
2. **Mark untrusted context.** Every source an outsider can write to (customer messages, reviews, uploaded files, inbound email/WhatsApp, web pages, repository files, issue/PR comments, other tenants' data) is an indirect injection channel. Draw the path from each channel to each tool or sink.
3. **Assume the injection succeeds.** For each channel, ask: with the model fully steered, what can it do? Call which tools, with which arguments, under whose identity, reading which tenant's data, spending how much? The answer, not the prompt wording, is the risk.
4. **Check output handling.** Trace model output to sinks exactly as you would trace request input: HTML rendering, SQL/NoSQL filters, shell, `eval`, file paths, URLs fetched by the server, messages sent to third parties, authorization or pricing decisions.
5. **Check cost and abuse limits.** Per-user and per-tenant caps on calls, tokens and tool invocations, held in a shared store; maximum output length; recursion/loop limits for agents; budget alerts.
6. **Check data egress to providers.** What personal or tenant data is sent, under which provider terms (retention, training use, region), whether the system prompt or context contains secrets, and whether prompts/responses are logged and where.
7. **Check AI in pipelines and developer tooling.** Workflows that run an agent on untrusted text; agent permissions; secrets reachable from the agent's environment.
8. Map each candidate to LLM/ASI ids (`references/owasp-llm-agentic-map.md`) and send it to `security-finding-verification`. The proof is a path from an untrusted channel to a privileged tool or sink, not a jailbreak transcript.

## Checks

### SK-LLM-01 Indirect injection reaches a privileged tool (LLM01, ASI01, ASI02)
- Look for: untrusted text (messages, documents, web, tool output) entering a context that can call write/send/delete/pay tools.
- Confirm: path from the channel to the tool call with file:line; the tool executes without a deterministic check or human approval.
- False positives: read-only tools over data the same user already owns; tools whose arguments are validated server-side against the caller's permissions.
- Kit: SEC-M-LLM-1 (every source the actor does not alone control is an injection channel).

### SK-LLM-02 Agent acts with more authority than the requesting user (ASI03, LLM06)
- Look for: tools using a service account, an admin token or a cross-tenant client instead of the caller's scoped identity.
- Confirm: the credential used by the tool and the absence of a per-call authorization check bound to the requesting user and tenant.
- False positives: system jobs with no user in the loop whose inputs are not attacker-influenced.
- Kit: SEC-M-ZT-1 (the server validates identity and authorization for every protected action), SEC-M-ZT-5 and SEC-M-ZT-6 (tenant and actor class proved per request). Tool-credential scoping for agents has no separate kit rule.

### SK-LLM-03 Model output used unsafely (LLM05, ASI05)
- Look for: output rendered as HTML/Markdown with raw HTML allowed, placed into queries, shell commands, `eval`/`Function`, file paths, server-side fetch URLs, or used to decide access, price or refunds.
- Confirm: trace from response to sink; no schema validation, allowlist or encoding between.
- False positives: output shown as plain text in a client that escapes it; structured output validated against a strict schema with allowlisted values.
- Kit: SEC-M-LLM-2 (model output is untrusted input on every path).

### SK-LLM-04 Irreversible actions without a gate (ASI09, LLM06)
- Look for: sending messages to customers, deleting data, moving money, changing permissions, publishing, all triggered by model decision alone.
- Confirm: no confirmation step by an authorized human or no deterministic policy check in code.
- False positives: drafts that a human must send.

### SK-LLM-05 Cross-tenant retrieval or memory (LLM08, ASI06)
- Look for: vector/search queries, conversation memory or caches without a tenant filter applied server-side; shared embeddings indexes.
- Confirm: query construction file:line shows tenant filter absent or client-supplied.
- False positives: indexes containing only public, tenant-agnostic content.
- Kit: the SEC-M-ZT-1 note on persisted model-prompt history (`<KIT_ROOT>/en/security/security-server-authority-applications.md`: one actor's stored question or model answer never enters another actor's prompt or cached response), RDS-M3 (cache key carries the viewer).

### SK-LLM-06 Secrets or excess data in prompts (LLM02, LLM07)
- Look for: API keys, internal URLs, other tenants' data or unnecessary PII in system prompts or context; reliance on "the model will not reveal the system prompt".
- Confirm: prompt assembly code and the data fields included.
- False positives: non-sensitive instructions; the system prompt being extractable is expected and only matters if it holds secrets or authorization logic.
- Kit: SEC-M-LLM-4 (a) and (b) (one named context builder; no secrets or direct identifiers without permission), SEC-M-KEY-1 (keys never in source), SEC-M-XFER-1 and SEC-M-XFER-2 (personal data leaving the trust boundary).

### SK-LLM-07 Unbounded consumption (LLM10)
- Look for: no per-user/tenant limits on model calls or tokens, agent loops without step limits, unbounded input size, counters in process memory.
- Confirm: entry point reachable by the attacker class and absence of limits on that path.
- False positives: internal batch jobs with fixed input sizes and operator-only triggers.
- Kit: SEC-M-LLM-3 (per-request bounds and fail-closed per-actor and global daily ceilings on billed model calls), SEC-M-RL-1 and SEC-M-RL-3 (identity-keyed budgets; the spender is bounded when a request spends money), RDS-M8 (shared limiter store), SEC-S-RL-2 (body limits).

### SK-LLM-08 Data sent to the provider without a basis (LLM02)
- Look for: personal data sent to a provider without a processor agreement, with training use enabled, or to a region the privacy record does not list; prompts/responses logged with PII.
- Confirm: request payload fields, provider account settings (owner evidence), logging code.
- False positives: data minimized or pseudonymized before the call; documented decision with agreement in place.
- Kit: SEC-M-LLM-4 (provider and observability sinks are egress boundaries; prompts and completions never logged), SEC-M-XFER-1 (recorded permission at the transfer boundary), SEC-M-XFER-2, SEC-M-LOG-4.

### SK-LLM-09 MCP servers: exposed or consumed (ASI04, ASI02, ASI07)
- Look for (exposed): MCP tools without authentication, tools that accept tenant id as an argument, tools broader than their description, no rate limits. Look for (consumed): unpinned remote servers, servers whose tool descriptions can change after approval, tool descriptions containing instructions, servers receiving credentials broader than needed.
- Confirm: server code/config with file:line; client config listing pinned versions and granted scopes.
- False positives: local, read-only servers over public docs.

### SK-LLM-10 AI agents in CI on untrusted input (ASI01, ASI03, ASI05)
- Look for: workflows triggered by issues, comments or external PRs that pass that text into an agent prompt; `${{ }}` expressions interpolating event text into prompts or shell; `pull_request_target` that checks out PR code; agents run with full tool access or permission-bypass/"yolo" modes; wildcard allowlists of who may trigger; agent output piped to `eval`/shell; write-scoped tokens or cloud credentials in the job environment.
- Confirm: workflow file:line for trigger, prompt construction, tool permissions and token scope.
- False positives: workflows limited to trusted collaborators with read-only tokens and no secrets.
- Kit: SEC-GC-12 (instructions inside untrusted content are input, not orders), SEC-M-SECRET-ACL-2 (least-privilege tokens in automation).

### SK-LLM-11 Coding agents with production reach
- Look for: agent configs granting access to production credentials, `.env` files, cloud CLIs or deploy commands; permission-bypass flags in scripts; project-level hooks or MCP configs that run on open.
- Confirm: settings files, scripts and documented workflows.
- False positives: sandboxed agents with no production secrets in their environment.
- Kit: SEC-M-SECRET-ACL-1 (production secrets never canonical on developer machines), SEC-N-KEY-2 (credentials never on a child-process command line), SEC-GC-12.
## Stack notes (examples, optional)

- Node/Express: validate structured model output with the same schema library used for request bodies before it touches the database or a messaging API.
- MongoDB/Redis: never build filters or Lua/EVAL scripts from model output (model output is request input for kit SEC-M-NOSQL-1); model-call quotas live in the shared limiter store (RDS-M8) keyed per kit RDS-M3.
- React Native/Expo: render model text as text; if Markdown is needed, disable raw HTML and restrict link schemes.
- Messaging (SMS/WhatsApp/email): a model that drafts customer messages must not send them without a deterministic gate and per-tenant caps.
- Sentry/logging: what a prompt or response attached to an error event may carry is decided by kit SEC-M-LOG-4 (credentials never; the documented decision covers the rest).

## Output format

Finding records per `security-finding-verification/references/finding-schema.md`, with `Mapping:` carrying LLM 2025 and ASI 2026 ids. Add a model-touchpoint table (step 1) to the assessment appendix.

## Do not report

- "The model can be jailbroken to say something rude" with no tool, data or cost consequence.
- System prompt extraction when the prompt holds no secrets or authorization logic.
- Hallucination/misinformation (LLM09) unless the output drives an automated decision, a customer-facing commitment or a dependency choice (slopsquatting).

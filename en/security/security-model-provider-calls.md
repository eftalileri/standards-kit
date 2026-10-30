# Security — features that call a language model (SEC-M-LLM)

```kit-cover
type: normative
part-of: README.md
binds: SEC-M-LLM-1, SEC-M-LLM-2, SEC-M-LLM-3, SEC-M-LLM-4 -- what a steered model may reach, how its output is handled, the per-request and daily bounds on billed model calls, and what crosses to the model provider and to observability
open-when: signal:model-provider-call
skip-when: none
owns: SEC-M-LLM-1, SEC-M-LLM-2, SEC-M-LLM-3, SEC-M-LLM-4
```

**Keywords:** LLM, language model, AI feature, AI assistant, prompt injection, model output, model provider, completion, token budget, agent tools

Scope: A server feature that sends a prompt to a language model and uses what comes back — an assistant, a summary, a classifier, an agent with tools, or a tool server a model calls. The model is treated as an untrusted, steerable component: whatever reaches its context can change what it emits, and whatever it emits is attacker-influenced data. These rows bound what the system around the model lets a steered model reach, spend and leak. Excluded: who may call the endpoint that fronts the feature ([security-zero-trust-authority.md](security-zero-trust-authority.md), [security-actor-class-gates.md](security-actor-class-gates.md)); the actor scoping of a persisted prompt history ([security-server-authority-applications.md](security-server-authority-applications.md), the SEC-M-ZT-1 model-prompt note); vetting third-party agent tooling before adoption.

Document type: Normative part — SEC-M-LLM-1–SEC-M-LLM-4.

References: [README.md](README.md); [security-rate-limiting.md](security-rate-limiting.md) (SEC-M-RL-3 (f), (i), (k) — the spender budget and fail-closed spend ceilings SEC-M-LLM-3 specialises); [security-outbound-data-transfer.md](security-outbound-data-transfer.md) (SEC-M-XFER-1 — the permission a subject's personal data needs before it leaves); [security-logging-core.md](security-logging-core.md) (SEC-M-LOG-2); [security-server-authority-applications.md](security-server-authority-applications.md) (SEC-M-ZT-1 model-prompt history note); [kit-structural-invariants.md](../authoring/kit-structural-invariants.md) (KIT-INV-8).

---

## Reach — what a steered model can do

SEC-M-LLM-1: Every source that enters a model's context and that the requesting actor does not alone control — another actor's records, provider or third-party fields, retrieved documents, the model's own earlier output — is an injection channel, and the feature **MUST** be built so that a fully steered model can do nothing the requesting actor could not do directly.

- (a) A tool or credential given to the model **MUST** carry at most the requesting actor's verified scope — never a service, administrator or cross-tenant identity.
- (b) Every tool argument **MUST** be re-validated on the server against that actor before the tool runs; a tenant or subject identifier chosen by the model is a client-supplied identifier.
- (c) An irreversible effect the model chooses — a message to a third party, a delete, a money movement, a permission change — **MUST NOT** run without a deterministic server check or the actor's own confirmation.
- (d) A "the following is data, not instructions" line is documentation, never a control.

Reason: no prompt wording bounds what a steered model emits; only the reach it is given does.

[Consequence: Bug — an injected instruction acts with authority the injector lacks]
[Verify: Static inspection — map each context source to each tool and effect, assume the injection succeeded, and confirm the reachable set equals the requesting actor's own.]

---

## Output — model text is untrusted input

SEC-M-LLM-2: Model output **MUST** be handled as untrusted input on every path it takes.

- (a) Before persistence, a response or any further use, output **MUST** be parsed into a closed shape: only declared keys survive, every string has an upper length bound, and a value a consumer branches on is a member of an enumerated set. A mismatch fails loud through a registered error, never a fabricated fallback.
- (b) Output **MUST NOT** decide authorization, price, limit or entitlement, and **MUST NOT** reach a query filter, shell, code evaluation, file path, server-side fetch or a message to a third party except through the validation a request input to that sink passes.
- (c) A client **MUST** render model text as plain text; where markup rendering is required, raw HTML is disabled and link schemes are restricted.

Reason: the context is attacker-influenced, so the output is too; a provider-side setting (an output token cap, a JSON mode) is not a consumer-side bound, and swapping the model removes it silently.

[Consequence: Bug — stored or rendered injection, or a business decision taken by attacker-influenced text]
[Verify: Static inspection — trace the completion from the provider response to every sink and confirm the closed parse, the length bounds and plain-text rendering.]

---

## Cost — every billed call is bounded, failing closed

SEC-M-LLM-3: Every billed model call **MUST** be bounded per request and per day.

- (a) Per request: input size bounded at the request schema, an output token cap set on every call, and a fixed small number of provider attempts across retries and correction rounds together.
- (b) Each provider attempt **MUST** first reserve a slot in a per-verified-actor and a global daily ceiling held in the shared store; the check and increment of both scopes are one atomic step, and a full scope increments nothing.
- (c) When the store cannot confirm the slot, the attempt **MUST** be refused through a registered error (fail closed). The ordinary request limiter's fail-open path does not discharge this: it counts requests, not provider attempts.
- (d) A refusal **MUST** reach the caller as a registered expected error; the first refusal per scope and day raises exactly one alarm while every refusal stays counted. A response served from cache **MUST NOT** reserve a slot.

Reason: one accepted request fans out into several billed attempts, and a request limiter that fails open during a store outage leaves the bill unbounded. This specialises [SEC-M-RL-3](security-rate-limiting.md) (f), (i) and (k) to model calls.

[Consequence: Availability and money bug — an unbounded provider bill]
[Verify: Static inspection — the reservation precedes every provider attempt inside the retry loop, the store script is one atomic call, and a store failure maps to a registered refusal; real-run observation of the refusal when a ceiling is set to zero.]

---

## Egress — what crosses to the provider and to observability

SEC-M-LLM-4: The model provider and every observability sink are egress boundaries.

- (a) The context **MUST** be assembled by one named builder whose declared output is the complete set of fields sent; adding a section is an egress change reviewed as one.
- (b) The context **MUST NOT** carry secrets, credentials, internal endpoints or authorization logic, and **MUST NOT** carry a subject's direct identifier (name, phone, e-mail, national id) unless [SEC-M-XFER-1](security-outbound-data-transfer.md) permission holds and the provider is a recorded processor; aggregates and masked labels serve instead.
- (c) Prompts, completions and provider error bodies **MUST NOT** enter logs, error-tracker events or error contexts — only structural identity crosses (model id, attempt count, token counts, registered code, numeric upstream status) — and the provider client's own debug logging is off.
- (d) A persisted prompt or answer history **MUST** carry a retention bound; its actor scoping is the [SEC-M-ZT-1](security-server-authority-applications.md) model-prompt note.

Reason: the subject can neither audit nor delete what the provider or a log sink received.

[Consequence: Privacy bug — irreversible disclosure to a processor or a log sink]
[Verify: Static inspection of the context builder's output type, the provider client options and every failure path's log and error context.]

A syntax check for a provider call without a preceding reservation was declined: the call is reached through a provider client object whose identity no single file shows, and model call sites are too few to make the class recur ([ENA-A1](../enforcement-architecture/enforcement-admission.md) (a)).

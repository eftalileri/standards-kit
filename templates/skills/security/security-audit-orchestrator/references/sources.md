# Sources and licenses

All skill text in this folder is written fresh. Sources contributed **ideas** (methods, check categories, structure); no text was copied. Licenses were taken from the research notes or the repository's SPDX field on 2026-10-30; "not verified" means no license text was read.

## License handling

| License class | Sources in this list | What it allows here |
|---|---|---|
| Permissive (MIT, Apache-2.0, BSD-3-Clause, CC-BY-4.0) | most community and vendor skill repos | Adaptation with attribution; we still rewrote rather than copied. |
| Share-alike (CC-BY-SA-4.0, GPL/AGPL) | Trail of Bits skills; OWASP documents and cheat sheets | **No verbatim reuse.** Copying text would put the derived file under the same license. Ideas only, rewritten. |
| Proprietary / all rights reserved | Anthropic `claude-security` plugin; vendor blogs and product docs; news articles | **No verbatim reuse.** Ideas and facts only, cited. |
| No license / NOASSERTION / not verified | dweinstein mobile skills, Wiz rules, Cisco skill-scanner, forum posts, some Anthropic plugin folders | **No verbatim reuse.** Treat as all rights reserved; ideas only. |
| Public legal or government text | GDPR, KVKK, NIST SSDF | Cite; summarize in own words. |

## security-audit-orchestrator

| Idea | Source | License |
|---|---|---|
| Inventory → threat model → component × category matrix; ~25-file components; coverage section naming skipped directories; commit stamp with dirty flag; effort levels; repository text as data | Anthropic `claude-security` plugin — https://github.com/anthropics/claude-plugins-official/tree/main/plugins/claude-security | Proprietary |
| Coverage ledger, additive re-runs, hunters plus coverage critics, data-isolation and lifecycle hunting area | Cloudflare `security-audit-skill` — https://github.com/cloudflare/security-audit-skill ; blog https://blog.cloudflare.com/build-your-own-vulnerability-harness | MIT (skill); blog all rights reserved |
| Recon then investigate split; todo file on disk for resumable sweeps | Gemini CLI security extension — https://github.com/gemini-cli-extensions/security | Apache-2.0 |
| Nominate files before analysis; explicit postcondition per step | Ghost Security skills — https://github.com/ghostsecurity/skills | Apache-2.0 |
| Never "fix" by disabling a protection; "not visible in app code — verify at runtime/config"; documented overrides are not argued; audit order for Express | OpenAI `security-best-practices` — https://github.com/openai/skills/tree/main/skills/.curated/security-best-practices | Apache-2.0 |
| Threat model → scan → validate → patch pipeline shape | OpenAI Codex Security docs — https://developers.openai.com/codex/security/faq | Proprietary docs |
| Blast radius by counting callers; "small PR / just a refactor" at full rigor | Trail of Bits `differential-review` — https://github.com/trailofbits/skills/tree/main/plugins/differential-review | CC-BY-SA-4.0 |
| Introduced-by-change criterion (kept, but pre-existing findings reported separately) | OpenAI Codex review rubric — https://github.com/openai/codex/blob/main/codex-rs/prompts/templates/review/rubric.md | Apache-2.0 |
| Project policy file read before review | Anthropic `security-guidance` plugin — https://github.com/anthropics/claude-plugins-official/tree/main/plugins/security-guidance | Apache-2.0 |
| Phase order, often-forgotten areas, tool blind spots | OWASP WSTG (https://owasp.org/www-project-web-security-testing-guide/), ASVS 5.0 (https://github.com/OWASP/ASVS), MASTG (https://github.com/OWASP/mastg); Apiiro on DAST and IDOR (https://apiiro.com/blog/why-dast-tools-miss-real-idor-vulnerabilities-and-how-ai-helps); Semgrep cross-file docs (https://semgrep.dev/docs/semgrep-code/semgrep-pro-engine-data-flow) | OWASP CC-BY-SA-4.0; vendor pages proprietary |
| Authorization and business logic as the main failure area of agent-built apps | Tenzai experiment via CIO Korea — https://www.cio.com/article/4117131/ | News, proprietary |
| Trace one request path; feed the authorization model; one session per line of inquiry | SpecterOps — https://specterops.io/blog/2026/03/26/leveling-up-secure-code-reviews-with-claude-code/ | Proprietary blog |

## security-finding-verification

| Idea | Source | License |
|---|---|---|
| Hard exclusions and precedents; per-finding filter sub-task; report only at 8/10+ | Anthropic `/security-review` command — https://github.com/anthropics/claude-code-security-review/blob/main/.claude/commands/security-review.md | MIT |
| Three lenses (reachability, impact, defenses), default reject, no invented defenses, lower-only severity, votes counted outside the model, introduced-vs-pre-existing verdict, one most-specific CWE | Anthropic `claude-security` scan verifier/researcher — https://github.com/anthropics/claude-plugins-official/tree/main/plugins/claude-security | Proprietary |
| Restate the claim first; rationalizations table; chain check across rejected items | Trail of Bits `fp-check` — https://github.com/trailofbits/skills/blob/main/plugins/fp-check/skills/fp-check/SKILL.md | CC-BY-SA-4.0 |
| Variant analysis of a confirmed bug class | Trail of Bits `variant-analysis` — https://github.com/trailofbits/skills/tree/main/plugins/variant-analysis | CC-BY-SA-4.0 |
| Verdict trio, strongest control on every path and fail-closed test, confidence cap without execution, fingerprints without line numbers, "authentication is not ownership" | briiirussell `finding-verifier` — https://github.com/briiirussell/cybersecurity-skills/blob/main/agents/finding-verifier.md | MIT |
| Four-question gate; Confirmed/Likely/Needs-verification labels; path field | agamm `claude-code-owasp` — https://github.com/agamm/claude-code-owasp | MIT |
| Attacker-model inflation, documented behavior mistaken for a bug | harshdhamaniya `exploitability-skeptic` — https://github.com/harshdhamaniya/mobile-security-skill/blob/main/agents/exploitability-skeptic.md | MIT |
| Five-question false-positive gate (adapted so config/infra findings survive) | Gemini CLI security `GEMINI.md` — https://github.com/gemini-cli-extensions/security/blob/main/GEMINI.md | Apache-2.0 |
| High-confidence-only reporting; "do not flag" server-controlled values | Sentry `security-review` — https://github.com/getsentry/skills/blob/main/skills/security-review/SKILL.md | Apache-2.0 |
| Secret masking, rotation advice, downgrade when no exploit scenario | Anthropic `code-modernization` security-auditor — https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-modernization/agents/security-auditor.md | Not verified (per-plugin) |
| Thresholds applied by code; judge separate from producer; precedents generalize; gate unsuited to "find every X" | nikiforovall teardown — https://nikiforovall.blog/ai/2026/07/28/claude-code-security.html | Blog, no license stated |
| Run-to-run variance; persist findings outside chat | Fencer — https://www.fencer.dev/blog/claude-security-review-50-pull-requests | Vendor blog |
| Reviewer disarmed by "safe" comments; real bug dismissed after generic payloads | Checkmarx — https://checkmarx.com/zero-post/bypassing-claude-code-how-easy-is-it-to-trick-an-ai-security-reviewer/ | Vendor blog |
| Deterministic backbone, LLM findings capped and labelled | dev.to ayame0328 — https://dev.to/ayame0328/building-a-security-scanner-with-claude-code-skills-how-i-tackled-llms-p-hacking-problem-ebk | Author copyright |
| Cross-model second opinion; finder plus challenger | Hacker News 47633855 — https://news.ycombinator.com/item?id=47633855 | Forum, no license |
| CVSS 4.0 nomenclature (B/BT/BE/BTE); "severity, not risk" | FIRST CVSS v4.0 — https://www.first.org/cvss/v4-0/ | FIRST terms; cite only |
| Taint-flow fields in the finding record | awesome-copilot `sast-sca-security-analyzer` — https://github.com/github/awesome-copilot/blob/main/agents/sast-sca-security-analyzer.agent.md | MIT |

## security-threat-modeling

| Idea | Source | License |
|---|---|---|
| Evidence-anchored model; boundaries as edges with protocol/auth/encryption/validation/rate limit; explicit non-capabilities; abuse paths; existing vs recommended mitigations; quality checklist (the "pause to ask" step replaced by an assumptions register) | OpenAI `security-threat-model` — https://github.com/openai/skills/blob/main/skills/.curated/security-threat-model/SKILL.md | Apache-2.0 |
| Hand-off fields: entry points, sinks, assumptions, boundaries, hot files | Anthropic `claude-security` workflow — https://github.com/anthropics/claude-plugins-official/tree/main/plugins/claude-security | Proprietary |
| Phased STRIDE workflow; data kept separate from report | fr33d3m0n `threat-modeling` — https://github.com/fr33d3m0n/threat-modeling | BSD-3-Clause |
| What each function assumes and guarantees | Trail of Bits `audit-context-building` — https://github.com/trailofbits/skills/tree/main/plugins/audit-context-building | CC-BY-SA-4.0 |
| Tenant-membership investigation questions | Sentry `django-access-review` tenant isolation — https://github.com/getsentry/skills/blob/main/skills/django-access-review/references/tenant-isolation.md | Apache-2.0 |
| Server-side enforcement of price, role, plan, limits | raroque `vibe-security-skill` — https://github.com/raroque/vibe-security-skill | MIT |
| Threat-model-first stance | Addy Osmani `security-and-hardening` — https://github.com/addyosmani/agent-skills/blob/main/skills/security-and-hardening/SKILL.md | MIT |

## security-llm-agent

| Idea | Source | License |
|---|---|---|
| Risk taxonomy | OWASP Top 10 for LLM Applications 2025 — https://genai.owasp.org/llm-top-10/ ; OWASP Top 10 for Agentic Applications 2026 — https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026 | CC-BY-SA-4.0 (OWASP); repo SPDX NOASSERTION |
| LLM-safety checks: secrets/PII in prompts, output into eval/SQL/HTML/shell, authz from model output, over-permissioned tools | Gemini CLI security `GEMINI.md` §1.6 — https://github.com/gemini-cli-extensions/security/blob/main/GEMINI.md | Apache-2.0 |
| AI agents in GitHub Actions: nine vectors | Trail of Bits `agentic-actions-auditor` — https://github.com/trailofbits/skills/tree/main/plugins/agentic-actions-auditor | CC-BY-SA-4.0 |
| Agentic id list and report tagging | agamm `claude-code-owasp` — https://github.com/agamm/claude-code-owasp | MIT |
| MCP security rule area | Project CodeGuard — https://github.com/cosai-oasis/project-codeguard | CC-BY-4.0 (rules); repo NOASSERTION |
| Action not hardened against prompt injection; trusted PRs only | Anthropic `claude-code-security-review` README — https://github.com/anthropics/claude-code-security-review | MIT |
| Agent read process environment from a crafted comment | Born City — https://borncity.com/news/claude-code-kritische-sicherheitsluecke-haette-api-keys-preisgegeben/ | News |
| Malware driving local AI CLIs with permission-bypass flags | Apiiro on Nx "s1ngularity" — https://apiiro.com/blog/nx-supply-chain-breach-shows-why-malicious-package-detection-matters | Vendor blog |
| AI usage caps | raroque `vibe-security-skill` — https://github.com/raroque/vibe-security-skill | MIT |
| Agent security controls | OWASP AI Agent Security Cheat Sheet — https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html | CC-BY-SA-4.0 |

## security-privacy-logging

| Idea | Source | License |
|---|---|---|
| Privacy taint: privacy sources to log/third-party sinks; masking counts as sanitization | Gemini CLI security `GEMINI.md` §1.7 — https://github.com/gemini-cli-extensions/security/blob/main/GEMINI.md | Apache-2.0 |
| Logging rules; secrets scanner covering database and cache connection strings | awesome-copilot `security-and-owasp` instructions and `secrets-scanner` hook — https://github.com/github/awesome-copilot | MIT |
| Alerting, not just logging; fail-closed on exceptional conditions | OWASP Top 10:2025 A09, A10 — https://top10.owasp.org/2025/0x00_2025-Introduction | CC-BY-SA-4.0 |
| No source maps in production bundles; logout clears cached data | JubaKitiashvili Expo `security-review` — https://github.com/JubaKitiashvili/everything-react-native-expo/blob/main/skills/security-review/SKILL.md | MIT |
| Source-map exposure; webhook and AI cost items | raroque `vibe-security-skill` — https://github.com/raroque/vibe-security-skill | MIT |
| Privacy and logging rule areas | Project CodeGuard — https://github.com/cosai-oasis/project-codeguard | CC-BY-4.0 (rules) |
| Incident runbook and GDPR handling as topic seeds | wshobson `agents` — https://github.com/wshobson/agents | MIT |
| Breach-notification exercise material | Sushegaad GRC skills — https://github.com/Sushegaad/Claude-Skills-Governance-Risk-and-Compliance | MIT |
| Legal anchors | GDPR (Regulation (EU) 2016/679); KVKK Law No. 6698 and Board guidance | Public legal text |
| Error-tracker settings named in the checklist | Sentry product documentation — https://docs.sentry.io/ | Vendor docs; cite only |

## security-skill-supply-chain

| Idea | Source | License |
|---|---|---|
| Trusted sources only; audit every bundled file; external-URL fetching is risky; treat like installing software | Anthropic Agent Skills overview — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview ; Claude Code security — https://code.claude.com/docs/en/security | Proprietary docs |
| Malicious skills hide mostly in prose; credential theft and agent manipulation | "Do Not Mention This to the User" — https://arxiv.org/abs/2602.06547 | arXiv; cite only |
| Malicious payload techniques (pipe-to-shell, encoded exfil, remote instruction loading, memory poisoning) | Snyk ToxicSkills — https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/ ; https://arxiv.org/html/2605.28588 | Vendor blog; arXiv |
| Skill scanners bypassed (padding, bytecode, archives, injection against LLM scanners); pin versions against rug pulls | CSA note on Trail of Bits bypass research — https://labs.cloudsecurityalliance.org/research/csa-research-note-ai-agent-skill-scanner-bypass-20260610-csa/ | CSA, cite only |
| Dynamic-context commands, unrestricted tool grants, external URLs as detection heuristics | Datadog Security Labs — https://securitylabs.datadoghq.com/articles/malicious-skills-supply-chain-risks-in-coding-agents-with-dynamic-context/ | Vendor blog |
| Hidden Unicode in rules files | Pillar Security "Rules File Backdoor" via SC World — https://www.scworld.com/news/how-ai-coding-assistants-could-be-compromised-via-rules-file | News / vendor research |
| Project config (hooks, MCP auto-enable, API base URL) as attack surface | Check Point Research — https://research.checkpoint.com/2026/rce-and-api-token-exfiltration-through-claude-code-project-files/ | Vendor research |
| Integrity manifests with file hashes; promotion gate | awesome-copilot `agent-supply-chain` — https://github.com/github/awesome-copilot/blob/main/skills/agent-supply-chain/SKILL.md | MIT |
| Agentic skills risk list | OWASP Agentic Skills Top 10 — https://owasp.org/www-project-agentic-skills-top-10/ | OWASP (CC-BY-SA-4.0 expected; not verified) |
| Template farms, impersonating names, mass-generated libraries, pushy triggers | Research notes (`github_community.md`, `anthropic_ecosystem.md`) observations of public repos | Own research |
| Optional scanners (as tools, with blind spots) | Cisco skill-scanner — https://github.com/cisco-ai-defense/skill-scanner (NOASSERTION); NVIDIA SkillSpector — https://github.com/NVIDIA/SkillSpector (Apache-2.0) | as listed |
| Positive instructions and push-back guidance when writing security skills | Semgrep — https://semgrep.dev/blog/2026/security-skills-ai-agents/ | Vendor blog |

## Domain skills (candidate sources from the research notes)

The seven domain skills were written in parallel by another author. The rows below list the research-note sources relevant to each domain; the domain author should confirm or prune them.

| Skill | Candidate sources (license) |
|---|---|
| `security-web-frontend` | OpenAI `security-best-practices` React/frontend references (Apache-2.0); awesome-copilot `security-and-owasp` FE/RX families (MIT); VibeSec open-redirect and headers (Apache-2.0); OWASP ASVS 5.0 V3 (CC-BY-SA-4.0); Anthropic `security-guidance` patterns (Apache-2.0) |
| `security-backend-api-authz` | OpenAI Express reference (Apache-2.0); ersinkoc `security-check` mass-assignment, race, rate-limit, business-logic (MIT); Sentry tenant-isolation (Apache-2.0); OWASP API Top 10 2023 (CC-BY-SA-4.0); Trail of Bits `insecure-defaults` (CC-BY-SA-4.0); vibe-security payments (MIT) |
| `security-auth-session` | OWASP ASVS 5.0 V6/V7/V9/V10 (CC-BY-SA-4.0); awesome-copilot AU/AZ families (MIT); VibeSec JWT checklist (Apache-2.0) |
| `security-database-cache` | ersinkoc `sc-nosqli` (MIT); OpenAI Express `EXPRESS-INJECT-002` (Apache-2.0); MongoDB Security Checklist (vendor docs); Redis security docs (vendor docs) |
| `security-mobile` | OWASP MASVS 2.1 / MASTG 2.0 (CC-BY-SA-4.0); JubaKitiashvili Expo checklist (MIT); harshdhamaniya mobile skill (MIT); dweinstein mobile skills (no license, ideas only); Expo EAS Update code-signing docs (vendor docs); CodeGuard mobile rule (CC-BY-4.0) |
| `security-infra-cloud-dns` | OWASP WSTG-CONF-10 subdomain takeover (CC-BY-SA-4.0); can-i-take-over-xyz (see repo); Trail of Bits `insecure-defaults` (CC-BY-SA-4.0) |
| `security-secrets-supply-chain-cicd` | Trail of Bits `supply-chain-risk-auditor` (CC-BY-SA-4.0); awesome-copilot D1–D5 and secrets hook (MIT); Wiz slopsquatting rule (NOASSERTION); Snyk package health (Apache-2.0); SLSA 1.2; OpenSSF Scorecard (Apache-2.0) |

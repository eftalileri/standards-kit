# Security skill set (template)

Fourteen optional Claude Code skills for a read-only security assessment and a kit-driven pre-push review of a whole project — code, mobile app, data stores, hosting, DNS/email, release pipeline, third parties, AI features, people and process. They report only findings they can prove (file:line trace, configuration evidence or a written reproduction) and never create test artifacts.

The skills carry procedure only. Wherever a kit rule governs a check, the check names it on a `Kit:` line (for example `Kit: SEC-M-NOSQL-1, SEC-N-NOSQL-2`) instead of restating it, so the kit stays the single source of each requirement. Checks the kit does not cover stand on their own text. Check ids use the `SK-<AREA>-NN` form, which no kit identity uses.

| Folder | Role |
|---|---|
| `security-audit-orchestrator/` | Entry point: scope, inventory, component × lens matrix, routing, coverage ledger, report. `references/skill-set.md` is the set's index and shared conventions; `references/sources.md` records the provenance and licenses of the ideas. |
| `security-push-review/` | The security step of the push or release gate: changed paths → governing kit rows, reachable callers, playbooks, triage, fix in the same turn (kit SEC-GC-14, SEC-GC-15). Replace its example area map with your paths. |
| `security-threat-modeling/`, `security-finding-verification/` | Threat model hand-off; proof, refutation, severity and variant analysis for every candidate. |
| `security-web-frontend/`, `security-backend-api-authz/`, `security-auth-session/`, `security-database-cache/`, `security-mobile/`, `security-infra-cloud-dns/`, `security-secrets-supply-chain-cicd/` | Domain checklists. |
| `security-llm-agent/`, `security-privacy-logging/`, `security-skill-supply-chain/` | Cross-cutting process checklists. |

## Install

```bash
mkdir -p .claude/skills && cp -R docs/standards-kit/templates/skills/security/security-* .claude/skills/
```

Then replace `<KIT_ROOT>` in the copied files with the kit's path in your repository (find them with `grep -rn '<KIT_ROOT>' .claude/skills/security-*`). Stack notes (Node/Express, MongoDB, Redis, React Native/Expo, Railway, Cloudflare, Sentry) are examples; a `Kit:` line that names a topic your project does not use does not apply. Start an assessment with `/security-audit-orchestrator`; each domain skill can also run alone. Wire `/security-push-review` into your push gate in place of a generic diff-review prompt.

The assessment skills are read-only: they never change console settings, never run exploits, and installing any scanner they mention needs the owner's approval. `security-push-review` is the one exception: it fixes confirmed findings inside the push your root agent file's gate already authorizes. The skills grant no authority of their own; a fix they lead to follows your root agent file like any other change.

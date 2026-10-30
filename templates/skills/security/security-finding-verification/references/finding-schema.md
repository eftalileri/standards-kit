# Finding record schema

One record per finding. Markdown block for humans; the same fields as one JSON object per line when a machine-readable file is wanted.

```
### <ID> <short title>
- Verdict:        confirmed | needs_validation | rejected
- Severity:       Critical | High | Medium | Low
- CVSS:           CVSS-B|BT|BE|BTE 4.0 <score> — <vector string>
- Business impact: one sentence in the owner's terms (who loses what)
- Confidence:     <1-10> (<why>)
- CWE:            one most-specific Base or Class weakness (never a Pillar)
- Mapping:        OWASP Top 10:2025 / API Top 10 2023 / ASVS 5.0 / MASVS 2.1 / LLM 2025 / ASI 2026 id(s) where they fit
- Location:       sink file:line · enclosing function/symbol
- Path:           entry file:line -> hop file:line -> ... -> sink file:line
- Attacker:       who, with what access; explicit non-capabilities
- Preconditions:  what must be true
- Controls examined: control, file:line, why it does not stop this path
- Evidence:       code excerpt (<= 10 lines, secrets masked) and/or config evidence with source and date
- Scenario:       one or two sentences, no weaponized payload
- Fix:            root-cause fix at the shared authority; mitigation if the fix needs time
- Variants:       pattern searched, scope, count, list of ids
- Chain:          related finding ids, if part of a chain
- Verification:   verifier votes (REACHABILITY/IMPACT/DEFENSES), runs that found it, second-model result
- Change mode:    introduced | pre-existing | n/a
- Fingerprint:    <class>:<file>:<symbol> (no line numbers)
- Status:         open | fixed (evidence) | accepted risk (decision reference) | duplicate of <ID>
- Re-check:       what evidence closes it
```

ID convention: `<RUN>-<NNN>` within a run; the fingerprint links the same finding across runs.

Secret findings add: masked value, credential type, what it grants, live/test judgment and how it was judged, rotation recommendation, history exposure (first commit that contained it).

Triage log line for rejected candidates: `<fingerprint> | rejected | <reason or precedent> | <date>`.

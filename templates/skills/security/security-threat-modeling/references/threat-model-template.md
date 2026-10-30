# Threat model template

```
# Threat model — <system or subsystem> — <date>
Commit <sha> · scope <paths/services> · author <agent/run id>

## 1. System model
| Component | Kind (client/service/worker/store/cache/third party/admin/build) | Evidence | Runtime or build/dev |

## 2. Assets
| Asset | Data class | Where stored | Where it flows | Legal weight |

## 3. Actors
| Actor | Can | Cannot (non-capabilities) | Entry points |

## 4. Trust boundaries
| Id | From → To | Protocol | Authn | Authz decision (file:line) | Tenant scope source | Encryption | Validation (file:line) | Rate limit (store) |

## 5. Data-flow diagram
(Mermaid flowchart or indented list; mark boundaries with their ids)

## 6. Threats
| Id | Element/boundary | STRIDE | Abuse path (actor → entry → steps → gain) | Existing controls (evidence) | Likelihood | Impact | Tier |

## 7. Abuse cases kept / dismissed
| Case | Kept? | Reason |

## 8. Assumptions register
| Id | Assumption | Relied on at | Confidence | Verify by |

## 9. Mitigations
| Threat id | Existing (evidence) | Recommended (authority location) |

## 10. Quality pass
- [ ] every entry point has a threat
- [ ] every boundary has a threat
- [ ] every High has an owner component
- [ ] every assumption has a verification task
- [ ] no threat relies on a listed non-capability

## 11. Hand-off
(the YAML block defined in SKILL.md)
```

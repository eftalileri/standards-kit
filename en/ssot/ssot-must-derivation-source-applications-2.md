# SSoT **MUST** — measured shapes of a wrong derivation source (2/2): the fact supplied by the caller

```kit-cover
type: normative
part-of: README.md
binds: the shape in which a derivation's wrong source is not a store it reads but its own CALLER -- a parameter naming a fact that another parameter of the same list already determines, consumed as the answer instead of resolved from that fact's authority
open-when: never-by-default
skip-when: none
owns: none
```

Part of: [SSoT principles and precedence](ssot-principles-and-precedence.md), through [wrong derivation source applications](ssot-must-derivation-source-applications.md). **SSG-M1** is defined in [authority, write access and derived fields](ssot-must-authority-and-derivation.md) and is not restated here; this file documents applications only ([**KIT-INV-3**](../authoring/kit-structural-invariants.md)).

Example file: opened when the **SSG-M1** shape list names the caller-supplied fact. Its source is the caller, not a store: the shape closes by deleting the parameter. The store-side shapes, including the frozen-copy one, are in the [entry example file](ssot-must-derivation-source-applications.md).

References: [authority, write access and derived fields](ssot-must-authority-and-derivation.md) (**SSG-M1**, **SSG-M2**); [wrong derivation source applications](ssot-must-derivation-source-applications.md) (the store-side shapes); [re-spelled derivations](ssot-must-derivation-respelled-applications.md) (the source is right and the derivation was re-spelled); [SSoT principles and precedence](ssot-principles-and-precedence.md) (**SSG-M8** — one authority, no parallel path); [declared, not stored: single values and raw inputs](ssot-must-duplicate-authority-declaration-shapes-2.md) (the consumer that reads a derivation's raw input rather than the derivation).

---

**SSG-M1** caller-supplied-fact application: A derivation **MUST NOT** accept as a parameter a fact already determined by another of its parameters. Resolve the fact from its own authority and remove the redundant input. This occurs when a callable receives a key together with a value that the key uniquely determines, such as an account identifier and its owner identifier. The parameter name can conceal substitution: a caller may pass its own identity because it usually matches the account's owner, while another call site may pass a different actor and produce a plausible but incomplete result. (a) Do not place a key and a fact it determines side by side in one parameter list; keep only independently sourced inputs. (b) A parameter named after a fact does not prove that it contains that fact. (c) Preserve parameters that are claims to verify: an ownership assertion compared against a record, or a proposed value for a new record with no existing authority, may be a valid input. The distinction is whether the callee verifies the claim or consumes it as truth. (d) A result described as complete must be derived from the authority that defines membership, not from caller-provided members. Enforcement limit: a single-file syntax check of the parameter list cannot distinguish a value consumed as truth from a claim compared against a record. Prefer removing redundant parameters so invalid calls are unrepresentable; otherwise review the callee's use of the value. [On violation: Bug — a derivation returns a plausible answer built from a fact its caller supplied incorrectly] [Verify by: remove parameters already determined by another input; for every surviving identity parameter, verify the callee checks the claim instead of trusting it; derive complete sets from their membership authority]

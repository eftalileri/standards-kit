# Error policy — the typed carrier and derived severity (**M13**–**M15**, **M39**)

```kit-cover
type: normative
part-of: README.md
binds: the fourth band of error-policy MUST rows — the typed carrier that gives a throw its registry identity, the second carrier a shared tier must declare instead of importing upward, the compile-time type binding that makes an off-registry code impossible, and severity derived from category rather than stored
open-when: shape:backend-heavy, signal:error-infrastructure, signal:error-raise, signal:error-boundary
skip-when: signal:client-only, signal:no-error-path-change
owns: M13, M14, M15, M39
```

Part of [Error policy](error-policy.md) — the agent execution contract (**C1**–**C10**), the closed category set, the registry/carrier/boundary model, the required message shape and the semantic-code rows (S1–S3) are defined there and bind every row below.

Bare-ID scope: an unlinked `C*` / `M*` / `N*` / `S*` id cited in this topic always means an error-policy row. The band that defines each one — prohibitions included — is listed in [README.md](README.md); that list has one writer ([**SSG-M8**](../ssot/ssot-principles-and-precedence.md)) and is not restated here.

---

## **MUST** — **M13** to **M15**

**M13**: Throws on policy-covered paths **MUST** carry the registry code as identity through a typed carrier. Operator detail (root cause, identifiers) **MUST** live in structured context, not in a message string (**N10**). For a TypeScript project this may be an error class or throw factory; use the project’s equivalent typed mechanism in other languages.

When a domain package is compiled for both client and server, it must not depend upward on an application-layer throw factory. The shared tier still needs a typed carrier holding a code from the shared error contract and structured diagnostic context. It may declare a carrier at that layer and let the single server boundary resolve its registry facts; it must not encode identity in free-text messages or create multiple carrier authorities. Follow the consuming project’s dependency-direction standard where packages are shared across tiers.

Use one carrier shape per shared tier, and branch on its common base. If a narrow typed error already exists, generalize it as a subclass of the common carrier rather than adding a parallel carrier. The boundary should resolve the base carrier once, while status, category, message key, and retryability are read from the registry rather than cached on the carrier.

Why a raw-code throw is not a smaller version of a typed carrier. A boundary resolves a thrown value by type, not by parsing its message (**N10**). A raw exception whose message begins with a code falls through to the unknown-error path. If the registry classifies that code as an expected business outcome, the user instead receives a generic server error and crash reporting receives a false defect. This remains true even if a particular status happens to match today; it is a property of that registry row, not a guarantee of the string-based pattern.

Declared enforcement limit for code-shaped throws. A single-file static check can detect code-shaped throw expressions, but cannot determine whether that code is registered because the registry lives in another module. Its remedy should describe the general requirement to use the project’s typed carrier, with a separate path for shared packages that cannot import an application-layer factory. Register an unregistered code before converting the raise site, then remove any parallel constant in the same change. A staged rollout may scope enforcement to measured clean paths and document remaining debt; never imply coverage for unchecked paths.

A text search is not automatically a missing carrier — inspect its producer first. Before replacing a substring predicate with a structured carrier, determine whether the producer throws, is reachable on the path, and actually emits the searched text. If any condition fails, the branch may be dead and should be removed. If it is live, check whether an existing structured signal already carries the same fact; consume that authority instead of creating a second one. Record which producer fact justified removal or conversion.

A non-carrier caught value needs structural classification. A caught value that is not the typed carrier and has no structural classifier should be wrapped as a registered `SYSTEM` failure using only structural evidence, never relabeled as an expected business or authorization outcome (**M33**(b), **N12**). Where this branch is statically decidable, a project may enforce it with a focused check and document its limits.

**M14**: The error-code type **MUST** be derived from the registry keys so an off-registry code is a compile-time error where the language supports that relationship. Casts or untyped escapes that admit unregistered codes are forbidden (**N7**). Apply the type to every code-bearing carrier and boundary field, including wrappers for foreign library errors. If an external library exposes multiple reachable statuses, register one semantic code per status; the boundary identifies the matching registered case and does not invent a status or category. An unmatched status remains on the unknown-error path.

**M15**: Severity **MUST** be derived from category through one total function (for example, `severityOf(category)` mapping to `WARN` or `ERROR`), never stored on the error or registry row. The function **MUST** be exhaustive over the closed category set; an unmapped category must fail through the language’s type/checking mechanism where available.

Every consuming tier derives severity from the same category authority; it must not maintain a hand-kept list of expected codes. Such lists drift as the registry grows and can route expected failures to crash reporting. Read category from the envelope; for older or boundary-less responses, resolve the same registry row from the wire code when the shared contract is available. Unknown codes keep the crash-channel default. Evaluate any branch for a specific diagnostic before the general severity mapping so the generic expected-error branch cannot swallow it.

A consumer behavior that relies on a code being unregistered is an accidental default. Registering an already-used code may change how downstream consumers classify it. Before adding such a row, inspect released consumers and preserve any diagnostic behavior with an explicit branch keyed by the semantic code in the same change. Do not change the code’s classification merely to preserve a downstream special case; keep the registry facts aligned with the actual error meaning.

**M39**: A rejection caused by the server losing or altering input that an earlier boundary in the same request already accepted (a body re-parse failing after route validation, a request selector dropped by a body rewrite) **MUST** be raised with a registered SYSTEM code, never with the client-input code; the client-input code is reserved for input the boundary itself rejects. A handler that re-reads a route-validated body **MUST** do so through the project's single route-validated body reader, which knows whether the boundary already accepted it. Reason: a server defect classified as client input reaches only the metric channel, so an endpoint can reject every request without any alert.

# Error display UX (client surfaces) -- normative

```kit-cover
type: normative
part-of: README.md
binds: EHX obligations - which client UI surface presents which error category, narrowing presentation only
open-when: shape:frontend-heavy, signal:client-failure-path, signal:error-classification, signal:retry-ux
skip-when: signal:backend-only, signal:no-client-failure-path
owns: EHX-D*, EHX-M*, EHX-N*
```

Scope: Which UI surface (toast, inline, modal, full-screen region ) applies per [error-handling](error-handling.md) category — does not replace **M3**–**M8** (message shape, logging ) ; narrows presentation only.

Precedence: EHX-\* implements the distinct UX paths required by **M4**–**M8** and **C7** (no alternate error architecture — surface choice only ).

Document type: Normative part file under [README](README.md).

References: [error-handling.md](error-handling.md) (**M4**–**M8**); [forms](../forms/forms.md); the selected client-query standard (including [TanStack Query](../tanstack-query/README.md) where used).

---

## Definitions

| ID | Definition |
|----|------------|
| **EHX-D1** | Toast (or banner ) means a transient non-blocking notice that does not trap focus (typically top / bottom ). |
| **EHX-D2** | Inline means field or region error text next to the control / summary (forms ). |
| **EHX-D3** | Blocking region means full screen or card that replaces primary content with Retry ([error-handling](error-handling.md) **M5** ). |

---

## **MUST**

| ID | Rule |
|----|------|
| **EHX-M1** | Validation errors **MUST** use **EHX-D2** per [forms](../forms/forms.md) — not toast-only for required field failures. |
| **EHX-M2** | Blocking load errors (initial data required ) **MUST** use **EHX-D3** with Retry ([error-handling](error-handling.md) **M5** ). |
| **EHX-M3** | Background refetch errors when stale data remains visible **MUST** use **EHX-D1** or a dedicated non-blocking indicator — must not replace the whole screen ([error-handling](error-handling.md) **M6** ). |
| **EHX-M4** | Destructive / irreversible failures (if shown as modal ) **MUST** use a modal with explicit actions (OK / Cancel ) — not auto-dismiss toast-only. |
| **EHX-M5** | A blocked-action message MUST distinguish an absent or unknown authority from a negative answer. Represent each cause as a distinct state from the shared derivation; for each blocking state, select a catalogued message key that names the cause, not the surface. The same key must remain truthful across surfaces and supported languages. When another consumer changes what the sentence needs to describe, update the existing cause copy across languages instead of creating per-surface keys or parallel selectors. A static check may enforce that a gate consumes readiness and permission fields from the same snapshot when that shape is present; it cannot determine the sentence’s semantic subject or prove that no other cause reaches it. State that limit and review the affected copy and consumers. |
| **EHX-M6** | **A read that FAILED and a record that is genuinely ABSENT MUST NOT resolve to the same sentence.** A surface that renders a verdict when data is missing fires on both causes — the record is gone, or the read never completed — so one sentence is wrong for half of its readers: a transient network fault is announced as a deletion, and the user reads **wrong** information rather than missing information. An error is not a deletion. Three obligations follow. **(a) The record's absence has exactly one authority: the server's registered not-found code**, read structurally (never inferred from message text, and never from an empty cache slot) — a transport or server fault says only that the read failed, which is a statement about the *read*, not about the *record*. **(b) The failed-read branch shows a load-failure sentence taken from the product's EXISTING catalogue**, resolved through the single client message authority — never a sentence invented at the call site, and never the raw caught-error text ([error policy](../error-policy/transport-i18n-and-classification-rules.md) **M30**(b)). **(c) Data absent with NO error is neither of the two**: it is a not-yet-resolved read — a disabled or not-yet-started query in the selected client-query library answers exactly like this — and it shows waiting, not a verdict (per the selected client-query library’s loading contract). Same shape as **EHX-M5** one layer up: there the collapsed pair is "no authority" vs "authority said no"; here it is "no answer" vs "the answer says gone". [On violation: Bug — the user is told a record was deleted while it exists and only the read failed] [Verify by: the absence branch reads the query's error fact; the deletion sentence is reachable only behind the registered not-found code; the failed-read sentence is an existing catalogue key present in every declared language; data-absent-without-error renders waiting] |
| **EHX-M7** | An entitlement lock (blocked-action upsell) **MUST** offer only a remedy the viewer can perform and **MUST** name the feature that is actually locked. (a) The purchase or upgrade action is drawn only for a viewer who can obtain the entitlement; any other viewer is told who manages it and is given no button that does nothing. (b) Title and message come from one feature-keyed lock-copy table; a lock that names no feature shows the generic sentence, never another feature's sentence. (c) A gated destination is gated once, by its own readiness-aware gate (**EHX-M5**); its entry points do not open a second lock. Reason: a dead "upgrade" button and a wrong feature name are confident wrong answers, and a second entry-point lock fires before the authority has spoken. |

**EHX-M6** enforcement note. The structural half is decidable from one file's syntax tree and can be locked by a static rule: a gate that presents a missing-data message should also inspect the query or operation error state. A rule can distinguish query data obtained from a hook from a similarly named component prop, and should treat diagnostic logging as distinct from reading an error state. **Stated limit ([KIT-INV-8](../authoring/kit-structural-invariants.md)(b)):** whether a sentence asserts a fact about the record is semantic — it lives in natural-language copy, which an AST cannot interpret. A file that reads an error fact for another branch while this gate still conflates absence and failure is not covered; that residue needs flow analysis and review.

Cause-asserting sentences — the selector IS the cause authority. When catalogued sentences assert different causes, select among them using the closed-set authority for that cause, never a re-spelled subset. A partial membership list can silently route omitted registered codes to the wrong copy. Raw error text is not a suitable selector: it varies by language and version. A key whose translations assert different causes has no single meaning; fix the key rather than adding a branch.

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **EHX-N1** | Must not use toast as the only signal for form submit rejection when field mapping exists (**EHX-M1** ). |
| **EHX-N2** | Must not stack multiple blocking modals for the same failure class (one surface per incident ). |

---

<a id="stated-enforcement-limit--the-validation-failure-must-not-pass-silently-is-not-mechanically-enforced"></a>

## Enforcement admission

The validation-display check is not mechanically enforced. Deciding whether a validation failure is blocked or reaches a user-visible surface may span the component, its caller, alert helpers, observability and the global error boundary; a single-file check produces false positives on compliant blocking-only failures, and eventual user feedback is a whole-program property. Review obligation: trace each validation failure from the validator through the submit gate to the user-visible surface or blocking decision, and confirm that every path either stops the action or communicates the failure. Do not infer coverage from the absence of a static finding.

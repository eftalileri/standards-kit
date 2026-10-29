# Forms (validation, state, submission)

```kit-cover
type: normative
part-of: README.md
binds: the client form model - file-local C, M and N obligations for field state, the selected schema validation and server-state tools, error display, reset and the dirty guard
open-when: shape:frontend-heavy, signal:form-input, signal:schema-parse, signal:schema-validation, signal:accessibility-label
skip-when: signal:backend-only, signal:no-user-input-field
owns: C1, C2, C3, C4, C5, C6, C7, C8, C9, C10, C11, C12, M1, M2, M3, M4, M5, M6, M7, M8, M9, M10, M11, M12, M13, M14, M15, M16, M17, M18, M19, N1, N2, N3, N4, N5, N6, N7, N8, N9
```

Scope

- Included: Client form field state, validation through the project's selected schema mechanism (including Zod where selected), error display (field / form / submission), submission through the project's selected server-state mechanism (including TanStack Query where selected), controlled inputs, reset, dirty guard on edit screens, and accessibility labels for inputs and actions.
- Excluded: Backend request body contract beyond what [error policy](../error-policy/error-policy.md) requires; repository / transaction rules; editable persisted attribute cascade detail ([editable-persistent-attributes/README.md](../editable-persistent-attributes/README.md)).
- Document type: Normative standard for form behavior on the client.

Environment: Applies to browser and app form interfaces. Use the validation and server-state tools selected by the adopting project's architecture and [decision matrix](../decision-matrix/decision-matrix.md); examples in this file mention Zod and TanStack Query where those tools are selected.

Binding principle: An uncontrolled form core, validation that bypasses the selected schema policy, or skipped user-visible errors is a bug. Remedy: fix code or update standards.

References:

- [SSOT readiness and form data](../ssot-readiness/ssot-readiness-and-form-data.md) — readiness gate, message shape [**M7**](../ssot-readiness/ssot-readiness-rules.md), silent failure bans
- [Error handling](../error-handling/error-handling.md) — client errors, **M3** copy
- [Decision functions](../decision-function/decision-function.md) — `validate*` `string | null`, callers **M7** / V2
- [Decision matrix](../decision-matrix/decision-matrix.md) — form-validation, server-state and client-state rows
- [Gray-situation decisions](../agent-gray-decisions/gray-situation-decisions.md)
- [TanStack Query](../tanstack-query/README.md) — mutations, cache, loading
- [Markdown authoring](../authoring/markdown-authoring.md) — decisions/facts and implementation-bound verification obligations (M17)
- [Zustand](../zustand/README.md) — client UI / prefs / selection when matrix assigns Zustand
- [input-clearable-placeholder.md](input-clearable-placeholder.md) — clearable fields, placeholders, and empty semantics (ICP-\*)
- [Mobile UI patterns](../mobile-ui-patterns/mobile-ui-patterns-rules.md) — **MUP-M2** extends **M7** to primary action tiles / non-form tappables
- The adopting project's architecture documentation for screen-specific contracts

Code samples: [`../_meta/examples/forms-code-samples.md`](../_meta/examples/forms-code-samples.md) (non-normative).

---

## Agent execution contract

General obligations: [shared agent contract](../_meta/agent-contract.md). Local identities below retain their citation handles.

C1: Apply [shared **C1**](../_meta/agent-contract.md).

C2: Apply [shared **C2**](../_meta/agent-contract.md).

C3: Precedence: Apply the adopting project's declared precedence ladder; use the applicable decision-matrix order to resolve questions among selected frontend stack layers.

C4: Apply [shared **C4**](../_meta/agent-contract.md).

C5: Apply [shared **C5**](../_meta/agent-contract.md).

C6: Apply [shared **C2**](../_meta/agent-contract.md): no alternate validation stack (**N3**).

C7: The project's architecture selects the form-validation library and supported version. When Zod is selected, use the version documented by that project; do not introduce a second library or ad-hoc validation rules for the same fields (M1, N2, N3).

C8: Apply [shared **C3**](../_meta/agent-contract.md).

C9: Follow the consuming project's change-class verification policy.

C10: If the selected schema library does not meet the project's documented version requirement, or the shared schema contract is unknown, STOP — resolve the dependency or contract before proceeding.

C11: Apply [shared **C4**](../_meta/agent-contract.md).

C12: Apply [shared **C12**](../_meta/agent-contract.md).

Testability: Static: schema definitions, controlled bindings, error maps; runtime: mutation outcomes, field error text; explicit failure: **M11** STOP, **M12** user-visible or blocked submit.

---

## Technology

| Topic | Rule |
|-------|------|
| Validation | The project's selected schema library and supported version; use Zod where selected (M1, M11). |
| Client state | Zustand and/or `useState` for field values, field-level validation UI state, dirty, submit-in-flight UI — **M2**. |
| Server state | The project's selected server-state layer for mutations and queries that load form data; use TanStack Query where selected (M3). |
| Module | Schemas in shared or feature modules per project architecture — one schema per form surface (no scattered duplicate rules). |

---

## **MUST**

M1: All form field validation rules that run on the client must be expressed through the project's selected schema-validation mechanism (schemas/refinements); use Zod when it is selected by project architecture.

M2: Field values, per-field error strings (or RHF/controller mapping), dirty, and local submit-disabled UI state **must** live in client state (Zustand / useState / form library bound to them) — not as the primary source in Query cache for editable fields.

M3: Submit and server-backed load/refetch must use the project's selected server-state layer, following the applicable decision-matrix form rows (TanStack Query where selected).

M4: User-visible validation copy **must** follow SSOT readiness **M7** / error handling **M3**.

M5: validate* helpers **must** follow decision functions (string | null, caller **M7** / V2).

M6: Controlled inputs (or library equivalent with the same single source of value per field) — **M6** / **N1**.

M7: Each input and primary action **must** have an accessible name/label (platform a11y APIs). Primary hub shortcuts / tiles (not text inputs) **must** also satisfy **MUP-M2** (stable accessibilityLabel or equivalent).

M8: Dirty edit screens **must** use a single guard (e.g. beforeRemove + isDirty) before destructive navigation; offer cancel / discard per product copy.

M9: Reset **must** clear errors and return fields to initial values through one documented function or hook — no partial orphan state.

M10: Validation timing (real-time vs submit-only) **must** be explicitly chosen per form or screen; when non-obvious, record it in Decisions / facts per markdown authoring. Default: high-signal fields (email, password strength, required visibility, format masks) **must** use real-time (onChange / onBlur) where decision matrix / product allows. Submit-only timing is allowed only for heavy or server-dependent checks and **must** be named in Decisions / facts — undocumented submit-only for a high-signal field is a bug.

M11: If the selected schema library does not satisfy the project's documented version requirement, STOP: resolve the dependency or amend the governing project decision before writing form code.

M12: If client validation, submission, or form state invariants fail, the UI **must** block invalid submit and/or surface user-visible errors per error handling and **N4** — silent continuation (treat as success, swallow errors, empty catch) is forbidden.

M13: A stable technical identifier attached to an input (for example, a keyboard-accessory field key) must be explicit and language-independent. Never derive it from localized, user-visible text such as an accessibility label, placeholder, or translated string: translations can change the identifier or collapse it to an empty value. Pass an explicit, instance-unique key (for example, `<surface>.<field>.<instanceId>`); reused input wrappers should take it from the parent as a required prop. Uniqueness is per mounted instance, not field type.

M14: A schema parser's raw failure details are user-facing text of the same class as a caught error's raw message, and MUST NOT reach a display surface; every schema rule that user input can fail MUST carry project-owned text or a registered code. A non-throwing parse result can bypass exception display protections, so the display-authority obligation ([error-handling M16](../error-handling/server-contract-and-display-authority.md)) is easy to read as not applying — and displaying the first raw diagnostic is exactly the leak that row exists to stop. A parser diagnostic message is one of three things and two of them are unshowable: the library's own default sentence, written in the library's language and about its type system (`Expected number, received nan`), and a registered error code the schema author wrote as the message so the boundary could map it — a machine identity that tells the reader nothing. Only the third, the schema author's own catalog text, is showable, and a display site cannot tell them apart at runtime. (a) Classify every failure point before choosing copy. Ask whether user input can reach that branch at all. A rule the user *can* fail is form validation and owes field-level copy. A rule only a malformed request body can fail — a payload builder that diverged from the schema, a constant the UI already bounds — is a wire-contract proposition: field-level copy there describes nothing the reader can do, so it is delegated to the surface's own declared failure text. Both classes are decided by reading the input path, not by the rule's wording. (b) A schema module that has no translator MUST NOT embed literal text in one language. Such a sentence ships to every other locale untranslated, and it is invisible to catalog-parity gates because it never entered a catalog ([I18N-CAT-M4](../internationalization-rn/user-text-catalogs-and-parity.md)). Either the schema is built by a factory that receives the translator, or its rules carry a registered code / catalog key and the display site resolves it — never a bare literal. (c) Display resolves through one authority whose decision input is the CODE. One named client function converts parser diagnostics into text: it resolves a registered code by equality against the client's code catalog ([error-handling M17](../error-handling/server-contract-and-display-authority.md) — never a substring search inside the message) and otherwise returns the caller-declared field text; it returns raw parser diagnostics in no branch. This is the same single-authority shape M16 requires for caught errors, and it is a second function only because its input is an issue list rather than a throwable. (d) A missing catalog entry is reported, not invented. When a reachable rule has no equivalent in the existing catalog, fall to the declared field text and record the gap as translation work; writing new product copy to fill it is a separate, owner-facing decision, and a registered code with no client text is a stated limit rather than a silent one.

Enforcement (M14 / N8): An adopting project may use static checks for direct raw-issue display. Such a check must document exclusions and limits; indirect flow through return values, field-error maps, or another module still requires review. A schema string rule whose type-error branch carries no project text (an untouched field then fails with the library's own sentence) is part of the same obligation: it needs a project-owned type-error message, and a static check may reject it.

M15: On an edit screen of an existing record, a field that the save sends to a stored value is the user's edit intent, never a copy of the stored value. (a) The form opens prefilled: each input shows the user's intent where one exists and otherwise the stored value read from the current query (the display seed), so the user never retypes a saved value. The intent starts empty and only the user's own input writes it; an empty or invalid input of a field that cannot be cleared returns it to "no change", while emptying a clearable optional field is its explicit clear. (b) The stored value is never written into the intent — not at first load, not when a query refetches — so an untouched input keeps following the stored value. The save sends only the field groups the user touched whose displayed value differs from the stored value; an untouched group is never re-sent, and dirty detection is that same comparison. A confirmed save retires the intent it sent (a field changed while the save ran stays), so the saved fields follow the stored value again and a later save never re-sends them over another writer's value. (c) Changing which record the intent targets (another record or line) clears the intent, so a value typed for one record is never saved to another. (d) The client never derives a value from stored fields (a unit amount from a total and a count, a ratio) and sends it back as a write; if a derived figure is shown, it is read from the one shared derivation. (e) The server treats an incoming value equal to the stored one as no write, and a deprecated field that released clients still send because it once carried a derived value is a write only when it differs from the record's own value read through its single authority. Why: a seeded value is re-sent on every save — even one that only changed a note — so it overwrites whatever another writer stored while the screen was open, and a derived value multiplied back through the count moves a stored amount by rounding. Declined check ([**IV-M13**](../implementation-verification/change-acceptance-bar.md)): seed-vs-intent and echo-vs-edit are cross-module data flow, and two measured instances do not meet [**ENA-A1**](../enforcement-architecture/enforcement-admission.md)(a).

---

**M15** composite inputs and partial commands: A saved composite address, coordinate pair or phone opens its edit inputs prefilled through the display seed like any other field. The composite sent **must** be the complete value the user sees — the saved parts overlaid with the parts the user changed — validated through the existing canonical resolver, and it is sent only when the user changed or explicitly confirmed that group. Emptying a clearable optional composite is its explicit clear and keeps the endpoint's established empty semantics. When an editor changes only part of a record, a compatible additive explicit-field command can select atomic field groups through the existing domain writer. An unselected group is preserved from the transaction's current record; absence inside a selected optional group means clear. A released full-replacement command keeps omission-as-clear unchanged. Do not echo a cached unrelated group, default consent into an existing record, or claim that refetch-then-write closes the race. Retire the whole form/confirmation lifetime on target or subject change; asynchronous writes, UI continuations and cache projection use the same captured scope. A usable current-scope cached prerequisite remains ready after a background error under [readiness **M1**/**M9**](../ssot-readiness/ssot-readiness-rules.md). Equal canonical input is no new field write under **M15**(e). Review traces the complete producer-to-consumer path.

M16: Moving to the next field **must** be owned by the single keyboard input component and its field-sequence authority, never hand-wired per screen. The keyboard's done/return action **must** focus the next editable field below on the same screen or modal (ordered by on-screen position) and dismiss the keyboard only when none is left, because a closing keyboard forces the user to tap every field again. A field that owns its own submit (`onSubmitEditing`, `submitBehavior`, `blurOnSubmit`) keeps that behaviour and stays out of the sequence. A field that shows or hides other fields (a role or type choice) **must** sit above the fields it reveals, so the revealed field appears where the user is looking.

M17: Every text input **must** render under a keyboard scroll surface of the single keyboard-visibility authority (the project's shared scroll container, keyboard-aware viewport or keyboard input region, or a modal shell configured as scrollable). A modal shell boundary resets the surface, so a non-scrollable dialog or sheet that holds an input **must** be configured as scrollable (a dialog also keyboard-avoiding) or mount the keyboard-aware viewport inside its content. Reason: without a surface the focused field is never moved above the keyboard and can stay hidden behind it. Held by review; a static check was declined under **ENA-A1**(d): the host is decided by the render tree across files, which no single file can decide.

M18: Keyboard avoidance of a form container **must** go through the single keyboard-avoiding wrapper, which uses `behavior='padding'` on every platform; `behavior='height'` **must not** be used. Reason: `height` captures the view's first measured height once and recomputes its keyboard inset from its own resized frame, so a first measurement shorter than the keyboard overlap makes the view alternate between full and zero height on every frame (the form flickers and cannot be typed into) until it remounts; `padding` leaves the view's own frame unchanged, so its inset never feeds back into itself. Held by review; a static check was declined under **ENA-A1**(a): the wrapper is the only `KeyboardAvoidingView` in the tree, so the class has no second surface (**ENA-A2**).

M19: An `InputAccessoryView` **must not** be used on a React Native version whose recycled accessory view un-hides itself after layout. Reason: the visible recycled view sits over its input, swallows every tap and paints its background as a band over the field. The keyboard is closed instead by (a) the return key of a single-line field, labelled next/done from the field-sequence authority (**M16**); (b) interactive drag-dismiss and tap-on-empty-area dismissal set once in the shared scroll and list wrappers with `keyboardShouldPersistTaps='handled'`, so a tap on an input or button reaches it first — a touch-capturing root wrapper **must not** be used, because it steals taps meant for inputs; (c) for a keyboard without a return key (multiline, iOS number pads) one shared close control, drawn in the app or modal window just above the keyboard only while such a field is focused and tracking the keyboard frame itself, so a field outside any keyboard-aware scroll area is covered, whose top edge moves the focused field above it but does not end the keyboard-aware frame. A `returnKeyType` **must not** be set on an iOS number pad, because React Native then attaches its own native toolbar. A keyboard-aware frame **must** end at the keyboard's top edge and the field gap applies only to where the focused field is moved, because a frame shrunk by the gap shows an empty band between content and keyboard. A bottom sheet lifted by the keyboard **must** continue its surface behind the keyboard, because a translucent keyboard leaves gaps that show the backdrop or the root view. Held by review; a static check was declined under **ENA-A1**(a): one input component and one close-control host own these paths, so the class has no second surface (**ENA-A2**).

## **MUST NOT**

N1: Uncontrolled form core (unowned value source) for required UX paths — use controlled or library-managed binding (**M6**).

N2: Hardcoded one-off validation duplicating the selected schema rules for the same fields — DRY through the schema (M1).

N3: Use a schema library other than the one selected by the project's architecture for form validation; do not introduce a competing schema stack (C7).

N4: Skip showing validation or submission errors to the user when standards require visibility — see SSOT readiness **N2**.

N5: Omit accessibility labels for interactive controls (**M7**).

N6: Treat validate* null as failure — null means valid per decision functions V1.

N7: Derive an input's technical/accessory key from localized visible text (`accessibilityLabel` / `placeholder` / i18n `t(...)`), leave it empty, or hardcode one shared constant in a reused wrapper (**M13**).

N8: Put a schema parser's raw failure details on a user surface — the first diagnostic message, a joined list, or a raw field path — or embed a literal one-language sentence as a schema rule's message in a module that has no translator (M14). Reading parser diagnostics into a log / crash-report field, or using them to select a catalog key, is out of scope here; showing them is not.

N9: Seed an edit intent from the stored value, report a display value to the parent form as if the user had typed it, keep an intent across a change of the target record, or send a client-derived value (such as a unit amount computed from a total) back as a write (**M15**).

---

## Submission and errors

Submit is M3; issue-to-field mapping M4 / N8; form-level copy uses server semantic codes ([error handling](../error-handling/error-handling.md)), never a client-invented one. When TanStack Query is selected, mutation state, bridge, rollback and the post-write method follow [mutations](../tanstack-query/mutations-cache-sync.md) (**MUT-M28** / **MUT-N3**) — not restated here.

---

## Implementation checklist

- [ ] **M1**–**M19** and **N1**–**N9** apply to the relevant form flow.
- [ ] Project checks, if present, document their actual scope and known limits.
- [ ] Cross-file behavior and product decisions receive explicit review.
- [ ] **M1**, **M2**, **M6** / **N1** — checks for these classes were declined where no measured incident justified them (**ENA-A2**); the shared request schemas at the backend boundary hold **M1**.
- [ ] **M13** / **N7** — a check can lock the derivation at the JSX site; instance-uniqueness across mounted inputs is cross-file and unchecked.
- [ ] **M14** / **N8** — see the Enforcement line under **M14**.
- [ ] **M3**, **M7** / **N5**, **N2** — a line-text guard was declined under [**ENA-A1**](../enforcement-architecture/enforcement-admission.md): it proved only a mutation token, counted input elements while missing wrapper components and every primary action, and fired **N2** only where zod was already imported.

---

Older form guidance is historical only; this folder is the current source for these rules.

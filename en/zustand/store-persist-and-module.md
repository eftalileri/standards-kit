# Zustand — persist, module layout, and store shape

```kit-cover
type: normative
part-of: README.md
binds: ZSP obligations - persist middleware version and partialize, hydration flag, reset, and the store module layout
open-when: shape:frontend-heavy, signal:client-state-store, signal:store-persistence, signal:cache-persistence
skip-when: signal:backend-only, signal:no-store-persistence
owns: ZSP-M*, ZSP-N*
```

Scope: File naming, modular helpers, persist middleware (version, partialize, onRehydrateStorage), `hasHydrated`, `reset`, UI vs domain store split. Excluded: Selector rules ([selectors-and-hooks.md](selectors-and-hooks.md)); action throws ([store-actions-logging.md](store-actions-logging.md)).

Rule prefix: **ZSP-M**\* / **ZSP-N**\* — rules in this file only.

Environment: Applies when client state is persisted to device storage and during application bootstrap; use the platform-approved adapter.

Compliance: Violations are bugs; **must not** ship; STOP — [zustand.md](zustand.md) **ZST-C4**, **ZST-C11**.

---

## **MUST**

| ID | Rule |
|----|------|
| **ZSP-M1** | Every store **must** declare `hasHydrated: boolean` (field always present for uniform bootstrap checks). Persisted stores: initial `false`, set `true` via `useStore.setState({ hasHydrated: true })` in `onRehydrateStorage` success path (no in-place object mutation of persisted snapshot). Ephemeral-only stores (no `persist` middleware): `hasHydrated` **must** be `true` in initial state and `onRehydrateStorage` is N/A — no async rehydration wait for disk; TSDoc may state "memory-only". |
| **ZSP-M2** | Persisted stores **must** use `persist` with `createJSONStorage(() => adapter)`, an integer `version` of at least 1, `partialize` for fields allowed to leave the process, and an `onRehydrateStorage` callback that sets `hasHydrated` on success. Add `migrate` when the version increments. Use the platform-approved adapter (for example, MMKV in applicable React Native applications) per [mmkv](../mmkv/README.md) (**MMA-M7**, MMI-\*). |
| **ZSP-M3** | Store files **must** follow the naming convention documented by the architecture. Split complex stores into type/helper modules when exceeding [code-modularity **COD-M3**](../code-modularity/code-modularity.md) or when responsibilities need separate boundaries. |
| **ZSP-M4** | Every store **must** expose a `reset` action returning slice to documented initial values (logout). |
| **ZSP-M5** | Domain state (e.g. activeTenantId, user, tokens) and ephemeral UI state (e.g. modal open, tab index) **must** live in separate stores — not one mixed interface. |
| **ZSP-M6** | When `persist` `version` increases, `migrate` **must** transform old persisted shape to new shape or purge safely — no silent incompatible reads. |
| **ZSP-M7** | Readiness scope **must** be truthful: `hasHydrated` proves only that a store's local persistence lifecycle completed. For a memory-only store it is immediately ready; it **must not** be persisted or reused as proof that remote session/bootstrap work succeeded. A required server bootstrap **must** have separate process-lifetime readiness derived from the server authority. Report failure through the configured observability boundary and offer an explicit retry that re-runs every failed prerequisite; do not mark success from a stale persisted flag or swallowed fetch error. When authenticated identity can change while async work is in flight, scope coalescing/caches to the current subject and prevent stale completions from writing state for a different subject. Auth-changing commands **must** acquire one process-memory monotonic transition handle (command/epoch) before request work begins; each post-`await` write (auth, readiness, tenant, language, notice, cache, or storage) **must** verify the exact current handle plus the expected subject/token and, where applicable, the expected final tenant scope. Serialize asynchronous persisted-auth writes FIFO with a rejection-safe tail so older snapshots cannot finish after newer commands. Logout **must** invalidate the current handle before its first side effect, await the serialized auth write tail before clearing persisted identity, and wait for the final persisted sign-out state; concurrent logout invocations **must** share one logout handle with counted leases, and auth ownership cannot reopen until every invocation has settled. A typed stale-command cancellation is not a current-command failure and **must not** clear or overwrite the current session in a terminal error callback. A retry **must** re-execute every failed required bootstrap prerequisite; incrementing only a presentation timer while a one-shot guard suppresses the underlying operation is not a retry. |
| **ZSP-M8** | A store whose values identify the active authenticated subject, organization/tenant scope, or actor/panel context **must** remain memory-only unless the architecture explicitly defines a safe persistence lifecycle. These are session facts, not ordinary user preferences; persisting them can expose stale identity/context after sign-out or subject change, and device compromise would disclose affiliation that the session had already ended. Encryption does not by itself make their lifetime safe — the defect is the lifetime, not the cipher. A memory-only store may start with `hasHydrated: true`; adding persistence reintroduces the “has the disk read finished?” question while the flag still answers `true`, so consumers can treat an empty or stale scope as ready (**ZSP-M7**, **ZSP-N3**). Enforcement anchors the boundary, not the loading syntax: static import, `require`, dynamic `import()` and a non-interpolated template-literal specifier are the same violation, while a non-persisting helper from the same middleware module (a devtools wrapper) is out of scope. Review store contents and imports when determining which stores hold these values; a single-file check cannot discover the full store inventory, so record the actual enumerated scope and limits of any check. |

---

**ZSP-M7** / **ZSP-N5** application — originating request ownership before the first public asynchronous seam. A command or ordinary authenticated query **must** consume the existing opaque session guard before the transport library queues its first promise; capture only inside a later asynchronous interceptor can already bind the next account. Read the installed transport's dispatch and interceptor ordering rather than treating an interceptor name or one synchronous flag as proof. Preserve original public methods, callbacks, defaults, body and serializer semantics. Anonymous requests remain credential-free. Explicit tenant declarations stay the original intent; only a truly implicit contract uses the default target, with a known origin bound before queuing. Request/consent awaits, raw replay dispatch and completion, response decoding and terminal auth writes **must** revalidate the same originating proof. A UI command with an earlier await passes its original opaque callback through the typed config seam rather than recapturing. Decoder event callbacks reject the owning promise on guard failure; an uncaught callback throw is not containment. This adds no auth/tenant writer, retry budget or persistence policy.

**ZSP-M7** / **ZSP-N5** application — a later leaf publication is still a writer. A transport response guard does not prove the caller's scope after binary conversion, a file or directory picker or a provider availability check. The command **must** capture the existing opaque authenticated lifetime before its first await, retain its requested tenant and re-prove current scope at every later publication or irreversible side-effect boundary. Re-read the current selection authority; a captured render value cannot prove that selection remained current. Mounted operation identity may additionally stop obsolete screen commands, but does not replace auth lifetime authority. Typed stale cancellation cannot display feedback in the new scope.

**ZSP-M7** / **ZSP-N5** application — identity-independent public reads are not session-owned. A request to an unauthenticated endpoint whose response does not vary by subject or tenant (a public status or capability flag) **must** use the transport's single anonymous request declaration: no credential is sent and no session guard is bound. Reason: session ownership exists to stop a stale response from writing into another identity's scope; such a response has no identity scope, so binding it only lets an unrelated auth transition discard a valid response — on a fail-closed gate that becomes a full-screen block. Requests that create, resume or end a session (login, register, one-time-code, recovery) and every identity-scoped read stay session-owned.

**ZSP-M7** / **ZSP-N5** application — a long-lived scope follows the generation. A UI scope that outlives auth transitions (a provider mounted for the whole logged-out or logged-in tree) **must** recapture its lifetime proof whenever the transition authority's generation advances or its logout lease opens or closes, through the authority's change subscription, not only when the subject, token or tenant it renders changes. Reason: an auto-login or login attempt that ends in the same logged-out state publishes nothing the scope reads, so a proof captured once at mount is stale for the scope's whole life and every command it guards is refused. The recaptured scope gets a new identity, so a command started under the old proof stays stale. Which scope outlives a transition is a mount-tree fact no single file shows; settle it by review.

**ZSP-M7** / **ZSP-N5** application — a command never joins a flight it did not start. A query-cache dedupe (TanStack `refetch` / `fetchQuery` / `ensureQueryData` while the same key is already fetching without data) hands the command a request captured under an earlier auth lifetime; the command's own handle then makes that request stale and the command fails on its own transition. The command **must** be the query's only starter (`enabled: false`, fetched imperatively after the handle exists) or cancel the earlier flight before fetching. The stale-command fact **must** keep one predicate: a transport refusal caused by a lifetime change carries the typed stale cancellation as `cause`, and the single stale predicate recognises that chain; a refusal without that cause (for example a tenant-target mismatch) is not the stale fact.

## **MUST NOT**

| ID | Rule |
|----|------|
| **ZSP-N1** | Persist middleware without `version` and `onRehydrateStorage` (when persist is used) — forbidden. |
| **ZSP-N2** | Mutate state objects in place — forbidden; only `set` / `setState` updates. |
| **ZSP-N3** | Skip `hasHydrated` gating for user-visible decisions that rely on rehydrated persisted fields — forbidden (ephemeral-only stores with `hasHydrated: true` fixed are exempt). |
| **ZSP-N4** | `partialize` **must not** persist (a) values derivable from other persisted keys, the TanStack cache, or an external SDK/provider snapshot (**ZST-N3**); (b) unbounded or large collections such as search results or full history; (c) temporary UI such as modal state or wizard step; or (d) scratch/session-only buffers. Keep these in memory. A migration from persisted provider-derived state **must** remove or ignore the old disk key before it can rehydrate as an authority; the current provider/session authority repopulates the view. Align with [TanStack **UIP-N2**](../tanstack-query/ui-persist-offline.md). |
| **ZSP-N5** | **Must not** use a persisted “session hydrated/bootstrap complete” flag as current proof of remote readiness; convert a failed required bootstrap into success/empty state; accept an unproven transport failure as a valid session; reuse a subject-agnostic in-flight/cache result after identity changes; acquire auth-command ownership only after the request has started; let a stale command's terminal callback clear the current session; invalidate ownership only after a logout side effect; perform an unguarded post-`await` leaf write; allow concurrent asynchronous auth-persist writes to resolve out of command order; report logout complete before its persisted sign-out snapshot has flushed; or expose a retry action that cannot rerun the failed operation. A subject id without the exact process command handle is insufficient because two commands for the same subject can race. These create parallel or fabricated readiness authorities and violate **ZSP-M7**. |
| **ZSP-N6** | **Must not** wrap a subject/tenant/actor-scope store in persistence middleware or import device persistence into it — including an encrypted module, and regardless of whether it arrives by static import, `require`, dynamic `import()`, or a template-literal specifier (**ZSP-M8**). Convenience (“keep the selection across restarts”) is not an exemption; the session authority re-establishes this value during the next bootstrap. |

---

## Failure path (normative)

| Situation | Required behavior |
|-----------|---------------------|
| Rehydrate error | Do not treat persisted fields as trusted; log (ZSA-\*); hasHydrated policy per product (STOP if undefined). |
| Migration fails | STOP shipping until **ZSP-M6** path defined or storage cleared per policy. |
| Required server bootstrap fails after local hydration | Keep remote readiness false, report through established observability, and show an explicit retry surface whose action reruns the failed prerequisite; do not set a persisted/local success flag or accept a transport failure as proof (**ZSP-M7** / **ZSP-N5**). |
| Auth command, authenticated subject, token, or tenant scope changes while bootstrap is in flight | Reject with the typed stale-command cancellation, serialize auth writes with a rejection-safe tail, prevent the stale terminal callback from clearing current auth, evict or partition the prior subject's shared cache, and bootstrap only the exact current command/subject/final-tenant scope from the server authority. Logout invalidates ownership before any other side effect (**ZSP-M7** / **ZSP-N5**). |

---

## Implementation checklist

- [ ] **ZSP-M1** / **ZSP-N3** hasHydrated pattern (persist vs memory-only)
- [ ] **ZSP-M7** / **ZSP-N5** local hydration is not remote bootstrap proof; required failure stays observable and retryable, retry reruns the failed prerequisite, auth-changing requests acquire an exact command/epoch handle before request start, every async writer revalidates handle + subject/token + final tenant scope, stale terminal callbacks cannot clear current auth, logout invalidates first, and in-flight/cache state cannot cross authenticated subjects
- [ ] **ZSP-N4** partialize review (GZ6 in [zustand.md](zustand.md))
- [ ] **ZSP-M2** / **ZSP-N1** persist completeness
- [ ] **ZSP-M4** reset
- [ ] **ZSP-M5** UI vs domain
- [ ] **ZSP-M3** naming + COD split

Verification: Inspect the `persist` options object: `version` present and `migrate` defined when the version history exceeds 1.

---

Part of: [README.md](README.md) — Zustand SSOT.

# TanStack Query — decision gates (non-normative explainer)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Status: Non-normative. SSOT: [`tanstack-query/mutations-cache-sync.md`](../../tanstack-query/mutations-cache-sync.md) — Decision gates (normative index) and MUT- / QRY- rows.

Purpose: Human-readable gloss on **G1**–**G8**. If this file disagrees with the normative tables, standards win.

One default, two declared exceptions (**MUT-M28**). Method A — wait for the server, write its answer through the domain orchestrator, refresh the rest, then close the form — is what every mutation does unless it declares otherwise. Method B shows a pending row from the mutation's own input on one screen; method C writes the temporary row into the cache because several screens must show it at once. Asking "should this be optimistic?" first is what pushes teams into cache-optimistic code for a row one screen shows for 400 ms; the right first question is "does the user need to see it before the server answers, and where?".

| Informal risk | Normative anchor |
|---------------|------------------|
| Optimistic on money / irreversible / provider flow | **MUT-N3** — always method A (one named exception: per-user inbox item deletion) |
| Cache-optimistic machinery (snapshot, rollback, id remap, page shape) for a row only one screen shows, or behind a blocking spinner | **MUT-M28**, **MUT-N8** — method B or A |
| Snapshot / rollback in a hook that wrote nothing optimistic | **MUT-N8** — restoring it can overwrite newer data |
| Form closes before the refresh finished, list briefly shows old data | **MUT-M28** method A, **MUT-M15** — orchestrator returns its promise, the callback awaits it |
| Pending row still on screen after the mutation failed | **MUT-M29** — `variables` outlive settle; gate the render on `pending` status |
| "Not optimistic" turned into invalidate-only, so the user waits for a refetch | **MUT-M28** method A + **G3** bridge |
| Pending row disappears, confirmed row not there yet (empty frame) | **MUT-M29**, **MUT-M4** — await the invalidation inside the callback |
| Pending variables mirrored into a Zustand store so another screen can see them | **MUT-M29**, **SSG-M8** — `useMutationState` on the canonical `mutationKey` instead |
| Refetch after the write still returns the old body (server answered `304` without running the handler, or a server-side derived cache was not bumped) | **MUT-M28** invariant, [**RDS-N14**, **RDS-M22**](../../redis/redis-prohibitions.md) |
| Invalidate “just in case” | **MUT-M6**, **MUT-N1** |
| Bridge with thin API response | **MUT-M4** |
| Fake / guessed cache rows | **MUT-M10** |
| Refetch every navigation | **QRY-N4**, **QRY-M9** |
| Cross-entity write leaves sibling/derived caches stale | **MUT-M20**–**M23**, **SSG-R4** |
| Irreversible provider success collapsed into full success/failure | **MUT-M24**–**M26**, **MUT-N5**–**N6** |
| Awaited required refetch resolves while target query is paused | **MUT-M27**, **MUT-N7** |

Meta: Server state change → strict **G1**–**G6**; **G7** applies to irreversible provider/store flows and **G8** applies when post-write sync is correctness-required. UI-only illusion → **G1**–**G4** and **G8** usually N/A for that action.

# Maps and location (React Native / Expo) -- normative

```kit-cover
type: normative
part-of: README.md
binds: device location and map obligations - default stack and rendering choice, permission gating and prompt timing, snapshot staleness, split permission and reading entry points, permission-free reachability, directions hand-off
open-when: shape:frontend-heavy, signal:device-location, signal:map-view, signal:location-permission, signal:directions-handoff, signal:geo-query
skip-when: signal:no-location-access
owns: MAP-RN-C1, MAP-RN-C2, MAP-RN-D1, MAP-RN-D2, MAP-RN-M1, MAP-RN-M2, MAP-RN-M3, MAP-RN-M4, MAP-RN-M5, MAP-RN-M8, MAP-RN-N1, MAP-RN-N2
```

References: [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/); [coordinate-authority-and-geospatial-query.md](coordinate-authority-and-geospatial-query.md) (**MAP-RN-M6**, **MAP-RN-M7**, stated limit (a)).


Rules this topic depends on and does not restate. A location surface is a client surface, a persistence surface and a query surface at once, so most of what governs it is owned elsewhere and is cited here rather than copied ([**KIT-INV-3**](../authoring/kit-structural-invariants.md)): outbound URL opening and capability probes — [**COB-RN-M5**](../client-observability-rn/outbound-link-ownership-and-visibility.md), [**COB-RN-M7**](../client-observability-rn/outbound-link-ownership-and-visibility.md), [**COB-RN-N5**](../client-observability-rn/client-observability-rn.md); index migration and the live-inventory read-back — [**REP-M-15**](../repository/repository-index-migrations-and-validated-reads.md); one authority and derived values — [**SSG-M1**](../ssot/ssot-must-authority-and-derivation.md), [**SSG-M8**](../ssot/ssot-principles-and-precedence.md); cursor total order — [**GAPI-M6**](../api-list-pagination/list-response-and-cursor-rules.md); cross-subject exposure and the recorded-consent exception a published location surface lands in — [**SEC-M-ZT-4**](../security/security-tenant-scope-gates.md), [**SEC-M-ZT-7**](../security/security-tenant-published-profile.md).

---

## Definitions

| ID | Definition |
|----|------------|
| **MAP-RN-D1** | Selected stack. Choose a location module and, when needed, a map-rendering package that support the application runtime, permissions, maintenance needs, and cost constraints. In Expo, expo-location is a first-party option; check current SDK compatibility and install guidance. Map rendering is a separate choice, and an application may provide location through manual entry, a distance-ordered list, or an external hand-off without embedding a map. Record the selected approach and its rationale in the project architecture or decision record. |
| **MAP-RN-D2** | Foreground location means while app is active / background rules per OS -- background modes require explicit product approval and platform config. |

---

## Agent execution contract

| ID | Rule |
|----|------|
| **MAP-RN-C1** | Must not ship a location or map feature that depends on a paid provider — map tiles, geocoding or reverse geocoding, routing, places, or any metered API — without the provider keys, the quota and the billing guardrails documented in Decisions / facts. The trigger is key material and metering, not map rendering. A keyless hand-off to an application the device already has (**MAP-RN-M3**) triggers nothing here, and neither does an on-device geocoder that the operating system provides; a metered geocoding call triggers it even though no map is ever drawn. Read the other way round too: a feature that deliberately introduces no paid provider says so in Decisions / facts, because "no key appears in the diff" and "this feature cannot incur a bill" are different claims and only the second one is a decision. |
| **MAP-RN-C2** | Must follow Expo config plugins for location and map modules on EAS builds when native config changes. |

---

## **MUST**

| ID | Rule |
|----|------|
| **MAP-RN-M1** | **MUST** take the device-location dependency from **MAP-RN-D1** for new location work, and **MUST** settle any map-rendering choice by **MAP-RN-D1**'s criteria, with the result written down before the dependency is added. |
| **MAP-RN-M2** | **MUST** request permission before reading coordinates (**MAP-RN-D2** compliance). |
| **MAP-RN-M3** | Directions and navigation are handed off to an application the device already has, by opening a platform URL — never re-implemented, and never worth an SDK for the hand-off alone. The URL family is chosen per platform and recorded per platform, because the families are not interchangeable and a platform's newest canonical form is often gated on an OS version above the project's minimum; the recorded choice names the form and the version floor it clears. A scheme that resolves only when one specific application is installed is used only behind a capability probe whose negative branch is a real alternative (**COB-RN-N5**), and that probe ships with its platform package-visibility declaration in the same change (**COB-RN-M7**) — without it the probe answers "not installed" on a device where the application is present. Where no alternative branch exists, prefer the `https` form: it degrades to the browser instead of failing on a device with no handler. Every hand-off goes through the project's one validated URL-opening authority (**COB-RN-M5**), and no destination coordinate reaches a log, breadcrumb, tag, analytics event or a validation-failure message (**MAP-RN-N1**). |
| **MAP-RN-M4** | A denied location permission never turns a surface into a dead end. Every surface that reads a position **MUST** also be reachable by at least one path that needs no location permission, and that path **MUST** be offered by name at the point of refusal — not left in a settings screen for the person to discover. Two independent reasons make this an obligation rather than a courtesy: a mobile app store can require a manual alternative to location access as a review condition, and a device whose platform cannot produce a position at all has no other way through, so the permission-free path is the only path for a whole device class. The alternative is a named offer, never a silent substitution — quietly downgrading to a different, less accurate source and presenting the result as if it were the one asked for is the forbidden-fallback shape, not a recovery. |
| **MAP-RN-M5** | The system permission prompt follows an action that implies opting in. It is not shown on app open, on screen mount, or as part of a launch sequence; it follows a control the person operated whose meaning is "use my location". The in-app explanation of what the location is for is shown before the first system prompt, and the flag recording that it was shown is persistent state with exactly one owner, so a second surface asking for the same permission inherits the answer instead of asking again (**SSG-M8**). A denied permission is not re-prompted on every app open. Once the platform reports it cannot be asked again, the recovery is a route into the operating-system settings plus the permission-free path of **MAP-RN-M4**; repeating the prompt trains the person to refuse it and, on some platforms, silently does nothing at all. A permission snapshot read once at mount goes stale. The person can change the permission in the operating system's own settings and come back, so every surface whose offered options depend on that permission **MUST** re-read it — without prompting — when the application returns to the foreground. Re-reading is not prompting and does not weaken the sentence above; failing to re-read leaves a granted permission showing as refused, which is the dead end **MAP-RN-M4** forbids, reached from the other side. Re-reading is also not measuring: whether a position read starts once the permission changes is the surface's decision, and a reader that starts one has quietly become a second authority (**SSG-M8**). |
| **MAP-RN-M8** | A permission-requesting entry point and a coordinate-reading entry point **MUST** be distinct, named operations. A surface that has already obtained permission calls the reading operation; a caller without a resolved permission uses the composed request-and-read operation. This prevents duplicate prompts and keeps permission handling in one authority. |

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **MAP-RN-N1** | Must not log raw lat/long in production logs, crash-reporting breadcrumbs, or equivalent telemetry unless security approves (minimize PII). |
| **MAP-RN-N2** | Must not use deprecated location APIs outside expo-location on Expo without gray exception. |

---

## Stated enforcement limits

Limit (a) travels with **MAP-RN-M7** in [coordinate-authority-and-geospatial-query.md](coordinate-authority-and-geospatial-query.md).

(b) The *general* claim of **MAP-RN-M3** to **MAP-RN-M7** is not mechanically fenced. Each is decidable only across files or only against a running deployment: which helper actually opened a URL, whether a permission-free path exists on the *same* surface as the permission-gated one, whether the module that built a coordinate is the only one that does, whether an index is live where the code is deployed. A single-file syntax check cannot answer any of them, and the live-index half is not a property of a checkout at all. These five therefore rest on review — with one named, bounded exception, stated so this paragraph is not read as broader than it is: the re-read half of **MAP-RN-M5** (and with it the staleness route into **MAP-RN-M4**'s dead end) *is* fenceable over a hand-chosen file set, and limit (c) says exactly how far that reaches. What is fenceable and already fenced elsewhere is cited rather than duplicated here — the outbound-URL and probe obligations by their own topic's checks, the index-migration mode contract by **REP-M-15**'s.

(c) **MAP-RN-M8** and **MAP-RN-M5**'s re-read half are fenceable only over a hand-chosen file set, and what that buys is smaller than it looks. Both are single-file decisions once you know which file is under the contract: whether a module binds the permission-requesting entry point, and whether the module that owns the permission snapshot also subscribes to the foreground transition. What no syntax tree can decide is the antecedent — *which* surface has already resolved the permission, and *which* module is the snapshot authority. That is a per-surface product fact, so a project's lint rules for these two rows are scoped by an explicitly recorded file list, and the scope record is the part that has to be maintained by hand. Read the consequence plainly: a green gate proves the listed files still hold their contract; it does not claim that a newly added third surface is covered, and it must not be cited as if it did.

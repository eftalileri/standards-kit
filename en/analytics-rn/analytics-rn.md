# Product analytics (React Native / Expo) -- normative

```kit-cover
type: normative
part-of: README.md
binds: product-behaviour telemetry obligations - event taxonomy, screen and funnel events, and the PII ban on the analytics channel
open-when: shape:frontend-heavy, signal:analytics-attribution, signal:product-analytics, signal:event-taxonomy, signal:funnel-tracking
skip-when: signal:backend-only, signal:no-telemetry-change
owns: PAN-RN-C*, PAN-RN-D*, PAN-RN-M*, PAN-RN-N*, PAN-RN-S*
```

References: Consult the documentation for the product-analytics SDK selected by the adopting application and verify compatibility with its React Native/Expo runtime.

---

## Definitions

| ID | Definition |
|----|------------|
| **PAN-RN-D1** | Selected SDK means the single product-analytics SDK chosen for the application, with a version compatible with its React Native/Expo runtime. Record the choice and alternatives in the project's architecture or decision record; this standard does not prescribe a vendor. |
| **PAN-RN-D2** | PII means names, raw phone, email, government ids, full addresses, precise location, tokens, session ids usable for impersonation. |
| **PAN-RN-D3** | Critical action means an irreversible, financial, account, security, or otherwise decision-relevant user action that the product explicitly names in its analytics taxonomy or event contract. Instrument only actions relevant to the application and only after privacy review. |

---

## Agent execution contract

| ID | Rule |
|----|------|
| **PAN-RN-C1** | Must not run two parallel product analytics SDKs without [gray-situation](../agent-gray-decisions/gray-situation-decisions.md) handling and an approved, recorded decision (duplicate pipelines and cost). |
| **PAN-RN-C2** | Keep product analytics (**PAN-RN-D1**) separate from crash and session observability ([client observability](../client-observability-rn/README.md)): crash events, breadcrumbs, and observability dashboards MUST NOT be the source of truth for product funnels or usage metrics, and product-analytics events MUST NOT replace failure diagnostics. Use the selected crash/observability provider only for its failure-diagnostic purpose. |

---

## **MUST**

| ID | Rule |
|----|------|
| **PAN-RN-M1** | New product analytics **MUST** use the application's selected SDK (**PAN-RN-D1**), through one client-side event authority. |
| **PAN-RN-M2** | **MUST** emit a screen / navigation view event (or documented equivalent hooked to [routing](../routing/routing.md) ) for each primary route in the shipping graph. |
| **PAN-RN-M3** | **MUST** emit **PAN-RN-D3** events where those flows exist in the app. |
| **PAN-RN-M4** | **MUST** ship an advertising / attribution SDK (Meta, TikTok, AppsFlyer, Adjust, …) — and any third-party analytics SDK that sends device data straight to a vendor able to use it for ad measurement — with every native auto-collection flag OFF in the build config — auto-init, auto app-event logging and advertiser-id (IDFA/GAID) collection. Where the SDK has no runtime setter to re-enable an identifier flag for consenting users, leave that flag at its default and set the vendor's identifier consent signal default-denied instead (Google consent mode `ad_storage` and its siblings), so the runtime applier can still grant it. Native flags are written into `Info.plist` / `AndroidManifest.xml`, so the SDK starts before the JS bundle (iOS `didFinishLaunching`, Android init `ContentProvider`) and therefore before any consent prompt or platform tracking permission can run. Flags left ON collect unconditionally on first launch; OTA cannot change them. |
| **PAN-RN-M5** | **MUST** enable that SDK's collection at runtime only, from one consent applier module (single write authority), and only after both signals are resolved: the in-app data-sharing consent is granted and the platform tracking permission is authorized (iOS ATT; on platforms without one, consent alone is the gate). Order inside the applier: settings first, manual `initializeSDK` last. When more than one gated SDK ships, every SDK takes its collection decision from one shared pure decision function; each SDK keeps its own single native writer, and an SDK-specific flag (Meta LDU) is derived beside it from the same inputs — a second copy of the consent conjunction can drift from the first. A vendor's own consent signals (Google consent mode) are written from that same decision before collection is enabled, and the event-logging call skips while the latest requested decision is not enabled. |
| **PAN-RN-M6** | **MUST** re-derive the SDK state from the consent authority on every consent change and on every app start — not only in the consent mutation's success handler. A user who consented in a previous session fires no mutation; a mutation-only applier leaves the SDK in the wrong state for the whole run. Re-deriving from the authority is self-healing and makes withdrawal actually take effect, which is what a "you can withdraw at any time" privacy statement promises. If a readiness or remote-control gate removes the mounted applier after collection was enabled, its unmount **MUST** submit a disabled decision through the same serialized SDK writer; otherwise the native SDK remains enabled after the controlling surface disappears. This is a terminal lifecycle decision, not a cleanup on each consent dependency change. Stated enforcement limit: an AST can see a cleanup call but cannot prove that it runs only for real unmounts, wins the native write queue, or leaves every SDK collection flag off; review the mounted lifetime and native writer together. |
| **PAN-RN-M7** | **MUST** mirror the server-side privacy transmission flags on the client SDK — e.g. Limited Data Use (`LDU` / `data_processing_options`) applied server-side for a region **MUST** be applied by the on-device SDK for the same region, from the same region→regime authority. |
| **PAN-RN-M8** | **MUST** inspect the runtime import graph of a consent-gated native SDK whose automatic initialization is disabled. If its package-root barrel eagerly opens a native module that requires SDK initialization, the consent applier **MUST** use only the narrow native settings bridge and **MUST NOT** load or re-export that root at runtime, even from the authorized applier. Type-only imports do not initialize it. Keep settings and the final manual initialization in the order required by **PAN-RN-M5**. Enforce known unsafe roots through a single-file AST rule covering static import, re-export, dynamic import and `require`; discovering a new unsafe vendor barrel requires native source and real-device or simulator evidence. |
| **PAN-RN-M9** | **MUST** serialize asynchronous consent SDK writes within the single applier and invalidate a superseded decision before any later SDK initialization. An effect cleanup alone cannot cancel a native Promise already in flight: a previous grant can otherwise initialize after withdrawal, and overlapping writes can leave the older decision last. The final applied state must follow the latest consent and platform-permission decision. Stated enforcement limit: a single-file AST check cannot prove the ordering of native Promise completion, component cleanup and later decisions; that temporal property requires review of the applier and real runtime evidence. |
| **PAN-RN-M10** | **MUST** treat OS tracking permission as a revocable live signal. On losing foreground, the permission owner invalidates an earlier authorization; at each return it reads the current OS status without opening a prompt. The signal remains unavailable while that read is pending or has failed, and stale asynchronous results after a newer read or cleanup are rejected. Only the first eligible permission opportunity may request a prompt; a foreground refresh never requests one. The collection applier consumes this owner's live status and remains the sole SDK writer. Anonymous status telemetry, where present, reports the newly resolved status through its existing consent-gated identifier path; older network writes cannot overwrite a newer report, including across unmount and remount of the permission owner. A transport success that explicitly says no record was updated is not a successful status report and remains retryable at the next safe opportunity. Mechanical coverage: a single-file AST rule checks that a module requesting Expo tracking permission also contains a foreground subscription and a nonprompting permission read. Stated limit: AST presence cannot prove the event, Promise, native write, and network ordering; those temporal conditions require code review and runtime evidence. |
| **PAN-RN-M11** | **MUST** count a client measurement change whose writer runs in the first session after a store install — install capture, pre-login funnel or onboarding events, a consent gate that must hold before the first SDK call, a flag read at first launch — as live for new installs only from the first store build that embeds it, rolled out to the whole production track. An over-the-air update applies from a later cold start, so every fresh install's first session runs the embedded bundle and records none of the change. A readiness or launch gate for such measurement therefore names that store build and proves the change's commit is its ancestor; the over-the-air update still ships for existing installs. Reason: without it, every install an ad campaign brings in is missing exactly the data the campaign is judged by, and no error is raised. Special cases: request-schema loosening (**MRP-M15** note (a)); native flags (**PAN-RN-M4**). |
| **PAN-RN-M12** | **MUST**, when a consent-gated SDK is started after process start (**PAN-RN-M5**), list the work that SDK performs only during its own start-up while collection was still off (an install ping, first-launch referrer read, settings-driven activation) and replay each item once at the consent-time start, using the SDK's own once-per-install record so the replay never double-sends. The list is read from the SDK's code path (source or bytecode) for the shipped version, not from its documentation of the default auto-start mode. Reason: the start-up path checks the collection flag only at process start, so the session in which the user signs up and consents — the session an ad campaign is judged by — never sends the install the platform attributes, while later events still arrive and make the pipeline look healthy. Check: review-held (**ENA-GV3**); a native SDK code path is outside lint reach. |
| **PAN-RN-M13** | **MUST** verify, in the minified release artifact itself, that every class and member an advertising / attribution SDK resolves by name through reflection (advertising-id client, platform-services availability check) survives under its original name, and **MUST** keep each such target through the tracked build-configuration surface the native project is generated from ([optimizer-configuration note](../client-observability-rn/sdk-setup-and-pii-scrubbing.md)) when the dependency graph does not already keep it. Reason: the code shrinker cannot see a name passed as a string, renames or drops the target, and the SDK's reflective lookup then fails silently — the device identifier is never read, every event reaches the ad platform without it, and nothing errors. Check: review-held (**ENA-GV3**); the predicate lives in a built binary, not in source. |


**PAN-RN-M3** application — telemetry follows the confirmed outcome. Required critical-action events remain required, but telemetry delivery is a terminal effect, not the authority for whether the command succeeded. After canonical server or provider acknowledgement establishes completion, a synchronous telemetry/log failure or an asynchronous rejection is contained and reported through the existing classification authority without changing that completion, entering the command's rollback/retry path or replaying the command. Preserve consent, taxonomy, privacy, event ownership and the originating operation's current-scope assertion before publication. Do not label telemetry failure as a failed business action or silently drop it. Stated limit (**ENA-GV3**): acknowledgement evidence, locked SDK callback positions and screen continuation/event ownership require cross-file review. Existing typed outcome, observed-aware no-throw boundary and lifecycle enforcement are stronger mechanisms; **ENA-A1**(c) admits no additional fence. This rule application does not certify every event producer or feedback/navigation consumer.
---

## **MUST NOT**

| ID | Rule |
|----|------|
| **PAN-RN-N1** | Must not send **PAN-RN-D2** in analytics properties (hash or omit per [security](../security/README.md) ). |
| **PAN-RN-N2** | Must not use analytics as the only audit trail for security or billing — server remains authoritative. |
| **PAN-RN-N3** | Must not leave a native auto-collection flag ON and rely on a later JS call to switch it off. That is a mitigation, not a gate: the SDK has already initialized and sent its first-launch events before JS runs. The gate must be the native flag being OFF (**PAN-RN-M4**). |
| **PAN-RN-N4** | Must not treat a permission gate that exists on one platform as the product's consent gate. A tracking-permission call that is a no-op on the other platform (and a hook that returns early there) leaves that platform with no gate at all. The consent signal must gate every platform; the platform permission is an additional conjunct where it exists. |
| **PAN-RN-N5** | Must not ship a privacy manifest or store data-safety declaration that contradicts the embedded SDK's own declaration. If a bundled SDK declares tracking and an advertising/device identifier, the app-level declaration saying "no tracking, nothing collected" is a false statement — declare what the shipped binary actually does, no more and no less. |

---

## SHOULD

| ID | Rule |
|----|------|
| **PAN-RN-S1** | Should maintain one versioned event / property taxonomy document in the project's documentation. |

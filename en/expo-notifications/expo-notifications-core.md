# Expo notifications — core (global SSOT)

```kit-cover
type: normative
part-of: README.md
binds: the NOTIF-C topic contract rows and the NOTIF-T-* deterministic timing constants -- the topic's scope, library baseline, its precedence over generic error/logging wording, and the measurable receipt-timing quantities every part file cites
open-when: shape:backend-heavy, shape:frontend-heavy, signal:notification, signal:push-notification, signal:notification-lifecycle, signal:receipt-timing
skip-when: signal:no-notification-change
owns: NOTIF-C1, NOTIF-C4, NOTIF-C7, NOTIF-C9, NOTIF-C10
```

Normative parts split out of this file: [decision gates](decision-gates.md) (GNOTIF1–GNOTIF10); [global delivery rules](global-delivery-rules.md) (NOTIF-G1, NOTIF-G2, NOTIF-N1).

Scope

- Included: Binding discipline for the full Expo push lifecycle (not only “send”): agent contract (`NOTIF-C*`), deterministic timing (`NOTIF-T-*`), decision gates (`GNOTIF*`), precedence vs error / logging SSOTs, and pointers to part files (`NOTIF-RCP-`, `NOTIF-BE-`, `NOTIF-CLI-`, `NOTIF-CFG-`, `NOTIF-OPS-`). Receipt semantics, dispatcher API, client handlers, config verification, and ops / metrics documentation live only in those parts.
- Excluded: Generic HTTP / persistence rules ([repository](../repository/README.md)) except where NOTIF-BE- cites notification records; generic routing ([routing](../routing/README.md)) except notification response handler contract in NOTIF-CLI-.

Document type: Normative — core for the expo-notifications topic. NOTIF-C2, NOTIF-C3, NOTIF-C5, NOTIF-C6, NOTIF-C8, NOTIF-C11 and NOTIF-C12 are not defined; the gaps are never back-filled.

Environment: Applies to an Expo client and any backend or provider services selected to dispatch push notifications. Platform credentials and native configuration depend on the chosen provider.

Binding principle: Violations of applicable NOTIF **MUST** / **MUST NOT** rows are defects and must be fixed before release. User-visible or analytics “delivered” / “confirmed” status must not be driven by `SENT` (ticket accepted) alone; require `DELIVERED_CONFIRMED` (receipt success) as defined by NOTIF-RCP-M2, NOTIF-G2, and GNOTIF10.

References: [README.md](README.md).

Code samples: [`../_meta/examples/expo-notifications-code-samples.md`](../_meta/examples/expo-notifications-code-samples.md) (non-normative).

---

## Deterministic timing (normative constants)

Purpose: Replace vague timing terms such as “periodically” or “later” with measurable predicates.

| ID | Quantity | Meaning |
|----|----------|---------|
| **NOTIF-T-RECEIPT-FIRST-MIN** | 15 (Expo Push Service guidance) | Minimum elapsed minutes from successful Expo ticket acceptance to the first `getPushNotificationReceiptsAsync` batch that includes that ticket id (Expo receipt API semantics). |
| **NOTIF-T-RECEIPT-WORKER-MAX-MIN** | Application-selected | Maximum elapsed minutes between receipt-worker runs while records await a receipt. The application chooses a finite bound consistent with its delivery and support requirements. |

Related ops constants (NOTIF-OPS): `NOTIF-T-OPS-RETRY-MAX`, `NOTIF-T-OPS-BACKOFF-MAX-MS`, `NOTIF-T-OPS-BATCH-MAX`, `NOTIF-T-OPS-RECEIPT-IDS-MAX`, `NOTIF-T-OPS-RECEIPT-RETENTION-H` — [operations-and-observability.md](operations-and-observability.md).

Verify discipline: The receipt worker schedule **MUST** satisfy NOTIF-T-RECEIPT-WORKER-MAX-MIN and be recorded in the adopting project’s operations configuration. A missing schedule is an unresolved delivery requirement.

---

## Rule identifiers (normative)

| Prefix | Where defined | Meaning |
|--------|----------------|---------|
| NOTIF-C\* | This file only | Agent execution contract. |
| NOTIF-T-\* | This file only | Deterministic timing constants for receipt work. |
| NOTIF-RCP-\* | [receipt-and-delivery.md](receipt-and-delivery.md) (M1–M7, N\*) and [push-credential-binding.md](push-credential-binding.md) (M8–M10) | Ticket / receipt, status model, receipt checker, DeviceNotRegistered. |
| NOTIF-BE-\* | [backend-dispatcher.md](backend-dispatcher.md) (M1–M7, N\*) and [backend-dispatcher-audience-and-egress.md](backend-dispatcher-audience-and-egress.md) (M8–M12) | Dispatcher, payload minimums, bypass bans. |
| NOTIF-CLI-\* | [client-expo.md](client-expo.md) | expo-notifications client, channels, token, listeners. |
| NOTIF-CFG-\* | [configuration-and-build.md](configuration-and-build.md) | app.json plugins, native / EAS verification. |
| NOTIF-OPS-\* | [operations-and-observability.md](operations-and-observability.md) | Receipt retry bounds, Expo batching / 429, metrics or none. |
| GNOTIF\* | [decision-gates.md](decision-gates.md) | Decision gates (normative index). |
| NOTIF-G\*, NOTIF-N\* | [global-delivery-rules.md](global-delivery-rules.md) | Topic-wide **MUST** / **MUST NOT** on delivery truth. |

Citations must use full IDs (e.g. NOTIF-RCP-M3, GNOTIF2).

---

## Agent execution contract

The shared [agent execution contract](../_meta/agent-contract.md) applies; the rows below are this topic's own.

| ID | Rule |
|----|------|
| **NOTIF-C1** | This topic (core + parts) is mandatory for Expo push notification work in scope (README Scope). |
| **NOTIF-C4** | Precedence: on notification pipeline behavior (dispatcher, receipt, delivery status, token lifecycle) this topic wins over generic error/logging wording; the structured error fields (`rootCause`, etc.) of [error-policy](../error-policy/error-policy.md) and [error-handling](../error-handling/error-handling.md) stay mandatory where those topics apply. |
| **NOTIF-C7** | Library baseline: `expo-notifications` is installed with `npx expo install expo-notifications` and matches the application's Expo SDK (see Technology); a mismatch is resolved under NOTIF-C10. |
| **NOTIF-C9** | Security of push tokens follows [security](../security/README.md); this topic does not authorize logging raw tokens (NOTIF-CLI-N3). |
| **NOTIF-C10** | When the `expo-notifications` / Expo SDK pair in the dependency manifest does not satisfy the Technology row, the dependency is upgraded or this topic amended before dependent work proceeds — no silent drift. A dependency declaration alone does not prove native notification configuration or runtime compatibility: verify the resolved SDK, native configuration, and a built artifact before claiming support. |

Verification: Part-file Verify rows identify whether evidence comes from source inspection, runtime behavior, provider documentation, or operational review. Do not imply source-only checks prove delivery.

---

## Technology

| Topic | Rule |
|-------|------|
| Client library | `expo-notifications` with current Expo SDK compatibility (project the selected package manager and current Expo docs) — NOTIF-C7, NOTIF-C10. |
| Push transport | Use Expo Push Service when selected; direct FCM / APNs is another supported provider path — NOTIF-BE-M4, NOTIF-RCP-M1; HTTP batching / 429 — NOTIF-OPS-M2, NOTIF-OPS-M4. |
| Config plugin | `expo-notifications` **must** appear in `app.json` `plugins` — NOTIF-CFG-M1, NOTIF-CFG-N1. |

Version compatibility: Resolve the installed package version and Expo SDK using the adopting project’s package manager and verify them against current Expo documentation.

---

## Failure-path and environment notes

| Dimension | Coverage |
|-----------|----------|
| Failure / invalid state | Receipt errors (NOTIF-RCP-M4, NOTIF-RCP-M8); dispatcher / push failures (NOTIF-BE-M5, NOTIF-BE-M6); token errors on device (NOTIF-CLI-M5, NOTIF-CLI-N1). |
| Environment | backend logger (NOTIF-BE-N3); EAS / FCM / APNs (NOTIF-CFG-M3, NOTIF-CFG-M5). |
| Operations / metrics | Retry / batching / 429 / metrics documentation — NOTIF-OPS-M1–M4, NOTIF-OPS-N1–N2. |
| N/A | Pure server services with no Expo client — NOTIF-CLI- / NOTIF-CFG- do not apply; NOTIF-BE- applies only if that service sends Expo push. |

NOTIF-OPS-M3 (b) `notifications_metrics: none` is explicit permission to ship without external metrics systems — logs remain mandatory per NOTIF-BE-N3 / logging policy where they apply.

---

## Decision gates and global rules — moved

The gate index GNOTIF1–GNOTIF10 is defined in [decision-gates.md](decision-gates.md). The topic-wide rows NOTIF-G1, NOTIF-G2 and NOTIF-N1 are defined in [global-delivery-rules.md](global-delivery-rules.md).

# Expo notifications — decision gates (GNOTIF*)

```kit-cover
type: normative
part-of: README.md
binds: GNOTIF1 to GNOTIF11 -- the binary routing index for push work; each gate names the NOTIF- rows that must hold and the STOP action when they do not
open-when: shape:backend-heavy, shape:frontend-heavy, signal:push-notification, signal:notification-gate-routing
skip-when: signal:no-notification-change
owns: GNOTIF1, GNOTIF2, GNOTIF3, GNOTIF4, GNOTIF5, GNOTIF6, GNOTIF7, GNOTIF8, GNOTIF9, GNOTIF10, GNOTIF11
```

Scope: The decision-gate index of the expo-notifications topic. Every gate routes to rows defined in the core file or in a part file; no gate defines behaviour of its own.

Document type: Normative part — GNOTIF1–GNOTIF11.

References: [README.md](README.md); [expo-notifications-core.md](expo-notifications-core.md) (NOTIF-C\*, NOTIF-T-\*); [global-delivery-rules.md](global-delivery-rules.md) (NOTIF-G1, NOTIF-G2, NOTIF-N1); [receipt-and-delivery.md](receipt-and-delivery.md); [backend-dispatcher.md](backend-dispatcher.md); [client-expo.md](client-expo.md); [configuration-and-build.md](configuration-and-build.md).

---

## Decision gates (normative index) — GNOTIF*

Purpose: Deterministic routing. Each gate references existing NOTIF- rows; gates do not define new behavior without an M / N row in a part file.

| Gate | Proceed only if YES (all bullets in the cell **must** hold unless marked OR) | Binding rule IDs | If NO (action) |
|------|----------------------------------------------------------------|-------------|-------------|
| **GNOTIF1** | Expo accepted a push (`ticket.status` ok) for a notification that claims real device delivery in production. | NOTIF-RCP-M2, NOTIF-RCP-M3, NOTIF-RCP-M5, NOTIF-T-RECEIPT-FIRST-MIN | Implement receipt check path before marking delivered; STOP until NOTIF-RCP- rows pass review. |
| **GNOTIF2** | A provider receipt or error reports a structurally validated unregistered-device outcome, such as `DeviceNotRegistered` for Expo Push Service. | NOTIF-RCP-M8, NOTIF-CLI-M6 | Invalidate the matching stored device credential and stop sending to it until the client registers again. |
| **GNOTIF3** | Adding or changing Expo push client code (`expo-notifications` imports). | NOTIF-CFG-M1, NOTIF-CFG-M2, NOTIF-CFG-V1 | `app.json` **must** list `expo-notifications` plugin and `defaultChannel` **must** match backend `channelId`; STOP until Verify passes. |
| **GNOTIF4** | Backend push payload includes Android `channelId`. | NOTIF-CLI-M3, NOTIF-CFG-M2 | Client **must** create that channel id before FCM delivery; STOP on mismatch. |
| **GNOTIF5** | Any notification remains `SENT` (ticket ok, receipt not final) in the database. | NOTIF-RCP-M6, NOTIF-T-RECEIPT-WORKER-MAX-MIN | Receipt worker schedule **must** meet NOTIF-T-RECEIPT-WORKER-MAX-MIN; STOP until documented interval exists. |
| **GNOTIF6** | Implementing backend push dispatch. | NOTIF-BE-M1, NOTIF-BE-N1, NOTIF-BE-N2 | Route sends through the application’s single domain dispatcher and its documented authorization, payload, and retry rules. |
| **GNOTIF7** | Persisting a notification record with PUSH channel. | NOTIF-BE-M4, NOTIF-BE-M7 | Push and DB write **must** be consistent per NOTIF-BE-M4; STOP on orphan push or orphan row. |
| **GNOTIF8** | Handling notification tap (response listener). | NOTIF-CLI-M4, NOTIF-CLI-M7 | Single handler; **must** navigate per contract or fallback list screen; STOP on empty handler path. |
| **GNOTIF9** | Logging push, receipt, or credential failures on the backend. | NOTIF-BE-N3 and the applicable logging policy | Use the application’s established structured logging authority; do not rely on unstructured console output as the only production record. |
| **GNOTIF10** | Claiming “delivered” or “confirmed” in product / analytics / UI. | NOTIF-RCP-M2, NOTIF-RCP-N2 | Use only `DELIVERED_CONFIRMED` after receipt `ok`; never map ticket-only success to “delivered”; STOP if marketing copy contradicts status model. |
| **GNOTIF11** | Narrowing a notification's recipients by anything other than structural eligibility (tenant, role, membership, token) — engagement or event history, a frequency cap, a quiet-hours window. | NOTIF-BE-M14, NOTIF-RCP-M11, NOTIF-RCP-M12, NOTIF-RCP-M13, NOTIF-RCP-N3 | Name the suppression's purpose and its single eligibility authority, record the coverage measurement of the chosen signal against each rejected alternative, and keep the permanent uninstall/credential state out of the same gate; STOP while the criterion rests on an unmeasured signal or on "notifications" in general. |

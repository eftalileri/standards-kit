# Expo notifications — non-normative examples

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Status: Non-normative. SSOT is [`../../expo-notifications/README.md`](../../expo-notifications/README.md) and part files. Do not treat this file as a rule source.

Applicability: The examples below apply only to a consuming application that uses Expo Notifications and the corresponding native push-delivery path. They are not requirements for other notification providers or stacks; use them only where the linked NOTIF- rules apply.

---

## Minimum `app.json` plugin shape (illustration)

```json
{
  "plugins": [
    [
      "expo-notifications",
      {
        "defaultChannel": "default"
      }
    ]
  ]
}
```

Normative requirements: **NOTIF-CFG-M1**, **NOTIF-CFG-M2**, [configuration-and-build.md](../../expo-notifications/configuration-and-build.md).

---

## Example operations notes for `docs/notifications.md`

This is a suggested documentation location, not a required filename or path. The sample values are choices for an Expo-backed implementation; select the applicable behavior from the normative operations rows and the consuming provider's documented contract.

Normative detail: [operations-and-observability.md](../../expo-notifications/operations-and-observability.md) (NOTIF-OPS-\* ) . Pick one pattern per row ; do not copy blindly without matching implementation .

```text
receipt_fetch_retry: none

expo_push_batching: single

expo_push_messages_per_request_max: 100

notifications_metrics: none

expo_push_429_policy: not_applicable
```

If the applicable Expo operations rule calls for retries or metrics, document those values and fields within its normative bounds; the sample `none` values are not universal defaults.

---

## Refactor checklist (illustration)

Use this as a human aid only ; compliance is defined by NOTIF- rows and Verify columns in the normative files.

### Frontend

- `expo-notifications` installed; `setNotificationHandler` at startup.
- Android default channel created before FCM traffic; `channelId` matches backend.
- Physical device: token errors use `logger.error`, not silent `info`.
- Single response listener module ; navigation uses `data.navigation` or fallback list screen.
- Frontend notification type union covers backend enum.

### Backend

- All push and notification creates via dispatcher ; for a repository with a `src/` tree and this function name, search for `sendPushNotifications\\s*\\(` and confirm no call sites exist outside the dispatcher (per **NOTIF-BE-N1** ).
- Model validates `data.type` and tenant id (**NOTIF-BE-M3** ).
- PUSH channel: push + DB consistent (**NOTIF-BE-M4** ).
- Errors logged with logger , not `console.*` (**NOTIF-BE-N3** ).

### Configuration

- `expo-notifications` in `plugins` (**NOTIF-CFG-M1** ).
- iOS background modes ; Android `googleServicesFile` and permissions (**NOTIF-CFG-M3** ).
- EAS projectId aligned with token code (**NOTIF-CFG-M4** ).

### Receipt pipeline

- `pushTicketId` stored ; receipt worker schedule documented (**NOTIF-RCP-M4**, **NOTIF-RCP-M6** ).
- For the Expo receipt pipeline, first receipt fetch timing follows **NOTIF-RCP-M5** (the 15-minute minimum shown here is provider/stack-specific, not a general notification rule ).
- `DeviceNotRegistered` clears token (**NOTIF-RCP-M8** ).

---

## Ticket vs receipt (illustration)

| Stage | Meaning |
|-------|---------|
| Ticket ok | Expo accepted the message for downstream delivery . |
| Receipt ok | FCM / APNs reported delivery to the device . |

Normative table: [receipt-and-delivery.md](../../expo-notifications/receipt-and-delivery.md) status model and **NOTIF-RCP-M1** .

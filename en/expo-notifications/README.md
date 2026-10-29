# Expo notifications (React Native / backend dispatch)

```kit-cover
type: routing
part-of: self
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

**Keywords:** push notifications, Expo, FCM, APNs, tickets, receipts, delivery

Planning: [Agent planning procedure](../agent-planning/agent-planning-procedure.md) — P1–P8 when this topic is in scope (P8 verification when implementation-bound); cite in deliverables per [markdown-authoring M16](../authoring/markdown-authoring.md).

Purpose: Conditional guidance for applications using Expo Notifications on the client and a backend dispatcher. It covers opt-in, credentials, provider handoff, tickets and receipts, delivery status, platform configuration, retries, and observability. Use only the provider and deployment rules that match the adopting application.

## Reading order

1. [expo-notifications-core.md](expo-notifications-core.md) — topic contract, status semantics, and configuration boundaries.
2. [decision-gates.md](decision-gates.md) — route the change to applicable rules.
3. [global-delivery-rules.md](global-delivery-rules.md) — delivery evidence and shared dispatch decisions.
4. [receipt-and-delivery.md](receipt-and-delivery.md) — tickets, receipts, delivery status, and durable receipt processing.
5. [push-credential-binding.md](push-credential-binding.md) — token binding and stale-credential cleanup.
6. [backend-dispatcher.md](backend-dispatcher.md) and [backend-dispatcher-audience-and-egress.md](backend-dispatcher-audience-and-egress.md) — recipient eligibility and backend handoff.
7. [backend-dispatcher-durable-handoff.md](backend-dispatcher-durable-handoff.md) — optional durable handoff when the request must not wait for provider delivery.
8. [client-expo.md](client-expo.md) — client registration, listeners, and response handling.
9. [notification-opt-in-and-ux.md](notification-opt-in-and-ux.md) — permission timing, foreground behavior, and notification actions.
10. [configuration-and-build.md](configuration-and-build.md) — Expo native configuration and provider credentials.
11. [operations-and-observability.md](operations-and-observability.md) — provider limits, bounded retries, and operational signals.

## Related

- [Error policy](../error-policy/error-policy.md)
- [Error handling](../error-handling/error-handling.md)
- [Logging policy](../logging-policy/logging-policy.md)
- [Security](../security/README.md)
- [Routing](../routing/README.md)

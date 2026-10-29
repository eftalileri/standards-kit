# Logging policy — code samples (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Purpose: Illustration only. Not SSOT. Normative rules: [`../../logging-policy/logging-policy.md`](../../logging-policy/logging-policy.md).

Strict alignment: Messages **M14** (`[Module] …`); `logger.error` meta **M12** (`action`, `rootCause`, `solution` when required); objects **M13**. See [error policy](../../error-policy/error-policy.md) for failure alignment. Anti-copy: adapt paths to your repo.

---

## Info with structured meta

```typescript
logger.info('[Appointments] Slot reserved', {
  userId,
  action: 'reserveSlot',
  slotId,
});
```

---

## Error with exception + policy fields

```typescript
logger.error('[Appointments] create failed', error, {
  userId,
  traceId,                  // same id as the API response + crash report (M19)
  action: 'createAppointment',
  rootCause: 'Database constraint violation',
  solution: 'Retry with valid foreign keys or return validation error to client.',
});
```

> **M20** / **N8** caution: here `logger` **MUST** be your single wrapper surface whose `error(message, error, meta)` merges `meta`. This call-shape warning illustrates the Winston API used below: a raw Winston instance may accept `rawWinston.error(msg, error, meta)` yet silently drop `meta` (the `(message, ...meta: any[])` signature), so `rootCause` / `solution` may never reach the crash report. Check the selected logger's API and keep its raw instance module-private; export only the wrapper.

> Expected (`warn`) errors are logged with `logger.warn` and counted on the metric channel (**M18**) — they are not sent to crash reporting (**N6**).

---

## Conditional transport example: Winston on a stdout-collecting host

This example applies only when the consuming system has selected Winston and a hosting platform that collects process stdout/stderr. In that configuration, production can use a console transport → stdout/stderr with JSON format; do not use a rotating file transport as the only required sink on such a platform (**M4**, R1–R3 in the normative document). For other logger or hosting choices, follow the consuming runtime's documented transport requirements under those same rows.

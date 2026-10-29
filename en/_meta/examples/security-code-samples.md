# Security — code samples (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Purpose: Illustrative patterns only. Binding rules are in `standards-kit/en/security/*.md`. If a sample conflicts with a normative row, the normative row wins.

The backend examples use Express-shaped pseudocode. Values shown below are inputs to be selected from the application's threat model, trusted network topology, deployment configuration, and data-retention policy; they are not universal defaults.

---

## Mobile: expo-secure-store (token storage)

```typescript
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('accessToken', token);
const access = await SecureStore.getItemAsync('accessToken');
await SecureStore.deleteItemAsync('accessToken');
```

Do not use `AsyncStorage` for tokens — **SEC-M-STORE-1** / **SEC-N-STORE-1**.

---

## Backend: rate limit (sketch)

```typescript
import rateLimit from 'express-rate-limit';

const globalLimiter = rateLimit({
  // Set these from the endpoint's abuse model and service capacity.
  windowMs: rateLimitPolicy.windowMs,
  limit: rateLimitPolicy.requestsPerWindow,
  keyGenerator: (req) => {
    if (req.user) return `principal:${req.user.id}`;

    // Use req.ip only when Express trust-proxy configuration matches the
    // actual reverse-proxy chain. Otherwise this value may be spoofable.
    // Do not add User-Agent: it is caller-controlled and not an identity.
    // Normalize/group addresses using the rate-limit library and address-family
    // policy selected for this deployment.
    return `network:${resolveClientAddressFromTrustedProxy(req)}`;
  },
});
```

Authenticated endpoints may need per-account, per-principal, or layered limits. Public endpoints may use a network address only when proxy trust is configured and verified. Choose the window, threshold, key cardinality, and fail-open/fail-closed behavior per endpoint risk and capacity; do not copy fixed limits between services. Match the threshold option name and IP-normalization helper to the installed library version.

---

## Backend: Helmet (sketch)

```typescript
import helmet from 'helmet';

app.use(
  helmet({
    // Build directives for the application's actual scripts, assets,
    // frames, and deployment origins. Avoid a copied policy that is either
    // too permissive or breaks required resources.
    contentSecurityPolicy: buildCspForDeployment(securityPolicy),
    // Enable HSTS only when the deployment is HTTPS-only and every covered
    // subdomain is ready to remain HTTPS. Choose duration/preload policy
    // through the deployment's security review.
    hsts: hstsPolicyForDeployment,
  }),
);
```

Helmet options are examples, not a universal CSP or HSTS profile. Validate the resulting headers against the actual deployment and its subdomains before enabling broader HSTS scope or preload behavior.

---

## Backend: Zod at route boundary (sketch)

```typescript
import { z } from 'zod';

const bodySchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email(),
});

const body = bodySchema.parse(req.body);
```

---

## Backend: CORS allowlist (sketch)

```typescript
import cors from 'cors';

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowed = process.env.ALLOWED_ORIGINS?.split(',') ?? [];
    if (!origin) {
      // Do not grant CORS access without an Origin. Non-browser requests
      // are governed by authentication/authorization, not by this callback.
      callback(null, false);
      return;
    }
    if (allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: Origin not allowed'));
    }
  },
  credentials: true,
};
```

An absent `Origin` header is not proof that a request is trusted or non-browser. This callback withholds CORS permission; it does not reject the HTTP request. If an endpoint requires an Origin check, enforce that separately at the request/authentication boundary. Non-browser clients still require normal authentication and authorization. CORS is not an authentication or CSRF defense.

---

## Webhook: raw payload storage (sketch)

```typescript
// Enforce the size limit while reading, before buffering the complete body.
// The limit must match this endpoint and deployment capacity.
const rawBytes = await readRawBodyWithLimit(req, webhookPolicy.maxBodyBytes);
// Verify the signature over the exact received bytes before parsing/persisting.
verifyWebhookSignature(rawBytes, req.headers, webhookSecret);

const typedEvent = webhookSchema.parse(parseJson(rawBytes));
await persistWebhookEvent({
  event: typedEvent,
  // Retain raw bytes only when a documented replay/audit need requires it.
  // Apply access controls, encryption, a strict size bound, and a retention
  // period from the webhook data policy, and never log raw bytes; otherwise
  // store a digest/minimum.
  rawPayload: webhookPolicy.retainRawPayload ? rawBytes : undefined,
});
```

Conditions: **SEC-M-WH-1** — see [security-backend-controls.md](../../security/security-backend-controls.md). Raw-body capture and size limits are framework/deployment-specific; retention requires a documented operational or legal purpose and access policy.

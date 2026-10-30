# Backend hunt patterns (candidate finders, read-only)

These ripgrep patterns nominate files and lines for manual tracing. A hit is never a finding by itself; trace it with the matching check in `SKILL.md`. Add excludes for the project (`-g '!**/dist/**' -g '!**/node_modules/**'`). Patterns target Node/Express TypeScript; translate the shapes for other stacks. Single-quoted patterns must stay single-quoted in the shell (they contain `$`); `\x60` is a backtick.

## 1. Surface and authority model

- Route registrations: `rg -n "\b(app|router|r)\.(get|post|put|patch|delete|all)\(\s*['\"\x60]/"`
- Routers and mounts: `rg -n "express\.Router\(|\.use\(\s*['\"\x60]/"`
- Middleware mount order: `rg -n "\b(app|router)\.use\("` (then read the bootstrap file top to bottom)
- Param loaders: `rg -n "\.param\(\s*['\"]"`
- Conditional routes: `rg -n "if\s*\(.*(NODE_ENV|isDev|DEBUG).*\)\s*\{?\s*(app|router)\."`
- Webhook / callback receivers: `rg -n -i "webhook|callback|/hooks?/"`
- Queue / cron consumers: `rg -n -i "cron|schedule\(|\.process\(|consumer|subscribe\("`

Record for each route: method, path, file:line, middleware chain, public-by-design yes/no.

## 2. Object, function and tenant scoping

- Id from request straight into a query: `rg -n "(findById|findByIdAndUpdate|findByIdAndDelete|deleteOne|updateOne|findOne)\([^)]*req\.(params|body|query)"`
- Filter on `_id` only: `rg -n "\{\s*_id\s*:\s*[^,}]+\}\s*[,)]"` (then look for a tenant/owner key in the same filter)
- Tenant or owner taken from input: `rg -n "req\.(body|query|params|headers)\.?\[?['\"]?(tenant|company|org|organization|account|owner|user)_?[Ii]d"`
- Role taken from input: `rg -n "req\.(body|query|headers)\.?\[?['\"]?(role|isAdmin|permissions?|scope)"`
- Batch ids: `rg -n '\$in\s*:\s*req\.|ids\s*=\s*req\.'`
- Aggregations and joins: `rg -n '\.aggregate\(|\$lookup|\.populate\('` (check the tenant match stage and populate filters)
- Cache and rate-limit keys: `rg -n "(redis|cache)\.(get|set|del|incr|expire)\(\s*['\"\x60]"` (is the tenant in the key?)

## 3. Mass assignment and response shaping

- Body into persistence: `rg -n "(create|insertOne|insertMany|updateOne|updateMany|findOneAndUpdate|findByIdAndUpdate|replaceOne)\([^)]*req\.body"`
- Spread or assign: `rg -n "\.\.\.req\.body|Object\.assign\([^,]+,\s*req\.body"`
- `$set` from input: `rg -n '\$set\s*:\s*(req\.body|body|input|data)\b'`
- Permissive validators: `rg -n "\.passthrough\(\)|\.catchall\(|allowUnknown|unknown\(\s*true"`
- Whole document returned: `rg -n "res\.(json|send)\(\s*(user|doc|document|result)\s*\)|toObject\(\)\s*\)"`

## 4. Races and idempotency

- Read-then-save on counters: `rg -n -U "find(One|ById)\([\s\S]{0,400}?(balance|credit|quota|stock|remaining|count)[\s\S]{0,400}?\.save\("`
- Non-atomic decrement: `rg -n "(balance|credit|quota|remaining)\s*-=|=\s*\w+\.(balance|credit|quota)\s*-"`
- Idempotency keys: `rg -n -i "idempotenc|eventId|event_id|dedup"` (is there a unique index behind it?)
- In-process shared state: `rg -n "new Map\(|new Set\(" -g '**/services/**'` (state shared across requests or instances)

## 5. Error handling and insecure defaults

- Catch that allows: `rg -n -U "catch\s*(\([^)]*\))?\s*\{\s*(return\s+true|next\(\))"`
- Env fallback literal: `rg -n "process\.env\.[A-Z0-9_]+\s*(\|\||\?\?)\s*['\"\x60]"`
- Env-toggled security: `rg -n -i "process\.env\.[A-Z0-9_]*(SKIP|DISABLE|BYPASS|INSECURE|ALLOW|VERIFY|AUTH)[A-Z0-9_]*"`
- CORS: `rg -n "cors\(|Access-Control-Allow-(Origin|Credentials)|origin\s*:\s*(true|['\"]\*['\"])"`
- Stack to client: `rg -n "(err|error)\.stack|res\.(json|send)\(\s*(err|error)\s*\)"`
- Default users: `rg -n -i "(admin|root|test)@|password\s*[:=]\s*['\"][^'\"]{1,20}['\"]"`

## 6. Express / Node sharp edges

- Proxy trust: `rg -n "trust proxy"` (compare with the real number of proxies in front: edge plus platform router)
- Body limits: `rg -n "express\.(json|urlencoded|raw|text)\(|bodyParser\."` (look for `limit`, `extended`)
- Headers: `rg -n "helmet\(|x-powered-by"`
- Open redirect: `rg -n "res\.redirect\(\s*(req\.|[a-zA-Z_.]*(next|returnTo|redirect|url)\b)"`
- Command execution: `rg -n "child_process|execSync\(|exec\(|spawn\([^)]*shell\s*:\s*true"`
- Dynamic code: `rg -n "\beval\(|new Function\(|vm\.(run|compile)|require\(\s*[^'\"\x60]"`
- Prototype pollution: `rg -n "(_\.|lodash\.)?(merge|defaultsDeep|set|setWith)\(|deepmerge|Object\.assign\(\s*\{\}\s*,\s*req\."`
- Regex from input: `rg -n "new RegExp\([^)]*(req\.|query|search|filter)"`
- Path joins: `rg -n "path\.(join|resolve)\([^)]*req\.|fs\.\w+\([^)]*req\."`

## 7. SSRF, uploads, webhooks

- Outbound call with a variable URL: `rg -n "(fetch|axios(\.\w+)?|got(\.\w+)?|request|undici\.\w+|https?\.get)\(\s*[a-zA-Z_][\w.]*\s*[,)]"`
- Redirect following: `rg -n "maxRedirects|follow(Redirects)?\s*:"`
- TLS verification off: `rg -n "rejectUnauthorized\s*:\s*false|NODE_TLS_REJECT_UNAUTHORIZED"`
- Upload middleware: `rg -n "multer\(|busboy|formidable|fileFilter|limits\s*:"`
- Signature checks: `rg -n -i "signature|hmac|timingSafeEqual|constructEvent|verifySignature"`
- Raw body: `rg -n "express\.raw\(|rawBody|verify\s*:\s*\("`

## 8. Express hardening facts to check against (not findings by themselves)

- `trust proxy` should match the trusted hops (or a list of trusted proxy addresses); `true` trusts every `X-Forwarded-For` entry. The requirement is kit SEC-M-RL-5.
- The default JSON body limit is small (body-parser default 100 kB) unless overridden; raising it to many MB on public routes is a resource-consumption candidate.
- Session stores live outside process memory in multi-instance deployments (kit GRDS1); the in-memory store is for development only.
- Error handlers take four arguments and are registered last; anything registered after them is outside their reach.
- The Node inspector and debug flags stay out of production start commands.

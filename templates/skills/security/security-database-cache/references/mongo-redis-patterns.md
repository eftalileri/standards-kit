# MongoDB and Redis: search patterns and configuration checklists

## 1. MongoDB code patterns (ripgrep, candidates only)

Single-quoted patterns must stay single-quoted in the shell (they contain `$`); `\x60` is a backtick.

- Request object as filter: `rg -n "find(One)?\(\s*req\.(body|query|params)\s*\)|find(One)?\(\s*\{\s*\.\.\.req\."`
- Field from request into filter: `rg -n "find(One|OneAndUpdate|OneAndDelete)?\(\s*\{[^}]*:\s*req\.(body|query)\."`
- Filter assembled from input: `rg -n "(filter|query|where|criteria)\s*=\s*req\.|Object\.assign\(\s*(filter|query)\s*,\s*req\."`
- Update from input: `rg -n "(update(One|Many)?|findOneAndUpdate|findByIdAndUpdate)\([^,]+,\s*req\.body"`
- Server-side JS: `rg -n '\$where|\$function|\$accumulator|mapReduce\('`
- Pipelines: `rg -n '\.aggregate\(|\$lookup|\$out|\$merge|\$unionWith'`
- Sort / projection / select from input: `rg -n "\.(sort|select|projection|populate)\(\s*req\.|\.(sort|select)\(\s*[a-z]+\.(sort|fields|select)"`
- Regex from input: `rg -n '\$regex\s*:\s*(req\.|[a-z]+\.(q|search|query|term))|new RegExp\(\s*req\.'`
- Limits from input: `rg -n "\.limit\(\s*(Number\()?req\.|\.skip\(\s*(Number\()?req\."`
- Raw commands: `rg -n "\.command\(|runCommand|db\.eval"`
- Sanitizer settings: `rg -n "sanitizeFilter|strictQuery|mongo-sanitize|mongoSanitize"`

For every hit answer: can this value be an object or array? Is there a tenant predicate? Is the field allowlisted?

## 2. Redis code patterns

- Dangerous commands: `rg -n -i "\.(keys|flushall|flushdb|config|debug|module|shutdown|replicaof|slaveof)\(|['\"](KEYS|FLUSHALL|FLUSHDB|CONFIG|DEBUG|MODULE)['\"]"`
- Scripting: `rg -n -i "\.eval(sha)?\(|defineCommand\(|['\"]EVAL['\"]"` (is the script body constant?)
- Key builders: `rg -n '\x60[a-z0-9_:-]*\$\{' -g '**/{cache,redis,limit,lock}*'` (does the key include tenant and environment?)
- TTL presence: `rg -n "\.(set|setex|psetex|expire|pexpire)\(|['\"](EX|PX)['\"]\s*,"`
- Connection security: `rg -n "redis://|rediss://|tls\s*:|rejectUnauthorized"`
- Error swallowing: `rg -n -U "redis[\s\S]{0,200}catch\s*(\([^)]*\))?\s*\{\s*(return|\})"`

## 3. Operator injection reasoning aid

- JSON bodies always allow objects. Query strings allow objects when the parser builds nested structures (Express 4 default extended parser); Express 5's default simple parser does not, but arrays may still appear for repeated keys.
- Login-style lookup: `findOne({ email, password: hash(input) })` is safe for the password field only if `input` is coerced to string before hashing; `findOne({ email: req.body.email })` with an object email matches the first user.
- Update operators: an update document from input lets the caller choose operators (`$set` on role, `$unset` on tenant). Build updates from an allowlist of fields.
- `$expr` and `$jsonSchema` in filters are not JavaScript but can still widen matches; treat as operators.

## 4. Managed MongoDB configuration checklist (console evidence)

1. Network: access list entries and their reasons; private endpoint or peering if the host supports it; no `0.0.0.0/0` without a recorded accepted-risk decision and compensating controls.
2. Authentication: SCRAM or X.509 users per application and environment; no shared users; human access through organization/project roles with MFA, not through application credentials.
3. Authorization: application users limited to the specific database and the actions they need (read/write on named DB, not any-database, not admin); separate read-only users for analytics.
4. Transport: TLS required (default on managed services); drivers do not disable certificate validation.
5. Encryption: at-rest encryption on (managed default); customer-managed keys if policy requires; field-level/queryable encryption for fields that must be hidden from database operators.
6. Server-side JavaScript: disabled if unused and the tier allows it.
7. Backups: enabled, retention matched to data policy, restore tested, snapshot download restricted to a small role set, no exported dumps outside the provider.
8. Auditing and alerts: database auditing where available and needed; alerts on user/role changes, access-list changes and unusual connection spikes.
9. Lifecycle: credentials rotated on staff changes; unused users and API keys removed; old clusters with real data deleted.

## 5. Redis configuration checklist (config file or provider console)

Kit: RDS-M11 (network, TLS, credentials), RDS-M3 and RDS-M4 (key namespace, TTL), RDS-D1, RDS-M8 and RDS-M9 (what each key class does when Redis fails). These rows decide; the items below are what to look at.

1. Not exposed to the internet; protected mode on for self-hosted; firewall or private network only.
2. ACL users per service with key patterns (`~tenant:*` style where feasible) and command categories excluding dangerous ones (`-@dangerous`, plus explicit denies as needed); default user disabled or restricted.
3. TLS for client connections across any untrusted network; certificate verification on in clients.
4. `CONFIG`, `MODULE`, `DEBUG` not available to application users (these can rewrite files or load code on the host).
5. Persistence files and replication links protected; replicas authenticated.
6. Memory policy chosen deliberately: an eviction policy can silently drop security keys (rate-limit counters, locks, revocation entries). Keep security-critical keys in a store or instance whose policy does not evict them; the behaviour when a key is missing follows the kit row for its class (RDS-M8 for limiters, RDS-M7 and RDS-M9 for locks and idempotency claims).
7. Separate logical or physical instances for environments; no shared cache between staging and production.

## 6. Migration safety checklist

Kit: REP-M-23, REP-M-25, SEC-M-NOSQL-6, SEC-M-NOSQL-9.

- Dry-run mode prints the commands, the count of affected documents and a sample, without writing.
- Backup or snapshot reference recorded before destructive runs.
- Idempotent: running twice changes nothing the second time.
- Scoped by tenant where the change is tenant-specific; never an unbounded update without a filter.
- Read-only verification query after the run, compared with the dry-run count.
- Credentials for running migrations limited to the needed database and revoked or rotated after one-off use.

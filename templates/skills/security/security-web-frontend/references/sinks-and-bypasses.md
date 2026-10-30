# Frontend sinks, search patterns and validation bypass classes

Use these to nominate candidates; confirm each with a source → sink trace.

## 1. Search patterns (ripgrep)

`\x60` in a pattern is a backtick.

- Raw HTML (React): `rg -n "dangerouslySetInnerHTML"`
- Raw HTML (DOM): `rg -n "\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML\(|document\.write(ln)?\("`
- Raw HTML (other frameworks): `rg -n "v-html|\[innerHTML\]|bypassSecurityTrust|\.html\(\s*[a-zA-Z_]"`
- Markdown / rich text: `rg -n -i "marked|markdown-it|react-markdown|rehype-raw|remark-html|html\s*:\s*true|allowDangerousHtml"`
- Sanitizer config: `rg -n "DOMPurify\.sanitize|sanitize-html|ADD_TAGS|ADD_ATTR|ALLOW_UNKNOWN_PROTOCOLS|allowedSchemes"`
- URL sinks: `rg -n "(href|src|action|formAction)=\{[^}]*\}|window\.open\(|location\.(href|assign|replace)\s*[=(]|location\s*=\s*"`
- Redirect params: `rg -n -i "(next|returnTo|return_url|redirect(_uri|Url)?|continue|callback)\b" -g '*.{ts,tsx,js,jsx}'`
- postMessage: `rg -n "addEventListener\(\s*['\"]message['\"]|onmessage\s*=|postMessage\("`
- Dynamic code: `rg -n "\beval\(|new Function\(|set(Timeout|Interval)\(\s*['\"\x60]"`
- Public env prefixes: `rg -n "(NEXT_PUBLIC_|VITE_|REACT_APP_|EXPO_PUBLIC_|PUBLIC_)[A-Z0-9_]*(KEY|SECRET|TOKEN|PASSWORD|PRIVATE)"`
- Build-time injection: `rg -n "DefinePlugin|define\s*:\s*\{|process\.env\.[A-Z_]+" -g '*.config.*'`
- Token storage: `rg -n "(localStorage|sessionStorage)\.setItem\([^)]*(token|jwt|auth|session)"`
- Third-party scripts: `rg -n "<script[^>]+src=\"https?://" -g '*.{html,tsx,jsx,ejs,hbs}'`
- Source maps: `rg -n "sourceMappingURL|devtool\s*:|sourcemap\s*:|productionSourceMap|GENERATE_SOURCEMAP"`

Built output: search the deployed or exported bundle directory (outside the repo copy if needed) for the same env names, `sk_`/`AKIA`/`-----BEGIN` style prefixes, internal hostnames, and `.map` files.

## 2. Sink semantics worth remembering

- Text interpolation in JSX/Vue templates is escaped; attributes are escaped too, but URL-valued attributes still accept dangerous schemes.
- A sanitizer protects only the exact string it returns; any later string concatenation, decoding or template step after sanitizing can reintroduce markup.
- Data placed into an inline `<script>` (e.g. serialized initial state) must escape `<` and line separators; `JSON.stringify` alone does not.
- `iframe sandbox` without `allow-scripts` blocks script; `allow-scripts` together with `allow-same-origin` on same-origin content removes the sandbox's value.
- Styles: user-controlled CSS can exfiltrate data via selectors and URLs; treat `style` injection as a lower-severity sink unless secrets are on the page.

## 3. Redirect and URL validation bypass classes

A check passes only if it parses the URL and compares scheme + host against an allowlist (or only allows same-origin relative paths after parsing). String checks fail on:

- Protocol-relative: `//attacker.example`
- Backslash normalization: `/\attacker.example`, `\\attacker.example`
- Missing slashes: `https:attacker.example`
- Userinfo: `https://trusted.example@attacker.example`
- Suffix/prefix tricks: `https://trusted.example.attacker.example`, `https://attacker-trusted.example`
- Encoded characters: `%2F%2F`, tab/newline inside the scheme, mixed case `JaVaScRiPt:`
- Look-alike Unicode domains (IDN homographs) when comparing display strings
- Fragment and query confusion: `https://attacker.example#trusted.example`

## 4. CSP evaluation points

- `script-src` uses nonces or hashes, optionally `strict-dynamic`; no `unsafe-inline` (ignored when nonces are present in modern browsers, but still a signal), no `unsafe-eval`.
- Host allowlists are weak when an allowed host serves user content, JSONP endpoints or old libraries with script gadgets.
- `object-src 'none'`, `base-uri 'none'` or `'self'`, `frame-ancestors` set, `form-action` set where forms post.
- Report-only policies give visibility, not protection.

## 5. postMessage rules

- Receiver: compare `event.origin` with an exact allowlist; validate message shape; never pass message data to an HTML or URL sink.
- Sender: pass an explicit target origin when the message contains anything non-public.
- Hybrid apps: the WebView ↔ native bridge is the same pattern (see `security-mobile`).

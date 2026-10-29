# Build and environment — verify commands (non-normative)

```kit-cover
type: reference
part-of: ../README.md
binds: nothing
open-when: never-by-default
skip-when: none
owns: none
```

Purpose: Copy-paste illustrations for static checks cited in [`../../build-environment/build-environment.md`](../../build-environment/build-environment.md). Not SSOT — obligations live only in that file.

---

## TypeScript strict (**BE-M1**)

From repository root (same directory as `package.json` ):

```bash
npx tsc --showConfig 2>/dev/null | rg -q '"strict": true' && echo OK
```

If `tsconfig.json` does not use `extends`:

```bash
node -e "const t=require('./tsconfig.json');process.exit(t.compilerOptions&&t.compilerOptions.strict===true?0:1)"
```

---

## `.env.example` present (**BE-M2**)

```bash
test -f .env.example && echo OK
```

---

## `scripts.build` present (**BE-M3**)

```bash
node -e "const p=require('./package.json');process.exit(p.scripts&&String(p.scripts.build).trim()?0:1)"
```

---

## README content (**BE-M7**)

```bash
test -f README.md \
  && rg -q '(install|pnpm|npm|yarn)' README.md \
  && rg -q '(\.env\.example|environment-variables)' README.md \
  && rg -q '(build|scripts)' README.md \
  && echo OK
```

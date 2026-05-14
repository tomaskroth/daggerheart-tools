# ADR-009: CRA → Vite Migration

> **Status:** `Proposed`
> **Date:** 2026-05-13
> **Backlog item:** PBI-005
> **Decider:** Architecture Agent → 👤 Human approval required

---

## Context

ADR-007 deferred the CRA → Vite build-tool migration to PBI-005 with an explicit instruction: "PBI-005 (frontend architecture) migrates the build tool to Vite as a separate, independently testable increment. This is lower risk and produces cleaner git history." That deferral is now due.

The current state after PBI-004:

- `react-scripts 5.0.1` drives `npm start` (dev server on port 3000) and `npm build` (production bundle).
- `vite@^6.4.2` and `@vitejs/plugin-react` are already `devDependencies` (installed for Vitest, per ADR-004).
- The test pipeline (Vitest + Playwright/Cucumber) does not depend on CRA's build pipeline — ADR-004 confirmed Vitest operates standalone.
- The e2e script (`test:e2e`) uses `start-server-and-test start http://localhost:3000 cucumber-js` — the start command is the one thing that must continue to produce a dev server on port 3000.
- `index.tsx` uses `ReactDOM.createRoot`, which is compatible with Vite's module graph entry point convention.
- Three CRA-specific conventions must change:
  1. **Environment variables**: `REACT_APP_API_URL` (used in `world.ts`) → `VITE_API_URL`.
  2. **HTML entry point**: `public/index.html` → `index.html` at project root (Vite convention), with `<script type="module" src="/src/index.tsx">` added.
  3. **`process.env.*`**: Vite does not inject `process.env.*` by default; it exposes env vars via `import.meta.env.*`.
- CRA 5 is in maintenance mode (no releases since 2022). Its Webpack dependency chain has known security advisories that will not be patched.

---

## Decision Drivers

- **Primary:** ADR-007 explicitly mandates this migration for PBI-005
- **Primary:** Eliminate CRA's unmaintained Webpack dependency chain
- **Primary:** Unify the build and test transform paths — Vitest already uses Vite/esbuild; the dev server should too
- **Secondary:** Vite's dev server starts in < 1 second (native ESM); CRA/Webpack starts in 10–30 seconds — CI wall-clock time is reduced
- **Secondary:** `vite.config.ts` is an explicit, version-controlled build config; CRA hides config in `react-scripts`
- **Constraints:** The e2e start command must produce a dev server on port 3000; the `REACT_APP_API_URL` env var rename affects `world.ts` and must be coordinated

---

## Options Considered

### Option A: Replace CRA with Vite — full migration

Remove `react-scripts` from `dependencies`. Add `@vitejs/plugin-react` as a direct dev dependency (it is already installed). Create `vite.config.ts`. Move `public/index.html` to `index.html` at root and add the `<script type="module" src="/src/index.tsx">` entry point tag. Replace `REACT_APP_API_URL` with `VITE_API_URL` in `world.ts` (the only consumer). Update `package.json` scripts: `start` → `vite`, `build` → `vite build`, `preview` → `vite preview`. Update `vitest.config.js` to import the shared `vite.config.ts` plugin list, removing the now-unnecessary custom esbuild plugin (all files are `.tsx` after PBI-004).

**Pros:**
- Eliminates CRA's unmaintained Webpack/babel chain in one move — security positive
- `vite` and `@vitejs/plugin-react` are already installed — no new dependencies
- Unifies build and test transform paths (both Vite/esbuild) — removes the "two transform pipelines" inconsistency noted in ADR-007
- Vite dev server is dramatically faster to start, reducing CI time
- `import.meta.env.*` is type-safe under `vite/client` types; `process.env.*` had no type-checking in CRA
- The `vitest.config.js` custom esbuild pre-enforce plugin (workaround for `.js` JSX files, added in ADR-004) becomes dead code once all files are `.tsx` — can be removed

**Cons:**
- `REACT_APP_API_URL` → `VITE_API_URL` rename must be applied in `world.ts` and any `.env` files
- `public/index.html` must move to root and gain the `<script type="module">` entry tag
- `vite.config.ts` must include `server: { port: 3000 }` to preserve the e2e test contract
- Vite does not support `process.env.*` by default — if any future code accidentally uses `process.env.*` instead of `import.meta.env.*`, it will silently be `undefined`; can be mitigated with a `define` mapping in `vite.config.ts`

**Security implications:**
- Removes ~80 unmaintained transitive Webpack dependencies from the build environment — net security improvement
- `import.meta.env.*` variables are injected at build time; they are not accessible at runtime unless explicitly exposed in the bundle — same trust boundary as CRA's `process.env.*`
- No new attack surface introduced

---

### Option B: Stay on CRA; apply Vite for production build only via a custom script

Keep `react-scripts start` for development but run `vite build` for production bundles. Maintain both configs in parallel.

**Pros:**
- No changes to dev server behaviour
- CRA's Webpack dev server continues to handle HMR

**Cons:**
- Two parallel build pipelines diverge over time — feature parity is not guaranteed
- Does not eliminate the unmaintained Webpack dependency chain (it remains in dev)
- Directly violates the spirit of ADR-007's deferral, which intends a clean replacement, not a parallel operation
- Increased maintenance burden: two configs, two output paths, two sets of env var conventions

**Security implications:**
- CRA's security vulnerabilities persist in the dev environment; developers are still exposed

---

### Option C: Migrate to Vite now but keep `REACT_APP_*` via a `define` shim

Apply Option A but add a `define: { 'process.env': {} }` shim in `vite.config.ts` to preserve `process.env.REACT_APP_API_URL` compatibility temporarily.

**Pros:**
- Reduces the change footprint at migration time — `world.ts` does not need to change immediately

**Cons:**
- Perpetuates the CRA env var convention in a Vite project — confusing for future maintainers
- The shim would need to map each `REACT_APP_*` variable explicitly; it does not generalise
- `world.ts` is the only consumer; the rename is a one-line change and the right long-term choice
- Creates a maintenance debt that will outlive PBI-005 if not cleaned up immediately

**Security implications:**
- A blanket `define: { 'process.env': {} }` shim could unexpectedly expose node-side env vars into the browser bundle if misconfigured — a genuine risk that Option A avoids by using `import.meta.env.*` explicitly

---

## Decision

**We will use Option A: full CRA → Vite migration.**

Option B contradicts ADR-007's intent and doubles the maintenance surface. Option C defers a trivial one-line rename at the cost of a security-risky shim and a lasting maintenance debt. Option A is the clean, correct migration that ADR-007 deferred for precisely this increment.

The key constraints are addressed explicitly:
- `vite.config.ts` sets `server: { port: 3000 }` to preserve the e2e start-server-and-test contract.
- `REACT_APP_API_URL` is renamed to `VITE_API_URL` in `world.ts` (the only consumer).
- `vitest.config.ts` (renamed from `.js`) is updated to remove the now-dead esbuild JSX workaround and instead use `@vitejs/plugin-react` directly.
- `vite/client` types are added to `tsconfig.json`'s `lib` or via a `/// <reference types="vite/client" />` directive so `import.meta.env` is typed.

---

## Architecture / Flow Diagram

```
Before (CRA / PBI-004 state):
  npm start  →  react-scripts start  →  Webpack dev server :3000
  npm build  →  react-scripts build  →  /build
  npm test   →  vitest run  ←  custom esbuild plugin for .js JSX

After (Vite / PBI-005 state):
  npm start   →  vite           →  Vite dev server :3000 (native ESM)
  npm build   →  vite build     →  /dist
  npm test    →  vitest run     ←  @vitejs/plugin-react (shared with vite.config.ts)
  npm preview →  vite preview   →  serve /dist locally

File layout changes:
  public/index.html  →  index.html (root)
    + <script type="module" src="/src/index.tsx">

New file: vite.config.ts
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'
  export default defineConfig({
    plugins: [react()],
    server: { port: 3000 },
    build: { outDir: 'dist' },
  })

vitest.config.ts (was vitest.config.js):
  - remove custom esbuild JSX plugin (dead code after PBI-004 .tsx migration)
  - import { defineConfig } from 'vitest/config'
  - plugins: [react()]
  - setupFiles: './src/test-setup.ts'

tsconfig.json additions:
  - "types": ["vite/client"]  (so import.meta.env is typed)

Environment variable rename:
  world.ts:  REACT_APP_API_URL  →  VITE_API_URL
  (index.tsx reads from a hardcoded string, not env var — no change needed there)
```

### e2e contract preservation

| Before | After |
|---|---|
| `start-server-and-test start http://localhost:3000 cucumber-js` | unchanged |
| `REACT_APP_API_URL` env var in `world.ts` | `VITE_API_URL` |
| `APP_URL` env var in `AppPage.ts` | unchanged |

---

## Consequences

### What becomes easier
- `vitest.config.ts` becomes clean — one plugin, no workarounds
- Build output is in `/dist` (Vite default) instead of `/build` (CRA default) — more conventional
- Developers get near-instant dev server start (< 1s HMR vs. 10–30s Webpack compile)
- Adding new env vars follows `VITE_*` convention with IDE type support via `import.meta.env`
- Future Vite plugins (e.g. SVG, WASM) are available without ejecting

### What becomes harder or riskier
- Any future code that accidentally uses `process.env.*` instead of `import.meta.env.*` will silently receive `undefined` at runtime — mitigated by the `vite/client` type that surfaces `import.meta.env` in the IDE
- Deployment pipeline (Vercel/Render) must be checked: Vercel detects Vite automatically; Render may need `npm run build` → `dist` output directory updated from `build`
- Any `.env` files in the project using `REACT_APP_*` prefix must be reviewed and renamed to `VITE_*`

### Impact on existing system
- **API contracts:** No — no backend changes
- **Database migration:** No
- **Auth/authorisation behaviour:** No
- **New external dependencies:** No — `vite` and `@vitejs/plugin-react` are already `devDependencies`
- **Removed dependencies:** `react-scripts` removed from `dependencies`

---

## Security Considerations

- **Authentication/Authorisation:** Not applicable — this decision concerns the build pipeline
- **Data sensitivity:** `import.meta.env.*` variables are statically replaced at build time by Vite. Only variables prefixed `VITE_` are exposed in the browser bundle — an explicit allowlist, safer than CRA's `REACT_APP_*` which exposes any matching env var
- **Attack surface:** Removes ~80 unmaintained transitive Webpack dependencies. The production bundle format changes from CRA's chunked Webpack output to Vite's Rollup-based output, but the runtime attack surface is equivalent
- **Threat mitigations:** `VITE_` prefix convention prevents accidental exposure of non-prefixed secrets into the bundle (unlike Node's `process.env.*` which has no such guard in Vite)

---

## Acceptance Scenarios Affected

All `@smoke @frontend` and `@regression @frontend` scenarios in `PBI-005-frontend-architecture.feature` exercise the app via the Vite dev server. The build-tool migration is invisible to users but must not break any existing passing scenario.

- `PBI-005-frontend-architecture.feature` — Scenario: "User can search and view an item from start to finish"
- `PBI-005-frontend-architecture.feature` — Scenario: "User can filter items by type"
- `PBI-005-frontend-architecture.feature` — Scenario: "Navigating directly to an item URL displays that item"
- `PBI-005-frontend-architecture.feature` — Scenario: "Dark mode preference is remembered after page reload"
- `PBI-005-frontend-architecture.feature` — Scenario: "Abilities type items display recall cost and level"

---

## 👤 Human Review Checklist

- [ ] The problem description matches my understanding of the intent
- [ ] At least two options were genuinely considered (not a rubber stamp)
- [ ] The chosen option's trade-offs are acceptable
- [ ] The flow diagram / sequence makes sense end-to-end
- [ ] The security section addresses auth, authorisation, and data sensitivity
- [ ] No existing API contracts are broken without explicit acknowledgment
- [ ] I am comfortable with this decision proceeding to implementation

**Decision:** `Approved` / `Rejected — [reason]` / `Needs revision — [what to revisit]`

---

## Notes

- `react-scripts` should be removed from `dependencies` (it is a runtime dep in `package.json`) and moved to devDependencies or removed entirely — it is not needed after this migration
- Vercel deployment: Vercel auto-detects Vite projects and sets `npm run build` + `dist` output directory automatically; the existing Vercel project settings may need `Output Directory` updated from `build` to `dist`
- Related ADRs: [ADR-004](./ADR-004-vitest-component-testing.md), [ADR-005](./ADR-005-playwright-cucumber-e2e.md), [ADR-006](./ADR-006-typescript-compiler-configuration.md), [ADR-007](./ADR-007-cra-typescript-integration.md)

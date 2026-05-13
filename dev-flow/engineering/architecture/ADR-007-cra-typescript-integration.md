# ADR-007: CRA + TypeScript Integration Approach

> **Status:** `Proposed`
> **Date:** 2026-05-13
> **Backlog item:** PBI-004
> **Decider:** Architecture Agent → 👤 Human approval required

---

## Context

PBI-004 migrates all frontend source files from JavaScript to TypeScript. The frontend uses Create React App (`react-scripts 5.0.1`). Three structurally different integration paths exist: use CRA's built-in TypeScript support (rename files in-place), migrate the build tool from CRA/Webpack to Vite now, or eject CRA.

ADR-004 (Vitest component testing) explicitly anticipated a future Vite migration and noted that the Vitest dev dependency added for PBI-006 "will become the main bundler in PBI-004." PBI-004 is that moment — the decision must now be made explicitly.

The trade-off is not trivial. CRA 5 is in maintenance mode (no new releases since 2022). Vite is the contemporary standard for React tooling and is the runtime environment Vitest already uses for component tests. However, PBI-004's stated scope is "no behaviour changes; no new features" — it is a migration, not a build-tool upgrade.

---

## Decision Drivers

- **Primary:** PBI-004's scope is behavioural equivalence — the app must build and run identically before and after
- **Primary:** Migration risk must be minimised; build-tool changes introduce a separate, significant failure mode
- **Secondary:** Vitest (ADR-004) already uses Vite as its transform engine — adding Vite as the app bundler would eliminate the "two transform paths" inconsistency
- **Secondary:** CRA 5 is unmaintained; any security patches to its Webpack dependency chain are unlikely to be backported
- **Constraints:** The project has one active increment (TypeScript migration) with test infrastructure (Vitest + Playwright/Cucumber, ADR-004 + ADR-005) depending on the current dev server behaviour

---

## Options Considered

### Option A: CRA built-in TypeScript support (rename `.js`/`.jsx` → `.ts`/`.tsx`, add `tsconfig.json`)

CRA 5 detects TypeScript source files by extension and automatically enables its Babel-based TS transform. No configuration changes to `react-scripts` are needed. The migration is: (1) rename each file, (2) add `tsconfig.json`, (3) add `@types/` packages, (4) fix type errors.

The existing `react-scripts start` and `react-scripts build` scripts continue to work unchanged. The Vitest and Playwright/Cucumber test infrastructure from ADR-004 and ADR-005 continues to work unchanged (they do not depend on CRA's build pipeline).

**Pros:**
- Smallest blast radius — only source file extensions and types change; zero build-pipeline risk
- `tsc --noEmit` can be run independently to verify the type-check requirement without touching the build
- All existing npm scripts (`start`, `build`) continue working
- Vitest config already handles `.tsx` — `vitest.config.js` will need only an extension update from `.js` to `.tsx`
- Consistent with PBI-004's stated scope: no behaviour changes

**Cons:**
- CRA 5 is unmaintained — this prolongs use of an unmaintained build tool
- CRA uses Babel for TS transpilation, not `tsc` — so compiler errors do not block the build (only `tsc --noEmit` does); this is a known CRA limitation
- The Vite migration remains a future task (PBI-005 or beyond), accruing deferred effort

**Security implications:**
- No change to the production build pipeline or output
- CRA's unmaintained Webpack dependency chain is an existing risk, not introduced by this decision

---

### Option B: Migrate build tool from CRA/Webpack to Vite as part of PBI-004

Replace `react-scripts` with Vite + `@vitejs/plugin-react`. Move from CRA's file-based entry point convention to a `vite.config.ts` with explicit entry. Update `package.json` scripts. The TypeScript migration and the build-tool migration are done simultaneously.

**Pros:**
- Resolves CRA's unmaintained status in one move
- Unifies the build and test transform paths (both using Vite/esbuild — consistent with ADR-004)
- Vite's build is significantly faster than CRA's Webpack build
- TypeScript errors block the Vite build by default (unlike CRA's Babel path)
- `@vitejs/plugin-react` is already a dev dependency (from ADR-004)

**Cons:**
- Expands PBI-004's scope significantly — two independent migration concerns are bundled
- CRA and Vite have different conventions: `public/index.html` vs. `index.html` at root, `process.env.REACT_APP_*` vs. `import.meta.env.VITE_*`, `ReactDOM.createRoot` entry point vs. Vite's module graph
- If either migration surfaces a problem, it is harder to isolate which change caused it
- The e2e test infrastructure (ADR-005) uses `start-server-and-test` with `npm start` → changing the dev server command requires updating `cucumber.js` config and the `test:e2e` script
- Risk of breaking the `@frontend` Playwright/Cucumber scenarios that were just established in PBI-006
- Vite does not inject `process.env.*` by default — `REACT_APP_API_URL` used in `world.ts` (ADR-005) would break without explicit Vite config

**Security implications:**
- Migrating away from unmaintained Webpack dependency chain is a security positive
- Risk of introducing build misconfiguration (e.g. incorrect `define` substitution for env vars) that could leak configuration into bundles

---

### Option C: Eject CRA

Run `react-scripts eject` to expose the Webpack config, then add TypeScript support manually.

**Pros:**
- Full control over the build pipeline

**Cons:**
- Irreversible — ejecting cannot be undone
- Produces ~50 generated config files that the team must now own and maintain
- Does not address the "move to Vite" desire — it locks the team into Webpack more deeply
- Explicitly out of scope for PBI-004 and prohibited by ADR-004 ("Avoid ejecting CRA")

**Security implications:**
- Increases maintenance burden of the Webpack security surface; direct opposite of what is wanted

---

## Decision

**We will use Option A: CRA built-in TypeScript support.**

Option C is eliminated — ejecting is irreversible and explicitly prohibited. The choice is between Option A (minimal scope, deferred Vite migration) and Option B (expanded scope, Vite migration now).

Option B's case is genuine: Vite migration is the right long-term move, and `@vitejs/plugin-react` is already present. However, PBI-004's invariant is "the app must build and run identically before and after." Bundling a build-tool migration into the same PR violates that invariant by introducing two independent sources of change. The Playwright/Cucumber e2e suite (ADR-005) and the `REACT_APP_API_URL` env var convention are particularly fragile to a CRA→Vite switch — they would require coordinated changes that are out of PBI-004's scope.

The correct sequencing is: PBI-004 completes the TypeScript migration on CRA, PBI-005 (frontend architecture) migrates the build tool to Vite as a separate, independently testable increment. This is lower risk and produces cleaner git history.

The Vite migration is **deferred to PBI-005**, which should treat it as an ADR-triggering decision at that time.

---

## Architecture / Flow Diagram

```
PBI-004 (this decision)
├── Rename src/*.js   → src/*.ts
│   Rename src/*.jsx  → src/*.tsx  (none currently — CRA convention is .js for JSX)
├── Add tsconfig.json  (ADR-006)
├── Add @types/react, @types/react-dom, @types/react-kofi-button  (ADR-008)
└── Fix strict-mode type errors in all nine source files

Build pipeline (unchanged):
  npm start  →  react-scripts start  →  Webpack dev server (port 3000)
  npm build  →  react-scripts build  →  /build output bundle

Type check (new, explicit):
  npx tsc --noEmit  →  0 errors required (feature file requirement)

Test pipeline (unchanged):
  npm test          →  vitest run (ADR-004)
  npm run test:e2e  →  start-server-and-test + cucumber-js (ADR-005)
```

---

## Consequences

### What becomes easier
- PBI-005 can migrate from CRA to Vite as a clean, isolated increment with a clear before/after
- The TypeScript migration PR has a single failure mode (type errors) rather than two (type errors + build-tool differences)
- CRA's Babel TS transform handles edge cases (e.g. decorators, const enums) without requiring additional Vite plugins

### What becomes harder or riskier
- CRA's unmaintained status continues for another increment — Webpack dependency chain is not upgraded
- CRA uses Babel to strip types rather than type-check them — build errors are not type errors; `tsc --noEmit` must be run separately for the feature file requirement to be satisfied
- The `vitest.config.js` currently uses a custom esbuild pre-enforce plugin for `.js` JSX — after PBI-004 renames files to `.tsx`, this workaround may be replaceable with the standard `@vitejs/plugin-react`; this is a cleanup opportunity but not a blocker

### Impact on existing system
- **API contracts:** No
- **Database migration:** No
- **Auth/authorisation behaviour:** No
- **New external dependencies:** Yes — `@types/` packages (see ADR-008); `tsconfig.json` (new file, not a runtime dependency)

---

## Security Considerations

- **Authentication/Authorisation:** Not applicable — this decision concerns the build pipeline, not runtime auth
- **Data sensitivity:** No change to data handled by the application
- **Attack surface:** No new endpoints, integrations, or runtime behaviour. CRA's build output is unchanged
- **Threat mitigations:** None introduced. The CRA/Webpack unmaintained-dependency risk is existing and accepted until PBI-005

---

## Acceptance Scenarios Affected

- `PBI-004-frontend-typescript-migration.feature` — Scenario: "Application builds successfully for production"
- `PBI-004-frontend-typescript-migration.feature` — All `@regression @frontend` scenarios (app behaviour must be identical)

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

- CRA 5 TypeScript support: renaming a file to `.tsx` is sufficient; no `react-scripts eject` or additional plugins needed
- The Vite migration (deferred to PBI-005) will need its own ADR covering: `vite.config.ts`, `index.html` relocation, `REACT_APP_*` → `VITE_*` env var rename, and `public/` path handling
- Related ADRs: [ADR-004](./ADR-004-vitest-component-testing.md), [ADR-005](./ADR-005-playwright-cucumber-e2e.md), [ADR-006](./ADR-006-typescript-compiler-configuration.md), [ADR-008](./ADR-008-type-strategy-third-party-deps.md)

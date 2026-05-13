# ADR-004: Vitest + React Testing Library for Frontend Component Testing

> **Status:** `Proposed`
> **Date:** 2026-05-13
> **Backlog item:** PBI-006
> **Decider:** Architecture Agent → 👤 Human approval required

---

## Context

PBI-006 requires a runnable component test suite for the frontend. The feature file explicitly names Vitest + React Testing Library as the required tools. No frontend test infrastructure exists today.

The frontend uses Create React App (`react-scripts 5.0.1`), which bundles Jest as its test runner. Adding Vitest means introducing a second test runner that operates outside CRA's managed pipeline. Vitest is typically paired with Vite as the build tool; the frontend currently uses CRA's Webpack-based build. PBI-004 (TypeScript migration, future) is likely to move the build to Vite — Vitest's natural home. Setting up Vitest now creates infrastructure that will remain correct before and after that migration.

The frontend source files are `.js` (JavaScript + JSX). Component tests are therefore also `.js` for now; they will be `.tsx` after PBI-004.

---

## Decision Drivers

- **Primary:** The feature file mandates Vitest — this is not a free choice
- **Primary:** Tests must run with `npm test` (or a documented alternative) in CI
- **Secondary:** Avoid ejecting CRA — the build must continue to work with `react-scripts`
- **Secondary:** Vitest setup should survive the PBI-004 Vite migration without rewiring
- **Constraints:** Frontend is currently JavaScript; the test setup must handle JSX in `.js` files

---

## Options Considered

### Option A: Vitest with jsdom, standalone (does not touch `react-scripts`)

Add Vitest, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`, and `vite` as dev dependencies. Provide a `vitest.config.js` that configures jsdom as the test environment and uses `@vitejs/plugin-react` for JSX transformation. Run tests via `vitest run` (a separate npm script from `react-scripts start/build`). CRA's build pipeline is untouched.

**Pros:**
- Does not require ejecting CRA or modifying `react-scripts` config
- Vitest config will be directly reused when the project migrates from CRA to Vite (PBI-004 forward)
- Vitest is fast (esbuild-powered transformation)
- `@testing-library/react` is the React Testing Library standard — well-supported, well-documented

**Cons:**
- Adds `vite` as a dev dependency solely to drive Vitest (Vite is not yet the app bundler)
- JSX in `.js` files requires explicit plugin configuration

**Security implications:**
- Dev-only dependencies; zero production footprint

---

### Option B: Jest via `react-scripts test` (no new runner)

Use the Jest runner already bundled in `react-scripts`. Add `@testing-library/react` for component tests.

**Pros:**
- No new dependencies for the test runner itself
- Already integrated with CRA's toolchain

**Cons:**
- Directly contradicts the feature file requirement ("Vitest + React Testing Library")
- CRA-bundled Jest is locked to CRA's version and config — cannot be customised without ejecting
- Creates test infrastructure that will NOT survive the PBI-004 migration (CRA Jest config is discarded when CRA is removed)
- No path to Vitest without re-doing the infrastructure work

**Security implications:** Same as Option A.

---

### Option C: Jest configured independently (outside CRA)

Eject CRA or add a separate `jest.config.js` with Babel, replacing the built-in Jest.

**Pros:**
- Full Jest configuration control

**Cons:**
- Ejecting CRA is irreversible and outside the scope of this PBI
- Same future migration cost as Option B — Jest must be replaced when moving to Vite
- Still contradicts the feature file requirement

**Security implications:** Same as Option A.

---

## Decision

**We will use Option A: Vitest with jsdom, standalone.**

Option B is eliminated by the feature file requirement. Option C would require ejecting CRA (out of scope) and still contradicts the feature file. Option A is the correct choice: it satisfies the feature requirement, does not touch the production build pipeline, and produces test infrastructure that will survive the PBI-004 Vite migration without rewiring.

The `vite` dev dependency added here is accepted overhead. It will become the main bundler in PBI-004, so it is not wasted.

---

## Architecture / Flow Diagram

```
npm test
    │
    └── vitest run (vitest.config.js)
           │
           ├── @vitejs/plugin-react  ← JSX transformation for .js files
           ├── jsdom                 ← DOM environment (window, document, etc.)
           ├── @testing-library/react  ← render(), screen, fireEvent
           ├── @testing-library/user-event  ← userEvent.type(), userEvent.click()
           └── @testing-library/jest-dom  ← toBeInTheDocument(), toHaveValue(), etc.
                  │
                  └── src/__tests__/
                         ├── SearchBar.test.js  ← PBI-006 stubs; full assertions in PBI-005
                         └── ItemList.test.js   ← PBI-006 stubs; full assertions in PBI-005
```

### Component test lifecycle (per test)

1. Vitest picks up `*.test.js` files via glob pattern
2. `@vitejs/plugin-react` transforms JSX at test time (not build time)
3. jsdom provides the browser-like DOM environment
4. Test file imports the component under test and renders it with `render()`
5. Assertions use `screen.*` queries and `@testing-library/jest-dom` matchers

---

## Consequences

### What becomes easier
- Component tests can be added to any PBI without further tooling setup
- Vitest's jsdom mode runs headlessly — no browser binary needed for component tests
- Tests run fast (sub-second per file for unit-level component tests)

### What becomes harder or riskier
- Two test commands now exist: `npm test` (Vitest) and `npm run test:e2e` (Playwright/Cucumber)
- `vitest.config.js` and `react-scripts` must not conflict — ensured by using separate `scripts` entries in `package.json`

### Impact on existing system
- **API contracts:** No
- **Database migration:** No
- **Auth/authorisation behaviour:** No
- **New external dependencies:** Yes — `vitest`, `vite`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom` (all `devDependencies`)

---

## Security Considerations

- **Authentication/Authorisation:** Not applicable — component tests run in an isolated jsdom environment with no network access
- **Data sensitivity:** Component tests use mock props; no real data
- **Attack surface:** Test-only code; zero production footprint
- **Threat mitigations:** All new packages are `devDependencies` and are excluded from production bundles

---

## Acceptance Scenarios Affected

- `PBI-006-frontend-test-infrastructure.feature` — all `@smoke @frontend` and `@regression @frontend` component scenarios

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

- Vitest 3.x is the current stable release (3.1.x at time of writing)
- `@testing-library/react` 16.x supports React 18
- `@vitejs/plugin-react` uses Babel-based JSX transformation; the project has no `babel.config.js` so defaults are used (React automatic JSX runtime)
- Related ADRs: [ADR-005](./ADR-005-playwright-cucumber-e2e.md)

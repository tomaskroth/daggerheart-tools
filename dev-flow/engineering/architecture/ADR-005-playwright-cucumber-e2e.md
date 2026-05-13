# ADR-005: Playwright + Cucumber JS for Frontend E2E Testing

> **Status:** `Proposed`
> **Date:** 2026-05-13
> **Backlog item:** PBI-006
> **Decider:** Architecture Agent → 👤 Human approval required

---

## Context

PBI-006 requires a runnable end-to-end acceptance test suite for the frontend. The feature file names Playwright + Cucumber JS as the required tools. The dev flow produces `.feature` files in Gherkin; the e2e layer must consume them.

Two structural constraints shape this decision:

1. **Backend dependency**: The e2e scenario "Full search flow works end-to-end in the browser" requires the app to be running and to make API calls. The frontend's `ServerStatusGate` component polls the backend before rendering the app. The backend URL is hardcoded in `index.js` to the Render production deployment (`https://daggerheart-tools-4v1t.onrender.com/api`). For e2e tests to be self-contained and CI-stable, API calls must be intercepted and mocked at the browser network layer.

2. **TypeScript step definitions**: The coding guidelines mandate TypeScript for all new frontend code. E2e step definitions are new frontend code and must be `.ts`, even though the app itself is currently JavaScript. This requires `ts-node` for Cucumber JS to execute TypeScript step files.

---

## Decision Drivers

- **Primary:** Feature file mandates Playwright + Cucumber JS — not a free choice
- **Primary:** E2e tests must run in CI with no manual setup ("no manual setup" from the feature file)
- **Primary:** Must not require the backend to be running (production URL hardcoded in `index.js`)
- **Secondary:** Step definitions must be TypeScript (coding guidelines)
- **Secondary:** Page Object pattern required (coding guidelines: "no raw selectors in step definitions")
- **Constraints:** CRA dev server starts on port 3000; Playwright must wait for it before running

---

## Options Considered

### Option A: Cucumber JS + Playwright (browser automation), API mocked via `page.route()`

Use `@cucumber/cucumber` as the BDD runner. Use `playwright` (not `@playwright/test`) as the browser automation library. Step definitions are TypeScript, executed via `ts-node`. A `CustomWorld` class holds the browser and page instances across steps. Cucumber `BeforeAll`/`AfterAll` hooks manage browser lifecycle; `Before`/`After` hooks manage per-scenario page instances.

Before navigating to the app, step definitions register `page.route()` intercepts for all API endpoints (`**/api/**`). This prevents real network calls and returns deterministic mock responses, making tests independent of the backend.

The CRA dev server is started by `start-server-and-test` in the e2e npm script, which:
1. Runs `npm start`
2. Waits for `http://localhost:3000` to respond
3. Runs `cucumber-js`
4. Terminates the dev server on exit

**Pros:**
- Direct Gherkin feature file consumption — satisfies the feature requirement
- `page.route()` API mocking is idiomatic Playwright — well-supported, intercepts any URL including external ones
- `ServerStatusGate` and `App` search calls are both mocked, making the full flow testable without a backend
- Page Object pattern is natural and enforced at design time
- TypeScript step defs with `ts-node` is standard Cucumber JS practice
- `start-server-and-test` is a small, stable utility for this exact pattern

**Cons:**
- Three new tools (`@cucumber/cucumber`, `playwright`, `start-server-and-test`) plus TypeScript tooling (`ts-node`, `typescript`)
- Cucumber JS + Playwright integration is manual (no official scaffold) — setup is more involved than Playwright Test standalone

**Security implications:**
- All dev dependencies; zero production footprint
- `page.route()` intercepts are per-test and do not persist beyond the test session

---

### Option B: Playwright Test standalone (no Cucumber JS)

Use `@playwright/test` directly. Write tests as `.spec.ts` files using Playwright's built-in test runner.

**Pros:**
- Official Playwright toolchain — best-supported option
- `webServer` config option natively starts/stops the CRA dev server
- TypeScript supported natively

**Cons:**
- Cannot consume `.feature` files — disconnects from the Gherkin-based dev flow
- Does not satisfy the feature file requirement ("Cucumber JS test runner is configured with Playwright")
- Future PBIs that write step definitions would have no runner

**Security implications:** Same as Option A.

---

### Option C: Cypress + Cucumber JS

Use Cypress as the browser automation tool with `@badeball/cypress-cucumber-preprocessor` for Gherkin support.

**Pros:**
- Mature Cucumber integration with Cypress
- GUI test runner for local debugging

**Cons:**
- Cypress uses Chromium only by default; Playwright supports multiple browsers
- Heavier dependency than Playwright (Cypress bundles its own Electron-based runner)
- The `@badeball/cypress-cucumber-preprocessor` is a third-party plugin with additional configuration overhead
- Contradicts the feature file requirement ("Playwright")

**Security implications:** Same as Option A.

---

## Decision

**We will use Option A: Cucumber JS + Playwright with `page.route()` API mocking.**

Options B and C are eliminated by the feature file requirement. Option A satisfies all constraints: Gherkin feature file consumption, TypeScript step defs, Page Object pattern, and self-contained CI execution via `start-server-and-test` and `page.route()` mocking.

The `page.route()` API mocking approach is the key enabling decision. It makes the e2e suite independent of the backend and stable in CI, at the cost of not testing the real network path. That trade-off is acceptable for PBI-006's scope: the goal is to establish the test runner infrastructure, not to validate end-to-end API integration (which is covered by the Cucumber backend tests from PBI-003).

---

## Architecture / Flow Diagram

```
npm run test:e2e
    │
    └── start-server-and-test
           ├── npm start  ─────→  CRA dev server on :3000
           ├── wait-on http://localhost:3000
           └── cucumber-js  (with ts-node)
                   │
                   ├── reads  dev-flow/product/*.feature  (filter: @frontend)
                   └── runs   e2e/steps/*.ts  +  e2e/support/world.ts
                          │
                          ├── BeforeAll: browser = await chromium.launch()
                          ├── Before: page = await browser.newPage()
                          │           register page.route() intercepts
                          │
                          ├── Steps
                          │     ├── e2e/pages/AppPage.ts  ← Page Object
                          │     │      • navigate()
                          │     │      • typeInSearchBar(text)
                          │     │      • submitSearch()
                          │     │      • getResultCards()
                          │     └── Step defs call AppPage methods only
                          │
                          ├── After: await page.close()
                          └── AfterAll: await browser.close()
```

### API mock routes (registered in `Before` hook)

| Route pattern | Method | Mock response |
|---|---|---|
| `**/api` | GET | `{}` — 200 OK (satisfies `ServerStatusGate`) |
| `**/api/srd/types` | GET | `[]` — empty type list |
| `**/api/search` | POST | `{ items: [{ id: "1", slug: "guardian-warrior", title: "Guardian Warrior", type: "ABILITIES", excerpt: "" }], total: 1 }` |

### Page Object

`AppPage` encapsulates all Playwright selectors. Step definitions call `AppPage` methods only — no raw `page.$()` or `page.locator()` calls in step files.

---

## Consequences

### What becomes easier
- Any future `@frontend` scenario can add step definitions to the established Cucumber JS context
- The Page Object layer shields step defs from selector changes — PBI-005 can refactor the DOM without touching step def files
- `start-server-and-test` means CI only needs `npm run test:e2e` — no manual server management

### What becomes harder or riskier
- The `page.route()` API mocking means e2e tests do not validate the real API contract — that is intentional and accepted for PBI-006
- TypeScript step defs require `ts-node` and `typescript` dev dependencies; type errors in step defs will fail the test run
- `start-server-and-test` adds wall-clock time to CI (CRA dev server takes 10–30s to start)

### Impact on existing system
- **API contracts:** No
- **Database migration:** No
- **Auth/authorisation behaviour:** No
- **New external dependencies:** Yes — `@cucumber/cucumber`, `playwright`, `ts-node`, `typescript`, `start-server-and-test`, `@types/node` (all `devDependencies`)

---

## Security Considerations

- **Authentication/Authorisation:** Not applicable — e2e tests run against the local dev server with a mocked backend
- **Data sensitivity:** Mock responses contain only synthetic data (no real SRD content)
- **Attack surface:** No new production endpoints. `page.route()` intercepts are test-only and do not modify the production application
- **Threat mitigations:** All packages are `devDependencies`. The hardcoded production URL (`https://daggerheart-tools-4v1t.onrender.com/api`) is intercepted in tests — it is not contacted during the test run

---

## Acceptance Scenarios Affected

- `PBI-006-frontend-test-infrastructure.feature` — `@smoke @frontend` e2e scenario ("Full search flow works end-to-end in the browser")

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

- `@cucumber/cucumber` 11.x is the current stable release
- `playwright` 1.x is used (not `@playwright/test` — the standalone browser library, not the full test runner)
- `start-server-and-test` 2.x is a widely-used utility for this exact pattern
- Related ADRs: [ADR-004](./ADR-004-vitest-component-testing.md)
- Coding guidelines reference: "Page Objects used in Playwright steps (no raw selectors in step definitions)"

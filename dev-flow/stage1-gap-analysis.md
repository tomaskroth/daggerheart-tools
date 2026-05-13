# Stage 1 Gap Analysis — daggerheart-tools

**Date:** 2026-05-13
**Codebase:** daggerheart-tools (React frontend + Spring Boot Java backend)
**Assessed against:** dev-flow coding guidelines, architecture guidelines, testing strategy, security guidelines

---

## What the Product Is

A read-mostly compendium for the Daggerheart tabletop RPG — users browse and search the System Reference Document (SRD). The backend stores SRD content in H2 + Lucene and serves search/lookup endpoints. The frontend renders search results and item detail views. There are a small number of admin-only write operations (bulk upsert, reindex) that are not user-facing.

This context matters for the gap analysis: most security and architecture risk is concentrated in a few specific spots, not spread evenly across the codebase.

---

## Summary Verdict

The codebase is small and coherent — it does one thing and largely does it clearly. However, it has three gaps that would corrupt new work if left in place (**blockers**), and a set of structural gaps that should be addressed in a foundation increment before feature development begins.

| Area | Status | Notes |
|---|---|---|
| Architecture / layering | ⚠ Partial | No service layer; controllers own all logic |
| Code quality | ⚠ Partial | Good on some points, several violations |
| Test coverage | ❌ None | Zero tests exist anywhere |
| Security | ❌ Blockers | Open write endpoints; XSS risk; wildcard CORS |
| TypeScript | ❌ Missing | Frontend is plain JavaScript |

---

## Architecture Assessment

### What exists
The backend has a reasonable package structure: `web` (controllers), `model`, `repo`, `search`. Constructor injection is used correctly. `SrdItemRepository` is a clean Spring Data interface. `LuceneService` is well-scoped to search concerns.

### What's missing or wrong

**No service/domain layer.** `SrdController` calls both the repository and `LuceneService` directly, and applies business logic inline (default parameter values, null coalescing). There is nothing between the HTTP boundary and the data layer. Any new feature built on top of this will perpetuate the pattern.

**`ImportController` is misnamed and misplaced.** It is annotated `@Component` and uses `@PostConstruct` — it is a startup service, not a controller. Its name, package (`web`), and annotation tell three different stories. It contains import orchestration logic (repo + index coordination) that belongs in a service layer.

**Business logic in controller.** The `search` endpoint in `SrdController` constructs default `SearchDTO` values inline and passes parameters directly to `LuceneService`. These defaults are business decisions — they should be in a service, not a controller.

**Frontend has no layers at all.** `App.js` does everything: API calls, state management for all features, URL parsing, dark mode persistence, and rendering. There are no custom hooks, no service functions, and no feature modules. Components are flat and unorganised under `src/components/`.

**Frontend is plain JavaScript.** No TypeScript. The guidelines require TypeScript. This is a prerequisite for the flow to produce type-safe code alongside existing code.

---

## Code Quality Assessment

### What's good
- Java 21 used (records, text blocks available but not yet used)
- Constructor injection throughout the backend ✅
- `SrdItemRepository` is clean and minimal ✅
- Components are small and focused ✅
- No commented-out code ✅

### Violations

**Backend:**

- `pom.xml` has `groupId: com.example` — a placeholder left from project creation. Should be `com.dhsrd` or the real domain.
- `ImportController` uses `java.util.logging.Logger` directly. Spring Boot provides SLF4J/Logback — use that everywhere for consistent log formatting.
- `nz()` is a cryptic private method name in `LuceneService`. Rename to `nullSafe()` or `emptyIfNull()`.
- `SrdItem` uses verbose traditional getters/setters. With Java 21, this class is a candidate for a record or at minimum Lombok. Not a blocker, but worth noting.
- `@CrossOrigin(origins = "*")` is applied on `SrdController` **and** a global `WebConfig` is also configured — duplicated and inconsistent. One place only.
- No `@Valid` on any request body in any controller. Input validation is wired up (spring-boot-starter-validation is present) but never applied.
- `SearchDTO` defaults (`from = 0, size = 300, fuzzy = true`) are applied in the controller. These should be in a service or in the DTO itself with sensible defaults.

**Frontend:**

- `useEffect` in `App.js` that fetches `/srd/types` has an empty dependency array `[]` but depends on `serverUrl` — this is a stale closure bug. Should be `[serverUrl]`.
- `useEffect` that reacts to URL path (`location`) also has `[location]` — but `location` is assigned from `window.location.pathname` as a const at render time, not from a state or router hook. This effect will never re-run on navigation. `react-router-dom` is installed but not used.
- `typeIcons` object is duplicated identically in both `ItemDetail.js` and `AbilitiesCard.js`. Should be a shared constant.
- `typeIcons` in both files has a duplicate `weapons` key (defined twice in the same object literal) — a JavaScript bug where the second silently overwrites the first.
- All API calls are made directly in `App.js` with raw `fetch`. No abstraction, no error handling on failures beyond `console.error`.
- `react-scripts` (Create React App) is used. CRA is end-of-life. Not a blocker for the flow, but a migration to Vite should be planned.

---

## Test Coverage Assessment

**There are zero tests.** No test files, no test directory, no test dependencies in `pom.xml` (spring-boot-starter-test is absent). No jest/vitest configuration in `package.json`.

This is the largest single gap. The flow's Test Implementation Agent has nothing to work alongside, and the Independent Review Agent cannot pass a submission without test coverage.

What needs to exist before the flow can run:

- Backend: `src/test/` directory with JUnit 5 + Cucumber infrastructure (requires adding `spring-boot-starter-test` and Cucumber dependencies to `pom.xml`)
- Frontend: Vitest + React Testing Library configuration, Playwright + Cucumber JS for e2e

---

## Security Assessment

### Critical — must fix before new work begins

**[SEC-1] Unprotected admin endpoints.**
`POST /api/srd/_bulkUpsert` and `GET /api/srd/_reindex` are completely open — no authentication, no authorisation. Anyone who can reach the server can overwrite all SRD content or trigger a full reindex. There is no Spring Security configured at all.

These are the only "write" operations in the product. They should either be protected behind admin credentials, restricted to localhost/internal network, or — since they are used only at startup and tooling time — converted to a CLI/startup mechanism and removed as HTTP endpoints entirely.

**[SEC-2] `dangerouslySetInnerHTML` with database content.**
Both `ItemDetail.js` (line 38) and `AbilitiesCard.js` (line 52) render `item.content` directly into the DOM using `dangerouslySetInnerHTML`. The content comes from the database, which is populated via the open `bulkUpsert` endpoint. If that endpoint is exploited, arbitrary HTML/JavaScript can be injected into every user's browser.

This requires either: sanitising content server-side before storage, sanitising client-side before rendering (using a library like DOMPurify), or both.

### Warnings — address in foundation increment

**[SEC-3] Wildcard CORS in two places.**
`@CrossOrigin(origins = "*")` on `SrdController` plus `allowedOrigins("*")` in `WebConfig`. This is intentional for a public read-only API, but should be a conscious single-place decision documented in an ADR. Also, the `DELETE` and `PUT` methods are allowed globally but no such endpoints exist — unnecessary surface.

**[SEC-4] No input validation applied.**
`spring-boot-starter-validation` is declared as a dependency but `@Valid` is never used on any controller method parameter. Malformed JSON payloads or out-of-bounds values are not rejected at the boundary. Low risk given the current read-mostly nature, but required by the guidelines.

**[SEC-5] No security headers.**
No Content-Security-Policy, X-Frame-Options, or X-Content-Type-Options headers are configured. For a tool that renders HTML content from the database, CSP is particularly relevant given [SEC-2].

---

## Foundation Increment Required?

**Yes.** The following gaps would directly corrupt new work if left in place:

1. No service layer — implementation agents would write new business logic into controllers, deepening the violation.
2. No TypeScript — agents would write JavaScript, and mixing typed/untyped code as TypeScript is added later is painful.
3. No test infrastructure — agents cannot produce tests without a working test setup.
4. Open write endpoints + `dangerouslySetInnerHTML` (SEC-1, SEC-2) — these are security blockers.

A foundation increment should address these before any product feature work begins.

---

## Proposed Foundation Increment

**Goal:** Establish the structural patterns and safety baseline that the dev flow depends on, without changing any user-visible behaviour.

### Backend tasks

| Item | Type | Priority |
|---|---|---|
| Add Spring Security; restrict bulkUpsert and reindex to localhost or remove as HTTP endpoints | Security blocker | Critical |
| Introduce `SrdService` — extract search defaults and orchestration logic from `SrdController` | Architecture | High |
| Convert `ImportController` to `SrdImportService` (service, not controller) | Architecture | High |
| Add test infrastructure: `spring-boot-starter-test`, Cucumber + JUnit 5 dependencies | Testing | High |
| Write initial Cucumber step definitions and JUnit unit tests for `SrdService` | Testing | High |
| Replace `java.util.logging` with SLF4J in `ImportController` | Quality | Medium |
| Fix `groupId` in `pom.xml` from `com.example` to `com.dhsrd` | Quality | Low |
| Apply `@Valid` to `bulkUpsert` and `search` request bodies | Quality | Medium |
| Consolidate CORS config to `WebConfig` only; remove `@CrossOrigin` from controller | Security | Medium |
| Add security headers (CSP, X-Frame-Options) via Spring Security config | Security | Medium |

### Frontend tasks

| Item | Type | Priority |
|---|---|---|
| Sanitise `item.content` before `dangerouslySetInnerHTML` using DOMPurify | Security blocker | Critical |
| Migrate from plain JavaScript to TypeScript | Architecture | High |
| Extract API calls to a `services/srdApi.ts` module | Architecture | High |
| Extract data fetching logic from `App.js` into custom hooks (`useSearch`, `useTypes`) | Architecture | High |
| Set up Vitest + React Testing Library | Testing | High |
| Set up Playwright + Cucumber JS | Testing | High |
| Fix `useEffect` stale closure bug (missing `serverUrl` dependency) | Quality | High |
| Fix URL/navigation — use `react-router-dom` properly instead of `window.location.pathname` | Quality | High |
| Extract `typeIcons` to a shared constant; remove duplicate key bug | Quality | Medium |
| Migrate from CRA (`react-scripts`) to Vite | Architecture | Medium |

---

## What Can Wait (Incremental Migration)

These gaps do not block the flow and can be addressed opportunistically as new features are built:

- `SrdItem` entity refactoring to use Java records or Lombok
- `nz()` method rename
- Removing unused CORS methods (DELETE, PUT)
- Expanding test coverage beyond what the foundation increment establishes

---

## Recommended Next Step

Once you've reviewed this report, the action is:

> "Start a new increment: Foundation — establish the architectural patterns, test infrastructure, and security baseline required for the dev flow. The goal is to not change any user-visible behaviour; only restructure and secure the internals."

The Breakdown Agent will split this into PBIs, the Acceptance Scenario Agent will write structural scenarios (the layer boundary exists, the endpoints are protected, the test suite runs), and the flow proceeds from there.

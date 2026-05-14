# ADR-008: Type Strategy for Third-Party Dependencies

> **Status:** `Proposed`
> **Date:** 2026-05-13
> **Backlog item:** PBI-004
> **Decider:** Architecture Agent → 👤 Human approval required

---

## Context

PBI-004 migrates the frontend to TypeScript. With `strict: true` (ADR-006) and `noImplicitAny` active, every imported symbol must have a type declaration. The application has five runtime dependencies, each with a different types story:

| Package | Bundled types? | `@types/` package exists? | Action needed |
|---|---|---|---|
| `react` | No | Yes — `@types/react@19.x` | Install `@types/react` |
| `react-dom` | No | Yes — `@types/react-dom@19.x` | Install `@types/react-dom` |
| `react-router-dom` | Yes (`dist/index.d.ts`) | Not needed | None |
| `@vercel/analytics` | Yes (`dist/index.d.ts`) | Not needed | None |
| `react-kofi-button` | No | Yes — `@types/react-kofi-button@0.1.0` | Install `@types/react-kofi-button` |

The decision here is not "do we need types?" — with `strict: true`, all three untyped packages will produce `Could not find a declaration file` errors. The decision is **how to provide those types**: install the community `@types/` packages, write local `declare module` stubs, or use a mixed strategy.

A secondary concern is version pinning: `@types/react` and `@types/react-dom` must be compatible with the installed React version (18.x) and with each other. The `@types/react@19.x` packages add React 19 types; using them with React 18 requires care.

---

## Decision Drivers

- **Primary:** All three untyped packages must be resolvable without `any` under `strict: true`
- **Primary:** `@types/react` and `@types/react-dom` must be version-compatible with React 18.x (installed) and with each other
- **Secondary:** Minimise maintenance burden — `declare module` stubs require manual updates when the underlying package's API changes
- **Secondary:** `@types/react-kofi-button` is a community-maintained package at version `0.1.0` — its quality and maintenance status must be assessed
- **Constraints:** `typescript` is already a `devDependency` (from ADR-005); `@types/node` is already installed

---

## Options Considered

### Option A: Install official `@types/` packages for all three untyped dependencies

Install `@types/react`, `@types/react-dom`, and `@types/react-kofi-button` as dev dependencies.

Pin `@types/react` and `@types/react-dom` to `^18.x` to match the installed React version and avoid React 19 type surface bleeding into a React 18 codebase.

`@types/react-kofi-button@0.1.0` declares a single named export `KofiButton` with a props interface. Inspecting the package confirms it covers the usage in `App.js` (`<KofiButton username='...' label='...' backgroundColor='...' className='...'>`).

**Pros:**
- Standard pattern — `@types/` packages are the established TypeScript mechanism for third-party types
- Types are maintained by the DefinitelyTyped community; security patches and API updates are handled externally
- `skipLibCheck: true` in `tsconfig.json` (ADR-006) ensures that `@types/` declaration file errors do not block the build
- Zero code to write — no local files to maintain

**Cons:**
- `@types/react@18.x` and the latest `@types/react@19.x` coexist on npm; care is needed to pin to 18.x
- `@types/react-kofi-button@0.1.0` is a low-version community package — if the library's API changes, the types may lag
- Adds three dev dependencies to `package.json`

**Security implications:**
- Dev-only dependencies; zero production footprint
- `@types/` packages are `devDependencies` excluded from the production bundle
- DefinitelyTyped packages undergo basic review, but are community-maintained — same supply-chain risk profile as any npm package

---

### Option B: Write local `declare module` stubs for all three untyped packages

Create a `src/types/declarations.d.ts` file with `declare module 'react'`, `declare module 'react-dom/client'`, and `declare module 'react-kofi-button'` stubs that type only the specific exports used by the application.

**Pros:**
- No new npm dependencies
- Types are scoped exactly to what the application uses — no surface area from unused React APIs
- No version mismatch risk between `@types/react` and the installed React version

**Cons:**
- Significant upfront effort: `@types/react` has hundreds of type declarations; hand-writing even a partial stub for `useState`, `useEffect`, `ReactDOM.createRoot`, `JSX.Element`, `ReactNode`, and all JSX intrinsics is not practical
- Stubs become stale as the application uses more React APIs in future PBIs
- Defeats the purpose of TypeScript — React's own type surface is complex and the community `@types/react` package encodes years of correctness work
- For `react-kofi-button`, a local stub is the fallback if `@types/react-kofi-button` proves inadequate, but it should not be the first choice

**Security implications:**
- Same as Option A — dev-only; no production footprint

---

### Option C: Mixed strategy — `@types/` for React ecosystem, local stub for `react-kofi-button`

Install `@types/react@18.x` and `@types/react-dom@18.x`. For `react-kofi-button`, write a minimal local stub (`declare module 'react-kofi-button' { ... }`) rather than relying on the low-version community package.

**Pros:**
- React types are too complex to stub locally — Option A's approach is correct for React
- Insulates the codebase from quality issues in `@types/react-kofi-button`
- The stub for `KofiButton` is trivial: one named export with four string props

**Cons:**
- Local stub must be updated manually if `react-kofi-button` changes its API
- Additional file to maintain in the repository

**Security implications:**
- Same as Options A and B

---

## Decision

**We will use Option A: install official `@types/` packages for all three untyped dependencies, with `@types/react` and `@types/react-dom` pinned to `^18.3`.**

Option B is impractical for React — hand-writing React's type surface is unjustifiable when `@types/react` exists and is actively maintained. Option C is reasonable but adds a local file to maintain for a package whose community type package is small and reviewable.

`@types/react-kofi-button@0.1.0` covers exactly the `KofiButton` export with the four props used in `App.js`. The `skipLibCheck: true` in `tsconfig.json` ensures that even if the declaration file has internal issues, it will not block the build. If the package proves inadequate during implementation, the fallback is to switch to a local stub per Option C — this is a low-risk decision.

**Packages to install:**

```
npm install --save-dev @types/react@^18.3 @types/react-dom@^18.3 @types/react-kofi-button
```

---

## Architecture / Flow Diagram

```
tsc --noEmit
    │
    └── resolves third-party types:
           │
           ├── import React from 'react'
           │       └── node_modules/@types/react/index.d.ts  (^18.3)
           │
           ├── import ReactDOM from 'react-dom/client'
           │       └── node_modules/@types/react-dom/client.d.ts  (^18.3)
           │
           ├── import { useLocation } from 'react-router-dom'
           │       └── node_modules/react-router-dom/dist/index.d.ts  (bundled)
           │
           ├── import { Analytics } from "@vercel/analytics/react"
           │       └── node_modules/@vercel/analytics/dist/index.d.ts  (bundled)
           │
           └── import { KofiButton } from "react-kofi-button"
                   └── node_modules/@types/react-kofi-button/index.d.ts  (0.1.0)
```

---

## Consequences

### What becomes easier
- All third-party imports are typed — IDEs provide autocomplete and go-to-definition for React APIs
- Future PBIs adding new React APIs (hooks, context, refs) are already covered by `@types/react`

### What becomes harder or riskier
- `@types/react@18.x` vs. `@types/react@19.x` version discipline must be maintained — if someone runs `npm update` without specifying a version range, a `@types/react@19.x` install could introduce React 19 type signatures against a React 18 runtime
- `@types/react-kofi-button` is a low-adoption community package — its maintenance status should be reviewed if `react-kofi-button` is upgraded

### Impact on existing system
- **API contracts:** No
- **Database migration:** No
- **Auth/authorisation behaviour:** No
- **New external dependencies:** Yes — `@types/react`, `@types/react-dom`, `@types/react-kofi-button` (all `devDependencies`)

---

## Security Considerations

- **Authentication/Authorisation:** Not applicable
- **Data sensitivity:** Not applicable — type declarations carry no runtime data
- **Attack surface:** No new runtime code; `devDependencies` are excluded from production bundles
- **Threat mitigations:** `skipLibCheck: true` ensures that a malformed declaration file cannot block production builds. All three packages are `devDependencies` and are stripped at bundle time by CRA's Webpack config

---

## Acceptance Scenarios Affected

- `PBI-004-frontend-typescript-migration.feature` — Scenario: "TypeScript compilation passes with zero errors" (all third-party imports must resolve without `any`)

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

- `@types/react@18.3.x` is the last 18.x release on DefinitelyTyped as of the date of this ADR; `^18.3` will pick it up
- `react-router-dom` v7 ships bundled types — confirmed via `npm info react-router-dom` showing `types: ./dist/index.d.ts`
- `@vercel/analytics` ships bundled types — confirmed via `npm info @vercel/analytics` showing `types: ./dist/index.d.ts`
- If the Vite migration (PBI-005, per ADR-007) changes how env vars or entry points work, `@types/node` (already installed) and potentially `vite/client` types will be needed — this is out of scope for PBI-004
- Related ADRs: [ADR-006](./ADR-006-typescript-compiler-configuration.md), [ADR-007](./ADR-007-cra-typescript-integration.md)

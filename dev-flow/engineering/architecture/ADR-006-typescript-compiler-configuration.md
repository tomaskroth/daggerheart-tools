# ADR-006: TypeScript Compiler Configuration (tsconfig.json)

> **Status:** `Proposed`
> **Date:** 2026-05-13
> **Backlog item:** PBI-004
> **Decider:** Architecture Agent → 👤 Human approval required

---

## Context

PBI-004 migrates all frontend source files from JavaScript to TypeScript. The migration requires a `tsconfig.json`. The choices made in that file — particularly around strictness, compilation target, and module resolution — are consequential and expensive to reverse:

- Enabling `strict: true` on a large existing codebase requires fixing all type errors at migration time; it cannot be layered in silently afterwards without a second migration pass.
- Disabling strict checks now and enabling them later means accepting two migration efforts: one to rename files, one to type-check rigorously.
- `target`, `lib`, and `moduleResolution` choices affect what TypeScript accepts as valid and how it resolves third-party types.

The frontend uses Create React App (`react-scripts 5.0.1`). CRA has its own embedded `tsconfig` defaults that are applied on top of any user-provided `tsconfig.json`. The effective compiler options are the merge of both. CRA enforces a minimum set (e.g. `jsx: react-jsx`, `moduleResolution: node`) and silently overrides any options it manages.

The feature file requires `tsc --noEmit` to exit with code 0 and report no type errors.

---

## Decision Drivers

- **Primary:** The build must pass `tsc --noEmit` with zero errors post-migration (feature file requirement)
- **Primary:** TypeScript strictness level is a foundational choice — changing it later requires revisiting every migrated file
- **Primary:** Must not require ejecting CRA; options managed by CRA must be consistent with CRA's requirements
- **Secondary:** The Vitest config (ADR-004) anticipates a future Vite migration — `tsconfig` choices should survive that move
- **Constraints:** CRA 5 manages `jsx`, `moduleResolution`, `esModuleInterop`, `allowSyntheticDefaultImports`, and `skipLibCheck` — these must not conflict

---

## Options Considered

### Option A: Strict mode enabled from day one (`"strict": true`)

Enable the full TypeScript `strict` flag umbrella from the initial migration. This activates: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictPropertyInitialization`, `noImplicitThis`, and `alwaysStrict`. All type errors surfaced by strict mode must be resolved before the migration is considered done.

**Pros:**
- One migration effort — files are fully typed when the PR lands
- `strictNullChecks` in particular prevents a whole class of runtime errors (accessing properties on potentially-null values)
- Consistent with the coding guidelines' "TypeScript only" rule: if new code must be `.ts`, it should be properly typed
- Industry standard starting point; all documentation and examples assume strict mode
- Easier for the independent review agent and future reviewers — no need to wonder whether a type assertion is hiding a real problem

**Cons:**
- More work at migration time: every implicit `any`, every nullable access, every untyped prop must be resolved
- Some current code has patterns that strict mode will reject (e.g. `item.type.toLowerCase()` on a loosely-typed `item` prop in `ItemCard` and `ItemDetail`; the `use` import in `App.js` that is unused)
- Potentially blocks the migration PR if a difficult type is hard to express

**Security implications:**
- `strictNullChecks` catches null-dereference patterns at compile time — a net security positive for rendering user-supplied HTML fields

---

### Option B: Non-strict mode (`"strict": false`, add targeted flags gradually)

Start with strict mode disabled. Enable individual strict flags incrementally in later PBIs as the codebase is touched.

**Pros:**
- Minimal additional work at migration time — most files rename cleanly with no errors
- Unblocks PBI-004 quickly

**Cons:**
- Deferred cost, not eliminated: later PBIs that touch typed files will need to fix strict violations in the same edit
- `strictNullChecks: false` means TypeScript will not catch `undefined` access on component props — the type system provides false confidence
- The coding guidelines require TypeScript; non-strict TypeScript with implicit `any` is barely distinguishable from JavaScript in terms of safety
- Every PBI after PBI-004 that adds a new component will silently inherit the "non-strict" baseline, making a future `strict: true` migration progressively harder
- Creates a divergence between new code (which reviewers expect to be strict) and migrated code (which is not)

**Security implications:**
- Weaker than Option A — `strictNullChecks: false` misses null-dereference patterns that affect rendered output

---

### Option C: Strict mode enabled, with `// @ts-nocheck` escape hatches per-file

Enable `strict: true` globally, but suppress errors in files that are hard to type quickly using `// @ts-nocheck` at the top of the file. Files are migrated incrementally to full strictness.

**Pros:**
- Global strict baseline from day one
- Difficult files can land without blocking the migration

**Cons:**
- `// @ts-nocheck` silently disables all type checking in the file — worse than `strict: false` for those files
- Creates a two-tier codebase with no clear remediation schedule
- Reviewers cannot tell whether a `@ts-nocheck` file is unsafe or simply not yet migrated
- Violates the intent of strict mode without the honesty of Option B

**Security implications:**
- Same weakness as Option B for annotated files, plus the opacity of a file-level suppression

---

## Decision

**We will use Option A: strict mode enabled from day one.**

Option B defers rather than eliminates cost, and produces a type system baseline that provides false confidence. Option C adds opacity on top of Option B's weaknesses. Option A is the higher-effort choice at migration time, but it is the only option that produces a correctly-typed codebase.

The current source files are small (9 components + `App.js` + `index.js`), and their typing requirements are straightforward: component prop interfaces, API response shapes, and standard React event types. The strict-mode errors that will surface are known patterns (implicit-any props, nullable DOM calls) with well-understood solutions. This is the right moment to resolve them — before the codebase grows.

**Resolved `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "strict": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src"]
}
```

Notes on specific choices:
- `target: ES2020` — matches the `browserslist` production targets in `package.json`; CRA's babel pipeline handles down-compilation for older browsers
- `lib: ["ES2020", "DOM", "DOM.Iterable"]` — `DOM.Iterable` is required for iterating `NodeList` and `HTMLCollection` (common in React code)
- `skipLibCheck: true` — required when mixing CRA-managed `@types/react` with the app's own `@types` additions; suppresses errors in `.d.ts` files of third-party packages
- `resolveJsonModule: true` — allows importing JSON files if needed in future
- `isolatedModules: true` — required by CRA's Babel transform; each file must be independently compilable
- `noEmit: true` — type checking only; CRA's webpack/babel pipeline handles actual transpilation

---

## Architecture / Flow Diagram

```
tsc --noEmit
    │
    └── reads tsconfig.json
           │
           ├── strict: true  ─────→ noImplicitAny, strictNullChecks, strictFunctionTypes, etc.
           ├── include: ["src"]  ──→ src/index.tsx, src/App.tsx, src/components/*.tsx
           └── moduleResolution: node
                  │
                  ├── react, react-dom  ──→  resolved via @types/react, @types/react-dom
                  ├── react-router-dom  ──→  resolved via bundled .d.ts (no @types/ needed)
                  ├── @vercel/analytics ──→  resolved via bundled .d.ts
                  └── react-kofi-button ──→  resolved via @types/react-kofi-button
```

CRA's `react-scripts build` uses Babel for transpilation and calls `tsc --noEmit` separately for type checking. The `tsconfig.json` governs the type-check pass only; CRA's Babel config governs the output.

---

## Consequences

### What becomes easier
- All future `.ts`/`.tsx` files are type-checked strictly from the moment they are created — no migration debt accumulates
- IDE tooling (autocomplete, refactoring, go-to-definition) works correctly across the codebase
- The independent review agent can treat type errors as a hard signal (not a "maybe strict mode is off" ambiguity)
- The Vitest test suite (ADR-004) will have typed test helpers once the migration is complete

### What becomes harder or riskier
- Migration requires defining explicit prop interfaces for all nine components
- `App.js` uses `window.location.pathname` which requires `DOM` lib (already included)
- `App.js` imports `use` from React but does not use it — this will be a compiler error that must be removed at migration time
- `ItemCard.js` and `ItemDetail.js` have duplicate keys in `typeIcons` — TypeScript will not catch this (it is valid JS/TS), but the dead keys should be removed for clarity

### Impact on existing system
- **API contracts:** No
- **Database migration:** No
- **Auth/authorisation behaviour:** No
- **New external dependencies:** Yes — `@types/react`, `@types/react-dom`, `@types/react-kofi-button` (all `devDependencies`; see ADR-008 for type strategy)

---

## Security Considerations

- **Authentication/Authorisation:** Not applicable — compiler configuration does not touch auth
- **Authorisation:** Not applicable
- **Data sensitivity:** `strictNullChecks` provides compile-time protection against null-dereference on fields derived from API responses (including `item.content` which is rendered via `dangerouslySetInnerHTML` — already sanitised server-side per ADR-002)
- **Attack surface:** No new endpoints, integrations, or runtime behaviour introduced
- **Threat mitigations:** Strict mode is a defence-in-depth measure; it does not replace runtime validation or the ADR-002 HTML sanitisation

---

## Acceptance Scenarios Affected

- `PBI-004-frontend-typescript-migration.feature` — Scenario: "TypeScript compilation passes with zero errors"
- `PBI-004-frontend-typescript-migration.feature` — Scenario: "Application builds successfully for production"

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

- TypeScript 5.x is already a `devDependency` in `package.json` (added by ADR-005 for Cucumber step definitions)
- CRA 5 / `react-scripts 5.0.1` supports TypeScript out-of-box; no additional CRA configuration is needed
- `isolatedModules: true` is compatible with the Vitest esbuild plugin used in `vitest.config.js` (ADR-004)
- Related ADRs: [ADR-007](./ADR-007-cra-typescript-integration.md), [ADR-008](./ADR-008-type-strategy-third-party-deps.md)

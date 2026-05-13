# Coding Guidelines

These guidelines apply to all code produced by implementation agents and are the baseline used by the independent review agent to evaluate submissions. Deviations require an explicit Architecture Decision Record (ADR) explaining why the deviation is justified.

---

## Principles

1. **Clarity over cleverness.** Code is read far more than it is written. Optimise for the next reader.
2. **Explicit over implicit.** Avoid magic. Prefer visible, traceable behaviour.
3. **Fail fast, fail loudly.** Validate inputs early. Propagate errors explicitly. Do not swallow exceptions silently.
4. **Security is not optional.** Every change that touches auth, data access, or external input must be reviewed through a security lens.
5. **Tests are first-class citizens.** Test code is held to the same quality standard as production code.

---

## General (Frontend and Backend)

### Naming
- Names must be descriptive and unambiguous. Avoid abbreviations unless they are universally understood (`id`, `url`, `http`).
- Boolean variables and functions must read as yes/no questions: `isLoading`, `hasPermission`, `canEdit`.
- Functions and methods must be named for what they *do*, not what they *are*: `fetchUser()` not `user()`, `buildAuthToken()` not `authToken()`.

### Comments
- Do not comment *what* the code does — the code itself must be clear enough. Comments explain *why* a non-obvious decision was made.
- TODO comments must include a backlog item reference: `// TODO PBI-042: remove once legacy API is sunset`.
- No commented-out code in committed files.

### Error Handling
- Errors must be caught at the appropriate boundary and either handled or explicitly propagated.
- Error messages shown to users must not expose internal state, stack traces, or server paths.
- Log errors with enough context to diagnose them (user ID, request ID, relevant input parameters — never raw passwords or tokens).

### Secrets and Configuration
- No hardcoded secrets, API keys, connection strings, or environment-specific values in source code.
- All configuration is injected via environment variables or a configuration service.
- `.env` files must never be committed.

---

## Backend — Java

### Project Structure
```
src/
├── main/
│   └── java/
│       └── com.company.product/
│           ├── api/          ← Controllers / REST handlers
│           ├── domain/       ← Business logic, domain models, use cases
│           ├── infrastructure/  ← DB repositories, external service adapters
│           └── config/       ← Spring configuration classes
└── test/
    └── java/
        ├── steps/            ← Cucumber step definitions
        ├── unit/             ← Unit tests (plain JUnit 5)
        └── integration/      ← Integration tests (Spring context)
```

### Naming Conventions
- Classes: `PascalCase`
- Methods and variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Packages: `lowercase`, no underscores

### Architecture Rules
- Controllers must contain **no business logic** — they only parse requests, delegate to domain services, and format responses.
- Domain services must have **no knowledge of HTTP, persistence, or frameworks** — they operate on domain objects only.
- Infrastructure adapters implement domain-defined interfaces (Dependency Inversion). The domain does not depend on infrastructure.
- Use constructor injection. Field injection (`@Autowired` on fields) is not permitted.

### Code Style
- Java 17+ features are permitted and encouraged: records, sealed classes, pattern matching, text blocks.
- Use `Optional<T>` for values that may be absent. Do not return `null` from public methods.
- Streams are preferred over imperative loops for collection transformations, provided readability is not compromised.
- Method length: aim for under 20 lines. A method that needs to be longer should be decomposed.
- Class length: aim for under 200 lines. A class that is larger is likely doing too much.

### Security (Java-specific)
- All database queries must use parameterised statements or JPA. String-concatenated queries are never permitted.
- Input validation must occur at the controller boundary using Bean Validation (`@Valid`, constraint annotations).
- Authorisation checks must happen in the domain/service layer — not only in the controller. Controllers are not a security boundary.
- Sensitive fields (passwords, tokens) must never appear in `toString()`, logs, or serialised responses.
- Passwords must be stored as bcrypt hashes (work factor ≥ 12). Never store or log plaintext passwords.
- HTTP responses must include appropriate security headers (configured once at the framework level, not per-endpoint).

### Testing (Java)
- Unit tests: JUnit 5 + Mockito. Test one class in isolation; mock all collaborators.
- Integration tests: `@SpringBootTest` with Testcontainers for database-dependent tests.
- Acceptance tests: Cucumber step definitions map 1:1 to `.feature` files. Step definitions call service/API layer directly — no mocking at this level.
- Test method naming: `should_<expected_outcome>_when_<condition>()`.
- Every public method in the domain and service layer must have at least one unit test for the happy path and one for each expected failure mode.

---

## Frontend — React

### Project Structure
```
src/
├── components/       ← Reusable UI components (no business logic)
├── features/         ← Feature-scoped modules (components + hooks + local state)
│   └── <feature>/
│       ├── components/
│       ├── hooks/
│       └── index.ts  ← Public API of the feature
├── pages/            ← Route-level components (thin wrappers, no logic)
├── services/         ← API client functions (fetch wrappers, typed)
├── store/            ← Global state (if used — prefer local/server state first)
├── types/            ← Shared TypeScript types and interfaces
└── utils/            ← Pure utility functions
```

```
e2e/
├── features/         ← .feature files (symlinked from dev-flow/product/)
└── steps/            ← Playwright + Cucumber step definitions (TypeScript)
```

### Language and Typing
- TypeScript is mandatory. `any` is not permitted except in explicitly justified adapter/shim code, which must be isolated and documented.
- All props, function arguments, and return values must be typed. No implicit `any` from missing types.
- Use `interface` for object shapes that can be extended; use `type` for unions, intersections, and aliases.

### Component Rules
- Components are functions. Class components are not used in new code.
- Each component has a single responsibility. A component that both fetches data and renders complex UI must be split.
- Business logic lives in custom hooks (`use<Feature>Logic`), not in components.
- Components receive data via props or hooks — they do not call API services directly.
- Side effects (`useEffect`) must have explicit dependency arrays. Omitting the dependency array is not permitted.

### Naming Conventions
- Components: `PascalCase` (filename matches component name: `UserCard.tsx`)
- Hooks: `camelCase` prefixed with `use`: `useProductList.ts`
- Types/Interfaces: `PascalCase`, descriptive: `UserProfile`, `ApiError`
- Constants: `UPPER_SNAKE_CASE` for module-level; `camelCase` for local
- Event handlers in props: `on<Event>` (`onSubmit`, `onSelect`)
- Event handler implementations: `handle<Event>` (`handleSubmit`, `handleSelect`)

### State Management
- Prefer local state (`useState`, `useReducer`) and server state (React Query / SWR) over global state.
- Global state (Redux or Zustand) is only introduced when state genuinely needs to be shared across unrelated parts of the UI — a decision that requires an ADR.
- Derived values are computed from state, not stored alongside it.

### Security (React-specific)
- `dangerouslySetInnerHTML` is never used unless explicitly reviewed and justified in an ADR.
- All user-provided content rendered to the DOM must be treated as untrusted.
- Sensitive data (tokens, secrets) is never stored in `localStorage` or `sessionStorage`. Session tokens live in `httpOnly` cookies managed by the backend.
- API calls must include CSRF protection as required by the backend contract.
- Authentication state must be verified on the backend — the frontend is not a security boundary.

### Testing (React)
- Acceptance tests: Playwright + Cucumber JS, step definitions in `e2e/steps/`. Tests drive the real browser against the running application.
- Component tests: React Testing Library. Test behaviour as a user would experience it — not component internals.
- No snapshot tests. They create noise without catching real regressions.
- A component or hook with conditional logic must have tests for each branch.

---

## Pull Request / Code Submission Rules

These rules apply to every code submission that reaches the independent review agent:

1. Each submission corresponds to one backlog item. Mixed-concern PRs are rejected.
2. The submission must include tests covering all new behaviour introduced.
3. All acceptance scenarios for the backlog item must have passing step definitions.
4. No new compiler warnings are introduced.
5. No secrets or `.env` files are included.
6. The security agent must have reviewed the submission before it reaches the independent review agent.

---

## What the Independent Review Agent Checks

The review agent evaluates submissions against this document. Its report is organised into:

- **Blockers** — violations that prevent merge (security issues, architectural violations, missing tests, guideline breaches)
- **Warnings** — non-blocking concerns worth addressing (style inconsistencies, complexity, unclear naming)
- **Suggestions** — optional improvements

The human is notified only when there are Blockers involving architectural decisions or security risks.

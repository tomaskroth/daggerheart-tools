# ADR-003: Cucumber JVM for Backend Acceptance Testing

> **Status:** `Proposed`
> **Date:** 2026-05-13
> **Backlog item:** PBI-003
> **Decider:** Architecture Agent → 👤 Human approval required

---

## Context

PBI-003 requires runnable Cucumber acceptance tests covering the `@backend` scenarios from the existing `.feature` files. The dev flow specifies that every PBI's `@backend` scenarios must pass as step definitions before the PBI is considered done — but no BDD framework is currently wired into the project.

The existing tests (`SrdServiceTest`, `SecurityIntegrationTest`) are JUnit 5 + Mockito unit/slice tests. They are not Cucumber and cannot consume `.feature` files directly. A Cucumber runtime must be added to bridge the Gherkin scenarios to Java step definitions.

The project uses Spring Boot 3.3.2, JUnit 5 (via `spring-boot-starter-test`), and Maven. The JUnit 5 integration requires `cucumber-junit-platform-engine` — the older `cucumber-junit` artefact targets JUnit 4 and cannot be used here.

---

## Decision Drivers

- **Primary:** Runnable `@backend` Gherkin scenarios in CI — the smoke scenario explicitly requires Cucumber execution
- **Primary:** Consistency — the dev flow process produces `.feature` files; the test framework must consume them
- **Secondary:** Minimal new footprint — only add what is needed for the acceptance layer
- **Constraints:** Must integrate with JUnit 5; must work with `mvn test`; must not require a running external process

---

## Options Considered

### Option A: Cucumber JVM 7.x with JUnit Platform engine

Cucumber's official JUnit 5 integration. Dependencies: `cucumber-java`, `cucumber-spring`, `cucumber-junit-platform-engine`, and `junit-platform-suite`. Step definitions are plain Java methods annotated with `@Given`/`@When`/`@Then`. Spring context is shared across all steps via `@CucumberContextConfiguration`. Scenarios run as part of the standard `mvn test` lifecycle.

**Pros:**
- Direct consumption of Gherkin `.feature` files — the format the dev flow already produces
- Native JUnit 5 integration — runs alongside existing tests in the same `mvn test` invocation
- Spring context wiring via `@SpringBootTest` — real application stack, no mocking needed at the acceptance layer
- Tag filtering (`@backend`) is first-class — `@frontend` scenarios are skipped automatically until PBI-006

**Cons:**
- Four new Maven dependencies (small footprint, all in `test` scope)
- JUnit Platform Suite wiring has a small amount of configuration boilerplate

**Security implications:**
- Test-only dependencies; no production classpath impact
- Acceptance tests run against `@SpringBootTest` with H2 in-memory — no real persistence risk

---

### Option B: REST-assured + JUnit 5 (no BDD layer)

Test HTTP endpoints directly with REST-assured DSL. No Gherkin; scenarios are expressed as Java tests.

**Pros:**
- No new framework, fluent API, good Spring Boot integration

**Cons:**
- Disconnects the test code from the `.feature` files the dev flow produces — scenarios would need to be maintained in two places or not at all
- Does not satisfy the smoke scenario ("Cucumber acceptance tests execute")
- Future PBIs that write step definitions would have nothing to run against

**Security implications:**
- Same as Option A — test scope only

---

### Option C: Spring Boot `@SpringBootTest` slice tests only (no Cucumber)

Expand existing `SecurityIntegrationTest`-style `@WebMvcTest` tests to cover the PBI-003 scenarios without adding Cucumber.

**Pros:**
- No new dependencies
- Already established pattern

**Cons:**
- Does not satisfy the smoke scenario explicitly requiring Cucumber
- Does not provide a runner that can consume `.feature` files — future PBIs write step definitions to nothing
- The dev flow's acceptance scenario contract is broken from the start

**Security implications:**
- None — test scope only

---

## Decision

**We will use Option A: Cucumber JVM 7.x with JUnit Platform engine.**

Options B and C cannot satisfy the explicit smoke scenario that requires a Cucumber runner. The dev flow is built around Gherkin feature files; the test framework must be able to consume them. Cucumber JVM 7.x is the standard, well-supported choice for JUnit 5 + Spring Boot 3.x. The four test-scoped Maven dependencies are a proportionate cost. Tag filtering (`@backend`) ensures that `@frontend` scenarios are skipped until PBI-006 provides the frontend test infrastructure.

---

## Architecture / Flow Diagram

```
mvn test
   │
   ├── Surefire (JUnit Platform)
   │      │
   │      ├── CucumberTestSuite  (@Suite, @SelectClasspathResource("features"))
   │      │      │    filter: tags = "@backend"
   │      │      │
   │      │      └── Cucumber runtime
   │      │             │
   │      │             ├── reads  src/test/resources/features/*.feature
   │      │             ├── wires  CucumberSpringContextConfig (@SpringBootTest, RANDOM_PORT)
   │      │             └── executes step defs in com.dhsrd.cucumber.steps.*
   │      │                    │
   │      │                    └── HTTP calls → local Spring Boot application
   │      │                           │
   │      │                           ├── SrdController
   │      │                           ├── SrdService (Lucene, H2)
   │      │                           └── SecurityConfig (HTTP Basic on admin endpoints)
   │      │
   │      ├── SrdServiceTest  (existing unit tests)
   │      └── SecurityIntegrationTest  (existing slice tests)
```

---

## Consequences

### What becomes easier
- Every future PBI adds step definitions to the existing Cucumber context — the infrastructure is in place
- `@backend` tag filter means the same feature files can coexist with `@frontend` scenarios without failing the backend test run
- CI command is still `mvn test` — no new scripts required

### What becomes harder or riskier
- `@SpringBootTest(webEnvironment = RANDOM_PORT)` starts a full application context per test run — slower than slice tests. Acceptable for an acceptance suite; unit tests remain fast
- Cucumber step definition scope (shared state between `@Given`/`@When`/`@Then` within a scenario) requires careful use of instance variables; misuse causes flaky tests

### Impact on existing system
- **API contracts:** No — test infrastructure only
- **Database migration:** No
- **Auth/authorisation behaviour:** No
- **New external dependencies:** Yes — four test-scoped Maven dependencies (see flow descriptor for versions)

---

## Security Considerations

- **Authentication:** Acceptance tests for the `@security` scenarios use `httpBasic` with the same `TEST_ADMIN_PASSWORD` constant pattern established in `SecurityIntegrationTest`. Credentials are injected via `@TestPropertySource`, never hardcoded as string literals.
- **Authorisation:** No change to production authorisation. Tests verify existing behaviour.
- **Data sensitivity:** Tests use synthetic fixture data from `src/test/resources/srd.json`. No real SRD or user data in the test corpus.
- **Attack surface:** No new endpoints. No changes to `SecurityConfig`.
- **Threat mitigations:** All new code is `test` scope; it cannot be included in the production jar.

---

## Acceptance Scenarios Affected

- `PBI-003-backend-test-infrastructure.feature` — all six scenarios

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

- Cucumber 7.18.x is the latest stable release in the 7.x line at time of writing; compatible with Spring Boot 3.3.x and JUnit 5.
- Related ADRs: [ADR-001](./ADR-001-spring-security-admin-protection.md), [ADR-002](./ADR-002-html-content-sanitisation.md)
- References: [Cucumber JVM + Spring Boot integration guide](https://cucumber.io/docs/cucumber/api/#junit-platform)

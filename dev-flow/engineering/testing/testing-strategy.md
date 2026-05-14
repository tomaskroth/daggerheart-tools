# Testing Strategy

This document defines how the Test Implementation Agent translates acceptance scenarios into executable tests, how the test layers relate to each other, and what coverage is expected at each level for both the React frontend and Java backend.

---

## Guiding Principles

1. **Scenarios are the source of truth.** The Test Implementation Agent does not invent test cases. Every acceptance test maps directly to a `Scenario` in a `.feature` file. If a behaviour matters, it has a scenario. If it has a scenario, it has a test.

2. **Tests are human-readable.** Acceptance tests use the Gherkin scenarios as their specification. Step definitions must be written so that the scenario wording and the step code are unmistakably aligned — a reader should not need to trace through implementation to understand what a test is verifying.

3. **Tests are independent.** Each test sets up its own state and cleans up after itself. Tests do not rely on execution order or shared mutable state.

4. **Tests are deterministic.** A test that passes sometimes and fails sometimes is a broken test. Flakiness is treated as a blocker, not a warning.

5. **Test code is held to the same quality standard as production code.** The coding guidelines apply to test code. The independent review agent checks test code.

---

## The Test Pyramid

```
        ┌───────────────────────┐
        │   Acceptance Tests    │  ← Gherkin scenarios, full stack or near-full
        │  (Cucumber / Playwright)  │    Small number, high confidence
        ├───────────────────────┤
        │  Integration Tests    │  ← Spring context / API layer / DB round-trips
        │                       │    Moderate number, realistic wiring
        ├───────────────────────┤
        │      Unit Tests       │  ← Domain logic, pure functions, hooks
        │                       │    Large number, fast, isolated
        └───────────────────────┘
```

The pyramid exists for a reason: unit tests are fast and precise, acceptance tests are slow and broad. Most logic is tested at the unit level. Acceptance tests verify that the assembled system behaves as the scenarios describe — they do not re-test every edge case that unit tests already cover.

---

## Backend — Java

### Layer 1: Unit Tests (JUnit 5 + Mockito)

**What they test:** Domain services, use cases, domain model logic, utility functions. Anything with conditional logic, computation, or business rules.

**What they do not test:** HTTP routing, database persistence, Spring wiring.

**Setup:** Plain JUnit 5. No Spring context. All collaborators are mocked with Mockito.

**Location:** `src/test/java/unit/`

**Naming convention:** `<ClassUnderTest>Test.java`, method names `should_<outcome>_when_<condition>()`.

**Coverage expectation:**
- Every public method in every domain service and use case has at least one test for the happy path.
- Every branch (if/else, switch, optional presence/absence) has a corresponding test.
- Every expected exception or error state has a test.

**Example:**
```java
class OrderServiceTest {

    private final OrderRepository repository = mock(OrderRepository.class);
    private final OrderService service = new OrderService(repository);

    @Test
    void should_return_order_when_valid_id_is_provided() {
        var order = new Order(OrderId.of("ORD-001"), ...);
        when(repository.findById(OrderId.of("ORD-001"))).thenReturn(Optional.of(order));

        var result = service.getOrder(OrderId.of("ORD-001"));

        assertThat(result).isEqualTo(order);
    }

    @Test
    void should_throw_not_found_when_order_does_not_exist() {
        when(repository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getOrder(OrderId.of("MISSING")))
            .isInstanceOf(OrderNotFoundException.class);
    }
}
```

---

### Layer 2: Integration Tests (Spring Boot + Testcontainers)

**What they test:** The wiring between layers — controller routing, request/response serialisation, Bean Validation, repository queries against a real database, security configuration (auth required, auth forbidden).

**What they do not test:** Business logic (that's unit tests) or full user flows (that's acceptance tests).

**Setup:** `@SpringBootTest` with `WebMvcTest` for controller slice tests, or `@SpringBootTest` with Testcontainers (PostgreSQL/MySQL) for repository tests. MockMvc for HTTP assertion.

**Location:** `src/test/java/integration/`

**Naming convention:** `<Feature>IntegrationTest.java`

**Coverage expectation:**
- Every controller endpoint has an integration test covering: happy path response shape, authentication required (401 if missing token), authorisation check (403 if wrong role), and at least one validation failure (400 with error body).
- Every custom repository query has a test against the real database.

**Example:**
```java
@WebMvcTest(OrderController.class)
class OrderControllerIntegrationTest {

    @Autowired MockMvc mockMvc;
    @MockBean OrderService orderService;

    @Test
    @WithMockUser(roles = "USER")
    void should_return_200_with_order_when_authenticated() throws Exception {
        when(orderService.getOrder(any())).thenReturn(buildSampleOrder());

        mockMvc.perform(get("/api/orders/ORD-001"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value("ORD-001"));
    }

    @Test
    void should_return_401_when_not_authenticated() throws Exception {
        mockMvc.perform(get("/api/orders/ORD-001"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "GUEST")
    void should_return_403_when_insufficient_role() throws Exception {
        mockMvc.perform(get("/api/orders/ORD-001"))
            .andExpect(status().isForbidden());
    }
}
```

---

### Layer 3: Acceptance Tests (Cucumber + JUnit 5)

**What they test:** The full scenarios from `.feature` files — from API call to database and back. These tests run against a fully assembled application with a real (containerised) database.

**Source:** `.feature` files in `dev-flow/product/`. Step definitions are written to match exactly. No scenario is skipped.

**Location:** `src/test/java/steps/` (step definitions), `src/test/resources/features/` (symlink or copy of `.feature` files)

**Tagging:** Tags from the `.feature` file control which scenarios run: `@backend` scenarios run in the JUnit Cucumber runner; `@frontend` scenarios are skipped at this layer.

**Coverage expectation:** Every `@backend` and `@smoke` scenario in every `.feature` file has a passing step definition.

**Step definition conventions:**
- One step definition class per feature file.
- Steps call the service or API layer directly — no mocking.
- Shared setup steps (application state, test data) live in a `SharedSteps` or `World` class.
- Step definitions must not contain assertions beyond what the scenario states.

---

## Frontend — React

### Layer 1: Component Tests (React Testing Library)

**What they test:** Individual components and custom hooks in isolation — rendering behaviour, conditional display, user interactions, state transitions.

**What they do not test:** API calls (mocked at the service boundary), routing, or full user flows.

**Setup:** Vitest (or Jest) + React Testing Library. API services are mocked. No real browser.

**Location:** `src/**/__tests__/` co-located with the component.

**Naming convention:** `<Component>.test.tsx`

**Coverage expectation:**
- Every component that has conditional rendering logic has a test for each branch.
- Every interactive element (button, input, form) has a test verifying its effect.
- Every custom hook has a test for its state transitions and side effects.
- Loading, error, and empty states are tested explicitly.

**Example:**
```tsx
describe('LoginForm', () => {
  it('shows error message when credentials are invalid', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new AuthError('Invalid email or password'));
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Email'), 'alice@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpassword');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });

  it('calls onSubmit with credentials when form is valid', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Email'), 'alice@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'S3cur3P@ss!');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'S3cur3P@ss!',
    });
  });
});
```

---

### Layer 2: Acceptance Tests (Playwright + Cucumber JS)

**What they test:** Full `@frontend` scenarios from `.feature` files — driving a real browser against the running application. These are end-to-end: frontend renders, backend responds, database is real.

**Source:** `.feature` files in `dev-flow/product/`. Step definitions map 1:1 to scenarios tagged `@frontend`.

**Location:** `e2e/steps/` (step definitions), `e2e/features/` (symlink or copy of `.feature` files)

**Setup:** Playwright browser (Chromium by default, configurable). The full application stack must be running. CI brings up the stack before running these tests.

**Page Object Model:** Every page or major UI section has a Page Object class in `e2e/pages/`. Step definitions interact with the application through Page Objects only — never through raw Playwright selectors.

```
e2e/
├── features/        ← .feature files (sourced from dev-flow/product/)
├── steps/           ← Cucumber step definitions
│   ├── auth.steps.ts
│   └── shared.steps.ts
└── pages/           ← Page Object classes
    ├── LoginPage.ts
    └── DashboardPage.ts
```

**Step definition conventions:**
- Steps use Page Object methods — they do not call `page.locator()` directly.
- Each step definition file corresponds to one feature area.
- Shared steps (navigation, authentication setup) live in `shared.steps.ts`.

**Example:**
```typescript
// e2e/steps/auth.steps.ts
Given('the user is on the login page', async function () {
  await loginPage.navigate();
});

When('they enter email {string} and password {string}', async function (email, password) {
  await loginPage.fillCredentials(email, password);
});

When('they click {string}', async function (buttonLabel) {
  await loginPage.clickButton(buttonLabel);
});

Then('they are redirected to the dashboard', async function () {
  await expect(dashboardPage.heading).toBeVisible();
});

Then('an error message is displayed: {string}', async function (message) {
  await expect(loginPage.errorMessage).toHaveText(message);
});
```

---

## CI Pipeline: Test Execution Order

Tests run in this order in CI. A failure at any layer blocks the next.

```
1. Unit tests (Java + React)          ← Fast. Fail early.
2. Integration tests (Java)           ← Medium. Catches wiring issues.
3. Component tests (React)            ← Fast. Catches UI logic issues.
4. Acceptance tests — @backend        ← Slow. Needs DB container.
5. Acceptance tests — @frontend       ← Slowest. Needs full stack + browser.
6. @smoke subset runs on every PR     ← Quick confidence check.
   Full suite runs on merge to main.
```

---

## Test Implementation Agent: Operating Rules

The Test Implementation Agent reads the `.feature` files and coding guidelines and produces test code. Its constraints:

- It does not modify `.feature` files. If a scenario is ambiguous or impossible to implement, it flags it for the Architecture Agent to clarify — it does not rewrite the scenario.
- It does not invent scenarios. Every test it writes has a parent scenario in a `.feature` file.
- It writes step definitions that are as readable as the scenario wording they implement.
- It uses Page Objects for all Playwright interactions — never raw selectors in step definitions.
- It does not skip scenarios tagged `@wip` without flagging them in its output report.
- Its output includes a **test coverage summary**: for each `.feature` file, which scenarios are covered, which are skipped (`@wip`), and which could not be implemented (with reason).

---

## Test Coverage Summary (Output Format)

After completing test implementation for a backlog item, the Test Implementation Agent produces:

```
Test Coverage Summary — PBI-XXX: [Feature Name]

Feature file: PBI-XXX-feature-name.feature

  ✅  Scenario: Successful login with valid credentials         [@smoke @frontend @backend]
  ✅  Scenario: Login fails with incorrect password            [@regression @frontend]
  ✅  Scenario: Login attempt for non-existent account        [@regression @backend]
  ✅  Scenario: Brute force protection triggers               [@security @backend]
  ✅  Scenario: SQL injection attempt is rejected safely      [@security @backend]
  ⏭  Scenario: User session expires after inactivity         [@regression @frontend] — @wip, pending session timeout config
  
Unit test coverage:
  ✅  AuthService — happy path, invalid credentials, account not found, brute force threshold
  ✅  LoginForm component — valid submission, invalid credentials display, loading state

Integration test coverage:
  ✅  POST /api/auth/login — 200, 401 (wrong password), 401 (no account), 429 (rate limit)
  ✅  POST /api/auth/login — 401 (no token), security headers present

Flagged for review:
  ⚠  Session timeout scenario (@wip) — requires configuration of token expiry in test environment.
     Flagged to Architecture Agent: PBI-XXX.
```

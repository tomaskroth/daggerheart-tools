# Acceptance Scenario Format

This document defines the format, conventions, and tooling for all acceptance scenarios in this product. Scenarios are written before implementation begins and serve as the contract between product intent and engineering delivery. They are also the direct source for executable tests.

---

## Format: Gherkin / BDD

All scenarios are written in [Gherkin](https://cucumber.io/docs/gherkin/reference/) syntax using `.feature` files. This format is:

- Readable by anyone — product, engineering, QA, and stakeholders
- Executable as automated tests (no translation step needed)
- The single source of truth for "did we build the right thing"

---

## File Location and Naming

```
dev-flow/product/
└── <backlog-item-id>-<short-slug>.feature
```

Examples:
- `PBI-001-user-authentication.feature`
- `PBI-007-product-search-filters.feature`

Each backlog item gets exactly one `.feature` file. Multiple scenarios live inside a single feature file if they belong to the same backlog item.

---

## Anatomy of a Feature File

```gherkin
Feature: <Feature name — matches the backlog item title>
  <One or two sentence description of the user need this feature addresses.>
  <Reference the backlog item ID.>
  Backlog item: PBI-XXX

  Background:
    <Optional: shared setup steps that apply to all scenarios in this file.>

  Scenario: <Specific, concrete situation being tested>
    Given <the initial context or state>
    And   <additional context if needed>
    When  <the action taken by the user or system>
    And   <additional actions if needed>
    Then  <the observable outcome>
    And   <additional assertions if needed>

  Scenario: <Another situation — typically a sad path or edge case>
    ...
```

---

## Writing Conventions

### Scenarios must be written from the user's perspective
Steps describe *what the user sees and does*, not implementation details.

✅ Correct:
```gherkin
When the user submits the login form with valid credentials
Then they are redirected to the dashboard
```

❌ Incorrect:
```gherkin
When POST /api/auth/login returns 200 with a JWT
Then the Redux store authSlice.token is not null
```

### Each scenario tests exactly one behaviour
A scenario should have one meaningful `Then`. If you find yourself writing many unrelated assertions, split into multiple scenarios.

### Cover the full behavioural surface — not just happy paths
Every Feature file should include:

- **Happy path** — the primary success flow
- **Sad paths** — invalid input, missing data, permission denied, not found
- **Edge cases** — boundary conditions, concurrent actions, empty states
- **Security cases** — unauthenticated access, insufficient permissions, injection attempts (where relevant)

### Use concrete values, not abstractions
Steps should use realistic data, not placeholders.

✅ Correct:
```gherkin
Given the user "alice@example.com" has the role "Editor"
```

❌ Incorrect:
```gherkin
Given a user with the appropriate role exists
```

### Avoid "UI language" in backend scenarios
Backend scenarios describe the system's behaviour as observed via its API or data state, not through a browser.

---

## Scenario Tags

Use tags to classify scenarios. The test runner uses these to select what to execute.

| Tag | Meaning |
|---|---|
| `@smoke` | Critical path — runs on every deployment |
| `@regression` | Full regression suite |
| `@frontend` | Executed by Playwright + Cucumber (React) |
| `@backend` | Executed by Cucumber + JUnit 5 (Java) |
| `@security` | Security-relevant scenario — always included in security review |
| `@wip` | Work in progress — excluded from CI until ready |

A scenario can carry multiple tags:
```gherkin
@smoke @frontend
Scenario: Successful login redirects to dashboard
```

---

## Tooling

### Backend (Java)
- **Framework**: [Cucumber](https://cucumber.io/docs/cucumber/) with [JUnit 5](https://junit.org/junit5/)
- **Step definitions**: Java classes in `src/test/java/steps/`
- **Runner**: `@CucumberOptions` JUnit Platform runner
- **Assertions**: AssertJ

### Frontend (React)
- **Framework**: [Playwright](https://playwright.dev/) with [Cucumber JS](https://github.com/cucumber/cucumber-js)
- **Step definitions**: TypeScript in `e2e/steps/`
- **Runner**: `cucumber-js` CLI
- **Page Objects**: Playwright Page Object Model pattern

### Mapping Scenarios to Tests
The Acceptance Scenario Agent produces `.feature` files. The Test Implementation Agent reads those files directly and writes step definitions — it does not invent its own test cases. The mapping is 1:1: every `Scenario` in a `.feature` file has a corresponding step definition implementation.

---

## Example: Full Feature File

```gherkin
Feature: User Authentication
  As a registered user, I need to be able to log in securely so that I can access
  my personal workspace and data.
  Backlog item: PBI-001

  Background:
    Given the application is running
    And the following user exists:
      | email              | password     | role  |
      | alice@example.com  | S3cur3P@ss!  | user  |

  @smoke @frontend @backend
  Scenario: Successful login with valid credentials
    Given the user is on the login page
    When they enter email "alice@example.com" and password "S3cur3P@ss!"
    And they click "Sign in"
    Then they are redirected to the dashboard
    And the header displays "Welcome, Alice"

  @regression @frontend
  Scenario: Login fails with incorrect password
    Given the user is on the login page
    When they enter email "alice@example.com" and password "wrongpassword"
    And they click "Sign in"
    Then an error message is displayed: "Invalid email or password"
    And they remain on the login page

  @regression @backend
  Scenario: Login attempt for non-existent account
    When a login request is made with email "ghost@example.com" and password "anything"
    Then the response status is 401
    And the response body contains "Invalid email or password"

  @security @backend
  Scenario: Brute force protection triggers after repeated failures
    When 5 consecutive failed login attempts are made for "alice@example.com"
    Then the 6th attempt returns status 429
    And the response body contains "Too many attempts. Please try again later."

  @security @backend
  Scenario: SQL injection attempt in login fields is rejected safely
    When a login request is made with email "' OR 1=1 --" and password "anything"
    Then the response status is 401
    And no user data is exposed in the response

  @regression @frontend
  Scenario: User session expires after inactivity
    Given the user is logged in as "alice@example.com"
    And the session has been inactive for 30 minutes
    When they attempt to navigate to a protected page
    Then they are redirected to the login page
    And a message is displayed: "Your session has expired. Please log in again."
```

---

## Acceptance Scenario Review Checklist (Human Checkpoint)

Before engineering begins, confirm the scenarios for each backlog item:

- [ ] The Feature description accurately states the user need
- [ ] The happy path is covered
- [ ] Sad paths cover the failure modes that matter
- [ ] Security-relevant scenarios are tagged `@security`
- [ ] Scenario steps are written in user/product language (no implementation leakage)
- [ ] Concrete values are used (no abstract placeholders)
- [ ] The scope feels right — nothing missing, nothing out of scope

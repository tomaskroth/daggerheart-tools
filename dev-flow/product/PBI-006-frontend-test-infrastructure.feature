Feature: Frontend Test Infrastructure
  The frontend must have a working component test suite (Vitest + React Testing Library)
  and an end-to-end acceptance test suite (Playwright + Cucumber JS). Both must be
  executable in CI with no manual setup.
  Backlog item: PBI-006

  NOTE: PBI-006 is intentionally sequenced before PBI-004 (TypeScript migration) and
  PBI-005 (frontend architecture). The @smoke scenarios establish the test runners and
  must pass with the codebase as it exists at the time of implementation. The @regression
  coverage scenarios (SearchBar, ItemList) are written against the final component
  contracts and will be implemented as stubs that pass trivially during PBI-006; full
  coverage is activated when PBI-004 and PBI-005 complete the components they test.

  Background:
    Given the frontend application is running

  # --- Test suite executability ---

  @smoke @frontend
  Scenario: Frontend component test suite runs and passes
    Given the Vitest test command is executed
    Then all component tests pass
    And no tests are skipped without a documented reason

  @smoke @frontend
  Scenario: Playwright acceptance test suite connects to the application and runs
    Given the Cucumber JS test runner is configured with Playwright
    When the e2e test suite is executed
    Then all scenarios tagged "@frontend" in the feature files pass

  # --- Component test coverage (SearchBar) ---

  @regression @frontend
  Scenario: SearchBar calls the search callback when form is submitted
    Given the SearchBar component is rendered with a mock search handler
    When the user types "dragon" into the search input
    And the user clicks the Search button
    Then the mock search handler is called with "dragon"

  @regression @frontend
  Scenario: SearchBar does not call the search callback on empty submission
    Given the SearchBar component is rendered with a mock search handler
    When the user submits the form without typing anything
    Then the mock search handler is not called

  # --- Component test coverage (ItemList) ---

  @regression @frontend
  Scenario: ItemList renders a card for each item in the list
    Given the ItemList component is rendered with 3 mock items
    Then 3 item cards are visible

  @regression @frontend
  Scenario: ItemList renders nothing when given an empty list
    Given the ItemList component is rendered with an empty list
    Then no item cards are visible
    And no error is thrown

  # --- E2e smoke ---

  @smoke @frontend
  Scenario: Full search flow works end-to-end in the browser
    When the user opens the application in the browser
    And the user types "guardian" in the search bar and submits
    Then at least one result card is displayed
    And no console errors are present

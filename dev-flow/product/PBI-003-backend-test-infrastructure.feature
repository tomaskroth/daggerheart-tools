Feature: Backend Test Infrastructure
  The backend must have a working test suite covering the service layer with unit tests
  and the API layer with Cucumber acceptance tests. The test infrastructure must be
  executable in CI with no manual setup.
  Backlog item: PBI-003

  Background:
    Given the application is running
    And the SRD data has been loaded

  # --- Test suite executability ---

  @smoke @backend
  Scenario: Backend unit test suite runs and passes
    Given the Maven test command is executed
    Then all unit tests pass
    And no tests are skipped without a documented reason

  @smoke @backend
  Scenario: Cucumber acceptance tests execute against the running application
    Given the Cucumber test runner is configured
    When the acceptance test suite is executed
    Then all scenarios tagged "@backend" in the feature files pass

  # --- SrdService unit test coverage (verified by the test suite) ---

  @regression @backend
  Scenario: Search with blank query returns all results
    When a search is performed with no query text
    Then all indexed items are returned up to the default page size

  @regression @backend
  Scenario: Search applies fuzzy matching by default
    When a search is performed with query "guardin"
    Then results include items matching "guardian"

  @regression @backend
  Scenario: Search respects explicit pagination parameters
    When a search is performed with from "10" and size "5"
    Then at most 5 items are returned
    And the first result is the 11th match overall

  @regression @backend
  Scenario: Service throws a not-found exception when slug does not exist
    When a lookup is performed for slug "nonexistent-slug"
    Then a not-found response is returned

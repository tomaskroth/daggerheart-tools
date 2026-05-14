Feature: Frontend TypeScript Migration
  All frontend source files must be migrated from JavaScript to TypeScript.
  The application must build and behave identically to before the migration.
  No user-visible behaviour changes.
  Backlog item: PBI-004

  Background:
    Given the frontend application is built and running

  # --- Build correctness ---

  @smoke @frontend
  Scenario: TypeScript compilation passes with zero errors
    Given the TypeScript compiler is run with "tsc --noEmit"
    Then the exit code is 0
    And no type errors are reported

  @smoke @frontend
  Scenario: Application builds successfully for production
    Given the build command is run
    Then the build completes without errors
    And the output bundle is produced

  # --- Behavioural regression: application still works ---

  @regression @frontend
  Scenario: Search bar is visible and accepts input on load
    When the user opens the application
    Then the search bar is visible
    And the type menu is visible

  @regression @frontend
  Scenario: Searching for a term displays results
    When the user opens the application
    And the user types "warrior" in the search bar and submits
    Then at least one result card is displayed

  @regression @frontend
  Scenario: Clicking an item card displays the item detail view
    Given search results are displayed
    When the user clicks on the first result card
    Then the item detail view is displayed
    And a back button is visible

  @regression @frontend
  Scenario: Dark mode toggle switches the visual theme
    When the user opens the application
    And the user clicks the dark mode toggle
    Then the dark mode class is applied to the document
    When the user clicks the dark mode toggle again
    Then the dark mode class is removed from the document

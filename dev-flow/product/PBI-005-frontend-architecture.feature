Feature: Frontend Architecture
  API calls must be extracted to a typed service module. Data-fetching logic must
  live in custom hooks, not in components. Navigation must use react-router properly.
  No user-visible behaviour changes.
  Backlog item: PBI-005

  Background:
    Given the frontend application is running

  # --- Core user flows still work after restructuring ---

  @smoke @frontend
  Scenario: User can search and view an item from start to finish
    When the user opens the application
    And the user types "warrior" in the search bar and submits
    Then at least one result card is displayed
    When the user clicks on the first result card
    Then the item detail view is displayed with a title and content
    When the user clicks the back button
    Then the search results list is displayed again

  @smoke @frontend
  Scenario: User can filter items by type
    When the user opens the application
    And the user clicks the "WEAPONS" type filter
    Then result cards are displayed
    And each visible result card shows type "Weapons"

  @regression @frontend
  Scenario: Navigating directly to an item URL displays that item
    When the user navigates directly to the URL "/ancestries/Human.md"
    Then the item detail view is displayed
    And the item title is visible

  @regression @frontend
  Scenario: Dark mode preference is remembered after page reload
    When the user opens the application
    And the user enables dark mode
    And the user reloads the page
    Then dark mode is still active

  @regression @frontend
  Scenario: Abilities type items display recall cost and level
    Given search results include an item of type "ABILITIES"
    When the user clicks on that item
    Then the abilities card is displayed
    And the recall cost is shown
    And the level is shown

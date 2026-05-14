@frontend
Feature: Multi-word item URL navigation
  Items whose titles contain more than one word have hyphenated slugs (e.g. gore-and-glory).
  Navigating to the item's URL must show the item detail regardless of slug complexity.

  Background:
    Given the frontend application is running

  @regression @bug-PBI-007
  Scenario: Navigating directly to a multi-word item URL shows the item detail
    When the user navigates directly to the URL "/abilities/gore-and-glory.md"
    Then the item title is visible

  @regression @bug-PBI-007
  Scenario: Clicking a multi-word item card from search results shows the item detail
    Given search results include an item of type "ABILITIES"
    When the user clicks on that item
    Then the item detail view is displayed with a title and content

Feature: Navigation bar restructured into Compendium dropdown and Character Sheet top-level button
  As a user, I want to navigate to either the SRD compendium or the character sheet
  from a clear top-level navigation bar, so I can reach my destination in one click
  without scanning through a flat list of category links.
  Backlog item: PBI-020

  Background:
    Given the application is running

  @smoke @frontend
  Scenario: Primary navigation row contains Compendium and Character Sheet buttons
    When the user views any page
    Then the primary navigation row contains a "Compendium" button
    And the primary navigation row contains a "Character Sheet" button
    And the primary navigation row does not contain individual SRD category links

  @smoke @frontend
  Scenario: Landing on the homepage shows the compendium secondary row open by default
    When the user navigates to the homepage
    Then the secondary navigation row is visible
    And the secondary navigation row contains links for all SRD categories

  @regression @frontend
  Scenario: Clicking Compendium collapses the secondary row when it is open
    Given the user is on the homepage
    And the secondary navigation row is visible
    When they click the "Compendium" button
    Then the secondary navigation row is hidden

  @regression @frontend
  Scenario: Clicking Compendium expands the secondary row when it is collapsed
    Given the user is on the homepage
    And the secondary navigation row is hidden
    When they click the "Compendium" button
    Then the secondary navigation row is visible

  @regression @frontend
  Scenario: Clicking Character Sheet navigates to the character sheet page
    Given the user is on the homepage
    When they click the "Character Sheet" button
    Then the character sheet page is displayed

  @regression @frontend
  Scenario: Navigating to the character sheet collapses the secondary navigation row
    Given the user is on the homepage
    And the secondary navigation row is visible
    When they click the "Character Sheet" button
    Then the secondary navigation row is hidden

  @regression @frontend
  Scenario: Navigating directly to a compendium item page shows the secondary row open
    When the user navigates directly to a compendium item page
    Then the secondary navigation row is visible

  @regression @frontend
  Scenario: Compendium button has diamond corner decorations
    When the user views the primary navigation row
    Then the "Compendium" button has the diamond corner decoration style

  @regression @frontend
  Scenario: Character Sheet button has diamond corner decorations
    When the user views the primary navigation row
    Then the "Character Sheet" button has the diamond corner decoration style

  @regression @frontend
  Scenario: Search bar remains present and usable after navigation restructure
    When the user views the homepage
    Then the search bar is visible in the navigation area

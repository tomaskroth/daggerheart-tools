Feature: Character Sheet Page Foundation
  As a player, I want a dedicated character sheet page so that I have a structured
  space to create and view my Daggerheart character.
  Backlog item: PBI-008

  Background:
    Given the application is running

  @smoke @frontend
  Scenario: Navigating to the character sheet page displays the sheet layout
    Given the user is on the home page
    When they navigate to "/character-sheet"
    Then a page titled "Character Sheet" is displayed
    And the page has a left column and a right column

  @regression @frontend
  Scenario: Character sheet page is reachable via main navigation
    Given the user is on the home page
    When they click the "Character Sheet" navigation link
    Then they are on the "/character-sheet" page

  @regression @frontend
  Scenario: Left column contains identity and stat sections
    Given the user is on the character sheet page
    Then the left column contains a class header section
    And the left column contains a traits section
    And the left column contains a "Damage & Health" section
    And the left column contains a "Hope" section
    And the left column contains an "Experience" section
    And the left column contains a "Gold" section
    And the left column contains a "Class Feature" section

  @regression @frontend
  Scenario: Right column contains equipment and inventory sections
    Given the user is on the character sheet page
    Then the right column contains an "Active Weapons" section
    And the right column contains an "Active Armor" section
    And the right column contains an "Inventory" section

  @regression @frontend
  Scenario: Header section has inputs for basic character identity
    Given the user is on the character sheet page
    Then the header section has a text input for "Name"
    And the header section has a text input for "Pronouns"
    And the header section has a text input for "Heritage"
    And the header section has a text input for "Subclass"
    And the header section has a numeric input for "Level"

  @regression @frontend
  Scenario: Character sheet is accessible directly by URL without a 404
    Given the user navigates directly to "/character-sheet"
    Then the character sheet page is displayed
    And no 404 error is shown

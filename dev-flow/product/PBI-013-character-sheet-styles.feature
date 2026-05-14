Feature: Character Sheet Styles
  The Character Sheet page and its navigation link must be styled
  consistently with the rest of the application's purple/gold visual
  language. Currently no CSS rules exist for any character sheet class
  names, leaving the page in an unstyled browser-default state.
  Backlog item: PBI-013

  Background:
    Given the user navigates to the character sheet page

  # ── Regression scenarios (bug fix proof) ──────────────────────────────

  @regression @bug-PBI-013 @frontend
  Scenario: Character Sheet navigation link is styled consistently with the application
    Given the user is on any page of the application
    When they look at the application header
    Then the "Character Sheet" navigation link has a gold text colour
    And the "Character Sheet" navigation link has a purple background

  @regression @bug-PBI-013 @frontend
  Scenario: Character Sheet page sections have card styling applied
    When the user views the character sheet page
    Then the page sections have a visible background colour distinct from the page background
    And the page sections have a coloured left border accent

  @regression @bug-PBI-013 @frontend
  Scenario: Character Sheet inputs and selects are styled consistently with the application
    When the user views the character sheet page
    Then the text inputs have a gold border
    And the select dropdowns have a gold border

  # ── Correct-behaviour scenarios ────────────────────────────────────────

  @regression @bug-PBI-013 @frontend
  Scenario: Character Sheet layout uses a two-column grid
    When the user views the character sheet page
    Then the left column and right column are displayed side by side

  @regression @bug-PBI-013 @frontend
  Scenario: Character Sheet section headings are styled in the application purple
    When the user views the character sheet page
    Then the section headings have a purple text colour

  @regression @bug-PBI-013 @frontend
  Scenario: Character Sheet styles are applied in dark mode
    Given the user has enabled dark mode
    When they navigate to the character sheet page
    Then the page sections have a dark background colour
    And the section headings have a gold text colour

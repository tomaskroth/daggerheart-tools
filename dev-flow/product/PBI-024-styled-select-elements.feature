# Complexity: standard

Feature: Theme-consistent select elements
  As a player using the character sheet,
  I want all dropdown selects to render with the app's visual language in both light
  and dark mode, rather than the OS-native white control appearance,
  So that the character sheet looks visually cohesive regardless of which theme is active.
  Backlog item: PBI-024

  # Light mode (default): light/white background, dark charcoal text, gold border (#d4b04f)
  # Dark mode (.dark-mode active): dark purple background, light text, muted gold border (#a88b32)
  # In both modes: appearance: none suppresses the OS-native arrow; a custom CSS arrow is rendered.

  Background:
    Given the user has navigated to the character sheet

  @smoke @frontend
  Scenario: Select elements render with a light background in light mode
    Given the app is in light mode
    Then all select elements on the character sheet have a light background colour
    And no select element displays an unstyled OS-native appearance

  @smoke @frontend
  Scenario: Select elements render with a dark background in dark mode
    Given the app is in dark mode
    Then all select elements on the character sheet have a dark background colour
    And no select element displays an unstyled OS-native appearance

  @regression @frontend
  Scenario: Select elements display dark text in light mode
    Given the app is in light mode
    Then all select elements on the character sheet display text in the dark charcoal colour

  @regression @frontend
  Scenario: Select elements display light text in dark mode
    Given the app is in dark mode
    Then all select elements on the character sheet display text in the light purple colour

  @regression @frontend
  Scenario: Select elements display a gold border in light mode
    Given the app is in light mode
    Then all select elements on the character sheet have a gold-coloured border

  @regression @frontend
  Scenario: Select elements display a muted gold border in dark mode
    Given the app is in dark mode
    Then all select elements on the character sheet have a muted gold-coloured border

  @regression @frontend
  Scenario: Select elements display a custom dropdown arrow in light mode
    Given the app is in light mode
    Then all select elements on the character sheet display a custom arrow indicator
    And no select element displays the default OS-native dropdown arrow

  @regression @frontend
  Scenario: Select elements display a custom dropdown arrow in dark mode
    Given the app is in dark mode
    Then all select elements on the character sheet display a custom arrow indicator
    And no select element displays the default OS-native dropdown arrow

  @regression @frontend
  Scenario: Toggling from light to dark mode updates select styling
    Given the app is in light mode
    When the user activates dark mode
    Then all select elements on the character sheet transition to a dark background
    And all select elements on the character sheet display light text

  @regression @frontend
  Scenario: Toggling from dark to light mode updates select styling
    Given the app is in dark mode
    When the user deactivates dark mode
    Then all select elements on the character sheet transition to a light background
    And all select elements on the character sheet display dark text

  @regression @frontend
  Scenario: Class dropdown retains correct theme styling after a selection
    Given the app is in light mode
    When the user selects a class from the "Class" dropdown
    Then the "Class" dropdown retains a light background, dark text, and gold border
    When the user activates dark mode
    Then the "Class" dropdown retains a dark background, light text, and muted gold border

  @regression @frontend
  Scenario: Subclass dropdown is styled correctly after a class is chosen
    Given the app is in light mode
    When the user selects a class from the "Class" dropdown
    And the user selects a subclass from the "Subclass" dropdown
    Then the "Subclass" dropdown has a light background, dark text, and gold border

  @regression @frontend
  Scenario: Weapon dropdown is styled correctly in both modes
    Given the app is in light mode
    Then the weapon select element has a light background, dark text, and gold border
    When the user activates dark mode
    Then the weapon select element has a dark background, light text, and muted gold border

  @regression @frontend
  Scenario: Armor dropdown is styled correctly in both modes
    Given the app is in light mode
    Then the armor select element has a light background, dark text, and gold border
    When the user activates dark mode
    Then the armor select element has a dark background, light text, and muted gold border

  @regression @frontend
  Scenario: A focused select element shows a visible focus ring in light mode
    Given the app is in light mode
    When the user focuses the "Class" dropdown using keyboard navigation
    Then the "Class" dropdown displays a visible focus indicator in the gold colour

  @regression @frontend
  Scenario: A focused select element shows a visible focus ring in dark mode
    Given the app is in dark mode
    When the user focuses the "Class" dropdown using keyboard navigation
    Then the "Class" dropdown displays a visible focus indicator in the muted gold colour

  @regression @frontend
  Scenario: A disabled or loading select element remains readable in light mode
    Given the app is in light mode
    And the SRD data has not yet loaded
    Then any disabled select elements on the character sheet are visually muted
    And the disabled select elements remain visible against the light background

  @regression @frontend
  Scenario: A disabled or loading select element remains readable in dark mode
    Given the app is in dark mode
    And the SRD data has not yet loaded
    Then any disabled select elements on the character sheet are visually muted
    And the disabled select elements remain visible against the dark background

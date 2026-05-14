Feature: Domain badges display after class selection
  As a player filling in my character sheet,
  I want to see my class's domain names appear in the header after selecting a class,
  So that I know which domains I have access to without consulting a separate rulebook.
  Backlog item: PBI-018

  Background:
    Given the character sheet is open

  @regression @smoke @frontend
  Scenario: Domain badges render correctly after selecting a class
    When the user selects "Bard" from the class dropdown
    Then two domain badges are displayed: "Grace" and "Codex"
    And the placeholder text "Select a class to see domains" is no longer visible

  @regression @frontend
  Scenario: Domain badges update when a different class is selected
    Given the user has selected "Bard" from the class dropdown
    When the user selects "Guardian" from the class dropdown
    Then two domain badges are displayed: "Valor" and "Blade"
    And no badges for "Grace" or "Codex" are visible

  @regression @frontend
  Scenario: Placeholder is shown when no class is selected
    Given no class has been selected
    Then the placeholder text "Select a class to see domains" is displayed
    And no domain badges are visible

  @regression @frontend
  Scenario: Domain badges render for all supported classes
    When the user selects "Druid" from the class dropdown
    Then two domain badges are displayed: "Sage" and "Arcana"
    When the user selects "Ranger" from the class dropdown
    Then two domain badges are displayed: "Bone" and "Sage"
    When the user selects "Rogue" from the class dropdown
    Then two domain badges are displayed: "Midnight" and "Grace"
    When the user selects "Seraph" from the class dropdown
    Then two domain badges are displayed: "Splendor" and "Valor"
    When the user selects "Sorcerer" from the class dropdown
    Then two domain badges are displayed: "Arcana" and "Midnight"
    When the user selects "Warrior" from the class dropdown
    Then two domain badges are displayed: "Blade" and "Bone"
    When the user selects "Wizard" from the class dropdown
    Then two domain badges are displayed: "Codex" and "Splendor"

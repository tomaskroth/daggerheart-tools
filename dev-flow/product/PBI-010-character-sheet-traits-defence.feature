Feature: Character Sheet Traits and Defence Statistics
  As a player, I want to record my six trait scores and defence values so that my
  character's core combat statistics are visible on the sheet.
  Backlog item: PBI-010

  Background:
    Given the application is running
    And the user is on the character sheet page

  @smoke @frontend
  Scenario: All six traits are displayed with their sub-skills
    Then the traits section displays "Agility" with sub-skills "Sprint", "Leap", "Maneuver"
    And the traits section displays "Strength" with sub-skills "Lift", "Smash", "Grapple"
    And the traits section displays "Finesse" with sub-skills "Control", "Hide", "Tinker"
    And the traits section displays "Instinct" with sub-skills "Perceive", "Sense", "Navigate"
    And the traits section displays "Presence" with sub-skills "Charm", "Perform", "Deceive"
    And the traits section displays "Knowledge" with sub-skills "Recall", "Analyze", "Comprehend"

  @regression @frontend
  Scenario: Trait score inputs accept positive integers
    When the user enters "2" in the "Presence" trait score field
    Then the "Presence" score field displays "2"

  @regression @frontend
  Scenario: Trait score inputs accept negative values
    When the user enters "-1" in the "Strength" trait score field
    Then the "Strength" score field displays "-1"

  @smoke @frontend
  Scenario: Evasion defaults to 10 on a new character sheet
    Then the "Evasion" field displays "10"

  @regression @frontend
  Scenario: Evasion field is editable
    When the user enters "12" in the "Evasion" field
    Then the "Evasion" field displays "12"

  @regression @frontend
  Scenario: Armor score field is editable
    When the user enters "3" in the "Armor Score" field
    Then the "Armor Score" field displays "3"

  @regression @frontend
  Scenario: Armor slot hearts are displayed and toggleable
    Then the armor section displays 6 heart slots
    When the user marks the first armor heart slot
    Then the first armor heart slot is shown as marked
    When the user marks the first armor heart slot again
    Then the first armor heart slot is shown as unmarked

  @regression @frontend
  Scenario: All six armor heart slots can be independently toggled
    When the user marks armor heart slot 3
    Then armor heart slot 3 is marked
    And armor heart slot 1 is not marked
    And armor heart slot 6 is not marked

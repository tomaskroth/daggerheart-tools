Feature: Trait Score Input Width
  The trait score number inputs must be wide enough to display any valid
  Daggerheart trait value, including negative numbers, without clipping.
  Backlog item: PBI-014

  Background:
    Given the user navigates to the character sheet page

  @regression @bug-PBI-014 @frontend
  Scenario: Negative trait score displays without clipping
    When the user enters "-2" in the "Agility" trait score field
    Then the "Agility" trait score field displays the value "-2" without truncation

  @regression @bug-PBI-014 @frontend
  Scenario: Two-digit positive trait score displays fully
    When the user enters "10" in the "Strength" trait score field
    Then the "Strength" trait score field displays the value "10" without truncation

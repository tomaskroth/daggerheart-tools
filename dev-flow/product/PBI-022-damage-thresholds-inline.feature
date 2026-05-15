Feature: Damage thresholds displayed as inline 2-input row in Damage and Health section
  As a character sheet user, I want the damage thresholds shown as a single inline row
  "Minor Damage | [input] | Major Damage | [input] | Severe Damage" with exactly two
  input fields, so I can see and set the category boundaries at a glance.
  Backlog item: PBI-022

  Background:
    Given the application is running
    And the user is on the character sheet page

  @smoke @frontend
  Scenario: Damage threshold row displays labels and inputs in the correct inline order
    Then the damage threshold row displays "Minor Damage" followed by an input field
    And then "Major Damage" followed by an input field
    And then "Severe Damage" as a trailing label

  @smoke @frontend
  Scenario: Damage threshold section contains exactly two input fields
    Then the damage threshold section contains exactly 2 input fields

  @regression @frontend
  Scenario: User can enter a value for the Minor-to-Major threshold
    When the user enters "5" in the first damage threshold input
    Then the first damage threshold input displays "5"

  @regression @frontend
  Scenario: User can enter a value for the Major-to-Severe threshold
    When the user enters "12" in the second damage threshold input
    Then the second damage threshold input displays "12"

  @regression @frontend
  Scenario: Threshold values are retained while interacting with other sheet fields
    When the user enters "5" in the first damage threshold input
    And the user enters "12" in the second damage threshold input
    And the user enters "Aria" in the Name field
    Then the first damage threshold input still displays "5"
    And the second damage threshold input still displays "12"

  @regression @frontend
  Scenario: Both threshold inputs are independently editable
    When the user enters "4" in the first damage threshold input
    And the user enters "11" in the second damage threshold input
    Then the first damage threshold input displays "4"
    And the second damage threshold input displays "11"

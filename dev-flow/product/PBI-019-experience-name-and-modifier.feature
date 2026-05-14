Feature: Experience lines have separate name and modifier fields
  As a player filling in my character sheet,
  I want each experience line to have a name field and a numeric modifier field,
  So that I can record experiences in the structured form the game uses,
  such as "Charlatan" with 2, matching how experiences are referenced during play.
  Backlog item: PBI-019

  Background:
    Given the character sheet is open

  @smoke @frontend
  Scenario: Each experience line shows a name field and a modifier field
    Then the experience section displays 5 rows
    And each row has a name input field
    And each row has a modifier input field

  @regression @frontend
  Scenario: Player can enter an experience name and modifier
    When the user enters "Charlatan" in the name field of experience line 1
    And the user enters 2 in the modifier field of experience line 1
    Then the name field of experience line 1 shows "Charlatan"
    And the modifier field of experience line 1 shows 2

  @regression @frontend
  Scenario: Player can enter a negative modifier
    When the user enters "Coward" in the name field of experience line 1
    And the user enters -1 in the modifier field of experience line 1
    Then the modifier field of experience line 1 shows -1

  @regression @frontend
  Scenario: Name and modifier fields are independent across experience lines
    When the user enters "Sailor" in the name field of experience line 2
    And the user enters 1 in the modifier field of experience line 2
    And the user enters "Acrobat" in the name field of experience line 3
    And the user enters 3 in the modifier field of experience line 3
    Then the name field of experience line 2 shows "Sailor"
    And the modifier field of experience line 2 shows 1
    And the name field of experience line 3 shows "Acrobat"
    And the modifier field of experience line 3 shows 3

  @regression @frontend
  Scenario: Experience fields are empty on initial load
    Then all experience name fields are empty
    And all experience modifier fields are empty

Feature: Class-specific HP slot count drives solid/dashed border rendering
  As a player filling in my character sheet,
  I want the number of solid HP boxes to reflect my chosen class,
  So that my sheet accurately shows the correct HP structure as defined in the
  Daggerheart rules, where different classes have different base hit point counts.
  Backlog item: PBI-017

  Background:
    Given the character sheet is open

  @smoke @frontend
  Scenario: HP boxes reflect the selected class's starting hit point count
    When the user selects "Bard" from the class dropdown
    Then exactly 5 HP boxes have a solid border
    And the remaining 5 HP boxes have a dashed border

  @regression @frontend
  Scenario: HP box borders update when a different class is selected
    Given the user has selected "Bard" from the class dropdown
    When the user selects "Guardian" from the class dropdown
    Then exactly 7 HP boxes have a solid border
    And the remaining 3 HP boxes have a dashed border

  @regression @frontend
  Scenario: HP boxes show a default when no class is selected
    Given no class has been selected
    Then exactly 6 HP boxes have a solid border
    And the remaining 4 HP boxes have a dashed border

  @regression @frontend
  Scenario: Each class renders the correct number of solid HP boxes
    When the user selects "Druid" from the class dropdown
    Then exactly 6 HP boxes have a solid border
    When the user selects "Ranger" from the class dropdown
    Then exactly 6 HP boxes have a solid border
    When the user selects "Rogue" from the class dropdown
    Then exactly 6 HP boxes have a solid border
    When the user selects "Seraph" from the class dropdown
    Then exactly 7 HP boxes have a solid border
    When the user selects "Sorcerer" from the class dropdown
    Then exactly 6 HP boxes have a solid border
    When the user selects "Warrior" from the class dropdown
    Then exactly 6 HP boxes have a solid border
    When the user selects "Wizard" from the class dropdown
    Then exactly 5 HP boxes have a solid border

  @regression @backend
  Scenario: Class API response includes the starting HP slot count for Bard
    When a request is made for the class with slug "bard"
    Then the response includes a field "hpSlotCount" with value 5

  @regression @backend
  Scenario: Class API response includes the starting HP slot count for Guardian
    When a request is made for the class with slug "guardian"
    Then the response includes a field "hpSlotCount" with value 7

  @regression @backend
  Scenario: All class API responses include a non-zero hpSlotCount
    When a request is made for each class in the system
    Then every response includes a field "hpSlotCount" with a value greater than 0

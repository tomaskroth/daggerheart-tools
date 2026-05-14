Feature: Class API response includes starting HP slot count
  As a frontend client,
  I want the class SRD item response to include the hpSlotCount field,
  So that the character sheet can render the correct number of solid HP boxes.
  Backlog item: PBI-017

  Background:
    Given the SRD data has been loaded

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

Feature: Compact identity bar — three fields per row
  As a player using the character sheet,
  I want the six identity fields to appear across two rows of three,
  So that the identity bar is more compact and less vertical space is consumed.
  Backlog item: PBI-023

  Background:
    Given the user has navigated to the character sheet

  @smoke @frontend
  Scenario: Identity fields render in three columns on a wide viewport
    Given the viewport is 1024px wide
    Then the identity bar displays three fields on the first row: "Name", "Pronouns", and "Class"
    And the identity bar displays three fields on the second row: "Heritage", "Subclass", and "Level"

  @regression @frontend
  Scenario: Field order is preserved in the three-column layout
    Given the viewport is 1024px wide
    Then the identity fields appear in order: "Name", "Pronouns", "Class", "Heritage", "Subclass", "Level"

  @regression @frontend
  Scenario: Identity grid collapses to two columns on a tablet viewport
    Given the viewport is 768px wide
    Then the identity bar displays two fields per row

  @regression @frontend
  Scenario: Identity grid collapses to one column on a small mobile viewport
    Given the viewport is 480px wide
    Then the identity bar displays one field per row

  @regression @frontend
  Scenario: All six identity fields remain visible and operable after layout change
    Given the viewport is 1024px wide
    When the user types "Seraphina" into the "Name" field
    And the user types "she/her" into the "Pronouns" field
    And the user selects a class from the "Class" dropdown
    And the user selects a heritage from the "Heritage" dropdown
    And the user enters "3" into the "Level" field
    Then all entered values are visible in the identity bar

Feature: Character sheet identity row full-width and traits 2-column layout
  As a character sheet user, I want the identity fields to span the full width at the
  top of the sheet and the trait scores to sit in a 2-column layout immediately below,
  so the sheet has a clear visual hierarchy with identity prominent and traits compact.
  Backlog item: PBI-021

  Background:
    Given the application is running
    And the user is on the character sheet page

  @smoke @frontend
  Scenario: Identity row spans the full width of the character sheet
    Then the identity row containing the Name, Pronouns, and Class fields spans the full width of the sheet

  @smoke @frontend
  Scenario: Trait scores section is displayed in a 2-column layout
    Then the traits section is displayed in a 2-column layout below the identity row

  @regression @frontend
  Scenario: Identity row is displayed above the traits section
    Then the identity row appears above the traits section on the character sheet

  @regression @frontend
  Scenario: Sections below the traits block remain in the existing 2-column layout
    Then the Damage and Health section appears below the traits section
    And it is displayed in the 2-column layout

  @regression @frontend
  Scenario: Identity fields remain editable after layout change
    When the user enters "Aria" in the Name field
    Then the Name field displays "Aria"

  @regression @frontend
  Scenario: Trait score inputs remain editable after layout change
    When the user enters "3" in the Agility trait input
    Then the Agility trait input displays "3"

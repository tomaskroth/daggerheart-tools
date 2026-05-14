Feature: Class Feature Section Full Width
  The Class Feature section must span the full width of the character
  sheet (both columns) so that text-heavy class feature content is
  readable and not cramped into a single narrow column.
  Backlog item: PBI-016

  Background:
    Given the user navigates to the character sheet page

  @regression @frontend
  Scenario: Class Feature section spans the full width of the character sheet
    When the user views the character sheet page
    Then the Class Feature section spans both columns

  @regression @frontend
  Scenario: Class Feature section renders full-width in dark mode
    Given the user has enabled dark mode
    When they navigate to the character sheet page
    Then the Class Feature section spans both columns

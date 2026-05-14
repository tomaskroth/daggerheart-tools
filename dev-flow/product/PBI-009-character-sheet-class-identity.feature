Feature: Character Sheet Class and Identity with SRD Data
  As a player, I want to select my class, heritage, and subclass from real Daggerheart
  options so that my character's identity is backed by SRD content.
  Backlog item: PBI-009

  Note: Subclass filtering by class requires a backend data update. The SRD does not
  currently store a class→subclass relationship. The Architecture Agent must include a
  step to request this mapping data from the product owner and persist it in the backend
  before the subclass dropdown can be filtered.

  Background:
    Given the application is running
    And the user is on the character sheet page

  @smoke @frontend
  Scenario: Class dropdown is populated with classes from the SRD
    Then the "Class" dropdown contains at least 9 options
    And the "Class" dropdown contains an option "Bard"
    And the "Class" dropdown contains an option "Druid"

  @smoke @frontend
  Scenario: Selecting a class displays the class domains
    When the user selects "Bard" from the "Class" dropdown
    Then the class header shows the domains "Grace" and "Codex"

  @regression @frontend
  Scenario: Selecting a class populates the class feature text
    When the user selects "Bard" from the "Class" dropdown
    Then the "Class Feature" section displays "Rally"
    And the "Class Feature" section displays text describing the Rally ability

  @regression @frontend
  Scenario: Selecting a class populates the Hope feature text
    When the user selects "Bard" from the "Class" dropdown
    Then the "Hope" section displays the Bard's Hope feature text containing "Make a Scene"

  @regression @frontend
  Scenario: Selecting a different class updates all class-specific content
    Given the user has selected "Bard" from the "Class" dropdown
    When the user selects "Druid" from the "Class" dropdown
    Then the class header shows the domains "Sage" and "Arcana"
    And the "Class Feature" section displays "Beastform"
    And the "Hope" section displays the Druid's Hope feature text containing "Evolution"

  @regression @frontend
  Scenario: Heritage dropdown is populated with communities from the SRD
    Then the "Heritage" dropdown contains at least 1 option

  @regression @frontend
  Scenario: Selecting a heritage records it on the sheet
    When the user selects a heritage from the "Heritage" dropdown
    Then the selected heritage is displayed in the heritage field

  @regression @frontend
  Scenario: Subclass dropdown is filtered to subclasses belonging to the selected class
    Given the user has selected "Bard" from the "Class" dropdown
    Then the "Subclass" dropdown contains only Bard subclasses
    And the "Subclass" dropdown does not contain subclasses from other classes

  @regression @frontend
  Scenario: Changing class resets the subclass selection and updates the subclass list
    Given the user has selected "Bard" from the "Class" dropdown
    And the user has selected a Bard subclass
    When the user selects "Druid" from the "Class" dropdown
    Then the subclass field is cleared
    And the "Subclass" dropdown contains only Druid subclasses

  @regression @frontend
  Scenario: No class selected shows an empty or disabled subclass dropdown
    Given no class has been selected
    Then the "Subclass" dropdown is empty or disabled

  @regression @frontend
  Scenario: Name and Pronouns fields accept free text
    When the user enters "Lyra Ashveil" in the "Name" field
    And the user enters "she/her" in the "Pronouns" field
    Then the "Name" field displays "Lyra Ashveil"
    And the "Pronouns" field displays "she/her"

  @regression @frontend
  Scenario: Level field accepts values from 1 to 10
    When the user enters "3" in the "Level" field
    Then the "Level" field displays "3"

  @regression @frontend
  Scenario: No class selected shows empty class feature section
    Given no class has been selected
    Then the "Class Feature" section is empty or shows a placeholder prompt

  @regression @frontend
  Scenario: No class selected shows empty Hope feature text
    Given no class has been selected
    Then the "Hope" section shows no class feature text

  @security @frontend
  Scenario: Class feature section does not execute script tags from SRD content
    Given a class whose SRD content contains a "<script>alert('xss')</script>" tag
    When the user selects that class from the "Class" dropdown
    Then the class feature section renders without executing the script
    And no alert dialog is triggered

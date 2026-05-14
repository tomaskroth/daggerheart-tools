Feature: Character Sheet Health, Hope, Gold and Experience Trackers
  As a player, I want to track my HP, Stress, Hope, Gold, and Experiences on the sheet
  so that I can use it as a live reference during a session.
  Backlog item: PBI-011

  Background:
    Given the application is running
    And the user is on the character sheet page

  @smoke @frontend
  Scenario: Damage threshold inputs are displayed with a level hint
    Then the "Damage & Health" section contains a "Minor Damage" threshold input
    And the "Damage & Health" section contains a "Major Damage" threshold input
    And the "Damage & Health" section contains a "Severe Damage" threshold input
    And the "Damage & Health" section shows helper text "Add your current level"

  @regression @frontend
  Scenario: Damage thresholds are manually editable
    When the user enters "4" in the "Minor Damage" field
    And the user enters "9" in the "Major Damage" field
    And the user enters "14" in the "Severe Damage" field
    Then the "Minor Damage" field displays "4"
    And the "Major Damage" field displays "9"
    And the "Severe Damage" field displays "14"

  @smoke @frontend
  Scenario: HP tracker shows 6 solid slots and 4 dashed overflow slots
    Then the HP tracker displays 6 solid checkbox slots
    And the HP tracker displays 4 dashed overflow checkbox slots
    And all HP slots are initially unmarked

  @regression @frontend
  Scenario: HP slots can be individually toggled
    When the user marks HP slot 1
    Then HP slot 1 is marked
    And HP slot 2 is not marked
    When the user marks HP slot 1 again
    Then HP slot 1 is not marked

  @regression @frontend
  Scenario: Stress tracker shows 4 solid slots and 4 dashed overflow slots
    Then the Stress tracker displays 4 solid checkbox slots
    And the Stress tracker displays 4 dashed overflow checkbox slots
    And all Stress slots are initially unmarked

  @regression @frontend
  Scenario: Stress slots can be individually toggled
    When the user marks Stress slot 2
    Then Stress slot 2 is marked
    And Stress slot 1 is not marked

  @smoke @frontend
  Scenario: Hope tracker displays 6 toggleable diamond slots
    Then the "Hope" section displays 6 diamond slots
    And all Hope diamonds are initially unmarked

  @regression @frontend
  Scenario: Hope diamonds can be individually toggled
    When the user marks Hope diamond 3
    Then Hope diamond 3 is marked
    And Hope diamond 1 is not marked

  @regression @frontend
  Scenario: Proficiency tracker displays 6 pips with the first filled by default
    Then the "Active Weapons" section displays a proficiency tracker with 6 pips
    And proficiency pip 1 is filled by default
    And proficiency pips 2 through 6 are empty by default

  @regression @frontend
  Scenario: Proficiency pips can be toggled to mark advancement
    When the user marks proficiency pip 2
    Then proficiency pip 2 is marked

  @regression @frontend
  Scenario: Experience section has 5 editable text lines
    Then the "Experience" section contains 5 text input lines
    When the user enters "Convinced the elder to open the gates" in experience line 1
    Then experience line 1 displays "Convinced the elder to open the gates"

  @smoke @frontend
  Scenario: Gold tracker shows Handfuls, Bags, and Chest
    Then the "Gold" section displays a "Handfuls" tracker with 9 slots
    And the "Gold" section displays a "Bags" tracker with 9 slots
    And the "Gold" section displays a "Chest" tracker with 1 slot

  @regression @frontend
  Scenario: Gold handful slots can be toggled
    When the user marks 3 handful slots
    Then 3 handful slots are marked
    And 6 handful slots are not marked

  @regression @frontend
  Scenario: Hope class feature text is shown when a class is selected
    Given the user has selected "Bard" from the "Class" dropdown
    Then the "Hope" section displays the Bard's Hope feature description

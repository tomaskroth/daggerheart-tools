Feature: Character Sheet Weapons, Armor and Inventory
  As a player, I want to select my active weapons and armour from SRD options and record
  inventory items so that my equipment section is complete and accurate.
  Backlog item: PBI-012

  Background:
    Given the application is running
    And the user is on the character sheet page

  @smoke @frontend
  Scenario: Active Primary weapon section is displayed
    Then the "Active Weapons" section contains a "Primary" weapon panel
    And the Primary weapon panel has fields for "Name", "Trait & Range", "Damage Dice & Type", and "Feature"

  @smoke @frontend
  Scenario: Active Secondary weapon section is displayed
    Then the "Active Weapons" section contains a "Secondary" weapon panel
    And the Secondary weapon panel has fields for "Name", "Trait & Range", "Damage Dice & Type", and "Feature"

  @regression @frontend
  Scenario: Primary weapon picker is populated with weapons from the SRD
    Then the Primary weapon picker contains at least 1 option

  @regression @frontend
  Scenario: Selecting a primary weapon from SRD auto-fills its fields
    When the user selects "Rapier" from the Primary weapon picker
    Then the Primary "Name" field displays "Rapier"
    And the Primary "Trait & Range" field is populated
    And the Primary "Damage Dice & Type" field is populated
    And the Primary "Feature" field is populated

  @regression @frontend
  Scenario: Primary weapon fields remain editable after SRD selection
    Given the user has selected "Rapier" from the Primary weapon picker
    When the user changes the Primary "Name" field to "Silver Rapier"
    Then the Primary "Name" field displays "Silver Rapier"

  @regression @frontend
  Scenario: Secondary weapon picker is populated with weapons from the SRD
    Then the Secondary weapon picker contains at least 1 option

  @regression @frontend
  Scenario: Selecting a secondary weapon from SRD auto-fills its fields
    When the user selects "Small Dagger" from the Secondary weapon picker
    Then the Secondary "Name" field displays "Small Dagger"
    And the Secondary "Trait & Range" field is populated
    And the Secondary "Damage Dice & Type" field is populated
    And the Secondary "Feature" field is populated

  @smoke @frontend
  Scenario: Active Armor section is displayed
    Then the "Active Armor" section contains fields for "Name", "Base Thresholds", "Base Score", and "Feature"

  @regression @frontend
  Scenario: Active armor picker is populated with armor from the SRD
    Then the armor picker contains at least 1 option

  @regression @frontend
  Scenario: Selecting armor from SRD auto-fills its fields
    When the user selects "Gambeson Armor" from the armor picker
    Then the "Active Armor" "Name" field displays "Gambeson Armor"
    And the "Active Armor" "Base Thresholds" field is populated
    And the "Active Armor" "Base Score" field is populated
    And the "Active Armor" "Feature" field is populated

  @regression @frontend
  Scenario: Inventory section has 6 free-text lines
    Then the "Inventory" section contains 6 text input lines
    When the user enters "50 feet of rope" in inventory line 1
    Then inventory line 1 displays "50 feet of rope"

  @regression @frontend
  Scenario: First inventory weapon slot has manual fields and a Primary toggle
    Then the first "Inventory Weapon" panel has a "Name" field
    And the first "Inventory Weapon" panel has a "Trait & Range" field
    And the first "Inventory Weapon" panel has a "Damage Dice & Type" field
    And the first "Inventory Weapon" panel has a "Feature" field
    And the first "Inventory Weapon" panel has a "Primary" toggle

  @regression @frontend
  Scenario: Second inventory weapon slot exists with the same fields
    Then the second "Inventory Weapon" panel has a "Name" field
    And the second "Inventory Weapon" panel has a "Primary" toggle

  @regression @frontend
  Scenario: Inventory weapon Primary/Secondary toggle can be switched
    When the user selects "Primary" on the first Inventory Weapon toggle
    Then the first Inventory Weapon is marked as "Primary"
    When the user selects "Secondary" on the first Inventory Weapon toggle
    Then the first Inventory Weapon is marked as "Secondary"

  @regression @frontend
  Scenario: Weapons and armor fields can be filled manually without SRD selection
    When the user enters "Custom Blade" in the Primary "Name" field
    And the user enters "Finesse - Melee" in the Primary "Trait & Range" field
    And the user enters "d10 phy" in the Primary "Damage Dice & Type" field
    Then the Primary weapon panel displays the manually entered values

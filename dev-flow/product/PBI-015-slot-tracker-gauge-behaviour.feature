Feature: Slot Tracker Gauge Behaviour
  HP, stress, hope diamond, armor, and proficiency slot trackers must
  fill from left to right and empty from right to left when clicked,
  matching the physical Daggerheart character sheet gauge metaphor.
  Backlog item: PBI-015

  Background:
    Given the user navigates to the character sheet page

  # ── HP tracker ────────────────────────────────────────────────────────

  @regression @frontend
  Scenario: Clicking an empty HP slot fills all slots up to and including it
    When the user clicks HP slot 4
    Then HP slots 1 through 4 are marked
    And HP slots 5 through 10 are unmarked

  @regression @frontend
  Scenario: Clicking the last filled HP slot empties it
    Given HP slots 1 through 3 are marked
    When the user clicks HP slot 3
    Then HP slots 1 through 2 are marked
    And HP slot 3 is unmarked

  @regression @frontend
  Scenario: Clicking an earlier filled HP slot empties from that slot rightward
    Given HP slots 1 through 5 are marked
    When the user clicks HP slot 3
    Then HP slots 1 through 2 are marked
    And HP slots 3 through 10 are unmarked

  # ── Stress tracker ────────────────────────────────────────────────────

  @regression @frontend
  Scenario: Clicking an empty stress slot fills all slots up to and including it
    When the user clicks stress slot 3
    Then stress slots 1 through 3 are marked
    And stress slots 4 through 8 are unmarked

  @regression @frontend
  Scenario: Clicking the last filled stress slot empties it
    Given stress slots 1 through 4 are marked
    When the user clicks stress slot 4
    Then stress slots 1 through 3 are marked
    And stress slot 4 is unmarked

  # ── Hope diamonds ─────────────────────────────────────────────────────

  @regression @frontend
  Scenario: Clicking an empty hope diamond fills all diamonds up to and including it
    When the user clicks hope diamond 3
    Then hope diamonds 1 through 3 are marked
    And hope diamonds 4 through 6 are unmarked

  @regression @frontend
  Scenario: Clicking the last filled hope diamond empties it
    Given hope diamonds 1 through 2 are marked
    When the user clicks hope diamond 2
    Then hope diamond 1 is marked
    And hope diamond 2 is unmarked

  # ── Armor slots ───────────────────────────────────────────────────────

  @regression @frontend
  Scenario: Clicking an empty armor slot fills all slots up to and including it
    When the user clicks armor slot 3
    Then armor slots 1 through 3 are marked
    And armor slots 4 through 6 are unmarked

  @regression @frontend
  Scenario: Clicking the last filled armor slot empties it
    Given armor slots 1 through 4 are marked
    When the user clicks armor slot 4
    Then armor slots 1 through 3 are marked
    And armor slot 4 is unmarked

  # ── Proficiency pips ──────────────────────────────────────────────────

  @regression @frontend
  Scenario: Clicking an empty proficiency pip fills all pips up to and including it
    When the user clicks proficiency pip 4
    Then proficiency pips 1 through 4 are filled
    And proficiency pips 5 through 6 are unfilled

  @regression @frontend
  Scenario: Clicking the last filled proficiency pip empties it
    Given proficiency pips 1 through 3 are filled
    When the user clicks proficiency pip 3
    Then proficiency pips 1 through 2 are filled
    And proficiency pip 3 is unfilled

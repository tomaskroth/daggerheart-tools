Feature: Backend Service Layer
  The backend must have a service layer that encapsulates all business logic,
  leaving controllers responsible only for HTTP parsing and response formatting.
  All existing API behaviour is preserved — this is a structural refactoring only.
  Backlog item: PBI-002

  Background:
    Given the application is running
    And the SRD data has been loaded

  # --- Existing API behaviour is preserved after refactoring ---

  @smoke @backend
  Scenario: Full-text search returns matching items
    When a POST request is made to "/api/search" with body '{"q": "guardian"}'
    Then the response status is 200
    And the response body contains a field "items" that is a list
    And the response body contains a field "total" that is a number

  @regression @backend
  Scenario: Search with no query returns all items with default pagination
    When a POST request is made to "/api/search" with an empty body
    Then the response status is 200
    And the response body field "items" contains at most 300 entries

  @regression @backend
  Scenario: Search with type filter returns only items of that type
    When a POST request is made to "/api/search" with body '{"types": ["WEAPONS"]}'
    Then the response status is 200
    And every item in the response has type "WEAPONS"

  @regression @backend
  Scenario: Item lookup by slug returns the correct item
    Given an SRD item exists with slug "guardian-warrior"
    When a GET request is made to "/api/srd/guardian-warrior"
    Then the response status is 200
    And the response body contains a field "slug" with value "guardian-warrior"

  @regression @backend
  Scenario: Item lookup for unknown slug returns 404
    When a GET request is made to "/api/srd/this-does-not-exist"
    Then the response status is 404

  @regression @backend
  Scenario: Types endpoint returns the full list of SRD types
    When a GET request is made to "/api/srd/types"
    Then the response status is 200
    And the response body is a list containing "WEAPONS"
    And the response body is a list containing "ABILITIES"

  @regression @backend
  Scenario: SRD data is automatically loaded on application startup
    Given the application has just started with an empty index
    Then the Lucene index is not empty
    And a search for "guardian" returns at least one result

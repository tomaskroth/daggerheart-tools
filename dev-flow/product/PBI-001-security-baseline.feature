Feature: Security Baseline
  The application must protect its admin/write endpoints from unauthenticated access,
  and must sanitise database-sourced HTML content before rendering it in the browser.
  No user-visible behaviour changes. Backend API read endpoints remain publicly accessible.
  Backlog item: PBI-001

  Background:
    Given the application is running

  # --- Admin endpoint protection ---

  @smoke @backend @security
  Scenario: Unauthenticated request to bulk upsert endpoint is rejected
    When an unauthenticated POST request is made to "/api/srd/_bulkUpsert" with a valid payload
    Then the response status is 401

  @smoke @backend @security
  Scenario: Unauthenticated request to reindex endpoint is rejected
    When an unauthenticated GET request is made to "/api/srd/_reindex"
    Then the response status is 401

  @regression @backend @security
  Scenario: Read endpoints remain publicly accessible without authentication
    When an unauthenticated GET request is made to "/api/srd/types"
    Then the response status is 200
    When an unauthenticated POST request is made to "/api/search" with body '{"q": "warrior"}'
    Then the response status is 200

  @regression @backend @security
  Scenario: HTTP security headers are present on API responses
    When an unauthenticated GET request is made to "/api/srd/types"
    Then the response header "X-Content-Type-Options" is "nosniff"
    And the response header "X-Frame-Options" is "DENY"
    And the response header "Content-Security-Policy" is present

  @regression @backend @security
  Scenario: CORS is configured in exactly one place
    When a preflight OPTIONS request is made to "/api/search" from origin "http://localhost:3000"
    Then the response status is 200
    And the response header "Access-Control-Allow-Origin" is present

  # --- Content sanitisation ---

  @smoke @backend @security
  Scenario: HTML content containing a script tag is sanitised before being stored
    Given admin credentials are available
    When an authenticated POST request is made to "/api/srd/_bulkUpsert" with an item whose content contains "<script>alert('xss')</script>Warrior text"
    Then the stored item's content does not contain "<script>"
    And the stored item's content retains the safe text "Warrior text"

  @smoke @frontend @security
  Scenario: Item detail page does not execute script tags from content
    Given an SRD item exists with content containing a script tag
    When the user navigates to that item's detail page
    Then no script alert is executed
    And the item title is visible on the page

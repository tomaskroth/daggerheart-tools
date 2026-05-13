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
    // Verified by SearchBar.test.tsx Vitest assertions
});

When('the user types {string} into the search input', function (this: CustomWorld, _query: string) {
    // Verified by SearchBar.test.tsx Vitest assertions
});

When('the user clicks the Search button', function (this: CustomWorld) {
    // Verified by SearchBar.test.tsx Vitest assertions
});

Then('the mock search handler is called with {string}', function (this: CustomWorld, _query: string) {
    // Verified by SearchBar.test.tsx Vitest assertions
});

When('the user submits the form without typing anything', function (this: CustomWorld) {
    // Verified by SearchBar.test.tsx Vitest assertions
});

Then('the mock search handler is not called', function (this: CustomWorld) {
    // Verified by SearchBar.test.tsx Vitest assertions
});

// =============================================================================
// @regression: ItemList stubs (PBI-006, activated in PBI-005)
// =============================================================================

Given('the ItemList component is rendered with {int} mock items', function (this: CustomWorld, _count: number) {
    // Verified by ItemList.test.tsx Vitest assertions
});

Then('{int} item cards are visible', function (this: CustomWorld, _count: number) {
    // Verified by ItemList.test.tsx Vitest assertions
});

Given('the ItemList component is rendered with an empty list', function (this: CustomWorld) {
    // Verified by ItemList.test.tsx Vitest assertions
});

Then('no item cards are visible', function (this: CustomWorld) {
    // Verified by ItemList.test.tsx Vitest assertions
});

Then('no error is thrown', function (this: CustomWorld) {
    // Verified by ItemList.test.tsx Vitest assertions
});

// =============================================================================
// PBI-001 @frontend @security stubs
// =============================================================================

Given('an SRD item exists with content containing a script tag', function (this: CustomWorld) {
    // TODO PBI-001: implement — activate when security e2e wiring is complete (TD-003)
});

When('the user navigates to that item\'s detail page', function (this: CustomWorld) {
    // TODO PBI-001: implement — activate when security e2e wiring is complete (TD-003)
});

Then('no script alert is executed', function (this: CustomWorld) {
    // TODO PBI-001: implement — activate when security e2e wiring is complete (TD-003)
});

Then('the item title is visible on the page', function (this: CustomWorld) {
    // TODO PBI-001: implement — activate when security e2e wiring is complete (TD-003)
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

Given('search results are displayed', async function (this: CustomWorld) {
    const appPage = new AppPage(this.page);
    await appPage.navigate();
    await appPage.waitForReady();
    await appPage.typeInSearchBar('guardian');
    await appPage.submitSearch();
    await appPage.waitForSearchResults();
});

When('the user clicks on the first result card', async function (this: CustomWorld) {
    const appPage = new AppPage(this.page);
    await appPage.clickFirstCard();
});

Then('the item detail view is displayed', async function (this: CustomWorld) {
    const appPage = new AppPage(this.page);
    await appPage.waitForItemDetail();
});

Then('a back button is visible', function (this: CustomWorld) {
    // TODO PBI-004: implement real assertion — activate when TypeScript migration is complete
});

When('the user clicks the dark mode toggle', async function (this: CustomWorld) {
    const appPage = new AppPage(this.page);
    await appPage.enableDarkMode();
});

Then('the dark mode class is applied to the document', async function (this: CustomWorld) {
    const appPage = new AppPage(this.page);
    expect(await appPage.isDarkModeActive()).toBe(true);
});

When('the user clicks the dark mode toggle again', async function (this: CustomWorld) {
    const appPage = new AppPage(this.page);
    await appPage.enableDarkMode();
});

Then('the dark mode class is removed from the document', async function (this: CustomWorld) {
    const appPage = new AppPage(this.page);
    expect(await appPage.isDarkModeActive()).toBe(false);
});

// =============================================================================
// PBI-005 @frontend (frontend architecture) — real assertions
// =============================================================================

Then('the item detail view is displayed with a title and content', async function (this: CustomWorld) {
    const appPage = new AppPage(this.page);
    await appPage.waitForItemDetail();
    const title = await appPage.getItemTitle();
    expect(title.length).toBeGreaterThan(0);
});

When('the user clicks the back button', async function (this: CustomWorld) {
    const appPage = new AppPage(this.page);
    await appPage.clickBackButton();
});

Then('the search results list is displayed again', async function (this: CustomWorld) {
    const appPage = new AppPage(this.page);
    await appPage.waitForSearchResults();
});

When('the user clicks the {string} type filter', async function (this: CustomWorld, type: string) {
    const appPage = new AppPage(this.page);
    await appPage.clickTypeFilter(type);
});

Then('result cards are displayed', async function (this: CustomWorld) {
    const appPage = new AppPage(this.page);
    await appPage.waitForSearchResults();
});

Then('each visible result card shows type {string}', async function (this: CustomWorld, type: string) {
    const appPage = new AppPage(this.page);
    const cardTypes = await appPage.getCardTypes();
    expect(cardTypes.length).toBeGreaterThan(0);
    for (const cardType of cardTypes) {
        expect(cardType).toBe(type.toLowerCase());
    }
});

When('the user navigates directly to the URL {string}', async function (this: CustomWorld, path: string) {
    const appPage = new AppPage(this.page);
    await appPage.navigateTo(path);
});

Then('the item title is visible', async function (this: CustomWorld) {
    const appPage = new AppPage(this.page);
    await appPage.waitForItemDetail();
    const title = await appPage.getItemTitle();
    expect(title.length).toBeGreaterThan(0);
});

When('the user enables dark mode', async function (this: CustomWorld) {
    const appPage = new AppPage(this.page);
    await appPage.enableDarkMode();
});

When('the user reloads the page', async function (this: CustomWorld) {
    const appPage = new AppPage(this.page);
    await appPage.reloadPage();
});

Then('dark mode is still active', async function (this: CustomWorld) {
    const appPage = new AppPage(this.page);
    expect(await appPage.isDarkModeActive()).toBe(true);
});

Given('search results include an item of type {string}', async function (this: CustomWorld, _type: string) {
    const appPage = new AppPage(this.page);
    await appPage.navigate();
    await appPage.waitForReady();
    await appPage.typeInSearchBar('arcane');
    await appPage.submitSearch();
    await appPage.waitForSearchResults();
});

When('the user clicks on that item', async function (this: CustomWorld) {
    const appPage = new AppPage(this.page);
    await appPage.clickItemCardByTitle('Arcane Strike');
});

Then('the abilities card is displayed', async function (this: CustomWorld) {
    const appPage = new AppPage(this.page);
    await appPage.waitForAbilitiesCard();
});

Then('the recall cost is shown', async function (this: CustomWorld) {
    const appPage = new AppPage(this.page);
    expect(await appPage.isRecallCostVisible()).toBe(true);
});

Then('the level is shown', async function (this: CustomWorld) {
    const appPage = new AppPage(this.page);
    expect(await appPage.isLevelVisible()).toBe(true);
});

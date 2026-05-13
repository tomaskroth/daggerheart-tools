import { Page } from 'playwright';

const APP_URL = process.env.APP_URL ?? 'http://localhost:3000';

export class AppPage {
    constructor(private readonly page: Page) {}

    async navigate(): Promise<void> {
        await this.page.goto(APP_URL);
    }

    async navigateTo(path: string): Promise<void> {
        await this.page.goto(APP_URL + path);
    }

    async waitForReady(): Promise<void> {
        await this.page.waitForSelector('form.search-bar', { timeout: 10000 });
    }

    async waitForItemDetail(): Promise<void> {
        await this.page.waitForSelector('.item-detail', { timeout: 10000 });
    }

    async waitForSearchResults(): Promise<void> {
        await this.page.waitForSelector('.item-card', { timeout: 10000 });
    }

    async typeInSearchBar(query: string): Promise<void> {
        await this.page.fill('input[placeholder="Search compendium..."]', query);
    }

    async submitSearch(): Promise<void> {
        await this.page.click('button[type="submit"]');
    }

    async getResultCards(): Promise<number> {
        await this.page.waitForSelector('.item-card', { timeout: 5000 });
        return this.page.$$eval('.item-card', (els) => els.length);
    }

    async clickFirstCard(): Promise<void> {
        await this.page.waitForSelector('.item-card', { timeout: 5000 });
        await this.page.locator('.item-card').first().click();
    }

    async clickItemCardByTitle(title: string): Promise<void> {
        await this.page.waitForSelector('.item-card', { timeout: 5000 });
        await this.page.locator('.item-card').filter({ hasText: title }).click();
    }

    async clickBackButton(): Promise<void> {
        await this.page.click('button:has-text("Back")');
    }

    async clickTypeFilter(type: string): Promise<void> {
        await this.page.click(`.type-menu button:has-text("${type}")`);
    }

    async enableDarkMode(): Promise<void> {
        await this.page.click('.dark-mode-toggle');
    }

    async reloadPage(): Promise<void> {
        await this.page.reload();
        await this.waitForReady();
    }

    async isDarkModeActive(): Promise<boolean> {
        return this.page.$eval('body', (el) => el.classList.contains('dark-mode'));
    }

    async getItemTitle(): Promise<string> {
        return (await this.page.textContent('.item-detail h1')) ?? '';
    }

    async waitForAbilitiesCard(): Promise<void> {
        await this.page.waitForSelector('.ability-card', { timeout: 10000 });
    }

    async isRecallCostVisible(): Promise<boolean> {
        const el = await this.page.$('.recall');
        return el !== null;
    }

    async isLevelVisible(): Promise<boolean> {
        const el = await this.page.$('.level');
        return el !== null;
    }

    async getCardTypes(): Promise<string[]> {
        await this.page.waitForSelector('.item-card', { timeout: 5000 });
        return this.page.$$eval('.item-card img', (imgs) =>
            imgs.map((img) => (img as HTMLImageElement).alt.toLowerCase()),
        );
    }
}

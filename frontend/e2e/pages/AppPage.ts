import { Page } from 'playwright';

const APP_URL = process.env.APP_URL ?? 'http://localhost:3000';

export class AppPage {
    constructor(private readonly page: Page) {}

    async navigate(): Promise<void> {
        await this.page.goto(APP_URL);
    }

    async waitForReady(): Promise<void> {
        await this.page.waitForSelector('form.search-bar', { timeout: 10000 });
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
}

import { setWorldConstructor, World, IWorldOptions, BeforeAll, AfterAll, Before, After } from '@cucumber/cucumber';
import { BrowserContext, Page, chromium, Browser } from 'playwright';

const API_BASE = process.env.REACT_APP_API_URL ?? 'https://daggerheart-tools-4v1t.onrender.com/api';

export class CustomWorld extends World {
    context!: BrowserContext;
    page!: Page;
    consoleErrors: string[] = [];

    constructor(options: IWorldOptions) {
        super(options);
    }
}

let sharedBrowser: Browser;

BeforeAll(async () => {
    sharedBrowser = await chromium.launch({ headless: true });
});

AfterAll(async () => {
    await sharedBrowser.close();
});

Before(async function (this: CustomWorld) {
    this.context = await sharedBrowser.newContext();
    this.page = await this.context.newPage();
    this.consoleErrors = [];

    this.page.on('console', (msg) => {
        if (msg.type() === 'error' && !msg.text().startsWith('Warning:')) {
            this.consoleErrors.push(msg.text());
        }
    });

    await this.page.route(API_BASE, (route) => {
        route.fulfill({ status: 200, body: 'OK' });
    });

    await this.page.route(`${API_BASE}/srd/types`, (route) => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(['Ability', 'Armor', 'Weapon']),
        });
    });

    await this.page.route(`${API_BASE}/search`, (route) => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                items: [
                    { id: 1, title: 'Guardian Warrior', type: 'abilities', slug: 'guardian-warrior' },
                    { id: 2, title: 'Guardian Shield', type: 'armor', slug: 'guardian-shield' },
                ],
                total: 2,
            }),
        });
    });
});

After(async function (this: CustomWorld) {
    await this.page.close();
    await this.context.close();
});

setWorldConstructor(CustomWorld);

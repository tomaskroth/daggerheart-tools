import { setWorldConstructor, World, IWorldOptions, BeforeAll, AfterAll, Before, After } from '@cucumber/cucumber';
import { BrowserContext, Page, chromium, Browser } from 'playwright';

const API_BASE = process.env.VITE_API_URL ?? 'https://daggerheart-tools-4v1t.onrender.com/api';

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

    const slugItems: Record<string, object> = {
        'guardian-warrior': { id: '1', title: 'Guardian Warrior', type: 'ABILITIES', slug: 'guardian-warrior', content: '<p>Warrior content</p>' },
        'guardian-shield':  { id: '2', title: 'Guardian Shield', type: 'ARMOR', slug: 'guardian-shield', content: '<p>Shield content</p>' },
        'arcane-strike':    { id: '3', title: 'Arcane Strike', type: 'ABILITIES', slug: 'arcane-strike', content: '<p>Ability content</p>', level: 2, recallCost: '1' },
        'iron-sword':       { id: '4', title: 'Iron Sword', type: 'WEAPONS', slug: 'iron-sword', content: '<p>A sword</p>' },
        'gore-and-glory':   { id: '5', title: 'Gore And Glory', type: 'ABILITIES', slug: 'gore-and-glory', content: '<p>Multi-word ability</p>', level: 9, recallCost: '2' },
    };
    await this.page.route(`${API_BASE}/srd/**`, (route) => {
        const slug = route.request().url().split('/srd/').pop() ?? '';
        const item = slugItems[slug] ?? { id: '99', title: slug, type: 'ABILITIES', slug, content: '<p>Content</p>' };
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(item) });
    });

    // Registered after srd/** so it takes priority in Playwright's LIFO evaluation order
    await this.page.route(`${API_BASE}/srd/types`, (route) => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(['ABILITIES', 'ARMOR', 'WEAPONS', 'ANCESTRIES']),
        });
    });

    await this.page.route(`${API_BASE}/search`, async (route) => {
        const body = JSON.parse(route.request().postData() ?? '{}') as { q?: string; types?: string[] };
        if (body.types?.some((t) => t.toLowerCase() === 'weapons')) {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    items: [
                        { id: '4', title: 'Iron Sword', type: 'weapons', slug: 'iron-sword', content: '<p>A sword</p>' },
                    ],
                    total: 1,
                }),
            });
        } else if (body.q?.toLowerCase().includes('arcane')) {
            // Return the ABILITIES item first so DetailRoute renders AbilitiesCard
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    items: [
                        { id: '3', title: 'Arcane Strike', type: 'ABILITIES', slug: 'arcane-strike', content: '<p>Ability content</p>', level: '2', recallCost: '1' },
                    ],
                    total: 1,
                }),
            });
        } else {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    items: [
                        { id: '1', title: 'Guardian Warrior', type: 'abilities', slug: 'guardian-warrior', content: '<p>Warrior content</p>' },
                        { id: '2', title: 'Guardian Shield', type: 'armor', slug: 'guardian-shield', content: '<p>Shield content</p>' },
                        { id: '3', title: 'Arcane Strike', type: 'ABILITIES', slug: 'arcane-strike', content: '<p>Ability content</p>', level: '2', recallCost: '1' },
                    ],
                    total: 3,
                }),
            });
        }
    });
});

After(async function (this: CustomWorld) {
    await this.page.close();
    await this.context.close();
});

setWorldConstructor(CustomWorld);

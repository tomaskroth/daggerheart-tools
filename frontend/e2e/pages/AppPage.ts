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

    // =============================================================================
    // Character Sheet helpers (PBI-008)
    // =============================================================================

    async navigateToCharacterSheet(): Promise<void> {
        await this.page.goto(APP_URL + '/character-sheet');
    }

    async clickNavLink(text: string): Promise<void> {
        await this.page.click(`nav a:has-text("${text}")`);
    }

    async waitForCharacterSheet(): Promise<void> {
        await this.page.waitForSelector('[data-testid="character-sheet"]', { timeout: 10000 });
    }

    async getPageTitle(): Promise<string> {
        return (await this.page.textContent('.character-sheet__title')) ?? '';
    }

    async hasColumn(side: 'left' | 'right'): Promise<boolean> {
        const el = await this.page.$(`[data-testid="${side}-column"]`);
        return el !== null;
    }

    async columnContainsSection(side: 'left' | 'right', label: string): Promise<boolean> {
        const column = await this.page.$(`[data-testid="${side}-column"]`);
        if (!column) return false;
        const text = await column.textContent();
        return (text ?? '').toLowerCase().includes(label.toLowerCase());
    }

    async hasHeaderInput(label: string): Promise<boolean> {
        const el = await this.page.$(`[data-testid="character-sheet"] input[aria-label="${label}"]`);
        return el !== null;
    }

    async hasHeaderNumericInput(label: string): Promise<boolean> {
        const el = await this.page.$(`[data-testid="character-sheet"] input[aria-label="${label}"][type="number"]`);
        return el !== null;
    }

    async hasClassHeaderSection(): Promise<boolean> {
        const el = await this.page.$('[data-testid="class-header"]');
        return el !== null;
    }

    async isCharacterSheetPageDisplayed(): Promise<boolean> {
        const el = await this.page.$('[data-testid="character-sheet"]');
        return el !== null;
    }

    async hasNoHeading404(): Promise<boolean> {
        const text = await this.page.textContent('body');
        return !(text ?? '').includes('404');
    }

    // =============================================================================
    // Character Sheet helpers (PBI-009 — Class Identity)
    // =============================================================================

    async getDropdownOptionCount(ariaLabel: string): Promise<number> {
        const select = this.page.locator(`select[aria-label="${ariaLabel}"]`);
        await select.waitFor({ timeout: 10000 });
        return select.locator('option').count();
    }

    async dropdownContainsOption(ariaLabel: string, optionText: string): Promise<boolean> {
        const select = this.page.locator(`select[aria-label="${ariaLabel}"]`);
        await select.waitFor({ timeout: 10000 });
        const options = await select.locator('option').allTextContents();
        return options.some((text) => text.trim() === optionText);
    }

    async selectDropdownOption(ariaLabel: string, optionText: string): Promise<void> {
        const select = this.page.locator(`select[aria-label="${ariaLabel}"]`);
        await select.waitFor({ timeout: 10000 });
        await select.selectOption({ label: optionText });
        // Allow React state updates to propagate
        await this.page.waitForTimeout(500);
    }

    async getDomainBadgeTexts(): Promise<string[]> {
        await this.page.waitForSelector('[data-testid="class-badges"]', { timeout: 10000 });
        return this.page.$$eval(
            '[data-testid="class-badges"] .class-header__badge--domain',
            (els) => els.map((el) => el.textContent?.trim() ?? ''),
        );
    }

    async classFeatureSectionContains(text: string): Promise<boolean> {
        const section = this.page.locator('[data-testid="class-feature-section"]');
        await section.waitFor({ timeout: 10000 });
        const content = await section.textContent();
        return (content ?? '').includes(text);
    }

    async classFeatureSectionIsEmpty(): Promise<boolean> {
        const placeholder = await this.page.$('[data-testid="class-feature-section"] .class-feature-section__placeholder');
        return placeholder !== null;
    }

    async hopeSectionContains(text: string): Promise<boolean> {
        const section = this.page.locator('[data-testid="hope-section"]');
        await section.waitFor({ timeout: 10000 });
        const content = await section.textContent();
        return (content ?? '').includes(text);
    }

    async hopeFeatureAreaIsEmpty(): Promise<boolean> {
        const area = this.page.locator('[data-testid="hope-feature-area"]');
        await area.waitFor({ timeout: 10000 });
        const content = await area.textContent();
        return (content ?? '').trim() === '';
    }

    async fillTextField(ariaLabel: string, value: string): Promise<void> {
        const input = this.page.locator(`input[aria-label="${ariaLabel}"]`);
        await input.waitFor({ timeout: 5000 });
        await input.fill(value);
    }

    async getInputValue(ariaLabel: string): Promise<string> {
        const input = this.page.locator(`input[aria-label="${ariaLabel}"]`);
        await input.waitFor({ timeout: 5000 });
        return input.inputValue();
    }

    async getSelectValue(ariaLabel: string): Promise<string> {
        const select = this.page.locator(`select[aria-label="${ariaLabel}"]`);
        await select.waitFor({ timeout: 5000 });
        return select.inputValue();
    }

    async isDropdownEmptyOrDisabled(ariaLabel: string): Promise<boolean> {
        const select = this.page.locator(`select[aria-label="${ariaLabel}"]`);
        await select.waitFor({ timeout: 5000 });
        const isDisabled = await select.isDisabled();
        if (isDisabled) return true;
        // Count only non-empty options (exclude the placeholder "— Select …" option)
        const options = await select.locator('option[value]:not([value=""])').count();
        return options === 0;
    }

    async getSubclassOptions(): Promise<string[]> {
        const select = this.page.locator('select[aria-label="Subclass"]');
        await select.waitFor({ timeout: 5000 });
        const options = await select.locator('option').allTextContents();
        // Exclude the placeholder option
        return options.filter((t) => t.trim() !== '' && !t.startsWith('—'));
    }

    async isSubclassFieldCleared(): Promise<boolean> {
        const select = this.page.locator('select[aria-label="Subclass"]');
        await select.waitFor({ timeout: 5000 });
        const value = await select.inputValue();
        return value === '';
    }

    // =============================================================================
    // Character Sheet helpers (PBI-010 — Traits & Defence)
    // =============================================================================

    async traitsSectionContainsTrait(traitLabel: string): Promise<boolean> {
        const section = this.page.locator('[data-testid="traits-section"]');
        await section.waitFor({ timeout: 10000 });
        const text = await section.textContent();
        return (text ?? '').includes(traitLabel);
    }

    async traitsSectionContainsSubSkills(subSkills: string[]): Promise<boolean> {
        const section = this.page.locator('[data-testid="traits-section"]');
        await section.waitFor({ timeout: 10000 });
        const text = await section.textContent();
        return subSkills.every((skill) => (text ?? '').includes(skill));
    }

    async fillTraitScore(traitKey: string, value: string): Promise<void> {
        const input = this.page.locator(`[data-testid="trait-input-${traitKey}"]`);
        await input.waitFor({ timeout: 5000 });
        await input.fill(value);
    }

    async getTraitScoreValue(traitKey: string): Promise<string> {
        const input = this.page.locator(`[data-testid="trait-input-${traitKey}"]`);
        await input.waitFor({ timeout: 5000 });
        return input.inputValue();
    }

    async getFieldValue(testId: string): Promise<string> {
        const input = this.page.locator(`[data-testid="${testId}"]`);
        await input.waitFor({ timeout: 5000 });
        return input.inputValue();
    }

    async fillFieldByTestId(testId: string, value: string): Promise<void> {
        const input = this.page.locator(`[data-testid="${testId}"]`);
        await input.waitFor({ timeout: 5000 });
        await input.fill(value);
    }

    async getArmorSlotCount(): Promise<number> {
        await this.page.waitForSelector('[data-testid="armor-slots"]', { timeout: 5000 });
        return this.page.$$eval('[data-testid^="armor-slot-"]', (els) => els.length);
    }

    async clickArmorSlot(slotIndex: number): Promise<void> {
        // Slots are 0-indexed in data-testid (armor-slot-0 = slot 1)
        const slot = this.page.locator(`[data-testid="armor-slot-${slotIndex - 1}"]`);
        await slot.waitFor({ timeout: 5000 });
        await slot.click();
    }

    async isArmorSlotMarked(slotIndex: number): Promise<boolean> {
        const slot = this.page.locator(`[data-testid="armor-slot-${slotIndex - 1}"]`);
        await slot.waitFor({ timeout: 5000 });
        const pressed = await slot.getAttribute('aria-pressed');
        return pressed === 'true';
    }

    // =============================================================================
    // Character Sheet helpers (PBI-011 — Health, Hope, Gold)
    // =============================================================================

    async damageHealthSectionContainsInput(label: string): Promise<boolean> {
        const section = this.page.locator('[data-testid="damage-health-section"]');
        await section.waitFor({ timeout: 10000 });
        const input = section.locator(`input[aria-label="${label} threshold"]`);
        return input.count().then((c) => c > 0);
    }

    async damageHealthSectionShowsHint(hint: string): Promise<boolean> {
        const hintEl = this.page.locator('[data-testid="damage-threshold-hint"]');
        await hintEl.waitFor({ timeout: 5000 });
        const text = await hintEl.textContent();
        return (text ?? '').includes(hint);
    }

    async countSlotsByType(trackerTestId: string, slotType: 'solid' | 'dashed'): Promise<number> {
        await this.page.waitForSelector(`[data-testid="${trackerTestId}"]`, { timeout: 5000 });
        return this.page.$$eval(
            `[data-testid="${trackerTestId}"] [data-slot-type="${slotType}"]`,
            (els) => els.length,
        );
    }

    async areAllSlotsUnmarked(trackerTestId: string): Promise<boolean> {
        await this.page.waitForSelector(`[data-testid="${trackerTestId}"]`, { timeout: 5000 });
        const markedCount = await this.page.$$eval(
            `[data-testid="${trackerTestId}"] button[aria-pressed="true"]`,
            (els) => els.length,
        );
        return markedCount === 0;
    }

    async clickSlot(testId: string): Promise<void> {
        const slot = this.page.locator(`[data-testid="${testId}"]`);
        await slot.waitFor({ timeout: 5000 });
        await slot.click();
    }

    async isSlotMarked(testId: string): Promise<boolean> {
        const slot = this.page.locator(`[data-testid="${testId}"]`);
        await slot.waitFor({ timeout: 5000 });
        const pressed = await slot.getAttribute('aria-pressed');
        return pressed === 'true';
    }

    async getHopeDiamondCount(): Promise<number> {
        await this.page.waitForSelector('[data-testid="hope-diamonds"]', { timeout: 5000 });
        return this.page.$$eval('[data-testid^="hope-diamond-"]', (els) => els.length);
    }

    async areAllHopeDiamondsUnmarked(): Promise<boolean> {
        await this.page.waitForSelector('[data-testid="hope-diamonds"]', { timeout: 5000 });
        const markedCount = await this.page.$$eval(
            '[data-testid="hope-diamonds"] button[aria-pressed="true"]',
            (els) => els.length,
        );
        return markedCount === 0;
    }

    async clickHopeDiamond(diamondNumber: number): Promise<void> {
        const diamond = this.page.locator(`[data-testid="hope-diamond-${diamondNumber}"]`);
        await diamond.waitFor({ timeout: 5000 });
        await diamond.click();
    }

    async isHopeDiamondMarked(diamondNumber: number): Promise<boolean> {
        const diamond = this.page.locator(`[data-testid="hope-diamond-${diamondNumber}"]`);
        await diamond.waitFor({ timeout: 5000 });
        const pressed = await diamond.getAttribute('aria-pressed');
        return pressed === 'true';
    }

    async getProficiencyPipCount(): Promise<number> {
        await this.page.waitForSelector('[data-testid="proficiency-tracker"]', { timeout: 5000 });
        return this.page.$$eval('[data-testid^="proficiency-pip-"]', (els) => els.length);
    }

    async isProficiencyPipFilled(pipNumber: number): Promise<boolean> {
        const pip = this.page.locator(`[data-testid="proficiency-pip-${pipNumber}"]`);
        await pip.waitFor({ timeout: 5000 });
        const pressed = await pip.getAttribute('aria-pressed');
        return pressed === 'true';
    }

    async clickProficiencyPip(pipNumber: number): Promise<void> {
        const pip = this.page.locator(`[data-testid="proficiency-pip-${pipNumber}"]`);
        await pip.waitFor({ timeout: 5000 });
        await pip.click();
    }

    async getExperienceLineCount(): Promise<number> {
        await this.page.waitForSelector('[data-testid^="experience-line-"]', { timeout: 5000 });
        return this.page.$$eval('[data-testid^="experience-line-"]', (els) => els.length);
    }

    async fillExperienceLine(lineNumber: number, value: string): Promise<void> {
        const input = this.page.locator(`[data-testid="experience-line-${lineNumber}"]`);
        await input.waitFor({ timeout: 5000 });
        await input.fill(value);
    }

    async getExperienceLineValue(lineNumber: number): Promise<string> {
        const input = this.page.locator(`[data-testid="experience-line-${lineNumber}"]`);
        await input.waitFor({ timeout: 5000 });
        return input.inputValue();
    }

    async getGoldSlotCount(groupLabel: string): Promise<number> {
        const group = this.page.locator(`[aria-label="${groupLabel}"]`);
        await group.waitFor({ timeout: 5000 });
        return group.locator('button').count();
    }

    async markHandfulSlots(count: number): Promise<void> {
        for (let i = 1; i <= count; i++) {
            const slot = this.page.locator(`[data-testid="handful-slot-${i}"]`);
            await slot.waitFor({ timeout: 5000 });
            await slot.click();
        }
    }

    async countMarkedHandfulSlots(): Promise<number> {
        const group = this.page.locator('[aria-label="Handfuls"]');
        await group.waitFor({ timeout: 5000 });
        return group.locator('button[aria-pressed="true"]').count();
    }

    async countUnmarkedHandfulSlots(): Promise<number> {
        const group = this.page.locator('[aria-label="Handfuls"]');
        await group.waitFor({ timeout: 5000 });
        return group.locator('button[aria-pressed="false"]').count();
    }

    // =============================================================================
    // Character Sheet helpers (PBI-012 — Weapons & Armor)
    // =============================================================================

    async activeWeaponsSectionContainsPanel(role: 'Primary' | 'Secondary'): Promise<boolean> {
        const panel = await this.page.$(`[data-testid="${role.toLowerCase()}-weapon-panel"]`);
        return panel !== null;
    }

    async weaponPanelHasField(role: 'primary' | 'secondary', fieldLabel: string): Promise<boolean> {
        const testId = `${role}-weapon-${this.fieldLabelToTestId(fieldLabel)}`;
        const el = await this.page.$(`[data-testid="${testId}"]`);
        return el !== null;
    }

    private fieldLabelToTestId(label: string): string {
        const map: Record<string, string> = {
            'Name': 'name',
            'Trait & Range': 'trait-range',
            'Damage Dice & Type': 'damage',
            'Feature': 'feature',
        };
        return map[label] ?? label.toLowerCase().replace(/\s+/g, '-');
    }

    async getWeaponPickerOptionCount(role: 'primary' | 'secondary'): Promise<number> {
        const select = this.page.locator(`[data-testid="${role}-weapon-select"]`);
        await select.waitFor({ timeout: 10000 });
        // Count options excluding the placeholder
        return select.locator('option[value]:not([value=""])').count();
    }

    async selectWeaponFromPicker(role: 'primary' | 'secondary', weaponName: string): Promise<void> {
        const select = this.page.locator(`[data-testid="${role}-weapon-select"]`);
        await select.waitFor({ timeout: 10000 });
        await select.selectOption({ label: weaponName });
        await this.page.waitForTimeout(300);
    }

    async getWeaponFieldValue(role: 'primary' | 'secondary', fieldLabel: string): Promise<string> {
        const testId = `${role}-weapon-${this.fieldLabelToTestId(fieldLabel)}`;
        const input = this.page.locator(`[data-testid="${testId}"]`);
        await input.waitFor({ timeout: 5000 });
        return input.inputValue();
    }

    async fillWeaponField(role: 'primary' | 'secondary', fieldLabel: string, value: string): Promise<void> {
        const testId = `${role}-weapon-${this.fieldLabelToTestId(fieldLabel)}`;
        const input = this.page.locator(`[data-testid="${testId}"]`);
        await input.waitFor({ timeout: 5000 });
        await input.fill(value);
    }

    async activeArmorSectionHasField(fieldLabel: string): Promise<boolean> {
        const ariaMap: Record<string, string> = {
            'Name': 'Active Armor Name',
            'Base Thresholds': 'Active Armor Base Thresholds',
            'Base Score': 'Active Armor Base Score',
            'Feature': 'Active Armor Feature',
        };
        const ariaLabel = ariaMap[fieldLabel] ?? fieldLabel;
        const el = await this.page.$(`[aria-label="${ariaLabel}"]`);
        return el !== null;
    }

    async getArmorPickerOptionCount(): Promise<number> {
        const select = this.page.locator('[data-testid="armor-select"]');
        await select.waitFor({ timeout: 10000 });
        return select.locator('option[value]:not([value=""])').count();
    }

    async selectArmorFromPicker(armorName: string): Promise<void> {
        const select = this.page.locator('[data-testid="armor-select"]');
        await select.waitFor({ timeout: 10000 });
        await select.selectOption({ label: armorName });
        await this.page.waitForTimeout(300);
    }

    async getArmorFieldValue(fieldLabel: string): Promise<string> {
        const testIdMap: Record<string, string> = {
            'Name': 'armor-name',
            'Base Thresholds': 'armor-thresholds',
            'Base Score': 'armor-base-score',
            'Feature': 'armor-feature',
        };
        const testId = testIdMap[fieldLabel] ?? fieldLabel.toLowerCase().replace(/\s+/g, '-');
        const input = this.page.locator(`[data-testid="${testId}"]`);
        await input.waitFor({ timeout: 5000 });
        return input.inputValue();
    }

    async getInventoryLineCount(): Promise<number> {
        await this.page.waitForSelector('[data-testid^="inventory-line-"]', { timeout: 5000 });
        return this.page.$$eval('[data-testid^="inventory-line-"]', (els) => els.length);
    }

    async fillInventoryLine(lineNumber: number, value: string): Promise<void> {
        const input = this.page.locator(`[data-testid="inventory-line-${lineNumber}"]`);
        await input.waitFor({ timeout: 5000 });
        await input.fill(value);
    }

    async getInventoryLineValue(lineNumber: number): Promise<string> {
        const input = this.page.locator(`[data-testid="inventory-line-${lineNumber}"]`);
        await input.waitFor({ timeout: 5000 });
        return input.inputValue();
    }

    async inventoryWeaponPanelHasField(ordinal: 'first' | 'second', fieldLabel: string): Promise<boolean> {
        const index = ordinal === 'first' ? 1 : 2;
        const fieldMap: Record<string, string> = {
            'Name': `inventory-weapon-${index}-name`,
            'Trait & Range': `inventory-weapon-${index}-trait-range`,
            'Damage Dice & Type': `inventory-weapon-${index}-damage`,
            'Feature': `inventory-weapon-${index}-feature`,
            'Primary': `inventory-weapon-${index}-role-primary`,
        };
        const testId = fieldMap[fieldLabel];
        if (!testId) return false;
        const el = await this.page.$(`[data-testid="${testId}"]`);
        return el !== null;
    }

    async selectInventoryWeaponRole(panelIndex: number, role: 'Primary' | 'Secondary'): Promise<void> {
        const roleValue = role.toLowerCase() as 'primary' | 'secondary';
        const testId = `inventory-weapon-${panelIndex}-role-${roleValue}`;
        const radio = this.page.locator(`[data-testid="${testId}"]`);
        await radio.waitFor({ timeout: 5000 });
        await radio.click();
    }

    async isInventoryWeaponRoleSelected(panelIndex: number, role: 'Primary' | 'Secondary'): Promise<boolean> {
        const roleValue = role.toLowerCase() as 'primary' | 'secondary';
        const testId = `inventory-weapon-${panelIndex}-role-${roleValue}`;
        const radio = this.page.locator(`[data-testid="${testId}"]`);
        await radio.waitFor({ timeout: 5000 });
        return radio.isChecked();
    }

    // =============================================================================
    // Slot gauge helpers (PBI-015)
    // =============================================================================

    /** Returns true if every slot in [from, to] has aria-pressed="true". Uses testId prefix, e.g. 'hp-slot'. */
    async areSlotsMarkedInRange(testIdPrefix: string, from: number, to: number): Promise<boolean> {
        for (let i = from; i <= to; i++) {
            if (!(await this.isSlotMarked(`${testIdPrefix}-${i}`))) return false;
        }
        return true;
    }

    /** Returns true if every slot in [from, to] has aria-pressed != "true". Uses testId prefix. */
    async areSlotsUnmarkedInRange(testIdPrefix: string, from: number, to: number): Promise<boolean> {
        for (let i = from; i <= to; i++) {
            if (await this.isSlotMarked(`${testIdPrefix}-${i}`)) return false;
        }
        return true;
    }

    /** Fill all slots up to slotNumber using gauge behaviour (clicking slot N fills 0..N). */
    async fillSlotsUpTo(testIdPrefix: string, slotNumber: number): Promise<void> {
        await this.clickSlot(`${testIdPrefix}-${slotNumber}`);
    }

    // =============================================================================
    // Trait input helpers (PBI-014)
    // =============================================================================

    /** Returns true if the trait score input content is horizontally clipped. */
    async isTraitScoreInputTruncated(traitKey: string): Promise<boolean> {
        const input = this.page.locator(`[data-testid="trait-score-${traitKey}"]`);
        await input.waitFor({ timeout: 5000 });
        return input.evaluate((el: Element) => {
            const inp = el as HTMLInputElement;
            return inp.scrollWidth > inp.clientWidth;
        });
    }

    // =============================================================================
    // Layout helpers (PBI-016)
    // =============================================================================

    async classFeatureSectionSpansBothColumns(): Promise<boolean> {
        const sheet = await this.page.$('[data-testid="character-sheet"]');
        const section = await this.page.$('[data-testid="class-feature-section"]');
        if (sheet === null || section === null) return false;
        const sheetBox = await sheet.boundingBox();
        const sectionBox = await section.boundingBox();
        if (sheetBox === null || sectionBox === null) return false;
        // The section width should be close to the sheet container width
        // (within 60px to account for padding)
        return Math.abs(sectionBox.width - sheetBox.width) < 60;
    }

    // =============================================================================
    // Style assertion helpers (PBI-013)
    // =============================================================================

    async getNavLinkComputedColor(linkText: string): Promise<string> {
        return this.page.$eval(
            `nav a:has-text("${linkText}")`,
            (el) => window.getComputedStyle(el).color,
        );
    }

    async getNavLinkComputedBackground(linkText: string): Promise<string> {
        return this.page.$eval(
            `nav a:has-text("${linkText}")`,
            (el) => window.getComputedStyle(el).backgroundColor,
        );
    }

    async getSectionComputedBackground(): Promise<string> {
        return this.page.$eval(
            '.character-sheet__section',
            (el) => window.getComputedStyle(el).backgroundColor,
        );
    }

    async getSectionComputedBorderLeftColor(): Promise<string> {
        return this.page.$eval(
            '.character-sheet__section',
            (el) => window.getComputedStyle(el).borderLeftColor,
        );
    }

    async getSectionInputBorderColor(): Promise<string> {
        // Find the first visible text or number input inside a section
        return this.page.$eval(
            '.character-sheet__section input[type="text"], .character-sheet__section input[type="number"]',
            (el) => window.getComputedStyle(el).borderColor,
        );
    }

    async getSectionSelectBorderColor(): Promise<string> {
        return this.page.$eval(
            '.character-sheet__section select',
            (el) => window.getComputedStyle(el).borderColor,
        );
    }

    async columnsAreDisplayedSideBySide(): Promise<boolean> {
        const left = await this.page.$('[data-testid="left-column"]');
        const right = await this.page.$('[data-testid="right-column"]');
        if (left === null || right === null) return false;
        const leftBox = await left.boundingBox();
        const rightBox = await right.boundingBox();
        if (leftBox === null || rightBox === null) return false;
        // Side-by-side: right column starts to the right of the left column
        return rightBox.x > leftBox.x;
    }

    async getSectionHeadingComputedColor(): Promise<string> {
        return this.page.$eval(
            '.character-sheet__section h2',
            (el) => window.getComputedStyle(el).color,
        );
    }
}

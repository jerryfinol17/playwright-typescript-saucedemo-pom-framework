import {Page, Locator, expect} from'@playwright/test';

export class BasePage {
    readonly page: Page;
    private timeout = 1500;
    constructor(page: Page) {
        this.page = page;
    }
    async fillInput(locator: string | Locator, value: string, clearFirst: boolean = true): Promise<void> {
        const loc = this.#getLocator(locator);
        if(clearFirst){
            await loc.clear();
        }
        await loc.fill(value);
    }
    async clickElement(
        locator: string | Locator,
        options: { force?: boolean; timeout?: number; } = {}
    ): Promise<void> {

        const loc = this.#getLocator(locator);

        const clickOptions = {
            timeout: options.timeout ?? 10000,
            force: options.force ?? false,
            ...options
        };

        try {
            await loc.waitFor({
                state: 'visible',
                timeout: clickOptions.timeout
            });

            await loc.click(clickOptions);

        } catch (error) {
            console.log(`Click normal falló para ${locator}, intentando con force: true`);
            await loc.click({
                force: true,
                timeout: clickOptions.timeout,
            });
        }
    }
    async waitForVisible(locator: string | Locator, timeout: number = this.timeout): Promise<Locator> {
        const loc = this.#getLocator(locator);
        await loc.waitFor({state: 'visible', timeout});
        return loc
    }
    async getText(locator: string | Locator): Promise<string> {
        const loc = this.#getLocator(locator);
        return await loc.innerText();
    }
    getCurrentURL(): string{
        return this.page.url()
    }
    async assertCurrentUrlContain(expectedSubstring: string, message: string | null = null): Promise<boolean> {
        const current = this.getCurrentURL();
        if(!current.includes(expectedSubstring)) {
            throw new Error(message || `URL "${current}" does not contain "${expectedSubstring}"`);
        }
        return current.includes(expectedSubstring);
    }
    async assertTextEquals(locator: string | Locator, expectedText: string): Promise<void> {
        const loc = this.#getLocator(locator);
        await expect(loc).toHaveText(expectedText);
    }
    #getLocator(locator: string | Locator): Locator{
        if (typeof locator === 'string') {
            return this.page.locator(locator);
        }
        return locator;
    }
    async isVisible(locator: string | Locator): Promise<boolean> {
        const loc = this.#getLocator(locator);
        return await loc.isVisible();
    }
}
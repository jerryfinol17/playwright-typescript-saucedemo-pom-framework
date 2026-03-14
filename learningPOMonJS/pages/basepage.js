import {expect} from'@playwright/test';

class BasePage {
    constructor(page) {
        this.page = page;
        this.timeout = 1500;
    }

    async fillInput(locator,value, clearFirst = true) {
        const loc= this.#getLocator(locator);
        if (clearFirst) {
            await loc.clear();
        }
        await loc.fill(value);
    }
    async  clickElement(locator, options = {}){
        const loc = this.#getLocator(locator);
        await loc.click(options);
    }
    async waitForVisible(locator, timeout = this.timeout){
        const loc = this.#getLocator(locator);
        await loc.waitFor({state: 'visible',timeout});
        return loc
    }
    async getText(locator){
        const loc = this.#getLocator(locator);
        return loc.innerText()
    }
    getCurrentUrl(){
        return this.page.url()
    }
    async  assertCurrentUrlContain(expectedSubstring,message = null){
        const current = await this.getCurrentUrl();
        if(!current.includes(expectedSubstring)){
            throw new Error(message || `URL "${current}" does not contain "${expectedSubstring}"`);
        }
        return current.includes(expectedSubstring);
    }
    async assertTextEquals(locator, expectedText){
        const loc = this.#getLocator(locator);
        await expect(loc).toHaveText(expectedText);
    }
    #getLocator(locator){
        if(typeof locator === 'string'){
            return this.page.locator(locator);
        }
        return locator;
    }
    async isVisible(locator){
        const loc = this.#getLocator(locator);
        return loc.isVisible();
    }
}
export {BasePage};
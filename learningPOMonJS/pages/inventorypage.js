import { BasePage } from './basepage.js';
import { LOCATORS } from "./config.js";

class InventoryPage extends BasePage {
    constructor(page) {
        super(page);
        this.primaryHeader     = page.locator(LOCATORS.primaryHeader);
        this.cartBadge         = page.locator(LOCATORS.cartBadge);
        this.burgerMenuBtn     = page.locator(LOCATORS.burgerMenuBtn);
        this.aboutLink         = page.locator(LOCATORS.aboutLink);
        this.resetLink         = page.locator(LOCATORS.resetLink);
        this.title             = page.locator(LOCATORS.title);
        this.sortDropdown      = page.locator(LOCATORS.sortDropdown);
        this.productItem       = page.locator(LOCATORS.productItem);
        this.productName       = page.locator(LOCATORS.productName);
        this.productPrice      = page.locator(LOCATORS.productPrice);
        this.productDescription= page.locator(LOCATORS.productDescription);
        this.addBtnPrefix      = LOCATORS.addBtnPrefix;
        this.removeBtnPrefix   = LOCATORS.removeBtnPrefix;
    }

    async isOnInventoryPage() {
        return this.assertCurrentUrlContain('inventory.html');
    }

    async goToAboutPage() {
        await this.clickElement(this.burgerMenuBtn);
        await this.clickElement(this.aboutLink);
        return this.assertCurrentUrlContain('saucelabs.com');
    }

    async isPrimaryHeaderVisible() {
        return this.isVisible(this.primaryHeader);
    }

    async getPageTitle() {
        return (await this.getText(this.title)).trim();
    }

    async getCartBadgeCount() {
        if (!await this.isVisible(this.cartBadge)) {
            return 0;
        }
        const countText = (await this.getText(this.cartBadge)).trim();
        return countText && !isNaN(countText) ? parseInt(countText, 10) : 0;
    }

    async #findProductItemByName(itemName) {
        const items = await this.productItem.all();
        for (const item of items) {
            const name = (await this.getText(item.locator(this.productName))).trim();
            if (name === itemName) {
                return item;
            }
        }
        return null;
    }

    async getProductName(itemName) {
        const item = await this.#findProductItemByName(itemName);
        return item ? itemName : "";
    }

    async getProductDescription(itemName) {
        const item = await this.#findProductItemByName(itemName);
        if (!item) return "";
        return (await this.getText(item.locator(this.productDescription))).trim();
    }

    async getProductPrice(itemName) {
        const item = await this.#findProductItemByName(itemName);
        if (!item) return "";
        return (await this.getText(item.locator(this.productPrice))).trim();
    }

    async addItemToCart(itemName) {
        const item = await this.#findProductItemByName(itemName);
        if (!item) {
            throw new Error(`Product '${itemName}' not found`);
        }
        const addBtn = item.locator(this.addBtnPrefix);
        await this.clickElement(addBtn);
    }

    async removeItemFromCart(itemName) {
        const item = await this.#findProductItemByName(itemName);
        if (!item) {
            throw new Error(`Product '${itemName}' not found`);
        }
        const removeBtn = item.locator(this.removeBtnPrefix);
        await this.clickElement(removeBtn);
    }

    async isAddButtonVisible(itemName) {
        const item = await this.#findProductItemByName(itemName);
        if (!item) return false;
        return this.isVisible(item.locator(this.addBtnPrefix));
    }

    async isRemoveButtonVisible(itemName) {
        const item = await this.#findProductItemByName(itemName);
        if (!item) return false;
        return this.isVisible(item.locator(this.removeBtnPrefix));
    }

    async selectSortOption(value) {
        await this.sortDropdown.selectOption(value);
    }

    async getProductNames() {
        const elements = await this.productName.all();
        return Promise.all(
            elements.map(el => this.getText(el).then(t => t.trim()))
        );
    }

    async getProductPrices() {
        const items = await this.productItem.all();
        return Promise.all(
            items.map(async item => {
                const text = (await this.getText(item.locator(this.productPrice))).trim();
                const cleaned = text.replace('$', '').trim();
                return cleaned ? parseFloat(cleaned) : NaN;
            })
        ).then(prices => prices.filter(p => !isNaN(p)));
    }

    async getInventoryItemsWithPrices() {
        const items = await this.productItem.all();
        const result = {};
        for (const item of items) {
            const name = (await this.getText(item.locator(this.productName))).trim();
            const priceText = (await this.getText(item.locator(this.productPrice))).trim();
            if (name && priceText) {
                const price = parseFloat(priceText.replace('$', '').trim());
                if (!isNaN(price)) {
                    result[name] = price;
                }
            }
        }
        return result;
    }
    async goToCart(){
        await this.clickElement(this.cartBadge)
    }
}

export {InventoryPage}

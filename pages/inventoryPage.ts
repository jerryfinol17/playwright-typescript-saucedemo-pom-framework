import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';
import { LOCATORS } from './config';

export class InventoryPage extends BasePage {
    readonly primaryHeader: Locator;
    readonly cartBadge: Locator;
    readonly cartLink: Locator;
    readonly burgerMenuBtn: Locator;
    readonly crossBurgerBtn: Locator;
    readonly aboutLink: Locator;
    readonly resetLink: Locator;
    readonly title: Locator;
    readonly sortDropdown: Locator;
    readonly productItem: Locator;
    readonly productName: Locator;
    readonly productPrice: Locator;
    readonly productDescription: Locator;
    readonly addBtnPrefix: string;
    readonly removeBtnPrefix: string;

    constructor(page: Page) {
        super(page);
        this.primaryHeader = page.locator(LOCATORS.primaryHeader);
        this.cartBadge = page.locator(LOCATORS.cartBadge);
        this.cartLink = page.locator(LOCATORS.cartLink);
        this.burgerMenuBtn = page.locator(LOCATORS.burgerMenuBtn);
        this.crossBurgerBtn = page.locator(LOCATORS.crossBurgerBtn);
        this.aboutLink = page.locator(LOCATORS.aboutLink);
        this.resetLink = page.locator(LOCATORS.resetLink);
        this.title = page.locator(LOCATORS.title);
        this.sortDropdown = page.locator(LOCATORS.sortDropdown);
        this.productItem = page.locator(LOCATORS.productItem);
        this.productName = page.locator(LOCATORS.productName);
        this.productPrice = page.locator(LOCATORS.productPrice);
        this.productDescription = page.locator(LOCATORS.productDescription);
        this.addBtnPrefix = LOCATORS.addBtnPrefix;
        this.removeBtnPrefix = LOCATORS.removeBtnPrefix;
    }
    async #findProductItemByName(itemName: string): Promise<Locator| null> {
        const items = await this.productItem.all();
        for (const item of items) {
            const name = (await this.getText(item.locator(this.productName))).trim();
            if (name === itemName) {
                return item;
            }
        }
        return null;
    }
    async isOnInventoryPage(): Promise<boolean> {
        return this.assertCurrentUrlContain('inventory.html');
    }
    async goToAboutPage(): Promise<boolean> {
        await this.clickElement(this.burgerMenuBtn);
        await this.clickElement(this.aboutLink);
        return this.assertCurrentUrlContain('saucelabs.com');
    }
    async resetApp(): Promise<void> {
        await this.clickElement(this.burgerMenuBtn);
        await this.clickElement(this.resetLink);
        await this.clickElement(this.crossBurgerBtn);
    }
    async isPrimaryHeaderVisible(): Promise<boolean> {
        return this.isVisible(this.primaryHeader);
    }
    async getTitle(): Promise<string> {
        return (await this.getText(this.title)).trim();
    }
    async getCartBadgeCount(): Promise<number> {
        if(!await this.isVisible(this.cartBadge)) {
            return 0;
        }
        const countText = (await this.getText(this.cartBadge)).trim();
        if(!countText) {
            return 0;
        }
        const num = Number(countText);
        if(!isNaN(num)) {
            return num;
        }
        return 0;
    }
    async getProductName(itemName: string): Promise<string> {
        const item = await this.#findProductItemByName(itemName)
        return item ? itemName : "";
    }
    async getProductDescription(itemName: string): Promise<string> {
        const item = await this.#findProductItemByName(itemName)
        if(!item) return "";
        return (await this.getText(item.locator(this.productDescription))).trim();
    }
    async getProductPrice(itemName: string): Promise<string> {
        const item = await this.#findProductItemByName(itemName)
        if(!item) return "";
        return (await this.getText(item.locator(this.productPrice))).trim();
    }
    async addItemToCart(itemName: string): Promise<void> {
        const item = await this.#findProductItemByName(itemName)
        if(!item){
            throw new Error(`Item not found! ${itemName}`);
        }
        const addBtn = item.locator(this.addBtnPrefix);
        await this.clickElement(addBtn);
    }
    async removeItemFromCart(itemName: string): Promise<void> {
        const item = await this.#findProductItemByName(itemName)
        if(!item){
            throw new Error(`Item not found! ${itemName}`);
        }
        const removeBtn = item.locator(this.removeBtnPrefix);
        await this.clickElement(removeBtn);
    }
    async isAddButtonVisible(itemName: string): Promise<boolean> {
        const item = await this.#findProductItemByName(itemName);
        if (!item) return false;
        return this.isVisible(item.locator(this.addBtnPrefix));
    }
    async isRemoveButtonVisible(itemName: string): Promise<boolean> {
        const item = await this.#findProductItemByName(itemName);
        if (!item) return false;
        return this.isVisible(item.locator(this.removeBtnPrefix));
    }
    async selectSortOption(value: string): Promise<void> {
        await this.sortDropdown.selectOption(value);
    }
    async getProductNames(): Promise<string[]> {
        const elements = await this.productName.all();
        return Promise.all(
            elements.map(el => this.getText(el).then(t => t.trim()))
        )
    }
    async getProductPrices(): Promise<number[]> {
        const items = await this.productItem.all();
        return Promise.all(
            items.map(async item => {
                const text = (await this.getText(item.locator(this.productPrice))).trim();
                const cleaned = text.replace('$', '').trim();
                return cleaned ? parseFloat(cleaned) : NaN;
            })
        ).then(prices => prices.filter(p => !isNaN(p)));
    }async getInventoryItemsWithPrices(): Promise<Map<string, number>> {
        const items = await this.productItem.all();

        const promises = items.map(async (item) => {
            const name = (await this.getText(item.locator(this.productName))).trim();
            const priceText = (await this.getText(item.locator(this.productPrice))).trim();
            if (!name || !priceText) {
                return null;
            }
            const price = parseFloat(priceText.replace('$', '').trim());
            if (isNaN(price)) {
                return null;
            }
            return { name, price };
        });

        const rawResults = await Promise.all(promises);
        const results = rawResults.filter((r): r is { name: string; price: number } => r !== null);
        return new Map(results.map(r => [r.name, r.price]));
    }

    async goToCart(): Promise<void> {
        await this.clickElement(this.cartLink);
    }
}

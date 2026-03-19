import {Page, Locator} from "@playwright/test";
import { BasePage } from './basePage';
import { LOCATORS } from "./config";

export class CartPage extends BasePage {
    readonly title: Locator;
    readonly continueShoppingBtn: Locator;
    readonly checkoutBtn: Locator;
    readonly cartItem: Locator;
    readonly cartBadge: Locator;
    readonly productName: Locator;
    readonly productPrice: Locator;
    readonly cartQuantity: Locator;
    readonly burgerMenuBtn: Locator;
    readonly allItemsLink: Locator;
    readonly removeBtnPrefix: string;
    constructor(page: Page) {
        super(page);
        this.title             = page.locator(LOCATORS.title);
        this.continueShoppingBtn = page.locator(LOCATORS.continueShoppingBtn);
        this.checkoutBtn       = page.locator(LOCATORS.checkoutBtn);
        this.cartItem          = page.locator(LOCATORS.cartItem);
        this.cartBadge         = page.locator(LOCATORS.cartBadge);
        this.productName       = page.locator(LOCATORS.productName);
        this.productPrice      = page.locator(LOCATORS.productPrice);
        this.cartQuantity      = page.locator(LOCATORS.cartQuantity);
        this.burgerMenuBtn     = page.locator(LOCATORS.burgerMenuBtn);
        this.allItemsLink      = page.locator(LOCATORS.allItemsLink);
        this.removeBtnPrefix   = LOCATORS.removeBtnPrefix;
    }
    async isOnCartPage():Promise<boolean> {
        return this.assertCurrentUrlContain('cart.html')
    }
    async getPageTitle(): Promise<string> {
        return (await this.getText(this.title)).trim();
    }
    async getCartBadgeCount(): Promise<number> {
        if(!await this.isVisible(this.cartBadge)){
            return 0;
        }
        const countText = (await this.getText(this.cartBadge)).trim();
        return countText && !isNaN(Number(countText)) ? parseInt(countText, 10): 0;
    }
    async getCartItemNames(): Promise<string[]> {
        const items = await this.cartItem.all()
        return Promise.all(
            items.map(item => this.getText(item.locator(this.productName
            )).then(text => text.trim()))
        );
    }
    async getCartItemPrices(): Promise<Number[]>{
        const items = await this.cartItem.all()
        const prices = await Promise.all(
            items.map( async (item) => {
                const text = (await this.getText(item.locator(this.productPrice))).trim();
                const cleaned = text.replace( '$', '').trim();
                return cleaned ? parseFloat(cleaned) : NaN;
            })
        );
        return prices.filter(p => !isNaN(p));
    }
    async getCartItemQuantity(itemName: string): Promise<number> {
        const items = await this.cartItem.all()
        for (const item of items) {
            const name = (await this.getText(item.locator(this.productName))).trim();
            if(name === itemName){
                const qtyText = (await this.getText(item.locator(this.cartQuantity))).trim();
                return qtyText && !isNaN(Number(qtyText)) ? parseInt(qtyText, 10) : 0;
            }
        }
        return 0;
    }
    async isCartEmpty(): Promise<boolean> {
        return (await this.getCartBadgeCount()) === 0;
    }
    async removeItemFromCart(itemName: string): Promise<void> {
        const items = await this.cartItem.all()
        for(const item of items) {
            const name = (await this.getText(item.locator(this.productName))).trim();
            if(name === itemName){
                const removeBtn = item.locator(this.removeBtnPrefix);
                await this.clickElement(removeBtn);
                return;
            }
        }
        throw new Error(`Product '${itemName}' not found in cart`);
    }
    async proceedToCheckout(): Promise<void> {
         await this.clickElement(this.checkoutBtn);
    }
    async continueShopping(): Promise<void> {
        await this.clickElement(this.continueShoppingBtn);
    }
    async clickAllItemsLink(): Promise<void> {
        await this.clickElement(this.burgerMenuBtn);
        await this.clickElement(this.allItemsLink);
    }
}

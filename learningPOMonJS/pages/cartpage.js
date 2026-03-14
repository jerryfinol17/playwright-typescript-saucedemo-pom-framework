import { BasePage } from './basepage.js';
import { LOCATORS } from "./config.js";

class CartPage extends BasePage {
    constructor(page) {
        super(page);
        this.title             = page.locator(LOCATORS.title);
        this.continueShoppingBtn = page.locator(LOCATORS.continueShoppingBtn);
        this.checkoutBtn       = page.locator(LOCATORS.checkoutBtn);
        this.cartItem          = page.locator(LOCATORS.cartItem);
        this.cartBadge         = page.locator(LOCATORS.cartBadge);
        this.productName       = page.locator(LOCATORS.productName);
        this.productPrice      = page.locator(LOCATORS.productPrice);
        this.cartQuantity      = page.locator(LOCATORS.cartQuantity);
        this.removeBtnPrefix   = LOCATORS.removeBtnPrefix;
    }

    async isOnCartPage() {
        return this.assertCurrentUrlContain('cart.html');
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

    async getCartItemNames() {
        const items = await this.cartItem.all();
        return Promise.all(
            items.map(item =>
                this.getText(item.locator(this.productName)).then(t => t.trim())
            )
        );
    }

    async getCartItemPrices() {
        const items = await this.cartItem.all();
        return Promise.all(
            items.map(async item => {
                const text = (await this.getText(item.locator(this.productPrice))).trim();
                const cleaned = text.replace('$', '').trim();
                return cleaned ? parseFloat(cleaned) : NaN;
            })
        ).then(prices => prices.filter(p => !isNaN(p)));
    }

    async getItemQuantity(itemName) {
        const items = await this.cartItem.all();
        for (const item of items) {
            const name = (await this.getText(item.locator(this.productName))).trim();
            if (name === itemName) {
                const qtyText = (await this.getText(item.locator(this.cartQuantity))).trim();
                return qtyText && !isNaN(qtyText) ? parseInt(qtyText, 10) : 0;
            }
        }
        return 0;
    }

    async isCartEmpty() {
        return (await this.getCartBadgeCount()) === 0;
    }

    async removeItemFromCart(itemName) {
        const items = await this.cartItem.all();
        for (const item of items) {
            const name = (await this.getText(item.locator(this.productName))).trim();
            if (name === itemName) {
                const removeBtn = item.locator(this.removeBtnPrefix);
                await this.clickElement(removeBtn);
                return;
            }
        }
        throw new Error(`Product '${itemName}' not found in cart`);
    }

    async proceedToCheckout() {
        await this.clickElement(this.checkoutBtn);
    }

    async continueShopping() {
        await this.clickElement(this.continueShoppingBtn);
    }
}

export { CartPage };
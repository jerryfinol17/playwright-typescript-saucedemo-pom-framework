import { BasePage } from './basepage.js';
import { LOCATORS } from './config.js';

class CheckoutPage extends BasePage {
    constructor(page) {
        super(page);

        // Step One - Your Information
        this.firstNameInput  = page.locator(LOCATORS.firstNameInput);
        this.lastNameInput   = page.locator(LOCATORS.lastNameInput);
        this.zipCodeInput    = page.locator(LOCATORS.zipCodeInput);
        this.continueBtn     = page.locator(LOCATORS.continueButton);
        this.cancelBtn       = page.locator(LOCATORS.cancelBtn);
        this.errorMsg        = page.locator(LOCATORS.errorMsg);

        // Step Two - Overview
        this.cartItem        = page.locator(LOCATORS.cartItem);
        this.productName     = page.locator(LOCATORS.productName);
        this.productPrice    = page.locator(LOCATORS.productPrice);
        this.subtotalLabel   = page.locator(LOCATORS.subtotalLabel);
        this.taxLabel        = page.locator(LOCATORS.taxLabel);
        this.totalLabel      = page.locator(LOCATORS.totalLabel);
        this.finishBtn       = page.locator(LOCATORS.finishBtn);

        // Step Three - Complete
        this.completeHeader  = page.locator(LOCATORS.completeHeader);
        this.completeText    = page.locator(LOCATORS.completeText);
        this.backHomeBtn     = page.locator(LOCATORS.backHomeBtn);

        // General
        this.title           = page.locator(LOCATORS.title);
    }

    // ── General ────────────────────────────────────────────────
    async getTitleText() {
        return (await this.getText(this.title)).trim();
    }

    async isOnCheckoutStepOne() {
        return this.getCurrentUrl().includes('checkout-step-one.html');
    }

    // ── Step One: Your Information ─────────────────────────────
    async fillPersonalInfo(first, last, zip) {
        await this.fillInput(this.firstNameInput, first);
        await this.fillInput(this.lastNameInput, last);
        await this.fillInput(this.zipCodeInput, zip);
    }

    async continueToOverview() {
        await this.clickElement(this.continueBtn);
    }

    async cancelFromStepOne() {
        await this.clickElement(this.cancelBtn);
    }

    async getErrorMessage() {
        if (await this.isVisible(this.errorMsg)) {
            return (await this.getText(this.errorMsg)).trim();
        }
        return '';
    }

    // ── Step Two: Overview ─────────────────────────────────────
    async getSubtotal() {
        const text = await this.getText(this.subtotalLabel);
        const match = text.match(/\$([\d.]+)/);
        return match ? parseFloat(match[1]) : 0;
    }

    async getTax() {
        const text = await this.getText(this.taxLabel);
        const match = text.match(/\$([\d.]+)/);
        return match ? parseFloat(match[1]) : 0;
    }

    async getTotal() {
        const text = await this.getText(this.totalLabel);
        const match = text.match(/\$([\d.]+)/);
        return match ? parseFloat(match[1]) : 0;
    }

    async getOverviewItemNames() {
        const items = await this.cartItem.all();
        return Promise.all(
            items.map(item =>
                this.getText(item.locator(this.productName)).then(t => t.trim())
            )
        );
    }

    async getOverviewItemsWithPrices() {
        const items = await this.cartItem.all();
        const result = {};
        for (const item of items) {
            const name = (await this.getText(item.locator(this.productName))).trim();
            const priceText = (await this.getText(item.locator(this.productPrice))).trim();
            if (name && priceText) {
                const price = parseFloat(priceText.replace('$', '').trim());
                if (!isNaN(price)) result[name] = price;
            }
        }
        return result;
    }

    async getOverviewItemCount() {
        const items = await this.cartItem.all();
        return items.length;
    }

    async finishPurchase() {
        await this.clickElement(this.finishBtn);
    }

    async cancelFromOverview() {
        await this.clickElement(this.cancelBtn);
    }

    // ── Step Three: Complete ───────────────────────────────────
    async isCompletePage() {
        const header = await this.getText(this.completeHeader);
        return header.trim().includes('Thank you for your order!');
    }

    async getCompleteHeader() {
        return (await this.getText(this.completeHeader)).trim();
    }

    async getCompleteMessage() {
        return (await this.getText(this.completeText)).trim();
    }

    async backToProducts() {
        await this.clickElement(this.backHomeBtn);
    }
}

export { CheckoutPage}
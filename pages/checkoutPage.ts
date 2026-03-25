import {Page, Locator} from "@playwright/test";
import{BasePage} from "./basePage";
import{LOCATORS} from "./config";

export class CheckoutPage extends BasePage {
    // Step One - Your Information
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly zipCodeInput: Locator;
    readonly continueButton: Locator;
    readonly cancelBtn: Locator;
    readonly errorMsg: Locator;

    // Step Two - Overview
    readonly cartItem: Locator;
    readonly productName: Locator;
    readonly productPrice: Locator;
    readonly subtotalLabel: Locator;
    readonly taxLabel: Locator;
    readonly totalLabel: Locator;
    readonly finishBtn: Locator;

    // Step Three - Complete
    readonly completeHeader: Locator;
    readonly completeText: Locator;
    readonly backHomeBtn: Locator;

    // General
    readonly title: Locator;

    constructor(page: Page) {
        super(page);

        // Step One
        this.firstNameInput  = page.locator(LOCATORS.firstNameInput);
        this.lastNameInput   = page.locator(LOCATORS.lastNameInput);
        this.zipCodeInput    = page.locator(LOCATORS.zipCodeInput);
        this.continueButton     = page.locator(LOCATORS.continueButton);
        this.cancelBtn       = page.locator(LOCATORS.cancelBtn);
        this.errorMsg        = page.locator(LOCATORS.errorMsg);

        // Step Two
        this.cartItem        = page.locator(LOCATORS.cartItem);
        this.productName     = page.locator(LOCATORS.productName);
        this.productPrice    = page.locator(LOCATORS.productPrice);
        this.subtotalLabel   = page.locator(LOCATORS.subtotalLabel);
        this.taxLabel        = page.locator(LOCATORS.taxLabel);
        this.totalLabel      = page.locator(LOCATORS.totalLabel);
        this.finishBtn       = page.locator(LOCATORS.finishBtn);

        // Step Three
        this.completeHeader  = page.locator(LOCATORS.completeHeader);
        this.completeText    = page.locator(LOCATORS.completeText);
        this.backHomeBtn     = page.locator(LOCATORS.backHomeBtn);

        // General
        this.title           = page.locator(LOCATORS.title);
    }
    // ── General ────────────────────────────────────────────────

    async getTitleText(): Promise<string> {
        return (await this.getText(this.title)).trim();
    }
    async isOnCheckoutStepOne(): Promise<boolean> {
        return this.assertCurrentUrlContain('checkout-step-one.html')
    }
    // ── Step One: Your Information ─────────────────────────────
    async fillPersonalInfo(first: string, last: string, zipCode: string): Promise<void> {
        await this.fillInput(this.firstNameInput, first);
        await this.fillInput(this.lastNameInput, last);
        await this.fillInput(this.zipCodeInput, zipCode);
    }
    async continueToOverview(): Promise<void> {
        await this.clickElement(this.continueButton);
    }
    async cancelFromStepOne(): Promise<void> {
        await this.clickElement(this.cancelBtn);
    }
    async getErrorMessage(): Promise<string> {
        if(await this.isVisible(this.errorMsg)) {
            return (await this.getText(this.errorMsg)).trim();
        }
        return '';
    }
    // ── Step Two: Overview ─────────────────────────────────────
    async getSubtotal(): Promise<number> {
        const text = await this.getText(this.subtotalLabel);
        const match = text.match(/\$([\d.]+)/);
        return match ? parseFloat(match[1]) : 0;
    }
    async getTax(): Promise<number> {
        const text = await this.getText(this.taxLabel);
        const match = text.match(/\$([\d.]+)/);
        return match ? parseFloat(match[1]) : 0;
    }
    async getTotal(): Promise<number> {
        const text = await this.getText(this.totalLabel);
        const cleanedText = text.trim();
        const match = cleanedText.match(/\$([\d.]+)/);
        return match ? parseFloat(match[1]) : 0;
    }
    async getOverviewItemNames(): Promise<string[]> {
        const items = await this.cartItem.all()
        return Promise.all(
            items.map(item =>
            this.getText(item.locator(this.productName)).then(t => t.trim()))
        )
    }
    async getOverviewItemWithPrices(): Promise<Record<string, number>> {
        const items = await this.cartItem.all()
        const result: Record<string, number> = {};
        for(const item of items){
            const name = (await this.getText(item.locator(this.productName))).trim()
            const priceText = (await this.getText(item.locator(this.productPrice))).trim()
            if(name && priceText){
                const price = parseFloat(priceText.replace('$','').trim());
                if(!isNaN(price)) result[name] = price;
            }
        }
        return result;
    }
    async getOverviewItemCount(): Promise<number> {
        const items = await this.cartItem.all()
        return items.length;
    }
    async finishPurchase(): Promise<void> {
        await this.clickElement(this.finishBtn);
    }
    async cancelFromOverview(): Promise<void> {
        await this.clickElement(this.cancelBtn);
    }
    // ── Step Three: Complete ───────────────────────────────────
    async isCompletePage(): Promise<boolean> {
        const header = await this.getText(this.completeHeader);
        return header.trim().includes('Thank you for your order!');
    }
    async getCompleteHeader(): Promise<string> {
        return (await this.getText(this.completeHeader)).trim();
    }
    async getCompleteMessage(): Promise<string> {
        return (await this.getText(this.completeText)).trim();
    }
    async backToProducts(): Promise<void> {
        await this.clickElement(this.backHomeBtn);
    }
}
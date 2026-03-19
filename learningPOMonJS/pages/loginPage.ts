import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';
import { LOCATORS } from './config';   

export class LoginPage extends BasePage {
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginBtn: Locator;
    readonly errorMsg: Locator;
    readonly inventoryTitle: Locator;
    readonly swagLabsLogo: Locator;
    readonly burgerMenuBtn: Locator;
    readonly logoutLink: Locator;
    constructor(page: Page) {
        super(page);
        this.usernameInput   = page.locator(LOCATORS.usernameInput);
        this.passwordInput   = page.locator(LOCATORS.passwordInput);
        this.loginBtn        = page.locator(LOCATORS.loginBtn);
        this.errorMsg        = page.locator(LOCATORS.errorMsg);
        this.inventoryTitle  = page.locator(LOCATORS.inventoryTitle);
        this.swagLabsLogo    = page.locator(LOCATORS.swagLabsLogo);
        this.burgerMenuBtn   = page.locator(LOCATORS.burgerMenuBtn);
        this.logoutLink      = page.locator(LOCATORS.logoutLink);
    }
    async login(username: string, password: string): Promise<void> {
        await this.fillInput(this.usernameInput, username);
        await this.fillInput(this.passwordInput, password);
        await this.clickElement(this.loginBtn);
    }
    async getErrorMessageOrEmpty(): Promise<string> {
        if (await this.isVisible(this.errorMsg)) {
            return (await this.getText(this.errorMsg)).trim();
        }
        return '';
    }
    async isErrorVisible(): Promise<boolean> {
        return await this.isVisible(this.errorMsg);
    }
    async isLoginOk(): Promise<boolean> {
        return this.page.url().includes('inventory.html');
    }
    async cleanLoginFields(): Promise<void> {
        await this.usernameInput.clear();
        await this.passwordInput.clear();
    }
    async isOnBasePage(): Promise<boolean> {
        return await this.isVisible(this.swagLabsLogo);
    }
    async isInventoryTitleVisible(): Promise<boolean> {
        return await this.isVisible(this.inventoryTitle);
    }
    async logout(): Promise<void> {
        await this.clickElement(this.burgerMenuBtn);
        await this.clickElement(this.logoutLink);
    }
}
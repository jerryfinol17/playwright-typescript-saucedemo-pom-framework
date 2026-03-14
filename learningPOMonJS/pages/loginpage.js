import {BasePage} from './basepage.js';
import {LOCATORS} from "./config.js";

class LoginPage extends BasePage {
    constructor(page) {
        super(page);
        this.usernameInput = page.locator(LOCATORS.usernameInput);
        this.passwordInput = page.locator(LOCATORS.passwordInput);
        this.loginBtn      = page.locator(LOCATORS.loginBtn);
        this.errorMsg      = page.locator(LOCATORS.errorMsg);
        this.inventoryTitle = page.locator(LOCATORS.inventoryTitle);
        this.swagLabsLogo = page.locator(LOCATORS.swagLabsLogo);
        this.burgerMenuBtn = page.locator(LOCATORS.burgerMenuBtn);
        this.logoutLink = page.locator(LOCATORS.logoutLink);
    }
    async login(username, password) {
        await this.fillInput(this.usernameInput, username);
        await this.fillInput(this.passwordInput, password);
        await this.clickElement(this.loginBtn);
    }
    async getErrorMessageOrEmpty(){
        if (await this.isVisible(this.errorMsg)){
            return (await this.getText(this.errorMsg)).trim();
        }
        return '';
    }
    async isErrorVisible(){
        return await this.isVisible(this.errorMsg);
    }
    async isLoginOk(){
        return this.page.url().includes('inventory.html')
    }
    async cleanLoginFields(){
        await this.usernameInput.clear();
        await this.passwordInput.clear();
    }
    async isOnBasePage(){
        return await this.isVisible(this.swagLabsLogo)
    }
    async isInventoryTitleVisible(){
        return await this.isVisible(this.inventoryTitle)
    }
}

export { LoginPage };
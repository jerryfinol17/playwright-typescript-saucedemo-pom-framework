import {test,expect} from '@playwright/test'
import {LoginPage} from "../pages/loginpage.js";
import {InventoryPage} from "../pages/inventorypage.js";
import {CartPage} from "../pages/cartpage.js";
import {BASE_URL,CREDENTIALS} from "../pages/config.js";

test("Test Cart E2E", async({page}) =>{
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page)
    const cart = new CartPage(page);
    const itemsToAdd = ["Sauce Labs Backpack",
        "Sauce Labs Bike Light",
        "Sauce Labs Bolt T-Shirt",
        "Sauce Labs Fleece Jacket",
        "Sauce Labs Onesie",
        "Test.allTheThings() T-Shirt (Red)"]


    await page.goto(BASE_URL);
    expect(await login.isOnBasePage()).toBe(true);
    await login.login(CREDENTIALS.standard.username, CREDENTIALS.standard.password);
    expect (await login.isLoginOk()).toBe(true);
    const prices = await inventory.getProductPrices();
    for(const item of itemsToAdd){
        await inventory.addItemToCart(item);
    }
    expect(await inventory.getCartBadgeCount()).toBe(6);
    await inventory.goToCart()
    expect(await cart.isOnCartPage()).toBe(true);
    expect(await cart.getPageTitle()).toBe("Your Cart");
    expect(await cart.getCartBadgeCount()).toBe(6);
    expect(await cart.getCartItemNames()).toEqual(itemsToAdd);
    expect(await cart.getCartItemPrices()).toEqual(prices);
    for(const item of itemsToAdd){
        expect(await cart.getItemQuantity(item)).toBe(1);
    }
    for(const item of itemsToAdd){
        await cart.removeItemFromCart(item);
    }
    expect(await cart.isCartEmpty()).toBe(true);
    await cart.clickAllItemsLink()
    expect(await inventory.isOnInventoryPage()).toBe(true);

})
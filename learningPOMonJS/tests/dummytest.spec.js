import {test,expect} from '@playwright/test'
import {LoginPage} from "../pages/loginpage.js";
import {InventoryPage} from "../pages/inventorypage.js";
import {CartPage} from "../pages/cartpage.js";
import {CheckoutPage} from "../pages/checkoutpage.js";
import {BASE_URL,CREDENTIALS, CHECKOUT_DATA} from "../pages/config.js";

test.beforeEach("baseLogin", async ({page}) => {
    const login = new LoginPage(page);
    await page.goto(BASE_URL)
    expect(await login.isOnBasePage()).toBe(true);
    await login.login(CREDENTIALS.standard.username, CREDENTIALS.standard.password);
    expect (await login.isLoginOk()).toBe(true);
})
test("beforeEach Work ", async ({page}) => {
    const inventory = new InventoryPage(page);
    expect(await inventory.isOnInventoryPage()).toBe(true);
})
test("Inventory Dummy", async ({page}) => {
    const inventory = new InventoryPage(page);
    expect(await inventory.isOnInventoryPage()).toBe(true);
    expect(await inventory.getPageTitle()).toBe("Products")
    expect(await inventory.getCartBadgeCount()).toBe(0);
})
test("Cart Dummy", async ({page}) => {
    const inventory = new InventoryPage(page);
    expect(await inventory.isOnInventoryPage()).toBe(true);
    await inventory.addItemToCart("Sauce Labs Backpack")
    expect(await inventory.getCartBadgeCount()).toBe(1);
    await inventory.addItemToCart("Sauce Labs Bike Light")
    await inventory.goToCart()
    const cart = new CartPage(page);
    expect(await cart.isOnCartPage()).toBe(true);
    expect (await cart.getCartBadgeCount()).toBe(2);
    expect (await cart.getPageTitle()).toBe("Your Cart");
    const names = await cart.getCartItemNames();
    expect(names).toContain("Sauce Labs Backpack");
    expect(names).toContain("Sauce Labs Bike Light");
    expect (await cart.getItemQuantity("Sauce Labs Backpack")).toBe(1)
    await cart.removeItemFromCart("Sauce Labs Backpack");
    expect(await cart.getCartBadgeCount()).toBe(1);
})
test("Checkout Dummy", async ({page}) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    const data = CHECKOUT_DATA
    await inventory.addItemToCart("Sauce Labs Backpack");
    await inventory.addItemToCart("Sauce Labs Bike Light");
    expect(await inventory.getCartBadgeCount()).toBe(2);
    await inventory.goToCart()
    expect(await cart.isOnCartPage()).toBe(true);
    const names = await cart.getCartItemNames();
    expect(names).toContain("Sauce Labs Backpack");
    expect(names).toContain("Sauce Labs Bike Light");
    await cart.proceedToCheckout()
    expect(await checkout.isOnCheckoutStepOne()).toBe(true);
    await checkout.fillPersonalInfo(data.valid.firstName, data.valid.lastName, data.valid.zipCode)
    await checkout.continueToOverview()
    const overviewNames = await checkout.getOverviewItemNames();
    expect(overviewNames).toContain("Sauce Labs Backpack");
    expect(overviewNames).toContain("Sauce Labs Bike Light");
    const total = await checkout.getTotal()
    console.log(`Total: ${total}`);
    await checkout.finishPurchase()
    expect(await checkout.isCompletePage()).toBe(true);
    const titleText = await checkout.getTitleText();
    console.log(titleText);
    const headerText = await checkout.getCompleteHeader();
    console.log(headerText);
    const completeText = await checkout.getCompleteMessage()
    console.log(completeText);
    await checkout.backToProducts()
    expect(await inventory.isOnInventoryPage()).toBe(true);
})
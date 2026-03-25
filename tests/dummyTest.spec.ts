import { test, expect } from '../fixtures/coverageFixture';
import { LoginPage } from '../pages/loginPage';
import { InventoryPage } from '../pages/inventoryPage';
import { CartPage } from '../pages/cartPage';
import { CheckoutPage } from '../pages/checkoutPage';
import { BASE_URL, CREDENTIALS, CHECKOUT_DATA } from '../pages/config';
test.beforeEach('baseLogin', async ({ page }) => {
    const login = new LoginPage(page);

    await page.goto(BASE_URL);
    await expect(login.isOnBasePage()).resolves.toBe(true);

    await login.login(CREDENTIALS.standard.username, CREDENTIALS.standard.password);
    await expect(login.isLoginOk()).resolves.toBe(true);
});

test('beforeEach Work', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await expect(inventory.isOnInventoryPage()).resolves.toBe(true);
});
test('Inventory Dummy', async ({ page }) => {
    const inventory = new InventoryPage(page);

    await expect(inventory.isOnInventoryPage()).resolves.toBe(true);
    await expect(inventory.getTitle()).resolves.toBe('Products');
    await expect(inventory.getCartBadgeCount()).resolves.toBe(0);
});
test('Cart Dummy', async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);

    await expect(inventory.isOnInventoryPage()).resolves.toBe(true);

    await inventory.addItemToCart('Sauce Labs Backpack');
    await expect(inventory.getCartBadgeCount()).resolves.toBe(1);

    await inventory.addItemToCart('Sauce Labs Bike Light');
    await inventory.goToCart();

    await expect(cart.isOnCartPage()).resolves.toBe(true);
    await expect(cart.getCartBadgeCount()).resolves.toBe(2);
    await expect(cart.getPageTitle()).resolves.toBe('Your Cart');

    const names = await cart.getCartItemNames();
    expect(names).toContain('Sauce Labs Backpack');
    expect(names).toContain('Sauce Labs Bike Light');

    await expect(cart.getCartItemQuantity('Sauce Labs Backpack')).resolves.toBe(1);

    await cart.removeItemFromCart('Sauce Labs Backpack');
    await expect(cart.getCartBadgeCount()).resolves.toBe(1);
});
test('Checkout Dummy', async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);

    await inventory.addItemToCart('Sauce Labs Backpack');
    await inventory.addItemToCart('Sauce Labs Bike Light');

    await expect(inventory.getCartBadgeCount()).resolves.toBe(2);

    await inventory.goToCart();
    await expect(cart.isOnCartPage()).resolves.toBe(true);

    const names = await cart.getCartItemNames();
    expect(names).toContain('Sauce Labs Backpack');
    expect(names).toContain('Sauce Labs Bike Light');

    await cart.proceedToCheckout();
    await expect(checkout.isOnCheckoutStepOne()).resolves.toBe(true);

    const { valid } = CHECKOUT_DATA;
    await checkout.fillPersonalInfo(valid.firstName, valid.lastName, valid.zipCode);

    await checkout.continueToOverview();

    const overviewNames = await checkout.getOverviewItemNames();
    expect(overviewNames).toContain('Sauce Labs Backpack');
    expect(overviewNames).toContain('Sauce Labs Bike Light');

    const total = await checkout.getTotal();
    console.log(`Total: ${total}`);

    await checkout.finishPurchase();
    await expect(checkout.isCompletePage()).resolves.toBe(true);

    const titleText = await checkout.getTitleText();
    console.log(titleText);

    const headerText = await checkout.getCompleteHeader();
    console.log(headerText);

    const completeText = await checkout.getCompleteMessage();
    console.log(completeText);

    await checkout.backToProducts();
    await expect(inventory.isOnInventoryPage()).resolves.toBe(true);
});
import { test, expect } from '../fixtures/coverageFixture';
import { LoginPage } from '../pages/loginPage';
import { InventoryPage } from '../pages/inventoryPage';
import { CartPage } from '../pages/cartPage';
import { CheckoutPage } from '../pages/checkoutPage';
import { BASE_URL, CREDENTIALS, CHECKOUT_DATA } from '../pages/config';
const itemsToAdd = [
    'Sauce Labs Backpack',
    'Sauce Labs Bike Light',
    'Sauce Labs Bolt T-Shirt',
    'Sauce Labs Fleece Jacket',
    'Sauce Labs Onesie',
    'Test.allTheThings() T-Shirt (Red)',
] as const;
const itemsToRemove = ['Test.allTheThings() T-Shirt (Red)', 'Sauce Labs Onesie'];
const finalItems = itemsToAdd.filter((item) => !itemsToRemove.includes(item));
test('E2E Happy Path', async ({ page }) => {
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    const cred = CREDENTIALS;
    const data = CHECKOUT_DATA;
    await page.goto(BASE_URL);
    await login.login(cred.standard.username, cred.standard.password);
    await expect(inventory.isOnInventoryPage()).resolves.toBe(true);
    for (const item of itemsToAdd) {
        await inventory.addItemToCart(item);
    }
    await expect(inventory.getCartBadgeCount()).resolves.toBe(itemsToAdd.length);
    const itemPrices = await inventory.getInventoryItemsWithPrices();
    await inventory.goToCart();
    await expect(cart.isOnCartPage()).resolves.toBe(true);
    await expect(cart.getCartBadgeCount()).resolves.toBe(itemsToAdd.length);
    for (const item of itemsToRemove) {
        await cart.removeItemFromCart(item);
    }
    await expect(cart.getCartBadgeCount()).resolves.toBe(finalItems.length);
    const cartNames = await cart.getCartItemNames();
    expect(cartNames).toEqual(finalItems);
    await cart.proceedToCheckout();
    await expect(checkout.isOnCheckoutStepOne()).resolves.toBe(true);
    const { valid } = data;
    await checkout.fillPersonalInfo(valid.firstName, valid.lastName, valid.zipCode);
    await checkout.continueToOverview();
    const overviewNames = await checkout.getOverviewItemNames();
    expect(overviewNames).toEqual(finalItems);
    const expectedSubTotal = finalItems.reduce((sum, item) => {
        const price = itemPrices.get(item);
        if (price === undefined) {
            throw new Error(`Precio no encontrado para "${item}" en itemPrices (Map)`);
        }
        return sum + price;
    }, 0)
    await expect(checkout.getSubtotal()).resolves.toBe(expectedSubTotal);
    const expectedTax = Number((expectedSubTotal * 0.08).toFixed(2));
    await expect(checkout.getTax()).resolves.toBe(expectedTax);
    const expectedTotal = Number(expectedSubTotal + expectedTax);
    await expect(checkout.getTotal()).resolves.toBeCloseTo(expectedTotal, 2);
    await checkout.finishPurchase();
    await expect(checkout.isCompletePage()).resolves.toBe(true);
    await checkout.backToProducts();
    await expect(inventory.isOnInventoryPage()).resolves.toBe(true);
    await login.logout();
    await expect(login.isOnBasePage()).resolves.toBe(true);
});
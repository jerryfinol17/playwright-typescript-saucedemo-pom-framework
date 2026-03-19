import {test,expect} from '@playwright/test'
import {LoginPage} from "../pages/loginPage";
import {InventoryPage} from "../pages/inventoryPage";
import {CartPage} from "../pages/cartPage";
import {BASE_URL,CREDENTIALS} from "../pages/config";
const itemsToAdd = [
    'Sauce Labs Backpack',
    'Sauce Labs Bike Light',
    'Sauce Labs Bolt T-Shirt',
    'Sauce Labs Fleece Jacket',
    'Sauce Labs Onesie',
    'Test.allTheThings() T-Shirt (Red)',
] as const;

test('Test Cart E2E', async ({page}) => {
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);

    await page.goto(BASE_URL);
    await  expect(login.isOnBasePage()).resolves.toBe(true);
    await login.login(CREDENTIALS.standard.username, CREDENTIALS.standard.password);
    await expect(login.isLoginOk()).resolves.toBe(true);
    const prices = await inventory.getProductPrices();
    for(const item of itemsToAdd) {
        await inventory.addItemToCart(item);
    }
    await expect(inventory.getCartBadgeCount()).resolves.toBe(itemsToAdd.length);
    await inventory.goToCart()
    await expect(cart.isOnCartPage()).resolves.toBe(true);
    await expect(cart.getPageTitle()).resolves.toBe('Your Cart');
    await expect(cart.getCartBadgeCount()).resolves.toBe(itemsToAdd.length);
    const cartItemsNames = await cart.getCartItemNames()
    expect(cartItemsNames).toEqual([...itemsToAdd]);
    const cartItemPrices = await cart.getCartItemPrices()
    expect(cartItemPrices).toEqual(prices);
    for(const item of itemsToAdd) {
        await expect(cart.getCartItemQuantity(item)).resolves.toBe(1)
    }
    for(const item of itemsToAdd) {
        await cart.removeItemFromCart(item);
    }
    await expect(cart.isCartEmpty()).resolves.toBe(true);
    await cart.clickAllItemsLink()
    await expect(inventory.isOnInventoryPage()).resolves.toBe(true);
})
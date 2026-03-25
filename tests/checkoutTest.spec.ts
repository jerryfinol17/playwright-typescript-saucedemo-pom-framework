import { test, expect } from '../fixtures/coverageFixture';
import {LoginPage} from "../pages/loginPage";
import {InventoryPage} from "../pages/inventoryPage";
import {CartPage} from "../pages/cartPage";
import {CheckoutPage} from "../pages/checkoutPage";
import {BASE_URL, CHECKOUT_DATA, CREDENTIALS} from "../pages/config";
interface CheckoutDataCase {
    firstName: string;
    lastName: string;
    zipCode: string;
    expectedError?: string;
}
const requiredFieldsCases: CheckoutDataCase[] = [
    {
        firstName: CHECKOUT_DATA.invalidName.firstName,
        lastName: CHECKOUT_DATA.invalidName.lastName,
        zipCode: CHECKOUT_DATA.invalidName.zipCode,
        expectedError: CHECKOUT_DATA.invalidName.expectedError,
    },
    {
        firstName: CHECKOUT_DATA.invalidLastname.firstName,
        lastName: CHECKOUT_DATA.invalidLastname.lastName,
        zipCode: CHECKOUT_DATA.invalidLastname.zipCode,
        expectedError: CHECKOUT_DATA.invalidLastname.expectedError,
    },
    {
        firstName: CHECKOUT_DATA.invalidZipCode.firstName,
        lastName: CHECKOUT_DATA.invalidZipCode.lastName,
        zipCode: CHECKOUT_DATA.invalidZipCode.zipCode,
        expectedError: CHECKOUT_DATA.invalidZipCode.expectedError,
    },
    {
        firstName: CHECKOUT_DATA.allBlankCheckout.firstName,
        lastName: CHECKOUT_DATA.allBlankCheckout.lastName,
        zipCode: CHECKOUT_DATA.allBlankCheckout.zipCode,
        expectedError: CHECKOUT_DATA.allBlankCheckout.expectedError,
    },
];
test.beforeEach(async ({page}) => {
    const login = new LoginPage(page);
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle')
    await expect(login.isOnBasePage()).resolves.toBe(true);
    await login.login(CREDENTIALS.standard.username, CREDENTIALS.standard.password);
    await expect(login.isLoginOk()).resolves.toBe(true);
})
test('Checkout Happy Path', async ({page}) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    const itemsToAdd = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'] as const;
    await expect(inventory.isOnInventoryPage()).resolves.toBe(true);
    for(const item of itemsToAdd){
        await inventory.addItemToCart(item);
    }
    await expect(inventory.getCartBadgeCount()).resolves.toBe(itemsToAdd.length);
    const itemPrices = await inventory.getInventoryItemsWithPrices();
    await inventory.goToCart()
    await expect(cart.isOnCartPage()).resolves.toBe(true);
    await cart.proceedToCheckout()
    await expect(checkout.isOnCheckoutStepOne()).resolves.toBe(true);
    const {valid} = CHECKOUT_DATA;
    await checkout.fillPersonalInfo(valid.firstName, valid.lastName, valid.zipCode);
    await checkout.continueToOverview();
    const names = await checkout.getOverviewItemNames()
    expect(names).toEqual(itemsToAdd);
    const expectedSubTotal = itemsToAdd.reduce((sum, item)=> {
        const price = itemPrices.get(item);
        if(price === undefined){
            throw new Error(`Precio no encontrado para "${item}" en itemsPrices (Map)`);
        }
        return sum + price;
    }, 0);
    await expect(checkout.getSubtotal()).resolves.toEqual(expectedSubTotal);
    const expectedTax = Number((expectedSubTotal * 0.08).toFixed(2));
    await expect(checkout.getTax()).resolves.toEqual(expectedTax);
    const expectedTotal = Number( expectedSubTotal + expectedTax );
    await expect(checkout.getTotal()).resolves.toEqual(expectedTotal);
    await checkout.finishPurchase();
    await expect(checkout.isCompletePage()).resolves.toBe(true);
    await checkout.backToProducts();
    await expect(inventory.isOnInventoryPage()).resolves.toBe(true);
})
test.describe('Checkout step one required fields',()=>{
    for(const {firstName, lastName, zipCode, expectedError} of requiredFieldsCases){
        test(`Shows ${expectedError} when: ${firstName} , ${lastName} , ${zipCode}`, async ({page}) => {
            const inventory = new InventoryPage(page);
            const cart = new CartPage(page);
            const checkout = new CheckoutPage(page);
            await inventory.addItemToCart("Sauce Labs Backpack");
            await inventory.goToCart();
            await expect(cart.isOnCartPage()).resolves.toBe(true);
            await cart.proceedToCheckout();
            await expect(checkout.isOnCheckoutStepOne()).resolves.toBe(true);
            await checkout.fillPersonalInfo(firstName, lastName, zipCode);
            await checkout.continueToOverview();
            const error = await checkout.getErrorMessage()
            expect(error).toBe(expectedError);
        })
    }
});
test('Checkout Cancel from step one', async ({page}) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    await inventory.addItemToCart("Sauce Labs Backpack");
    await inventory.goToCart();
    await expect(cart.isOnCartPage()).resolves.toBe(true);
    await cart.proceedToCheckout();
    await expect(checkout.isOnCheckoutStepOne()).resolves.toBe(true);
    await checkout.cancelFromStepOne()
    await expect(cart.isOnCartPage()).resolves.toBe(true);
});
test('Checkout cancel from step two', async ({page}) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    await inventory.addItemToCart("Sauce Labs Backpack");
    await inventory.goToCart();
    await expect(cart.isOnCartPage()).resolves.toBe(true);
    await cart.proceedToCheckout();
    await expect(checkout.isOnCheckoutStepOne()).resolves.toBe(true);
    const {valid} = CHECKOUT_DATA;
    await checkout.fillPersonalInfo(valid.firstName, valid.lastName, valid.zipCode);
    await checkout.continueToOverview();
    await checkout.cancelFromOverview()
    await expect(inventory.isOnInventoryPage()).resolves.toBe(true);
})
test('Items on Overview are correct', async ({page}) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    const itemsToAdd = ['Sauce Labs Backpack',
        'Sauce Labs Onesie',
        'Sauce Labs Fleece Jacket',
        'Sauce Labs Bolt T-Shirt',] as const;
    for(const item of itemsToAdd){
        await inventory.addItemToCart(item);
    }
    await expect(inventory.getCartBadgeCount()).resolves.toEqual(itemsToAdd.length);
    const inventoryPrices = await inventory.getInventoryItemsWithPrices()
    await inventory.goToCart();
    await expect(cart.isOnCartPage()).resolves.toBe(true);
    await expect(cart.getCartBadgeCount()).resolves.toEqual(itemsToAdd.length);
    await cart.proceedToCheckout();
    await expect(checkout.isOnCheckoutStepOne()).resolves.toBe(true);
    const {valid} = CHECKOUT_DATA;
    await checkout.fillPersonalInfo(valid.firstName, valid.lastName, valid.zipCode);
    await checkout.continueToOverview();
    const overviewItemCount = await checkout.getOverviewItemCount();
    expect(overviewItemCount).toBe(itemsToAdd.length);
    const overviewNames = await checkout.getOverviewItemNames()
    expect(overviewNames).toEqual(itemsToAdd);
    const overviewPrices = await checkout.getOverviewItemWithPrices()
    for(const name of itemsToAdd){
        expect(name in overviewPrices, `Item '${name}' does not appear in overview.`).toBe(true);
        expect(inventoryPrices.has(name), `Item '${name}' does not appear in Inventory (bug?).`).toBe(true);
        expect(
            overviewPrices[name],
            `Precio de '${name}' no coincide: inventory $${inventoryPrices.get(name)} vs overview $${overviewPrices[name]}`
        ).toBeCloseTo(inventoryPrices.get(name)!,2);
    }
    const expectedSubtotal = itemsToAdd.reduce((sum,item)=>{
        const price = inventoryPrices.get(item);
        if(price === undefined){
            throw new Error(`Precio no encontrado para "${item}"`);
        }
        return sum+price;
    },0);
    await expect(checkout.getSubtotal()).resolves.toBe(expectedSubtotal);
    const expectedTax = Number((expectedSubtotal * 0.08).toFixed(2))
    await expect(checkout.getTax()).resolves.toBe(expectedTax);
    const expectedTotal  = Number(expectedSubtotal + expectedTax);
    await expect(checkout.getTotal()).resolves.toBe(expectedTotal);
    await checkout.finishPurchase()
    await expect(checkout.isCompletePage()).resolves.toBe(true);
    await checkout.backToProducts()
    await expect(inventory.isOnInventoryPage()).resolves.toBe(true);
});
test.fail('Checkout without items in Cart (Known bug)', async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    await expect(inventory.isOnInventoryPage()).resolves.toBe(true);
    await inventory.goToCart();
    await expect(cart.isOnCartPage()).resolves.toBe(true);
    await cart.proceedToCheckout();
    await expect(checkout.isOnCheckoutStepOne()).resolves.toBe(true);
    const {valid} = CHECKOUT_DATA;
    await checkout.fillPersonalInfo(valid.firstName, valid.lastName, valid.zipCode);
    await checkout.continueToOverview();
    await expect(checkout.getSubtotal()).resolves.toBe(0);
    await checkout.finishPurchase()
    await expect(checkout.isCompletePage()).resolves.toBe(false);
    //This tests should fail because in a regular shopping web you can't make the checkout
    //without items in the shopping cart, but this page let you make the checkout.
});
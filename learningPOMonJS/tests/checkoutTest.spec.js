import {test, expect}  from "@playwright/test";
import {LoginPage} from "../pages/loginpage.js";
import {InventoryPage} from "../pages/inventorypage.js";
import {CartPage} from "../pages/cartpage.js";
import {CheckoutPage} from "../pages/checkoutpage.js";
import {BASE_URL, CHECKOUT_DATA, CREDENTIALS} from "../pages/config.js";
const requiredFieldsCases = [

    {   first: CHECKOUT_DATA.invalidName.firstName,
        last: CHECKOUT_DATA.invalidName.lastName,
        zip: CHECKOUT_DATA.invalidName.zipCode,
        errorMsg: CHECKOUT_DATA.invalidName.expectedError,
    },
    {   first: CHECKOUT_DATA.invalidLastname.firstName,
        last:CHECKOUT_DATA.invalidLastname.lastName,
        zip: CHECKOUT_DATA.invalidLastname.zipCode,
        errorMsg: CHECKOUT_DATA.invalidLastname.expectedError,
    },
    {   first: CHECKOUT_DATA.invalidZipCode.firstName,
        last: CHECKOUT_DATA.invalidZipCode.lastName,
        zip: CHECKOUT_DATA.invalidZipCode.zipCode,
        errorMsg: CHECKOUT_DATA.invalidZipCode.expectedError,
    },
    {   first:CHECKOUT_DATA.allBlakCheckout.firstName,
        last:CHECKOUT_DATA.allBlakCheckout.lastName,
        zip: CHECKOUT_DATA.allBlakCheckout.zipCode,
        errorMsg: CHECKOUT_DATA.allBlakCheckout.expectedError,
    },
    ]

test.beforeEach(async ({page}) => {
    const login = new LoginPage(page);
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle')
    await login.login(CREDENTIALS.standard.username, CREDENTIALS.standard.password);
    expect(await login.isLoginOk()).toBe(true);
})
test("Checkout Happy Path",async ({page}) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    const data = CHECKOUT_DATA
    const itemToAdd = ["Sauce Labs Backpack", "Sauce Labs Bike Light"]
    for(const item of itemToAdd){
        await inventory.addItemToCart(item);
    }
    expect(await inventory.getCartBadgeCount()).toBe(2);
    const itemsPrices = await inventory.getInventoryItemsWithPrices();
    await inventory.goToCart();
    expect(await cart.isOnCartPage()).toBe(true);
    await cart.proceedToCheckout();
    expect(await checkout.isOnCheckoutStepOne()).toBe(true);
    await checkout.fillPersonalInfo(data.valid.firstName, data.valid.lastName, data.valid.zipCode);
    await checkout.continueToOverview();
    const names = await checkout.getOverviewItemNames();
    expect(await names).toEqual(itemToAdd);
    const expectedSubTotal = itemToAdd.reduce((sum, item) => {
        const price = itemsPrices.get(item);

        if (price === undefined) {
            throw new Error(`Precio no encontrado para "${item}" en itemsPrices (Map)`);
        }

        return sum + price;
    }, 0);
    expect(await checkout.getSubtotal()).toEqual(expectedSubTotal);
    const expectedTax = Number((expectedSubTotal * 0.08).toFixed(2));
    expect(await checkout.getTax()).toEqual(expectedTax);
    const expectedTotal = Number(expectedTax + expectedSubTotal);
    expect(await checkout.getTotal()).toEqual(expectedTotal);
    await checkout.finishPurchase()
    expect(await checkout.isCompletePage()).toBe(true);
    await checkout.backToProducts()
    expect(await inventory.isOnInventoryPage()).toBe(true);
});
test.describe("Checkout step one required fields",async () => {
    for (const { first, last, zip, errorMsg } of requiredFieldsCases){
        test(`shows "${errorMsg}" when first:"${first}" last:"${last}" zip:"${zip}"`, async ({ page }) =>{
            const inventory = new InventoryPage(page);
            const cart = new CartPage(page);
            const checkout = new CheckoutPage(page);
            await inventory.addItemToCart('Sauce Labs Backpack');
            await inventory.goToCart();
            expect(await cart.isOnCartPage()).toBe(true);
            await cart.proceedToCheckout();
            expect(await checkout.isOnCheckoutStepOne()).toBe(true);
            await checkout.fillPersonalInfo(first,last,zip);
            await checkout.continueToOverview();
            expect(await checkout.getErrorMessage()).toBe(errorMsg);
        });
    }
});
test("Cancel Checkout From Step One", async ({page}) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    await inventory.addItemToCart('Sauce Labs Backpack');
    await inventory.goToCart();
    expect(await cart.isOnCartPage()).toBe(true);
    await cart.proceedToCheckout();
    expect(await checkout.isOnCheckoutStepOne()).toBe(true);
    await checkout.cancelFromStepOne()
    expect(await cart.isOnCartPage()).toBe(true);

})
test("Cancel Checkout From Step Two", async ({page}) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    const data = CHECKOUT_DATA
    await inventory.addItemToCart('Sauce Labs Backpack');
    await inventory.goToCart();
    expect(await cart.isOnCartPage()).toBe(true);
    await cart.proceedToCheckout();
    expect(await checkout.isOnCheckoutStepOne()).toBe(true);
    await checkout.fillPersonalInfo(data.valid.firstName, data.valid.lastName, data.valid.zipCode);
    await checkout.continueToOverview();
    await checkout.cancelFromOverview()
    expect(await inventory.isOnInventoryPage()).toBe(true);
})
test("Items on Overview are Correct", async ({page}) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    const data = CHECKOUT_DATA
    const itemsToAdd = ['Sauce Labs Backpack', 'Sauce Labs Onesie', 'Sauce Labs Fleece Jacket', 'Sauce Labs Bolt T-Shirt']
    for (const item of itemsToAdd) {
        await inventory.addItemToCart(item);
    }
    const inventoryPrices = await inventory.getInventoryItemsWithPrices();
    const itemsPrices = await inventory.getInventoryItemsWithPrices();
    await inventory.goToCart();
    expect(await cart.isOnCartPage()).toBe(true);
    expect(await cart.getCartBadgeCount()).toBe(4);
    const cartBadge = await cart.getCartBadgeCount();
    await cart.proceedToCheckout();
    expect(await checkout.isOnCheckoutStepOne()).toBe(true);
    await checkout.fillPersonalInfo(data.valid.firstName, data.valid.lastName, data.valid.zipCode);
    await checkout.continueToOverview();
    expect(await checkout.getOverviewItemCount()).toEqual(cartBadge);
    expect(await checkout.getOverviewItemNames()).toEqual(itemsToAdd);
    expect(await checkout.getOverviewItemCount()).toEqual(itemsToAdd.length);
    const overviewPrices = await checkout.getOverviewItemsWithPrices();
    for (const name of itemsToAdd) {
        expect(name in overviewPrices,
            `Item '${name}' does not appear in Overview.`).toBe(true);
        expect( inventoryPrices.has(name) ,
                `Item '${name}' does not appear in Inventory (bug?).`).toBe(true);
        expect(
            overviewPrices[name],
            `Precio de '${name}' no coincide: inventory $${inventoryPrices[name]} vs overview $${overviewPrices[name]}`
        ).toBeCloseTo(inventoryPrices.get(name), 3);
    }
    const names = await checkout.getOverviewItemNames();
    expect(await names).toEqual(itemsToAdd);
    const expectedSubTotal = itemsToAdd.reduce((sum, item) => {
        const price = itemsPrices.get(item);

        if (price === undefined) {
            throw new Error(`Precio no encontrado para "${item}" en itemsPrices (Map)`);
        }

        return sum + price;
    }, 0);
    expect(await checkout.getSubtotal()).toEqual(expectedSubTotal);
    const expectedTax = Number((expectedSubTotal * 0.08).toFixed(2));
    expect(await checkout.getTax()).toEqual(expectedTax);
    const expectedTotal = Number(expectedTax + expectedSubTotal);
    expect(await checkout.getTotal()).toEqual(expectedTotal);
    await checkout.finishPurchase()
    expect(await checkout.isCompletePage()).toBe(true);
    await checkout.backToProducts()
    expect(await inventory.isOnInventoryPage()).toBe(true);
});
test.fail("Checkout whitOut items on Cart (Known bug)",async ({page}) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    const data = CHECKOUT_DATA
    expect(await inventory.isOnInventoryPage()).toBe(true);
    await inventory.goToCart();
    expect(await cart.isOnCartPage()).toBe(true);
    await cart.proceedToCheckout();
    expect(await checkout.isOnCheckoutStepOne()).toBe(true);
    await checkout.fillPersonalInfo(data.valid.firstName, data.valid.lastName, data.valid.zipCode);
    await checkout.continueToOverview();
    expect(await checkout.getTotal()).toBe(0)
    await checkout.finishPurchase()
    expect(await checkout.isCompletePage()).toBe(false);
    //This tests should fail because in a regular shopping web you can't make the checkout
    //without items in the shopping cart, but this page let you make the checkout.
})
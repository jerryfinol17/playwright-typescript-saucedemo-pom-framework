import { chromium, expect } from '@playwright/test';

(async ()=>{
    const browser = await chromium.launch({headless: false, slowMo: 500});
    const context = await browser.newContext();
    const page = await context.newPage();

    async function getCartBadgeCount() {
        const cartBadge = page.locator('[data-test="shopping-cart-badge"]');
        const badgeCountText = await cartBadge.innerText();
        return Number(badgeCountText) || 0;
    }
    try{
        await page.goto('https://www.saucedemo.com/');
        await page.waitForLoadState('networkidle');
        const initialUrl= page.url();
        console.log(`Aqui comenzamos: ${initialUrl}`);
        const user = page.getByPlaceholder('Username');
        const password =  page.getByPlaceholder('Password');
        const loginBtn =  page.locator('[data-test="login-button"]');
        await user.fill('standard_user')
        await password.fill('secret_sauce')
        await loginBtn.click();
        await page.waitForLoadState('networkidle');
        await expect(page.url()).toContain(`inventory.html`);
        console.log(`Actual Url:${page.url()});`);
        console.log(`El Assert funciono! Vamos por buen camino`);
        const backpack = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
        const cartLink = page.locator('[data-test="shopping-cart-badge"]');
        await backpack.click();
        await expect(await getCartBadgeCount()).toBe(1);
        console.log('Agregamos un producto')
        await cartLink.click();
        await page.waitForLoadState('networkidle');
        await expect(page.url()).toContain(`cart.html`);
        const continueShopping = page.locator('[data-test="continue-shopping"]');
        await continueShopping.click();
        await page.waitForLoadState('networkidle');
        await expect(page.url()).toContain(`inventory.html`);
        const fleeceJacket =  page.locator('[data-test="add-to-cart-sauce-labs-fleece-jacket"]');
        await fleeceJacket.click();
        await expect(await getCartBadgeCount()).toBe(2);
        console.log('Agregamos dos productos')
        await cartLink.click();
        const removeBackpack = page.locator('[data-test="remove-sauce-labs-backpack"]');
        await removeBackpack.click();
        await expect(await getCartBadgeCount()).toBe(1);
        console.log('retiramos un producto asi que nos quedamos con uno')
        const checkoutBtn = page.locator('[data-test="checkout"]');
        await checkoutBtn.click();
        await expect(page.url()).toContain(`checkout-step-one.html`);
        console.log('Vamos a agradar los datos para el checkout')
        const firstName =  page.getByPlaceholder('First Name');
        const lastName =  page.getByPlaceholder('Last Name');
        const zipcode =  page.getByPlaceholder('Zip/Postal Code');
        await firstName.fill("Pepe")
        await lastName.fill("Tin")
        await zipcode.fill("5648")
        const continueButton =  page.locator('[data-test="continue"]');
        await continueButton.click();
        console.log('estamos en la ultima seccion del checkout')
        await page.waitForLoadState('networkidle');
        await expect(page.url()).toContain(`checkout-step-two.html`);
        const finishButton =  page.locator('[data-test="finish"]');
        await finishButton.click();
        await page.waitForLoadState('networkidle');
        console.log('estamos en la seccion del checkout')
        await expect(page.url()).toContain(`checkout-complete.html`);
        const title = page.locator('h2');
        const titleText = await title.innerText();
        await expect(titleText).toContain('your order!');
        await page.screenshot({path:`Complete-page.png`})
        console.log(`Actual Title:${titleText}`);
        const backHome =  page.locator('[data-test="back-to-products"]');
        await backHome.click();
        await page.waitForLoadState('networkidle');
        await expect(page.url()).toContain(`inventory.html`);
        console.log('el proceso se hizo de forma exitosa, vamos a hacer logout');
        const burgerButton =  page.locator('#react-burger-menu-btn');
        await burgerButton.click();
        const logoutLink =  page.locator('[data-test="logout-sidebar-link"]');
        await logoutLink.click();
        await page.waitForLoadState('networkidle');
        await expect(page.url()).toBe('https://www.saucedemo.com/');
        console.log('Se Logro!!!')
    }catch(error){
        console.error(`Consegui este error:`, error || error.message);
    }finally{
        await browser.close();
    }

})();
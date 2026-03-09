const {chromium} = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false, slowMo:80 });
    const context = await browser.newContext({});
    const page = await context.newPage();

    try{
        await page.goto('https://www.google.com/');
        const searchBox =  page.locator("#APjFqb");
        await searchBox.fill('Playwright')
        await page.screenshot({path: "first-screenshot.png", fullPage: true});
        await searchBox.press('Enter')
        await page.waitForLoadState('networkidle');
        const firstTitle= await page.getByRole('link', { name: /Playwright/i }).first().innerText()
        console.log(`Este es el primero: ${firstTitle}`)
        await page.screenshot({path: "second-screenshot.png", fullPage: true});
    }catch (error){
        console.error('Algo Fallo:', error || error.message)
    }finally{
        await browser.close();
    }
})();

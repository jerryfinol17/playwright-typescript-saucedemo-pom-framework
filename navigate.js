import { chromium, expect } from '@playwright/test';

(async () => {
    const browser = await chromium.launch({headless: false, slowMo: 80});
    const context = await browser.newContext();
    const page = await context.newPage();

    try{
        await page.goto('https://duckduckgo.com/');
        const searchBox =  page.getByPlaceholder('Search');
        await searchBox.fill('Playwright JS');
        await page.screenshot({path:`navigate-step-one.png`});
        await searchBox.press('Enter');
        await page.waitForLoadState('networkidle')
        await page.screenshot({path:`navigate-step-two.png`});
        const initialurl = page.url()
        console.log(`esta es la primera url: ${initialurl}`);
        const resultTitle = page.locator('h2')
        const count = await resultTitle.count();
        console.log(`Encontre ${count} Links`);
        await expect(count).toBeGreaterThan(0);
        console.log(`El Assert funciono!`)
        const firstTitleLocator = resultTitle.first()
        const lastTitleLocator = resultTitle.last()
        const firstLinkName = await firstTitleLocator.innerText();
        const lastLinkName = await  lastTitleLocator.innerText();
        console.log(`El nombre del primer link es: ${firstLinkName.trim()}`);
        console.log(`Y el nombre del ultimo que consegui es: ${lastLinkName.trim()}`);
        await firstTitleLocator.click();
        await page.waitForLoadState('networkidle');
        await expect(page.url()).toContain(`playwright.dev`);
        console.log(`El Assert funciono! de nuevo! y menos mal!`)
        await page.screenshot({path:`navigate-step-three.png`});
        console.log(`la nueva url es ${page.url()}`);
        await page.goBack()
        await page.waitForLoadState('networkidle');
        await expect(count).toBeGreaterThan(0);
        await lastTitleLocator.click()
        await page.waitForLoadState('networkidle');
        await page.screenshot({path:`navigate-step-four.png`});
        console.log(`la nueva url es ${page.url()}`);

    }catch(error){
        console.error('Encontré este error:', error.message || error);
    }
    finally{
        await browser.close();
    }
})();
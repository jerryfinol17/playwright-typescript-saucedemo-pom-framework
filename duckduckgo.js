import { chromium } from '@playwright/test';

(async () => {
    const browser= await chromium.launch({headless:false,slowMo: 80});
    const context = await browser.newContext();
    const page = await context.newPage();
    try{
        await page.goto('https://duckduckgo.com/')
        const searchBox = page.getByPlaceholder('Search');
        await searchBox.fill('Playwright JS');
        await page.screenshot({ path: `duckduckgo-first.png` });
        await searchBox.press('Enter');
        await page.waitForLoadState('networkidle');
        const resultTitle = page.locator('h2');
        const count = await resultTitle.count();
        console.log(`encontre: ${count} resultados`);
        for (let i = 0; i < Math.min(3, count); i++) {
            const titleLocator = resultTitle.nth(i);
            const titleText = await titleLocator.innerText();

            if (titleText && typeof titleText === 'string') {
                console.log(`Resultado ${i + 1}: ${titleText.trim()}`);
            } else {
                console.log(`Resultado ${i + 1}: (título vacío o no encontrado)`);
            }
        }
        await page.screenshot({ path: `duckduckgo-last.png` });

    }catch(error){
        console.error("Fallo en:",error)
        await page.screenshot({ path: `duckduckgo-error.png` });
    }finally{
        await browser.close()
    }
})();

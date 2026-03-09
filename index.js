import { chromium } from '@playwright/test';

(async () => {
    const browser = await chromium.launch({ headless: false, slowMo: 80 });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await page.goto('https://example.com/');

        const title = await page.locator('h1').innerText();
        const initialUrl = page.url();
        const bodyPreview = (await page.innerText('body')).slice(0, 300) + '...';

        console.log(`Título: ${title}`);
        console.log(`URL inicial: ${initialUrl}`);
        console.log(`Body (primeros 300 chars): ${bodyPreview}`);

        const learnMoreLink = page.getByRole('link', { name: 'Learn more' });
        await learnMoreLink.click();

        await page.waitForLoadState('networkidle');

        console.log(`Nueva URL después del click: ${page.url()}`);

        await page.screenshot({ path: 'after-learn-more.png', fullPage: true });
        console.log('Screenshot guardado ✓');

    } catch (error) {
        console.error('Algo falló:', error.message);
        await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
    } finally {
        await browser.close();
    }
})();
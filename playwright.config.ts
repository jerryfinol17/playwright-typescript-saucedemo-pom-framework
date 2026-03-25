import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : 4,

    reporter: [
        ['html'],
        ['monocart-reporter', {
            name: "Coverage Report",
            outputFile: './coverage-report/index.html',
            coverage: {
                reports: ['v8', 'console-details'],
                outputDir: './coverage-report'
            }
        }]
    ],

    use: {
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        headless: true,
        baseURL: 'https://www.saucedemo.com',
        launchOptions: { slowMo: 80 }
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
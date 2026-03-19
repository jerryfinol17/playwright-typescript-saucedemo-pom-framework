import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { BASE_URL, CREDENTIALS as cred } from '../pages/config';
interface PositiveUser {
    key: keyof typeof cred;
    shouldMeasureTime: boolean;
}
interface NegativeUser {
    key: keyof typeof cred;
    expectedError: string;
}
const positiveUsers = [
    { key: 'standard', shouldMeasureTime: true },
    { key: 'performanceGlitch', shouldMeasureTime: true },
    { key: 'problem', shouldMeasureTime: false },
    { key: 'error', shouldMeasureTime: false },
    { key: 'visual', shouldMeasureTime: false },
] as const satisfies readonly PositiveUser[];
const negativeUsers = [
    { key: 'lockedOut', expectedError: 'locked out' },
    { key: 'invalidUser', expectedError: 'do not match' },
    { key: 'invalidPassword', expectedError: 'do not match' },
    { key: 'blankUser', expectedError: 'username is required' },
    { key: 'blankPassword', expectedError: 'password is required' },
    { key: 'allBlank', expectedError: 'username is required' },
] as const satisfies readonly NegativeUser[];
for (const { key: userKey, shouldMeasureTime } of positiveUsers) {
    test(`Login Positivo -> ${userKey} user`, async ({ page }) => {
        const creds = cred[userKey];
        if (!creds) {
            throw new Error(`No se encontraron las credenciales para: ${userKey}`);
        }

        const login = new LoginPage(page);
        let startTime: number | null = null;

        if (shouldMeasureTime) {
            startTime = performance.now();
        }

        await page.goto(BASE_URL);
        await login.login(creds.username, creds.password);

        await expect(login.isInventoryTitleVisible()).resolves.toBe(true);
        await expect(login.isLoginOk()).resolves.toBe(true);

        if (shouldMeasureTime && startTime !== null) {
            const durationMs = performance.now() - startTime;
            const durationSec = durationMs / 1000;

            console.log(`${userKey} login + carga: ${durationSec.toFixed(2)} segundos`);

            expect(
                durationSec,
                `${userKey} demasiado lento`
            ).toBeGreaterThanOrEqual(1.0);

            expect(
                durationSec,
                `${userKey} demasiado lento`
            ).toBeLessThan(12.0);
        }
        if (['standard', 'visual', 'performanceGlitch'].includes(userKey)) {
            await page.screenshot({
                path: `screenshots/login_${userKey}_success.png`,
                fullPage: true,
            });
        }
    });
}

for (const { key: userKey, expectedError } of negativeUsers) {
    test(`Login Negativo - ${userKey} user`, async ({ page }) => {
        const creds = cred[userKey];
        if (!creds) {
            throw new Error(`Credenciales no encontradas: ${userKey}`);
        }

        const login = new LoginPage(page);

        await page.goto(BASE_URL);
        await login.login(creds.username, creds.password);

        await expect(login.isErrorVisible()).resolves.toBe(true);

        const errorMsg = await login.getErrorMessageOrEmpty();
        if (!errorMsg) {
            throw new Error(`No apareció mensaje de error para ${userKey}`);
        }

        const errorLower = errorMsg.toLowerCase();

        expect(
            errorLower,
            `Se esperaba que contuviera "${expectedError}", pero se obtuvo: "${errorMsg}"`
        ).toContain(expectedError.toLowerCase());
    });
}
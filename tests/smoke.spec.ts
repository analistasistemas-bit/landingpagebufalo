import { test, expect } from 'playwright/test';

const routes = [
  '/',
  '/a-marca',
  '/produtos',
  '/produtos/linhas-de-costura',
  '/produtos/ziperes',
  '/qualidade',
  '/revendedor',
  '/contato',
  '/privacidade',
];

const PRICE_PATTERN = /R\$|preço|price/i;

for (const route of routes) {
  test(`${route} — smoke`, async ({ page }) => {
    await page.goto(route);

    // 1. Exactly one <h1>
    const h1s = page.locator('h1');
    await expect(h1s).toHaveCount(1);

    // 2. WhatsApp floating button exists with correct href
    const waBtn = page.locator('a[href*="wa.me/5581983426557"]').first();
    await expect(waBtn).toBeVisible();

    // 3. No price text on the page
    const bodyText = await page.locator('body').innerText();
    expect(PRICE_PATTERN.test(bodyText)).toBe(false);

    // 4. Every <img> has a non-empty alt attribute
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt, `img #${i} on ${route} missing alt`).toBeTruthy();
    }

    // 5. Page <title> is non-empty
    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(0);
  });
}

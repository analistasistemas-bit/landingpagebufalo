import { test, expect } from 'playwright/test';

test.describe('prototype route isolation', () => {
  test('/prototipo owns a prototype shell', async ({ page }) => {
    const response = await page.goto('/prototipo');
    expect(response?.status()).toBe(200);
    await expect(page.locator('[data-prototype="true"]')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('footer[data-prototype-footer]')).toHaveCount(1);
  });

  test('/ remains outside prototype mode', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-prototype="true"]')).toHaveCount(0);
    await expect(page.locator('[data-analysis-toggle]')).toHaveCount(0);
  });

  test('prototype footer controls meet the 44px touch-target minimum', async ({ page }) => {
    await page.goto('/prototipo');
    const controls = page.locator('footer[data-prototype-footer] a');

    for (let index = 0; index < await controls.count(); index++) {
      const control = controls.nth(index);
      const label = await control.innerText();
      const box = await control.boundingBox();

      expect(box, `${label} needs a visible touch target`).not.toBeNull();
      expect(box?.width, `${label} needs a 44px minimum width`).toBeGreaterThanOrEqual(44);
      expect(box?.height, `${label} needs a 44px minimum height`).toBeGreaterThanOrEqual(44);
    }
  });
});

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

  test('hero uses verified proof and four audience paths', async ({ page }) => {
    await page.goto('/prototipo');
    const main = page.locator('main');
    await expect(main.getByText('500 cores', { exact: false })).toBeVisible();
    await expect(main.getByText('100+', { exact: false })).toHaveCount(0);
    await expect(page.locator('[data-audience-path]')).toHaveCount(4);
    await expect(page.locator('[data-audience-path] img')).toHaveCount(4);
    await expect(page.locator('#caminhos h2')).toHaveText('Escolha pelo seu trabalho');
    await expect(page.locator('[data-audience-path][href="#categorias"]')).toHaveCount(4);
  });

  test('prototype prioritizes eight real categories and keeps the full catalog separate', async ({ page }) => {
    await page.goto('/prototipo');
    await expect(page.locator('[data-priority-category]')).toHaveCount(8);
    const hrefs = await page.locator('[data-priority-category]').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    expect(hrefs).toEqual([
      '/produtos/linhas-de-costura', '/produtos/fios-overloque', '/produtos/ziperes', '/produtos/elasticos',
      '/produtos/passamanarias', '/produtos/botoes-de-pressao', '/produtos/tesouras', '/produtos/fita-metrica',
    ]);
    await expect(page.getByRole('link', { name: 'Ver catálogo completo' })).toHaveAttribute('href', '/produtos');
  });

  test('technical proof and conversion contain only confirmed content', async ({ page }) => {
    await page.goto('/prototipo');
    await expect(page.locator('[data-proof-product]')).toHaveCount(3);
    await expect(page.getByRole('link', { name: 'Comprar em volume' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Quero ser revendedor' })).toBeVisible();
    const body = await page.locator('body').innerText();
    expect(body).not.toContain('[CONFIRMAR]');
    expect(body).not.toContain('[em breve]');
    await expect(page.locator('#prova')).not.toContainText('100+');
    expect(body).not.toMatch(/R\$|preço|price/i);
  });

  test('analysis mode starts on and can become a clean landing', async ({ page }) => {
    await page.goto('/prototipo');
    await expect(page.locator('html')).toHaveAttribute('data-analysis-mode', 'on');
    await expect(page.locator('[data-analysis-marker]')).toHaveCount(7);
    await expect(page.locator('[data-analysis-panel]')).toBeVisible();

    const toggle = page.locator('[data-analysis-toggle]');
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-analysis-mode', 'off');
    await expect(page.locator('[data-analysis-panel]')).toBeHidden();
    await expect(page.locator('[data-analysis-marker]')).toBeHidden();

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-analysis-mode', 'off');
  });

  test('seven analysis records explain problem, change, and benefit in both views', async ({ page }) => {
    await page.goto('/prototipo');
    await page.evaluate(() => sessionStorage.removeItem('bufalo-prototype-analysis-mode'));
    await page.reload();
    await expect(page.locator('[data-analysis-note]')).toHaveCount(14);
    await expect(page.locator('[data-analysis-note] [data-note-problem]')).toHaveCount(14);
    await expect(page.locator('[data-analysis-note] [data-note-change]')).toHaveCount(14);
    await expect(page.locator('[data-analysis-note] [data-note-benefit]')).toHaveCount(14);
  });

  test('selecting a desktop note highlights its marker and section', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/prototipo');
    await page.locator('[data-analysis-panel] [data-analysis-note-button="3"]').click();
    await expect(page.locator('[data-analysis-marker="3"]')).toHaveAttribute('data-selected', 'true');
    await expect(page.locator('[data-analysis-section="categorias"]')).toHaveAttribute('data-selected', 'true');
    await expect(page.locator('[data-analysis-panel] [data-analysis-note-button="3"]')).toHaveAttribute('aria-pressed', 'true');
  });
});

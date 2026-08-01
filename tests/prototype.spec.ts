import { test, expect } from 'playwright/test';

function boxesOverlap(
  first: { x: number; y: number; width: number; height: number },
  second: { x: number; y: number; width: number; height: number },
) {
  const horizontal = Math.min(first.x + first.width, second.x + second.width) - Math.max(first.x, second.x);
  const vertical = Math.min(first.y + first.height, second.y + second.height) - Math.max(first.y, second.y);
  return horizontal > 0 && vertical > 0;
}

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

  test('desktop prototype controls do not obscure primary navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/prototipo');
    await page.locator('[data-analysis-toggle]').click();

    const toolbarBox = await page.locator('.analysis-toolbar').boundingBox();
    expect(toolbarBox).not.toBeNull();

    for (const link of await page.locator('#prototype-nav a').all()) {
      const linkBox = await link.boundingBox();
      expect(linkBox).not.toBeNull();
      expect(boxesOverlap(linkBox!, toolbarBox!)).toBe(false);
    }
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

  test('reenabling desktop analysis repositions markers after the layout reflows', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/prototipo');
    const toggle = page.locator('[data-analysis-toggle]');

    await toggle.click();
    await page.setViewportSize({ width: 1200, height: 900 });
    await toggle.click();
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));

    const markerBox = await page.locator('[data-analysis-marker="7"]').boundingBox();
    const sectionBox = await page.locator('[data-analysis-section="rodape"]').boundingBox();
    expect(markerBox).not.toBeNull();
    expect(sectionBox).not.toBeNull();
    const expectedMarkerY = sectionBox!.y + Math.min(64, sectionBox!.height / 2);
    expect(Math.abs(markerBox!.y - expectedMarkerY)).toBeLessThan(2);
  });

  test('crossing into desktop closes the mobile drawer without focusing its hidden trigger', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/prototipo');
    const drawer = page.locator('[data-analysis-drawer]');

    await page.locator('[data-analysis-drawer-open]').click();
    await expect(drawer).toBeVisible();
    await expect(page.locator('[data-analysis-drawer-close]')).toBeFocused();

    await page.setViewportSize({ width: 1024, height: 800 });
    await expect(drawer).toBeHidden();
    await expect(page.locator('[data-analysis-toggle]')).toBeFocused();
  });

  test('mobile menu and analysis drawer support Escape and focus restoration', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/prototipo');

    const menu = page.locator('#prototype-menu-toggle');
    await expect(menu).toHaveCSS('min-width', '44px');
    await expect(menu).toHaveCSS('min-height', '44px');
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeFocused();

    const drawerOpen = page.locator('[data-analysis-drawer-open]');
    await drawerOpen.click();
    await expect(page.locator('[data-analysis-drawer]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-analysis-drawer]')).toBeHidden();
    await expect(drawerOpen).toBeFocused();
  });

  test('mobile menu annotations clear the trigger and yield to the open navigation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/prototipo');

    const menuBox = await page.locator('#prototype-menu-toggle').boundingBox();
    const menuMarkerBox = await page.locator('[data-analysis-target="menu"]').boundingBox();
    expect(menuBox).not.toBeNull();
    expect(menuMarkerBox).not.toBeNull();
    expect(boxesOverlap(menuBox!, menuMarkerBox!)).toBe(false);

    await page.locator('#prototype-menu-toggle').click();
    const heroMarkerIsTopmost = await page.locator('[data-analysis-target="hero"]').evaluate((marker) => {
      const box = marker.getBoundingClientRect();
      return document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2) === marker;
    });
    expect(heroMarkerIsTopmost).toBe(false);
  });

  test('mobile analysis trigger does not overlap the WhatsApp action', async ({ page }) => {
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/prototipo');

      const drawerBox = await page.locator('[data-analysis-drawer-open]').boundingBox();
      const whatsAppBox = await page.getByRole('link', { name: 'Fale conosco no WhatsApp' }).boundingBox();
      expect(drawerBox).not.toBeNull();
      expect(whatsAppBox).not.toBeNull();

      const horizontalOverlap = Math.min(drawerBox!.x + drawerBox!.width, whatsAppBox!.x + whatsAppBox!.width)
        - Math.max(drawerBox!.x, whatsAppBox!.x);
      const verticalOverlap = Math.min(drawerBox!.y + drawerBox!.height, whatsAppBox!.y + whatsAppBox!.height)
        - Math.max(drawerBox!.y, whatsAppBox!.y);
      expect(horizontalOverlap <= 0 || verticalOverlap <= 0).toBe(true);
    }
  });

  test('mobile analysis drawer covers the WhatsApp float', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/prototipo');
    await page.locator('[data-analysis-drawer-open]').click();

    const whatsAppIsTopmost = await page.locator('.wa-float').evaluate((whatsApp) => {
      const box = whatsApp.getBoundingClientRect();
      return Boolean(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)?.closest('.wa-float'));
    });
    expect(whatsAppIsTopmost).toBe(false);
  });

  test('programmatic drawer opening restores focus to its real trigger', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/prototipo');

    const drawerOpen = page.locator('[data-analysis-drawer-open]');
    await drawerOpen.evaluate((button: HTMLButtonElement) => button.click());
    await expect(page.locator('[data-analysis-drawer-close]')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(drawerOpen).toBeFocused();
  });

  test('reduced motion removes the prototype WhatsApp hover transform', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/prototipo');

    const whatsApp = page.getByRole('link', { name: 'Fale conosco no WhatsApp' });
    await whatsApp.hover();
    await expect(whatsApp).toHaveCSS('transform', 'none');
  });

  for (const viewport of [
    { width: 320, height: 700 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    test(`no horizontal overflow at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/prototipo');
      const metrics = await page.locator('.prototype-page').evaluate((element) => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      }));
      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
    });
  }

  test('heading outline does not skip levels', async ({ page }) => {
    await page.goto('/prototipo');
    const levels = await page.locator('main h1, main h2, main h3').evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
  });
});

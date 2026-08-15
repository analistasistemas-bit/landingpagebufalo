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

    // 2b. Visible WhatsApp number in the footer matches the number used in wa.me links
    // (guards against the footer/JSON-LD text drifting from config.json — see waDisplay()).
    const footerText = await page.locator('footer').innerText();
    expect(footerText).toContain('+55 81 98342-6557');

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

test('home keeps the 500-color proof consistent in the hero ring', async ({ page }) => {
  await page.goto('/');

  const ring = page.locator('.color-ring');
  await expect(ring).toHaveAttribute('aria-label', /500 CORES/i);
  await expect(ring.locator('.color-ring__label')).toHaveText('500');
  await expect(ring.getByText('100+', { exact: true })).toHaveCount(0);
});

test('home prioritizes eight categories and keeps the full catalog accessible', async ({ page }) => {
  await page.goto('/');

  const categories = page.locator('[data-priority-category]');
  await expect(categories).toHaveCount(8);
  const hrefs = await categories.evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(hrefs).toEqual([
    '/produtos/linhas-de-costura',
    '/produtos/fios-overloque',
    '/produtos/ziperes',
    '/produtos/elasticos',
    '/produtos/passamanarias',
    '/produtos/botoes-de-pressao',
    '/produtos/tesouras',
    '/produtos/fita-metrica',
  ]);
  await expect(page.getByRole('link', { name: 'Ver catálogo completo' })).toHaveAttribute('href', '/produtos');
});

test('priority catalog stays usable from mobile to desktop', async ({ page }) => {
  for (const viewport of [
    { width: 320, height: 700 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const catalogLink = page.getByRole('link', { name: 'Ver catálogo completo' });
    const linkBox = await catalogLink.boundingBox();
    expect(linkBox).not.toBeNull();
    expect(linkBox!.width).toBeGreaterThanOrEqual(44);
    expect(linkBox!.height).toBeGreaterThanOrEqual(44);

    const pageWidth = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(pageWidth.scroll).toBeLessThanOrEqual(pageWidth.client);
  }
});

test('500-color proof uses bounded 3D motion with a reduced-motion fallback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const ring = page.locator('.color-ring');
  const track = ring.locator('[data-color-ring-track]');
  const dot = ring.locator('.color-ring__dot').first();
  const medallion = ring.locator('.color-ring__medallion');

  await expect(track).toHaveCSS('transform-style', 'preserve-3d');
  await expect(track).toHaveCSS('animation-name', 'ring-arrive');
  await expect(track).toHaveCSS('animation-iteration-count', '1');
  expect(await dot.evaluate((element) => getComputedStyle(element).backgroundImage)).toContain('radial-gradient');
  expect(await medallion.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe('none');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(track).toHaveCSS('animation-name', 'none');
  await expect(dot).toHaveCSS('animation-name', 'none');
  await expect(medallion).toHaveCSS('animation-name', 'none');
});

test('500-color palette keeps moving visibly while the hero is on screen', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const orbit = page.locator('.color-ring__orbit');
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: no-preference)').matches)).toBe(true);
  await expect(page.locator('[data-color-ring-track]')).toHaveCSS('animation-name', 'ring-arrive');
  await expect(orbit).toBeVisible();
  await expect(orbit).toHaveCSS('animation-name', 'palette-orbit');
  await page.waitForTimeout(1100);
  const transformBefore = await orbit.evaluate((element) => getComputedStyle(element).transform);
  await page.waitForTimeout(250);
  const transformAfter = await orbit.evaluate((element) => getComputedStyle(element).transform);

  expect(transformAfter).not.toBe(transformBefore);
});

test('500-color palette pauses its continuous motion offscreen', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const ring = page.locator('[data-color-ring]');
  const orbit = page.locator('.color-ring__orbit');
  await expect(ring).toHaveAttribute('data-orbit-active', 'true');
  await expect(orbit).toHaveCSS('animation-play-state', 'running');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(ring).toHaveAttribute('data-orbit-active', 'false');
  await expect(orbit).toHaveCSS('animation-play-state', 'paused');
});

test('500-color medallion visibly protrudes from the palette plane', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const medallion = page.locator('.color-ring__medallion');
  const depth = await medallion.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m43);
  const edgeTransform = await medallion.evaluate((element) => getComputedStyle(element, '::before').transform);

  expect(depth).toBeGreaterThanOrEqual(40);
  expect(edgeTransform).not.toBe('none');
});

test('500-color proof remains inside the mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');

  const ringBox = await page.locator('.color-ring').boundingBox();
  expect(ringBox).not.toBeNull();
  expect(ringBox!.x).toBeGreaterThanOrEqual(0);
  expect(ringBox!.x + ringBox!.width).toBeLessThanOrEqual(320);
});

test('footer publishes only confirmed contact channels', async ({ page }) => {
  await page.goto('/');

  const footer = page.locator('footer');
  await expect(footer).not.toContainText('[CONFIRMAR]');
  await expect(footer).not.toContainText('[em breve]');

  const instagram = footer.getByRole('link', { name: 'Instagram da Búfalo — @marcabufalo' });
  await expect(instagram).toHaveAttribute('href', 'https://www.instagram.com/marcabufalo/');
  await expect(instagram).toHaveAttribute('target', '_blank');
  await expect(instagram).toHaveAttribute('rel', /noopener/);

  const target = await instagram.boundingBox();
  expect(target).not.toBeNull();
  expect(target!.width).toBeGreaterThanOrEqual(44);
  expect(target!.height).toBeGreaterThanOrEqual(44);
});

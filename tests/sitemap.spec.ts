import { readFile } from 'node:fs/promises';
import { test, expect } from 'playwright/test';

test('generated sitemap excludes only the prototype route from representative public routes', async () => {
  const sitemap = await readFile('dist/sitemap-0.xml', 'utf8');
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

  expect(urls).not.toContain('https://landingpagebufalo.vercel.app/prototipo/');
  expect(urls).toContain('https://landingpagebufalo.vercel.app/');
  expect(urls).toContain('https://landingpagebufalo.vercel.app/produtos/');
  expect(urls).toContain('https://landingpagebufalo.vercel.app/qualidade/');
  expect(urls).toContain('https://landingpagebufalo.vercel.app/revendedor/');
});

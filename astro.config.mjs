import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = 'https://landingpagebufalo.vercel.app';
const prototypeUrl = new URL('/prototipo/', site).href;

export default defineConfig({
  site,
  integrations: [sitemap({ filter: (page) => page !== prototypeUrl })],
  devToolbar: { enabled: false }, // sem a barra de dev (evita confusão no preview local)
});

import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://landingpagebufalo.vercel.app',
  integrations: [sitemap()],
  devToolbar: { enabled: false }, // sem a barra de dev (evita confusão no preview local)
});

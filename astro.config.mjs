import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://bufalo.example.com', // [CONFIRMAR] domínio
  integrations: [sitemap()],
});

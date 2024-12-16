// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),

  image: {
    remotePatterns: [{ protocol: "https" }],
  },

  site: 'https://bench.builders',
  integrations: [sitemap()],

  redirects: {
    '/support': '/join'
  }
});
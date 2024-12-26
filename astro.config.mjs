// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

import sitemap from '@astrojs/sitemap';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  trailingSlash: 'never',

  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),

  image: {
    remotePatterns: [{ protocol: "https" }],
  },

  site: 'https://bench.builders',
  integrations: [sitemap(), mdx()],

  redirects: {
    '/support': '/join',
    '/guide': '/guides',
  },
});
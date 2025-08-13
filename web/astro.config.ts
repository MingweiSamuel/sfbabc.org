// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { getSites } from './src/data';
import remarkSectionize from 'remark-sectionize';
import remarkDetailize from './detailize.mjs';
import remarkLiftCaptions from './lift-captions.mjs';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  trailingSlash: 'ignore',

  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),

  image: {
    remotePatterns: [{ protocol: "https" }],
  },

  site: 'https://sfbabc.org',
  integrations: [sitemap(), mdx({
    remarkPlugins: [remarkSectionize, remarkDetailize, remarkLiftCaptions],
  })],

  redirects: {
    '/support': '/join',
    '/map_embed': '/map',
    '/guide': '/guides',
    ...Object.fromEntries((await getSites()).flatMap(({ id, muni, act, ggt, vta }) => {
      return [
        muni, act, ggt, vta
      ].filter(stopId => stopId).map(stopId => ['/' + stopId, '/' + id])
    })),
    '/guides/template2025': '/guides/template',
  },
});
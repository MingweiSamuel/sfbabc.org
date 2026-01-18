import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders'; // Not available with legacy API

const docs = defineCollection({
  loader: glob({ pattern: "*.mdx", base: "./src/docs" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    toc: z.boolean().optional(),
  }),
});

export const collections = { docs };

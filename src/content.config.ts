import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro:schema";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    author: z.string(),
    displayDate: z.coerce.date(),
    pubDate: z.coerce.date(),
    tags: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };

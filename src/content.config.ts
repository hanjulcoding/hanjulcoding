import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro:schema";

export const collections = {
  news: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/news" }),
    schema: z.object({
      title: z.string(),
      category: z.string(),
      author: z.string(),
      displayDate: z.coerce.date(),
      pubDate: z.coerce.date(),
      tags: z.string(),
      draft: z.boolean().default(false),
    }),
  }),
};

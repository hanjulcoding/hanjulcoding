import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import mdx from '@astrojs/mdx';
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  site: "https://hanjulcoding.com",
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    mdx(),
  ],
  vite: {
    plugins: [basicSsl()],
    server: {
      https: true,
    },
  },
});

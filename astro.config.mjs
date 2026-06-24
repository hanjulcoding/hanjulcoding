import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from '@astrojs/mdx';
import basicSsl from "@vitejs/plugin-basic-ssl";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://hanjulcoding.com",
  integrations: [
    react(),
    mdx(),
  ],
  vite: {
    plugins: [basicSsl(), tailwindcss()],
    server: {
      https: true,
    },
  },
});

import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
// import { loadEnv } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  site: "https://hanjulcoding.com",
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  vite: {
    plugins: [basicSsl()],
    server: {
      https: true,
    },
    define: {
      'process.env.CONTENTFUL_SPACE_ID': JSON.stringify(process.env.CONTENTFUL_SPACE_ID),
      'process.env.CONTENTFUL_DELIVERY_TOKEN': JSON.stringify(process.env.CONTENTFUL_DELIVERY_TOKEN),
      'process.env.CONTENTFUL_PREVIEW_TOKEN': JSON.stringify(process.env.CONTENTFUL_PREVIEW_TOKEN),
      'process.env.DEV': JSON.stringify(process.env.NODE_ENV === 'development'),
    },
  },
});

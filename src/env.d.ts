/// <reference types="astro/client" />

interface ImportMetaEnv {
  // readonly DOT_ENV_VARIABLE: string;
  readonly CONTENTFUL_SPACE_ID: string;
  readonly CONTENTFUL_DELIVERY_TOKEN: string;
  readonly CONTENTFUL_PREVIEW_TOKEN: string;
}

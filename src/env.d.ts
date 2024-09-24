/// <reference types="astro/client" />

interface ImportMetaEnv {
  // readonly DOT_ENV_VARIABLE: string;
  readonly PUBLIC_CONTENTFUL_SPACE_ID: string;
  readonly PUBLIC_CONTENTFUL_DELIVERY_TOKEN: string;
  readonly PUBLIC_BUILDER_API_PUBLIC_KEY: string;
}

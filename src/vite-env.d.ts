/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISCORD_INVITE_URL: string;
  readonly VITE_FORMSPREE_ENDPOINT: string;
  readonly VITE_STRYGONIA_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

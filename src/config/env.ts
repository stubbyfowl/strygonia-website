function env(name: keyof ImportMetaEnv, fallback: string): string {
  return import.meta.env[name] || fallback;
}

export const DISCORD_INVITE_URL = env("VITE_DISCORD_INVITE_URL", "https://discord.gg/strygonia");
export const FORMSPREE_ENDPOINT = env("VITE_FORMSPREE_ENDPOINT", "https://formspree.io/f/placeholder");
export const STRYGONIA_EMAIL = env("VITE_STRYGONIA_EMAIL", "contact@strygonia.com");

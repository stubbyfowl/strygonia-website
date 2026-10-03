import { DISCORD_INVITE_URL } from "@/config/env";

export { DISCORD_INVITE_URL };

// YouTube (@Strygonia 404s) and Discord (invite pointed at someone else's server)
// are off until real links exist. Re-add { id: "youtube" | "discord", label, href } here.
export const SOCIAL_LINKS = [
  {
    id: "instagram",
    label: "Instagram @Strygonia",
    href: "https://www.instagram.com/Strygonia/",
  },
] as const;

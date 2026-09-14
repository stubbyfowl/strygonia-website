import { DISCORD_INVITE_URL } from "@/config/env";

export { DISCORD_INVITE_URL };

export const SOCIAL_LINKS = [
  {
    id: "youtube",
    label: "YouTube @Strygonia",
    href: "https://www.youtube.com/@Strygonia",
  },
  {
    id: "instagram",
    label: "Instagram @Strygonia",
    href: "https://www.instagram.com/Strygonia/",
  },
  {
    id: "discord",
    label: "Join Strygonia Discord",
    href: DISCORD_INVITE_URL,
  },
] as const;

import { STRYGONIA_EMAIL } from "@/config/env";

export const ACCESSIBILITY_LAST_UPDATED = "June 26, 2026";

export const ACCESSIBILITY_SECTIONS = [
  {
    title: "Our commitment",
    body: "Strygonia is committed to making strygonia.com usable for as many people as possible. We design with readability, keyboard access, and reduced visual strain in mind across our marketing pages, product descriptions, and forms.",
  },
  {
    title: "Accessibility mode",
    body: "This site includes a built-in accessibility mode that increases text contrast, removes decorative background imagery, disables non-essential motion, and simplifies visual effects so content is easier to read. Use the toggle below to turn accessibility mode on or off at any time.",
  },
  {
    title: "Standards & testing",
    body: "We aim to conform with WCAG 2.1 Level AA where practical for a prototype marketing site. We regularly review color contrast, focus states, form labels, semantic headings, and keyboard navigation as pages evolve.",
  },
  {
    title: "Known limitations",
    body: "Some product renders, background photography, and scroll-driven animations may be reduced or removed in accessibility mode. Third-party embeds, if added in the future, may not fully match site accessibility settings.",
  },
  {
    title: "Feedback",
    body: `If you encounter a barrier on this site or need content in another format, email ${STRYGONIA_EMAIL} with the page URL and a short description of the issue. We will do our best to respond promptly.`,
  },
] as const;

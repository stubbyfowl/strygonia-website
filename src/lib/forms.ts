import { STRYGONIA_EMAIL } from "@/config/env";

/* Posts to /api/forms, which saves the submission in the site's Stripe account. */
export async function submitForm(form: "waitlist" | "contact" | "careers", fields: Record<string, string>) {
  const res = await fetch("/api/forms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ form, ...fields }),
  }).catch(() => null);
  const data = res ? await res.json().catch(() => null) : null;
  if (!res?.ok) throw new Error(data?.error ?? `Something went wrong. Please try again, or email ${STRYGONIA_EMAIL}.`);
  return data as { ok: true; already?: boolean };
}

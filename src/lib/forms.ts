import { STRYGONIA_EMAIL } from "@/config/env";

const FORMSPREE_URL = "https://formspree.io/f/xnpjwkvd";

type FormKind = "waitlist" | "contact" | "careers";

/* One Formspree form takes all three; the email subject says which one it was. */
const SUBJECTS: Record<FormKind, (fields: Record<string, string>) => string> = {
  waitlist: (f) => `BlackBox waitlist: ${f.email}`,
  contact: (f) => `Contact: ${f.name}${f.subject ? `, ${f.subject}` : ""}`,
  careers: (f) => `Job application: ${f.name}${f.role ? `, ${f.role}` : ""}`,
};

export async function submitForm(form: FormKind, fields: Record<string, string>) {
  const res = await fetch(FORMSPREE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ form, _subject: SUBJECTS[form](fields), ...fields }),
  }).catch(() => null);
  if (res?.ok) return;
  const data = res ? await res.json().catch(() => null) : null;
  const detail = (data?.errors as { message?: string }[] | undefined)?.map((e) => e.message).filter(Boolean).join(" ");
  throw new Error(detail || `Something went wrong. Please try again, or email ${STRYGONIA_EMAIL}.`);
}

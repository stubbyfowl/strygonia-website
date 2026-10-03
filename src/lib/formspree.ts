import { STRYGONIA_EMAIL, FORMSPREE_ENDPOINT } from "@/config/env";

/* "drafted" = no Formspree form is configured yet, so the message was handed to the
   visitor's mail app instead of being posted (and lost) to the placeholder endpoint. */
export async function submitToFormspree(
  formData: FormData,
  _kind: "contact" | "preorder" | "careers" = "contact"
): Promise<"sent" | "drafted"> {
  if (FORMSPREE_ENDPOINT.includes("/f/placeholder")) {
    const subject = String(formData.get("_subject") ?? "Strygonia inquiry");
    const body = [...formData]
      .filter(([key]) => !key.startsWith("_"))
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    window.location.href = `mailto:${STRYGONIA_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return "drafted";
  }

  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: "POST",
    body: formData,
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(
      (data as { error?: string } | null)?.error ??
        `Something went wrong. Please try again or email ${STRYGONIA_EMAIL} directly.`
    );
  }
  return "sent";
}

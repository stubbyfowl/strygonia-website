import { STRYGONIA_EMAIL, FORMSPREE_ENDPOINT } from "@/config/env";

export async function submitToFormspree(
  formData: FormData,
  _kind: "contact" | "preorder" | "careers" = "contact"
) {
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
}

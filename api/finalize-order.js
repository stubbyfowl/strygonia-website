import { stripe, assignEditions, FOUNDERS_CAP } from "./_founders.js";

// Called by the checkout return page right after Stripe redirects back. Labels the order
// (Founder's Edition N of 10, or standard) and tells the buyer which one they got.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const id = String(req.body?.paymentIntent ?? "");
  if (!/^pi_[A-Za-z0-9]+$/.test(id)) return res.status(400).json({ error: "Missing order reference." });

  try {
    const pi = await stripe.paymentIntents.retrieve(id);
    if (pi.metadata?.product !== "blackbox") return res.status(404).json({ error: "Order not found." });
    if (pi.status !== "succeeded") return res.status(200).json({ status: pi.status });
    const { labels } = await assignEditions(stripe, pi);
    const label = labels.get(pi.id) ?? { edition: pi.metadata.edition, number: Number(pi.metadata.founders_number) || null };
    return res.status(200).json({ status: pi.status, edition: label.edition, number: label.number, cap: FOUNDERS_CAP });
  } catch (err) {
    console.error("finalize-order:", err.message);
    return res.status(404).json({ error: "Order not found." });
  }
}

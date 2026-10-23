import { stripe, assignEditions, blackboxUnits, FOUNDERS_CAP } from "./_founders.js";

// Called by the checkout return page right after Stripe redirects back. Labels the order
// (Founder's Edition numbers for its BlackBox units, or standard) and tells the buyer.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const id = String(req.body?.paymentIntent ?? "");
  if (!/^pi_[A-Za-z0-9]+$/.test(id)) return res.status(400).json({ error: "Missing order reference." });

  try {
    const pi = await stripe.paymentIntents.retrieve(id);
    const product = pi.metadata?.product;
    if (product !== "blackbox" && product !== "case") return res.status(404).json({ error: "Order not found." });
    const cases = Number(pi.metadata.case_white_qty ?? 0) + Number(pi.metadata.case_black_qty ?? 0);
    if (pi.status !== "succeeded") return res.status(200).json({ status: pi.status });
    if (product === "case") return res.status(200).json({ status: pi.status, blackbox: 0, numbers: [], cases, cap: FOUNDERS_CAP });

    const { labels } = await assignEditions(stripe, pi);
    const label = labels.get(pi.id) ?? { edition: pi.metadata.edition, numbers: [] };
    return res.status(200).json({ status: pi.status, edition: label.edition, numbers: label.numbers, blackbox: blackboxUnits(pi.metadata), cases, cap: FOUNDERS_CAP });
  } catch (err) {
    console.error("finalize-order:", err.message);
    return res.status(404).json({ error: "Order not found." });
  }
}

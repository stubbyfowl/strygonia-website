import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Sidak's Websites (sidakswebsites.com) is a static site with no server, so its
// checkout borrows this endpoint and the shared Stripe account. Amounts live
// here, not in the browser, so a buyer can't pick their own price.
const PLANS = {
  deposit: { amount: 40000, description: "Sidak's Websites: website build deposit" },
  balance: { amount: 39900, description: "Sidak's Websites: website build launch balance" },
};

const ALLOWED_ORIGINS = new Set([
  "https://sidakswebsites.com",
  "https://www.sidakswebsites.com",
  "http://localhost:5173",
]);

const clean = (value) => String(value ?? "").trim().slice(0, 200);

export default async function handler(req, res) {
  const origin = req.headers.origin;
  const allowed = ALLOWED_ORIGINS.has(origin);
  if (allowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") return res.status(allowed ? 204 : 403).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!allowed) return res.status(403).json({ error: "Origin not allowed" });

  const { plan, name, email, business } = req.body || {};
  const chosen = PLANS[plan];
  if (!chosen) return res.status(400).json({ error: "Unknown payment plan." });
  if (!clean(name) || !clean(email)) {
    return res.status(400).json({ error: "Name and email are required." });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: chosen.amount,
      currency: "usd",
      description: chosen.description,
      receipt_email: clean(email),
      // Card statements read "<account prefix>* SIDAKS WEB" instead of only Strygonia.
      statement_descriptor_suffix: "SIDAKS WEB",
      automatic_payment_methods: { enabled: true },
      metadata: {
        business: "sidakswebsites",
        plan,
        client_name: clean(name),
        client_business: clean(business),
      },
    });
    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

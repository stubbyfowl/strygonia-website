import { stripe, assignEditions, FOUNDERS_CAP } from "./_founders.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { shipping } = req.body || {};
    // Provisional label; the order is finally labelled (Founder's N of 10, or standard) once it's paid.
    const { claimed } = await assignEditions();
    const params = {
      amount: 19900,
      currency: "usd",
      description: claimed < FOUNDERS_CAP ? "BlackBox: Founder's Edition" : "BlackBox",
      metadata: { product: "blackbox" },
      automatic_payment_methods: { enabled: true },
    };

    if (shipping?.name && shipping?.address) {
      params.shipping = {
        name: shipping.name,
        address: {
          line1: shipping.address.line1,
          line2: shipping.address.line2 || undefined,
          city: shipping.address.city,
          state: shipping.address.state || undefined,
          postal_code: shipping.address.postal_code || undefined,
          country: shipping.address.country || "US",
        },
      };
    }

    const paymentIntent = await stripe.paymentIntents.create(params);
    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

import { stripe, describeOrder } from "./_founders.js";
import { quoteShipping } from "./_shipping.js";

// The real prices, in cents. The browser only sends which items and how many; it never sets the amount.
const PRICES = { blackbox: 19900, "case-white": 2500, "case-black": 2500 };
const MAX_QTY = 10;

/* Subtotal plus USPS postage from Phoenix to the address (see _shipping.js), or null if we don't ship there. */
export function priceCart(qty, address) {
  const subtotal = Object.entries(qty).reduce((sum, [sku, n]) => sum + PRICES[sku] * n, 0);
  const quote = quoteShipping(qty, address);
  return quote && { subtotal, shipping: quote.cents, service: quote.service, amount: subtotal + quote.cents };
}

/* Cart from the browser -> { sku: qty }, or null if anything about it is off. */
export function parseItems(items) {
  if (items === undefined) return { blackbox: 1 }; // a page loaded before the cart existed
  if (!Array.isArray(items) || items.length === 0 || items.length > Object.keys(PRICES).length) return null;
  const qty = {};
  for (const item of items) {
    const n = Number(item?.qty);
    if (!Object.hasOwn(PRICES, item?.sku) || qty[item.sku] || !Number.isInteger(n) || n < 1 || n > MAX_QTY) return null;
    qty[item.sku] = n;
  }
  return qty;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const qty = parseItems(req.body?.items);
  if (!qty) return res.status(400).json({ error: "Your cart couldn't be read. Refresh the page and try again." });

  const { shipping } = req.body || {};
  if (!shipping?.name || !shipping?.address) return res.status(400).json({ error: "Enter your shipping address first." });
  const priced = priceCart(qty, shipping.address);
  if (!priced) return res.status(400).json({ error: "We can't ship to that address. Check the country and ZIP or postal code, or email contact@strygonia.com." });

  try {
    const { amount, shipping: shippingCents, service } = priced;
    // product=blackbox marks orders that include a BlackBox (the Founder's count only searches those);
    // case-only orders are product=case. The order is labelled with Founder's numbers once it's paid.
    const metadata = {
      product: qty.blackbox ? "blackbox" : "case",
      blackbox_qty: String(qty.blackbox ?? 0),
      case_white_qty: String(qty["case-white"] ?? 0),
      case_black_qty: String(qty["case-black"] ?? 0),
      shipping_cents: String(shippingCents),
      shipping_service: service,
    };
    const params = {
      amount,
      currency: "usd",
      description: describeOrder(metadata),
      metadata,
      automatic_payment_methods: { enabled: true },
      shipping: {
        name: shipping.name,
        address: {
          line1: shipping.address.line1,
          line2: shipping.address.line2 || undefined,
          city: shipping.address.city,
          state: shipping.address.state || undefined,
          postal_code: shipping.address.postal_code || undefined,
          country: shipping.address.country,
        },
      },
    };

    const paymentIntent = await stripe.paymentIntents.create(params);
    return res.status(200).json({ clientSecret: paymentIntent.client_secret, amount, shipping: shippingCents });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

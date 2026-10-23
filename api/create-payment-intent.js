import { stripe, describeOrder } from "./_founders.js";

// The real prices, in cents. The browser only sends which items and how many; it never sets the amount.
const PRICES = { blackbox: 19900, "case-white": 2500, "case-black": 2500 };
const MAX_QTY = 10;
const CASE_ONLY_SHIPPING = 500; // shipping is included with a BlackBox; case-only orders pay $5

export function priceCart(qty) {
  const subtotal = Object.entries(qty).reduce((sum, [sku, n]) => sum + PRICES[sku] * n, 0);
  const shipping = qty.blackbox ? 0 : CASE_ONLY_SHIPPING;
  return { subtotal, shipping, amount: subtotal + shipping };
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

  try {
    const { shipping } = req.body || {};
    const { amount, shipping: shippingCents } = priceCart(qty);
    // product=blackbox marks orders that include a BlackBox (the Founder's count only searches those);
    // case-only orders are product=case. The order is labelled with Founder's numbers once it's paid.
    const metadata = {
      product: qty.blackbox ? "blackbox" : "case",
      blackbox_qty: String(qty.blackbox ?? 0),
      case_white_qty: String(qty["case-white"] ?? 0),
      case_black_qty: String(qty["case-black"] ?? 0),
      shipping_cents: String(shippingCents),
    };
    const params = {
      amount,
      currency: "usd",
      description: describeOrder(metadata),
      metadata,
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
    return res.status(200).json({ clientSecret: paymentIntent.client_secret, amount });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

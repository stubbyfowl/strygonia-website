import Stripe from "stripe";

// Files starting with "_" in api/ aren't deployed as endpoints; this is shared code.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const FOUNDERS_CAP = 10;

const CASES = [
  ["case_white_qty", "BlackBox Case (Arctic White)"],
  ["case_black_qty", "BlackBox Case (Stealth Black)"],
];
const times = (n, label) => (n > 1 ? `${n} × ${label}` : label);
export const blackboxUnits = (metadata) => Number(metadata.blackbox_qty ?? (metadata.product === "blackbox" ? 1 : 0)) || 0;

/* Stripe description for an order, e.g. "BlackBox: Founder's Edition (#3, #4 of 10) + BlackBox Case (Stealth Black)". */
export function describeOrder(metadata, numbers = []) {
  const units = blackboxUnits(metadata);
  const parts = [];
  if (numbers.length) parts.push(`BlackBox: Founder's Edition (${numbers.map((n) => `#${n}`).join(", ")} of ${FOUNDERS_CAP})`);
  if (units > numbers.length) parts.push(times(units - numbers.length, "BlackBox"));
  for (const [key, label] of CASES) {
    const n = Number(metadata[key] ?? 0);
    if (n > 0) parts.push(times(n, label));
  }
  return parts.join(" + ");
}

const numbersOf = (pi) => (pi.metadata.founders_numbers ? pi.metadata.founders_numbers.split(",").map(Number) : []);

/* The first 10 BlackBox *units* paid for are the Founder's Edition; every later unit is a
   standard BlackBox (same $199). Cases never count: case-only orders are tagged
   product=case and aren't searched, and in mixed orders only blackbox_qty is counted.
   Orders are labelled when paid, not at checkout start, oldest first, so a rush of
   checkouts can't overfill it. An order that straddles unit 10 is "mixed".
   `justPaid` is a PaymentIntent fetched directly, since search can lag ~1 min. */
export async function assignEditions(client = stripe, justPaid = null) {
  const paid = [];
  for await (const pi of client.paymentIntents.search({ query: "status:'succeeded' AND metadata['product']:'blackbox'", limit: 100 })) {
    paid.push(pi);
  }
  if (justPaid?.status === "succeeded" && justPaid.metadata?.product === "blackbox" && !paid.some((p) => p.id === justPaid.id)) {
    paid.push(justPaid);
  }

  const labels = new Map();
  let claimed = 0;
  for (const p of paid) {
    if (!p.metadata.edition) continue;
    claimed += numbersOf(p).length;
    labels.set(p.id, { edition: p.metadata.edition, numbers: numbersOf(p) });
  }

  for (const pi of paid.filter((p) => !p.metadata.edition).sort((a, b) => a.created - b.created)) {
    const units = blackboxUnits(pi.metadata);
    const take = Math.max(0, Math.min(units, FOUNDERS_CAP - claimed));
    const numbers = Array.from({ length: take }, (_, i) => claimed + i + 1);
    claimed += take;
    const edition = take === units ? "founders" : take === 0 ? "standard" : "mixed";
    await client.paymentIntents.update(pi.id, {
      description: describeOrder(pi.metadata, numbers),
      metadata: { edition, founders_numbers: numbers.join(",") },
    });
    labels.set(pi.id, { edition, numbers });
  }
  return { claimed: Math.min(claimed, FOUNDERS_CAP), labels };
}

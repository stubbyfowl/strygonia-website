import Stripe from "stripe";

// Files starting with "_" in api/ aren't deployed as endpoints; this is shared code.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const FOUNDERS_CAP = 10;

export const describe = (edition, number) =>
  edition === "founders" ? `BlackBox: Founder's Edition (${number} of ${FOUNDERS_CAP})` : "BlackBox";

/* The first 10 paid BlackBox orders are the Founder's Edition; every later order is a
   standard BlackBox (same $199). Orders are labelled when they're paid, not when checkout
   starts, so a rush of people checking out at once can't all become Founder's units.
   Labels every paid, unlabelled order oldest first and returns how many Founder's units
   are claimed. `justPaid` is a PaymentIntent fetched directly, since search can lag ~1 min. */
export async function assignEditions(client = stripe, justPaid = null) {
  const paid = [];
  for await (const pi of client.paymentIntents.search({ query: "status:'succeeded' AND metadata['product']:'blackbox'", limit: 100 })) {
    paid.push(pi);
  }
  if (justPaid?.status === "succeeded" && justPaid.metadata?.product === "blackbox" && !paid.some((p) => p.id === justPaid.id)) {
    paid.push(justPaid);
  }

  let founders = paid.filter((p) => p.metadata.edition === "founders").length;
  const labels = new Map();
  for (const p of paid) if (p.metadata.edition) labels.set(p.id, { edition: p.metadata.edition, number: Number(p.metadata.founders_number) || null });

  for (const pi of paid.filter((p) => !p.metadata.edition).sort((a, b) => a.created - b.created)) {
    const edition = founders < FOUNDERS_CAP ? "founders" : "standard";
    const number = edition === "founders" ? ++founders : null;
    await client.paymentIntents.update(pi.id, {
      description: describe(edition, number),
      metadata: { edition, founders_number: number ? String(number) : "" },
    });
    labels.set(pi.id, { edition, number });
  }
  return { claimed: Math.min(founders, FOUNDERS_CAP), labels };
}

// Self-check for the Founder's Edition labelling. Run: node scripts/check-founders.mjs
import assert from "node:assert/strict";

process.env.STRIPE_SECRET_KEY ||= "sk_test_dummy";
const { assignEditions } = await import("../api/_founders.js");

function fakeStripe(pis) {
  return {
    store: pis,
    paymentIntents: {
      search: () => ({
        async *[Symbol.asyncIterator]() {
          for (const p of pis) if (p.status === "succeeded" && p.metadata.product === "blackbox" && !p.notYetSearchable) yield structuredClone(p);
        },
      }),
      async update(id, { description, metadata }) {
        const p = pis.find((x) => x.id === id);
        p.description = description;
        for (const [k, v] of Object.entries(metadata)) v === "" ? delete p.metadata[k] : (p.metadata[k] = v);
        return p;
      },
    },
  };
}
const order = (id, created, extra = {}) => ({ id, created, status: "succeeded", metadata: { product: "blackbox" }, ...extra });

// Launch rush: 12 paid orders arrive out of order -> the 10 oldest are Founder's #1-10, the rest standard.
const rush = fakeStripe([7, 3, 11, 1, 9, 12, 2, 5, 10, 4, 8, 6].map((n) => order(`pi_${n}`, 1000 + n)));
let r = await assignEditions(rush);
assert.equal(r.claimed, 10);
for (let n = 1; n <= 10; n++) {
  const p = rush.store.find((x) => x.id === `pi_${n}`);
  assert.equal(p.metadata.edition, "founders");
  assert.equal(p.metadata.founders_number, String(n));
  assert.equal(p.description, `BlackBox: Founder's Edition (${n} of 10)`);
}
for (const id of ["pi_11", "pi_12"]) {
  const p = rush.store.find((x) => x.id === id);
  assert.equal(p.metadata.edition, "standard");
  assert.equal(p.metadata.founders_number, undefined);
  assert.equal(p.description, "BlackBox");
}

// Running again changes nothing.
const snapshot = JSON.stringify(rush.store);
r = await assignEditions(rush);
assert.equal(r.claimed, 10);
assert.equal(JSON.stringify(rush.store), snapshot);

// Numbering continues after existing Founder's orders; unpaid and non-BlackBox payments are ignored;
// a just-paid order that search hasn't caught up with yet still gets labelled.
const later = fakeStripe([
  order("pi_a", 1, { metadata: { product: "blackbox", edition: "founders", founders_number: "1" } }),
  order("pi_b", 2, { metadata: { product: "blackbox", edition: "founders", founders_number: "2" } }),
  order("pi_unpaid", 3, { status: "requires_payment_method" }),
  order("pi_site", 4, { metadata: { business: "sidakswebsites" } }),
  order("pi_new", 5),
  order("pi_lag", 6, { notYetSearchable: true }),
]);
const justPaid = structuredClone(later.store.find((x) => x.id === "pi_lag"));
r = await assignEditions(later, justPaid);
assert.equal(r.claimed, 4);
assert.equal(r.labels.get("pi_new").number, 3);
assert.equal(r.labels.get("pi_lag").number, 4);
assert.equal(later.store.find((x) => x.id === "pi_unpaid").metadata.edition, undefined);
assert.equal(later.store.find((x) => x.id === "pi_site").metadata.edition, undefined);

console.log("founders labelling: all checks passed");

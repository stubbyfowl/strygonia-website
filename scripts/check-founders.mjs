// Self-check for Founder's Edition labelling and cart parsing. Run: node scripts/check-founders.mjs
import assert from "node:assert/strict";

process.env.STRIPE_SECRET_KEY ||= "sk_test_dummy";
const { assignEditions, describeOrder } = await import("../api/_founders.js");
const { parseItems, priceCart } = await import("../api/create-payment-intent.js");

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
const order = (id, created, meta = {}, extra = {}) => ({
  id, created, status: "succeeded",
  metadata: { product: "blackbox", blackbox_qty: "1", case_white_qty: "0", case_black_qty: "0", ...meta },
  ...extra,
});
const get = (s, id) => s.store.find((x) => x.id === id);

// Launch rush: 12 single-unit orders paid out of order -> the 10 oldest are #1-10, the rest standard.
const rush = fakeStripe([7, 3, 11, 1, 9, 12, 2, 5, 10, 4, 8, 6].map((n) => order(`pi_${n}`, 1000 + n)));
let r = await assignEditions(rush);
assert.equal(r.claimed, 10);
for (let n = 1; n <= 10; n++) {
  assert.equal(get(rush, `pi_${n}`).metadata.edition, "founders");
  assert.equal(get(rush, `pi_${n}`).metadata.founders_numbers, String(n));
  assert.equal(get(rush, `pi_${n}`).description, `BlackBox: Founder's Edition (#${n} of 10)`);
}
for (const id of ["pi_11", "pi_12"]) {
  assert.equal(get(rush, id).metadata.edition, "standard");
  assert.equal(get(rush, id).description, "BlackBox");
}

// Running again changes nothing.
const snapshot = JSON.stringify(rush.store);
r = await assignEditions(rush);
assert.equal(r.claimed, 10);
assert.equal(JSON.stringify(rush.store), snapshot);

// Units, not orders: a 3-unit order takes three numbers; one straddling unit 10 is "mixed";
// cases in a mixed order never count, and case-only orders aren't even searched.
const units = fakeStripe([
  order("pi_a", 1, { blackbox_qty: "3", case_black_qty: "2" }),
  order("pi_caseonly", 2, { product: "case", blackbox_qty: "0", case_white_qty: "4" }),
  order("pi_b", 3, { blackbox_qty: "6" }),
  order("pi_c", 4, { blackbox_qty: "3", case_white_qty: "1" }),
  order("pi_unpaid", 5, { blackbox_qty: "2" }, { status: "requires_payment_method" }),
  order("pi_lag", 6, { blackbox_qty: "1" }, { notYetSearchable: true }),
]);
r = await assignEditions(units, structuredClone(get(units, "pi_lag")));
assert.equal(r.claimed, 10);
assert.deepEqual(r.labels.get("pi_a").numbers, [1, 2, 3]);
assert.equal(get(units, "pi_a").description, "BlackBox: Founder's Edition (#1, #2, #3 of 10) + 2 × BlackBox Case (Stealth Black)");
assert.deepEqual(r.labels.get("pi_b").numbers, [4, 5, 6, 7, 8, 9]);
assert.equal(get(units, "pi_c").metadata.edition, "mixed");
assert.deepEqual(r.labels.get("pi_c").numbers, [10]);
assert.equal(get(units, "pi_c").description, "BlackBox: Founder's Edition (#10 of 10) + 2 × BlackBox + BlackBox Case (Arctic White)");
assert.equal(get(units, "pi_lag").metadata.edition, "standard");
assert.equal(get(units, "pi_caseonly").metadata.edition, undefined);
assert.equal(get(units, "pi_unpaid").metadata.edition, undefined);

// Descriptions for case-only orders.
assert.equal(describeOrder({ product: "case", blackbox_qty: "0", case_white_qty: "1", case_black_qty: "0" }), "BlackBox Case (Arctic White)");

// Cart parsing: the browser can choose items and quantities, never prices.
assert.deepEqual(parseItems([{ sku: "blackbox", qty: 1 }, { sku: "case-black", qty: 2 }]), { blackbox: 1, "case-black": 2 });
assert.deepEqual(parseItems(undefined), { blackbox: 1 });
for (const bad of [[], [{ sku: "blackbox", qty: 0 }], [{ sku: "blackbox", qty: 11 }], [{ sku: "blackbox", qty: 1.5 }], [{ sku: "toaster", qty: 1 }],
  [{ sku: "blackbox", qty: 1 }, { sku: "blackbox", qty: 1 }], [{ sku: "__proto__", qty: 1 }], "blackbox", [{ sku: "case-white", qty: "2", price: 1 }, null]]) {
  assert.equal(parseItems(bad), null, `should reject ${JSON.stringify(bad)}`);
}

// Shipping: $5 on case-only orders, included whenever there's a BlackBox.
assert.deepEqual(priceCart({ "case-white": 1 }), { subtotal: 2500, shipping: 500, amount: 3000 });
assert.deepEqual(priceCart({ "case-white": 2, "case-black": 1 }), { subtotal: 7500, shipping: 500, amount: 8000 });
assert.deepEqual(priceCart({ blackbox: 1, "case-black": 1 }), { subtotal: 22400, shipping: 0, amount: 22400 });
assert.deepEqual(priceCart({ blackbox: 2 }), { subtotal: 39800, shipping: 0, amount: 39800 });
assert.equal(describeOrder({ product: "case", blackbox_qty: "0", case_white_qty: "1", case_black_qty: "0", shipping_cents: "500" }), "BlackBox Case (Arctic White) + Shipping ($5.00)");

console.log("founders labelling + cart parsing + shipping: all checks passed");

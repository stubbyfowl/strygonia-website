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

// Shipping: USPS postage from Phoenix. One BlackBox packs to 10 oz (16 oz row), a lone case to 5 oz (8 oz row).
const ship = (qty, country, postal_code) => priceCart(qty, { country, postal_code })?.shipping ?? null;
assert.equal(ship({ blackbox: 1 }, "US", "85004"), 1005); // Phoenix, zone 1
assert.equal(ship({ blackbox: 1 }, "US", "90210"), 1110); // Beverly Hills, zone 4
assert.equal(ship({ blackbox: 1 }, "US", "10001"), 1365); // New York, zone 8
assert.equal(ship({ blackbox: 1 }, "US", "96813"), 1365); // Honolulu, zone 8
assert.equal(ship({ blackbox: 1 }, "US", "09001"), 1270); // APO under 1 lb, zone 7
assert.equal(ship({ blackbox: 1 }, "GU", "96910"), 1365); // Guam
assert.equal(ship({ "case-white": 1 }, "US", "85004"), 840);
assert.equal(ship({ blackbox: 1 }, "CA", "M5V 2T6"), 2600); // Canada, price group 1
assert.equal(ship({ blackbox: 1 }, "NR"), 3835); // Nauru, price group 4
assert.equal(ship({ blackbox: 1 }, "AU", "2000"), 4125); // Australia, price group 12
assert.equal(ship({ blackbox: 1 }, "US", "8500"), null); // no 5-digit ZIP
for (const blocked of ["CU", "IR", "KP", "SY", "RU", "BY", "SO", "XX", ""]) assert.equal(ship({ blackbox: 1 }, blocked, "12345"), null, blocked);
// Biggest cart abroad: 80 oz of items splits into two 44 oz packages (48 oz row).
assert.deepEqual(priceCart({ blackbox: 10, "case-white": 10, "case-black": 10 }, { country: "CA" }), { subtotal: 249000, shipping: 7700, service: "USPS First-Class Package International, price group 1, 2 packages", amount: 256700 });
assert.equal(priceCart({ blackbox: 1, "case-black": 1 }, { country: "US", postal_code: "85004" }).amount, 22400 + 1005);
assert.equal(describeOrder({ product: "blackbox", blackbox_qty: "1", case_white_qty: "0", case_black_qty: "0", shipping_cents: "500" }, [4]), "BlackBox: Founder's Edition (#4 of 10) + Shipping ($5.00)");
assert.equal(describeOrder({ product: "case", blackbox_qty: "0", case_white_qty: "1", case_black_qty: "0", shipping_cents: "840" }), "BlackBox Case (Arctic White) + Shipping ($8.40)");

console.log("founders labelling + cart parsing + shipping: all checks passed");

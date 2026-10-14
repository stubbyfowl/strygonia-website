// Checks the guard rails on api/sidakswebsites-payment-intent.js without calling Stripe.
// Run: node scripts/check-sidakswebsites-api.mjs
import assert from "node:assert/strict";

process.env.STRIPE_SECRET_KEY ||= "sk_test_placeholder";
const { default: handler } = await import("../api/sidakswebsites-payment-intent.js");

async function call({ method = "POST", origin = "https://sidakswebsites.com", body } = {}) {
  const res = {
    statusCode: 0, headers: {}, body: undefined,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
    end() { return this; },
  };
  await handler({ method, headers: { origin }, body }, res);
  return res;
}

const ok = { name: "Maria G", email: "maria@example.com" };

let r = await call({ method: "OPTIONS" });
assert.equal(r.statusCode, 204);
assert.equal(r.headers["access-control-allow-origin"], "https://sidakswebsites.com");

r = await call({ method: "OPTIONS", origin: "https://evil.example" });
assert.equal(r.statusCode, 403);
assert.equal(r.headers["access-control-allow-origin"], undefined);

r = await call({ origin: "https://evil.example", body: ok });
assert.equal(r.statusCode, 403);

r = await call({ method: "GET" });
assert.equal(r.statusCode, 405);

r = await call({ body: undefined });
assert.equal(r.statusCode, 400);

r = await call({ body: { ...ok, email: "   " } });
assert.equal(r.statusCode, 400);

console.log("sidakswebsites payment API guard checks passed");

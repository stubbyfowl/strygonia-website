import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Waitlist sign-ups, contact messages and job applications are saved as Stripe
// customers. The Stripe key is the site's only server-side secret, so this needs
// no other service or account. In Stripe > Customers the name says which form it
// came from ("BlackBox waitlist", "Contact: …", "Application: …"), and the
// message itself is in the customer's metadata.

const ALLOWED_ORIGINS = new Set([
  "https://www.strygonia.com",
  "https://strygonia.com",
  "http://localhost:5173",
]);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clip = (value, max) => String(value ?? "").trim().slice(0, max);

// Stripe metadata values max out at 500 characters, so long text spans several keys.
function chunked(prefix, text) {
  const out = {};
  for (let i = 0; i * 490 < text.length; i++) out[`${prefix}_${i + 1}`] = text.slice(i * 490, (i + 1) * 490);
  return out;
}

const FORMS = {
  waitlist: {
    required: [],
    build: (b) => ({
      name: "BlackBox waitlist",
      description: "Get notified when BlackBox ships",
      metadata: { form: "waitlist", page: clip(b.page, 100) },
    }),
  },
  contact: {
    required: ["name", "message"],
    build: (b) => ({
      name: `Contact: ${clip(b.name, 100)}`,
      description: clip(`Contact form${clip(b.subject, 200) ? `: ${clip(b.subject, 200)}` : ""}`, 300),
      metadata: {
        form: "contact",
        sender_name: clip(b.name, 100),
        company: clip(b.company, 200),
        subject: clip(b.subject, 200),
        ...chunked("message", clip(b.message, 4900)),
      },
    }),
  },
  careers: {
    required: ["name", "experience", "why_join"],
    build: (b) => ({
      name: `Application: ${clip(b.name, 100)}`,
      description: clip(`Job application${clip(b.role, 200) ? `: ${clip(b.role, 200)}` : ""}`, 300),
      metadata: {
        form: "careers",
        applicant_name: clip(b.name, 100),
        role: clip(b.role, 200),
        ...chunked("experience", clip(b.experience, 2450)),
        ...chunked("why_join", clip(b.why_join, 2450)),
      },
    }),
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!ALLOWED_ORIGINS.has(req.headers.origin)) {
    return res.status(403).json({ error: "Origin not allowed" });
  }

  const body = req.body || {};
  const form = FORMS[body.form];
  if (!form) return res.status(400).json({ error: "Unknown form." });

  // Hidden field that people never see; bots fill in every field. Pretend it worked.
  if (body.bb_hp) return res.status(200).json({ ok: true });

  const email = clip(body.email, 254).toLowerCase();
  if (!EMAIL.test(email)) return res.status(400).json({ error: "Enter a valid email address." });
  if (form.required.some((key) => !clip(body[key], 10))) {
    return res.status(400).json({ error: "Please fill in every required field." });
  }

  try {
    if (body.form === "waitlist") {
      const existing = await stripe.customers.list({ email, limit: 100 });
      if (existing.data.some((c) => c.metadata?.form === "waitlist")) {
        return res.status(200).json({ ok: true, already: true });
      }
    }
    const { metadata, ...fields } = form.build(body);
    await stripe.customers.create({
      email,
      ...fields,
      metadata: Object.fromEntries(Object.entries(metadata).filter(([, value]) => value)),
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("forms:", err.message);
    return res.status(500).json({ error: "Something went wrong. Please try again, or email contact@strygonia.com." });
  }
}

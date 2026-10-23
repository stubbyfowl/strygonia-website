import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { CaseViewer } from "@/components/CaseViewer";
import { CaseColourPicker } from "@/components/CaseColourPicker";
import { CASE_COLOURS, SHIPPING, CATALOG, usd, type CaseColour } from "@/constants/catalog";
import { cart } from "@/lib/cart";

const DISPLAY = "var(--ark-display)";
const BODY = "var(--ark-body)";
const PRICE = CATALOG["case-black"].price;

const FEATURES = [
  "Every port stays usable with the case on: USB-C, microSD, target cable, power terminal.",
  "The four status LEDs shine through the lid.",
  "The TRIGGER button works through a flexible tab in the front wall.",
  "Held together by BlackBox's own four mounting holes: no glue, no clips to snap.",
];

const OPENINGS = [
  ["Four LEDs", "Light holes in the lid, one over each status LED."],
  ["TRIGGER button", "A press-tab in the front wall."],
  ["USB-C", "A cutout big enough for a cable's moulded plug."],
  ["microSD", "A slot. The card sticks out about 2 mm so you can grab it."],
  ["Target cable", "A cutout in the left wall."],
  ["Power terminal", "A slot open at the top, so the plug's screws fit."],
];

const SPECS = [
  ["Size", "78.8 × 58.8 × 17 mm"],
  ["Weight", "About 17 g"],
  ["In the box", "Base and lid, 4 × M2.5 × 12 mm screws"],
  ["Fits", "BlackBox"],
  ["Colors", "Arctic White, Stealth Black"],
  ["Made", "3D printed to order by Strygonia"],
];

const GALLERY: [view: string, caption: string][] = [
  ["exploded", "What's inside: lid, board and base."],
  ["front-left", "The power terminal and target-cable openings."],
  ["bottom", "BLACKBOX engraved underneath."],
];

function Panel({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-lg ${className}`} style={{ background: "var(--ark-panel)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid var(--ark-line)" }}>
      {children}
    </div>
  );
}

function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="max-w-2xl mb-10">
      <span style={{ fontFamily: BODY, fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ark-signal)", display: "block", marginBottom: "1rem" }}>{kicker}</span>
      <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(1.9rem, 3.4vw, 2.8rem)", lineHeight: 0.98, color: "var(--ark-ink)" }}>{title}</h2>
    </div>
  );
}

export function CasePage({
  onHome,
  onBlackBox,
  onPurchase,
  onBuyBundle,
}: {
  onHome: () => void;
  onBlackBox: () => void;
  onPurchase: () => void;
  onBuyBundle: (colour: CaseColour) => void;
}) {
  const [colour, setColour] = useState<CaseColour>("black");
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const sku = CASE_COLOURS[colour].sku;

  const addToCart = () => {
    cart.add(sku);
    setAdded(true);
  };
  const buyNow = () => {
    cart.ensure(sku);
    onPurchase();
  };

  return (
    <main>
      <article>
        <section className="relative px-6 pt-32 pb-24" style={{ background: "var(--ark-bg)" }}>
          <div className="max-w-6xl mx-auto">
            <div className="mb-10 flex flex-wrap items-center gap-6">
              <button onClick={onHome} className="ark-focus inline-flex items-center gap-2 text-sm" style={{ fontFamily: BODY, color: "var(--ark-ink-dim)" }}>
                <ArrowLeft size={14} /> Home
              </button>
              <button onClick={onBlackBox} className="ark-focus inline-flex items-center gap-2 text-sm" style={{ fontFamily: BODY, color: "var(--ark-ink-dim)" }}>
                <ArrowLeft size={14} /> BlackBox
              </button>
            </div>

            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-10 items-center">
              <Reveal>
                <span style={{ fontFamily: BODY, fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ark-muted)" }}>Accessory · Fits BlackBox</span>
                <h1 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "clamp(2.6rem, 5.2vw, 4.4rem)", lineHeight: 0.96, color: "var(--ark-ink)", margin: "0.8rem 0 1.1rem" }}>BlackBox Case</h1>
                <p style={{ fontFamily: BODY, fontSize: "1.3rem", color: "var(--ark-signal)", lineHeight: 1.35, marginBottom: "1.2rem" }}>A snug two-piece case for BlackBox.</p>
                <p style={{ fontFamily: BODY, fontSize: "1.05rem", color: "var(--ark-ink-dim)", lineHeight: 1.8, maxWidth: "36rem", marginBottom: "1.6rem" }}>
                  The Strygonia logo on top, BLACKBOX underneath. Light windows for the four status LEDs, a press-tab for the TRIGGER button, and openings for USB-C, microSD, the target cable and the power terminal. Four screws, no tools beyond a hex key.
                </p>

                <p style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "2rem", color: "var(--ark-ink)", marginBottom: "1rem" }}>{usd(PRICE)}</p>
                <p style={{ fontFamily: BODY, fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ark-muted)", marginBottom: "0.6rem" }}>
                  Color: <span style={{ color: "var(--ark-ink)" }}>{CASE_COLOURS[colour].name}</span>
                </p>
                <CaseColourPicker value={colour} onChange={(c) => { if (c) { setColour(c); setAdded(false); } }} />

                <div className="flex flex-wrap gap-4 mt-7">
                  <Button size="lg" onClick={buyNow}>Buy | {usd(PRICE)} <ArrowRight size={17} /></Button>
                  <Button size="lg" variant="outline" onClick={addToCart}>Add to cart</Button>
                </div>
                {added && (
                  <p role="status" className="mt-4 inline-flex items-center gap-2" style={{ fontFamily: BODY, fontSize: "0.9rem", color: "var(--ark-signal)" }}>
                    <Check size={16} /> {CASE_COLOURS[colour].name} case added.{" "}
                    <button type="button" onClick={onPurchase} className="ark-focus" style={{ color: "var(--ark-signal)", textDecoration: "underline", textUnderlineOffset: "2px", background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 600 }}>View cart</button>
                  </p>
                )}
                <p className="mt-5 inline-flex items-center gap-2" style={{ fontFamily: BODY, fontSize: "0.85rem", color: "var(--ark-muted)" }}>
                  <Package size={15} /> 3D printed to order, so allow a few extra days to ship.
                </p>
                <p style={{ fontFamily: BODY, fontSize: "0.85rem", color: "var(--ark-muted)", marginTop: "0.3rem" }}>
                  Shipping is a flat {usd(SHIPPING)} per order.
                </p>
              </Reveal>

              <Reveal delay={0.1} variant="scale">
                <Panel className="p-6">
                  <CaseViewer colour={colour} open={open} fallback={`/products/case/${colour}-front-right.jpg`} />
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span style={{ fontFamily: BODY, fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ark-muted)" }}>{CASE_COLOURS[colour].name}</span>
                    <Button size="sm" variant="outline" onClick={() => setOpen((v) => !v)} aria-pressed={open}>
                      {open ? "Close it" : "Open it"}
                    </Button>
                  </div>
                </Panel>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="relative py-24 px-6 border-y" style={{ background: "var(--ark-bg-2)", borderColor: "var(--ark-line-soft)" }}>
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14">
            <div>
              <SectionHead kicker="Built around BlackBox" title="Nothing gets in the way" />
              <ul className="grid gap-4">
                {FEATURES.map((f) => (
                  <li key={f} className="pl-4" style={{ fontFamily: BODY, fontSize: "0.98rem", color: "var(--ark-ink-dim)", lineHeight: 1.65, borderLeft: "2px solid var(--ark-signal)" }}>{f}</li>
                ))}
              </ul>
            </div>
            <div>
              <SectionHead kicker="How it goes together" title="Four screws, no glue" />
              <p style={{ fontFamily: BODY, fontSize: "0.98rem", color: "var(--ark-ink-dim)", lineHeight: 1.75, marginBottom: "1rem" }}>
                The board's own four corner holes hold everything together. Four M2.5 × 12 mm screws go up through the base and the board and thread into posts in the lid, so there's no glue, no inserts and no clips.
              </p>
              <p style={{ fontFamily: BODY, fontSize: "0.98rem", color: "var(--ark-ink-dim)", lineHeight: 1.75 }}>
                The Strygonia logo is engraved on top, traced from the same artwork as the gold logo on the board. BLACKBOX is engraved underneath.
              </p>
            </div>
          </div>
        </section>

        <section className="relative py-24 px-6" style={{ background: "var(--ark-bg)" }}>
          <div className="max-w-6xl mx-auto">
            <SectionHead kicker="Every opening" title="Ports, LEDs and the button" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
              {OPENINGS.map(([name, detail]) => (
                <div key={name} className="pt-5 border-t" style={{ borderColor: "var(--ark-line)" }}>
                  <h3 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.2rem", color: "var(--ark-ink)", marginBottom: "0.4rem" }}>{name}</h3>
                  <p style={{ fontFamily: BODY, fontSize: "0.93rem", color: "var(--ark-ink-dim)", lineHeight: 1.7 }}>{detail}</p>
                </div>
              ))}
            </div>
            <Panel className="mt-12 p-7">
              <h3 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.3rem", color: "var(--ark-ink)", marginBottom: "0.5rem" }}>Fit-checked against the board</h3>
              <p style={{ fontFamily: BODY, fontSize: "0.95rem", color: "var(--ark-ink-dim)", lineHeight: 1.75, maxWidth: "48rem" }}>
                The script that builds the case also checks it against BlackBox's 3D model. Nothing on the board touches the case, and every connector and LED has a clear path out.
              </p>
            </Panel>
          </div>
        </section>

        <section className="ark-dark relative py-24 px-6" style={{ background: "var(--ark-bg)" }}>
          <div className="max-w-6xl mx-auto">
            <SectionHead kicker={CASE_COLOURS[colour].name} title="From every side" />
            <div className="grid gap-6 md:grid-cols-2">
              {GALLERY.map(([view, caption], i) => (
                <figure key={view} className={i === 0 ? "md:col-span-2" : ""}>
                  <img src={`/products/case/${colour}-${view}.jpg`} alt={`BlackBox Case in ${CASE_COLOURS[colour].name}. ${caption}`} width={1600} height={900} loading="lazy" className="block w-full h-auto rounded-lg" style={{ border: "1px solid var(--ark-line)" }} />
                  <figcaption className="mt-3" style={{ fontFamily: BODY, fontSize: "0.85rem", color: "var(--ark-muted)" }}>{caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-24 px-6" style={{ background: "var(--ark-bg-2)" }}>
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
            <Panel className="p-8">
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.4rem", color: "var(--ark-ink)", marginBottom: "1.2rem" }}>Specifications</h2>
              <dl className="grid divide-y" style={{ borderColor: "var(--ark-line-soft)" }}>
                {SPECS.map(([label, value]) => (
                  <div key={label} className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 py-3.5 first:pt-0" style={{ borderColor: "var(--ark-line-soft)" }}>
                    <dt style={{ fontFamily: BODY, fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ark-muted)" }}>{label}</dt>
                    <dd style={{ fontFamily: BODY, fontSize: "0.98rem", color: "var(--ark-ink)" }}>{value}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
            <Panel className="p-8">
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.4rem", color: "var(--ark-ink)", marginBottom: "0.8rem" }}>No BlackBox yet?</h2>
              <p style={{ fontFamily: BODY, fontSize: "0.95rem", color: "var(--ark-ink-dim)", lineHeight: 1.7, marginBottom: "1.4rem" }}>
                Get both in one order: BlackBox and a {CASE_COLOURS[colour].name} case, {usd(CATALOG.blackbox.price + PRICE)} together.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => onBuyBundle(colour)}>BlackBox + Case | {usd(CATALOG.blackbox.price + PRICE)} <ArrowRight size={15} /></Button>
                <Button variant="outline" onClick={onBlackBox}>See BlackBox</Button>
              </div>
            </Panel>
          </div>
        </section>
      </article>
    </main>
  );
}

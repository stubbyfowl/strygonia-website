import { useState } from "react";
import { Activity, ArrowRight, CircuitBoard, Gauge, Radio, Terminal, Zap } from "lucide-react";
import { DeviceMockup } from "@/components/DeviceMockup";
import { BlackBoxViewer } from "@/components/BlackBoxViewer";
import { BlackBoxExploded } from "@/components/BlackBoxExploded";
import { Reveal } from "@/components/Reveal";
import { WaitlistForm } from "@/components/WaitlistForm";
import { FoundersEdition } from "@/components/FoundersEdition";
import { Button } from "@/components/ui/button";
import { CaseColourPicker } from "@/components/CaseColourPicker";
import { CATALOG, usd, type CaseColour } from "@/constants/catalog";
import type { ProductSpec, SignalIcon } from "@/constants/products";
import { images } from "@/assets/images";

const { blackbox1, blackbox2, blackbox3 } = images;

const DISPLAY = "var(--ark-display)";
const BODY = "var(--ark-body)";

const SIGNAL_ICONS: Record<SignalIcon, React.ReactNode> = {
  gauge: <Gauge size={20} />,
  activity: <Activity size={20} />,
  terminal: <Terminal size={20} />,
  zap: <Zap size={20} />,
  board: <CircuitBoard size={20} />,
  radio: <Radio size={20} />,
};

function Panel({
  className = "",
  children,
  style,
}: {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-lg ${className}`}
      style={{
        background: "var(--ark-panel)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid var(--ark-line)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function PrimaryBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <Button size="lg" onClick={onClick}>
      {children}
    </Button>
  );
}

function GhostBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <Button variant="outline" size="lg" onClick={onClick}>
      {children}
    </Button>
  );
}

/* Section heading used by every band below the hero, so the page reads as one
   rhythm instead of a stack of unrelated panels. */
function SectionHead({ title, blurb }: { title: string; blurb?: string }) {
  return (
    <div className="max-w-2xl mb-14">
      <h2 className="ark-heading">
        {title}
      </h2>
      {blurb && (
        <p className=" mt-5" style={{ fontFamily: BODY, fontSize: "1.02rem", color: "var(--ark-ink-dim)", lineHeight: 1.8 }}>
          {blurb}
        </p>
      )}
    </div>
  );
}

/* ── At a glance: the feature list, scannable, straight under the hero.
   Gives the page an overview before the deep sections earn their length. ─ */
function AtAGlance({ product }: { product: ProductSpec }) {
  return (
    <section className="relative py-20 px-6 border-y" style={{ background: "var(--ark-bg-2)", borderColor: "var(--ark-line-soft)" }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="sr-only">At a glance</h2>
        <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-5">
          {product.features.map((f) => (
            <li key={f} className="pl-4" style={{ fontFamily: BODY, fontSize: "0.95rem", color: "var(--ark-ink-dim)", lineHeight: 1.65, borderLeft: "2px solid var(--ark-line)" }}>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── How it works: the signal chain, board → timeline ──────────────── */
function SignalChain({ product }: { product: ProductSpec }) {
  return (
    <section className="relative py-28 px-6" style={{ background: "var(--ark-bg-2)" }}>
      <div className="max-w-6xl mx-auto">
        <SectionHead
          title="How it works"
          blurb="BlackBox runs continuously while your board runs, keeping a rolling window of every channel. The failure is already recorded by the time you notice it."
        />
        <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
          {product.chain.map((c, i) => (
            <li key={c.step} className="pt-5 border-t" style={{ borderColor: "var(--ark-line)" }}>
              <h3 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.2rem", color: "var(--ark-ink)", marginBottom: "0.5rem" }}>{c.step}</h3>
              <p style={{ fontFamily: BODY, fontSize: "0.93rem", color: "var(--ark-ink-dim)", lineHeight: 1.7 }}>{c.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── What it records: the V1 channel set ──────────────────────────── */
function Signals({ product }: { product: ProductSpec }) {
  return (
    <section className="relative py-28 px-6" style={{ background: "var(--ark-bg-2)" }}>
      <div className="max-w-6xl mx-auto">
        <SectionHead
          title="V1 channels"
          blurb="Six inputs on one harness. Every sample shares the same clock, so a voltage dip, current spike, and the serial print that preceded them line up on one timeline."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
          {product.signals.map((s) => (
            <div key={s.title}>
              <div className="flex items-center gap-3 pb-4 mb-4 border-b" style={{ borderColor: "var(--ark-line)" }}>
                <span style={{ color: "var(--ark-signal)" }}>{SIGNAL_ICONS[s.icon]}</span>
              </div>
              <h3 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.25rem", color: "var(--ark-ink)", marginBottom: "0.55rem" }}>{s.title}</h3>
              <p style={{ fontFamily: BODY, fontSize: "0.93rem", color: "var(--ark-ink-dim)", lineHeight: 1.75 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Build sheet: specs beside what ships in the box ───────────────── */
function BuildSheet({ product }: { product: ProductSpec }) {
  return (
    <section className="relative py-28 px-6" style={{ background: "var(--ark-bg-2)" }}>
      <div className="max-w-6xl mx-auto">
        <SectionHead title="Specifications" />
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
          <Panel className="p-8">
            <h3 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.3rem", color: "var(--ark-ink)", marginBottom: "1.4rem" }}>Specifications</h3>
            <dl className="grid gap-0 divide-y" style={{ borderColor: "var(--ark-line-soft)" }}>
              {product.specs.map((spec) => (
                <div key={spec.label} className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 py-4 first:pt-0 last:pb-0" style={{ borderColor: "var(--ark-line-soft)" }}>
                  <dt style={{ fontFamily: BODY, fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ark-muted)" }}>{spec.label}</dt>
                  <dd style={{ fontFamily: BODY, fontSize: "0.98rem", color: "var(--ark-ink)" }}>{spec.value}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel className="p-8">
            <h3 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.3rem", color: "var(--ark-ink)", marginBottom: "1.4rem" }}>What ships with it</h3>
            <ul className="grid gap-4">
              {product.inTheBox.map((item) => (
                <li key={item} className="pl-4" style={{ fontFamily: BODY, fontSize: "0.95rem", color: "var(--ark-ink-dim)", lineHeight: 1.65, borderLeft: "2px solid var(--ark-signal-deep)" }}>
                  {item}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </section>
  );
}

/* BlackBox render gallery — the three Rev C PCB renders. */
const GALLERY_SHOTS = [
  {
    src: blackbox1,
    alt: "BlackBox Rev C PCB top view, components, ICs, and signal routing visible",
    full: true,
  },
  {
    src: blackbox2,
    alt: "BlackBox Rev C PCB bottom view, ground plane and bottom-side passives",
    full: false,
  },
  {
    src: blackbox3,
    alt: "BlackBox Rev C PCB profile view, board thickness, connector heights, and component clearances",
    full: false,
  },
];

function BlackBoxGallery() {
  return (
    <section className="relative py-28 px-6" style={{ background: "var(--ark-bg)" }}>
      <div className="max-w-6xl mx-auto">
        <SectionHead title="Product renders" />

        <div className="grid gap-6 md:grid-cols-2">
          {GALLERY_SHOTS.map((shot, i) => (
            <figure key={shot.src} className={shot.full ? "md:col-span-2" : ""}>
              <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--ark-line)" }}>
                <img src={shot.src} alt={shot.alt} width={3168} height={2384} loading="lazy" className="block w-full h-auto" />
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductDescriptionPage({
  product,
  onHome,
  onBack,
  backLabel,
  onBuy,
  onContact,
}: {
  product: ProductSpec;
  onHome: () => void;
  onBack: () => void;
  backLabel: string;
  onBuy?: (caseColour: CaseColour | null) => void;
  onContact?: () => void;
}) {
  const isBlackbox = product.id === "blackbox";
  const [caseColour, setCaseColour] = useState<CaseColour | null>(null);
  const casePrice = CATALOG["case-black"].price;
  return (
    <main>
    <article>
      {/* ── Hero: what it is, and the unit itself. Nothing else. ─────── */}
      <section className="ark-screen relative px-6 pt-36 lg:pt-44 pb-24 overflow-hidden" style={{ background: "var(--ark-bg)" }}>
        <div className="max-w-6xl mx-auto">
          {/* Phones: name, then the unit, then the details. Desktop: the unit spans the right column. */}
          <div className="grid lg:grid-cols-[0.92fr_1.08fr] gap-y-2 items-center">
            <h1 className="ark-title ark-title-xl relative z-10 lg:self-end lg:mb-6">{product.name}</h1>
            {/* The unit itself, out of its box and big. */}
            <div className="ark-board relative z-20 -mx-4 sm:mx-0 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:ml-8 lg:-mr-12" style={isBlackbox ? { viewTransitionName: "blackbox" } : undefined}>
              {isBlackbox ? <BlackBoxViewer /> : <DeviceMockup kind={product.mockup} className="w-full h-auto" />}
            </div>
            <Reveal className="relative z-10 lg:self-start">
              <p className="" style={{ fontFamily: BODY, fontSize: "1.3rem", color: "var(--ark-signal)", lineHeight: 1.35, marginBottom: "1.5rem" }}>
                {product.tagline}
              </p>
              <p className="" style={{ fontFamily: BODY, fontSize: "1.05rem", color: "var(--ark-ink-dim)", lineHeight: 1.8, maxWidth: "36rem", marginBottom: "2.2rem" }}>
                {product.summary}
              </p>

              {onBuy && isBlackbox && (
                <div className="mb-6">
                  <p style={{ fontFamily: BODY, fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ark-muted)", marginBottom: "0.6rem" }}>Add a case</p>
                  <CaseColourPicker value={caseColour} onChange={setCaseColour} allowNone priceSuffix={`+${usd(casePrice)}`} />
                </div>
              )}
              <div className="flex flex-wrap gap-4">
                {onBuy && (
                  <PrimaryBtn onClick={() => onBuy(caseColour)}>
                    {caseColour ? `Buy | ${usd(CATALOG.blackbox.price + casePrice)}` : product.reserveLabel} <ArrowRight size={17} />
                  </PrimaryBtn>
                )}
                {onContact && <GhostBtn onClick={onContact}>Talk to us</GhostBtn>}
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      <AtAGlance product={product} />
      <SignalChain product={product} />
      <Signals product={product} />

      {isBlackbox && (
        <BlackBoxExploded
          title="Scroll to take it apart."
          subtitle="Watch the Rev C board come apart: every part lifts off, then the board peels into its layers."
        />
      )}

      <BuildSheet product={product} />
      {isBlackbox && <BlackBoxGallery />}
      <section className="relative py-24 px-6 border-t" style={{ background: "var(--ark-bg-2)", borderColor: "var(--ark-line-soft)" }}>
        <div className="max-w-6xl mx-auto">
          <WaitlistForm page="product" />
        </div>
      </section>
      <FoundersEdition onReserve={onBuy && (() => onBuy(null))} onContact={onContact} />
    </article>
    </main>
  );
}

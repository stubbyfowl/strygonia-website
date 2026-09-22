import { Activity, ArrowLeft, ArrowRight, CircuitBoard, Gauge, Radio, Terminal, Zap } from "lucide-react";
import { CircuitBackdrop } from "@/components/CircuitBackdrop";
import { DeviceMockup } from "@/components/DeviceMockup";
import { BlackBoxViewer } from "@/components/BlackBoxViewer";
import { BlackBoxExploded } from "@/components/BlackBoxExploded";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import type { ProductSpec, SignalIcon } from "@/constants/products";
import { images } from "@/assets/images";

const { glacierField, alpineBackground, glacierCave, blackbox1, blackbox2, blackbox3, blackbox4 } = images;

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
function SectionHead({ kicker, title, blurb }: { kicker: string; title: string; blurb?: string }) {
  return (
    <div className="max-w-2xl mb-14">
      <span style={{ fontFamily: BODY, fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ark-signal)", display: "block", marginBottom: "1rem" }}>
        {kicker}
      </span>
      <h2 className="ark-on-photo" style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(1.9rem, 3.4vw, 2.8rem)", lineHeight: 0.98, color: "var(--ark-ink)" }}>
        {title}
      </h2>
      {blurb && (
        <p className="ark-on-photo mt-5" style={{ fontFamily: BODY, fontSize: "1.02rem", color: "var(--ark-ink-dim)", lineHeight: 1.8 }}>
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
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.36fr_1.64fr] gap-8 lg:gap-16">
        <h2 style={{ fontFamily: BODY, fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ark-muted)", lineHeight: 1.7 }}>
          At a glance
        </h2>
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
          kicker="How it works"
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
    <section className="relative py-28 px-6 overflow-hidden" style={{ background: "var(--ark-bg)" }}>
      <CircuitBackdrop grid={false} image={glacierCave} position="center 45%" />
      <div className="relative z-10 max-w-6xl mx-auto">
        <SectionHead
          kicker="V1 signal set"
          title="V1 channels"
          blurb="Six inputs on one harness. Every sample shares the same clock, so a voltage dip, current spike, and the serial print that preceded them line up on one timeline."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
          {product.signals.map((s, i) => (
            <div key={s.title} className="ark-on-photo">
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
        <SectionHead kicker="The hardware" title="Specifications" />
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

/* BlackBox render gallery — the four V1 product shots, full-bleed rows. */
const GALLERY_SHOTS = [
  {
    src: blackbox1,
    alt: "BlackBox V1 on a workbench, USB-C and universal interface header visible",
    caption: "V1 enclosure · on the bench",
    full: true,
  },
  {
    src: blackbox3,
    alt: "Exploded render — top enclosure, carrier PCB, and bottom plate separated with fasteners",
    caption: "Assembly · four fasteners, no glue",
    full: false,
  },
  {
    src: blackbox4,
    alt: "BlackBox with wiring harness, probe tips, and labelled internals",
    caption: "Harness · probes · internals",
    full: false,
  },
  {
    src: blackbox2,
    alt: "Six orthographic views of the BlackBox V1 — faces, ports, and interface header",
    caption: "Every face · ports and header",
    full: true,
  },
];

function BlackBoxGallery() {
  return (
    <section className="relative py-28 px-6" style={{ background: "var(--ark-bg)" }}>
      <div className="max-w-6xl mx-auto">
        <SectionHead kicker="Renders" title="Product renders" />

        <div className="grid gap-6 md:grid-cols-2">
          {GALLERY_SHOTS.map((shot, i) => (
            <figure key={shot.caption} className={shot.full ? "md:col-span-2" : ""}>
              <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--ark-line)" }}>
                <img src={shot.src} alt={shot.alt} loading="lazy" className="block w-full h-auto" />
              </div>
              <figcaption className="mt-3">
                <span style={{ fontFamily: BODY, fontSize: "0.82rem", fontWeight: 500, color: "var(--ark-muted)" }}>
                  {shot.caption}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Closing CTA, so the page doesn't dead-end after the gallery ───── */
function ProductCTA({ product, onReserve, onContact }: { product: ProductSpec; onReserve?: () => void; onContact?: () => void }) {
  return (
    <section className="relative py-28 px-6" style={{ background: "var(--ark-bg-2)", borderTop: "1px solid var(--ark-line-soft)" }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="ark-on-photo" style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(1.8rem, 3.2vw, 2.6rem)", lineHeight: 1, color: "var(--ark-ink)", maxWidth: "24rem" }}>
          Get a {product.name}
        </h2>
        <p className="mt-5" style={{ fontFamily: BODY, fontSize: "1.02rem", color: "var(--ark-ink-dim)", lineHeight: 1.8, maxWidth: "34rem" }}>
          {product.name} is currently a {product.status.toLowerCase()}. $198.99 for the Founder's Edition — includes the unit, harness, and ongoing firmware updates.
        </p>
        <div className="flex flex-wrap gap-4 mt-9">
          {onReserve && <PrimaryBtn onClick={onReserve}>{product.reserveLabel} <ArrowRight size={17} /></PrimaryBtn>}
          {onContact && <GhostBtn onClick={onContact}>Talk to us</GhostBtn>}
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
  onReserve,
  onContact,
}: {
  product: ProductSpec;
  onHome: () => void;
  onBack: () => void;
  backLabel: string;
  onReserve?: () => void;
  onContact?: () => void;
}) {
  const isBlackbox = product.id === "blackbox";
  return (
    <>
      {/* ── Hero: what it is, and the unit itself. Nothing else. ─────── */}
      <main
        className="relative overflow-hidden px-6 pt-32 pb-24"
        style={{ background: "var(--ark-bg)" }}
      >
        <CircuitBackdrop
          tint={isBlackbox ? "signal" : "deep"}
          image={isBlackbox ? glacierField : alpineBackground}
        />

        <div className="relative z-20 max-w-6xl mx-auto">
          <div className="mb-10 flex flex-wrap items-center gap-6">
            <button onClick={onHome} className="ark-focus inline-flex items-center gap-2 text-sm" style={{ fontFamily: BODY, color: "var(--ark-ink-dim)" }}>
              <ArrowLeft size={14} /> Home
            </button>
            <button onClick={onBack} className="ark-focus inline-flex items-center gap-2 text-sm" style={{ fontFamily: BODY, color: "var(--ark-ink-dim)" }}>
              <ArrowLeft size={14} /> {backLabel}
            </button>
          </div>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-10 items-center">
            <Reveal>
              <h1
                className="ark-on-photo"
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 600,
                  fontSize: "clamp(2.6rem, 5.2vw, 4.4rem)",
                  lineHeight: 0.96,
                  letterSpacing: "0",
                  color: "var(--ark-ink)",
                  marginBottom: "1.1rem",
                }}
              >
                {product.name}
              </h1>
              <p className="ark-on-photo" style={{ fontFamily: BODY, fontSize: "1.3rem", color: "var(--ark-signal)", lineHeight: 1.35, marginBottom: "1.5rem" }}>
                {product.tagline}
              </p>
              <p className="ark-on-photo" style={{ fontFamily: BODY, fontSize: "1.05rem", color: "var(--ark-ink-dim)", lineHeight: 1.8, maxWidth: "36rem", marginBottom: "2.2rem" }}>
                {product.summary}
              </p>

              <div className="flex flex-wrap gap-4">
                {onReserve && <PrimaryBtn onClick={onReserve}>{product.reserveLabel} <ArrowRight size={17} /></PrimaryBtn>}
                {onContact && <GhostBtn onClick={onContact}>Talk to us</GhostBtn>}
              </div>
            </Reveal>

            <Reveal delay={0.1} variant="scale">
              <Panel className="p-6">
                {isBlackbox ? <BlackBoxViewer /> : <DeviceMockup kind={product.mockup} className="w-full h-auto" />}
                <div className="mt-4 flex items-center justify-between">
                  <span style={{ fontFamily: BODY, fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ark-muted)" }}>{product.code}</span>
                  <span style={{ fontFamily: BODY, fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ark-signal)" }}>{product.status}</span>
                </div>
              </Panel>
            </Reveal>
          </div>
        </div>
      </main>

      {/* Sticky-scroll sections live outside <main> — its overflow-hidden
          (needed for the backdrop) would break position: sticky. */}
      <AtAGlance product={product} />
      <SignalChain product={product} />
      <Signals product={product} />

      {isBlackbox && (
        <BlackBoxExploded
          title="Scroll to take it apart."
          subtitle="Four parts between you and the recorder: the printed shell lifts, the radio module and carrier PCB separate, and the bottom plate drops away."
        />
      )}

      <BuildSheet product={product} />
      {isBlackbox && <BlackBoxGallery />}
      <ProductCTA product={product} onReserve={onReserve} onContact={onContact} />
    </>
  );
}

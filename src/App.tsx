import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Menu,
  X,
  Youtube,
  Instagram,
  MessageCircle,
  Eye,
  EyeOff,
  Lock,
  CreditCard,
} from "lucide-react";
import { CookieBanner } from "@/components/CookieBanner";
import { CircuitBackdrop } from "@/components/CircuitBackdrop";
import { DeviceMockup } from "@/components/DeviceMockup";
import { BlackBoxExploded } from "@/components/BlackBoxExploded";
import { RewindTimeline } from "@/components/RewindTimeline";
import { Reveal } from "@/components/Reveal";
import { ProductDescriptionPage } from "@/components/ProductDescriptionPage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { images } from "@/assets/images";
import {
  PRIVACY_POLICY_INTRO,
  PRIVACY_POLICY_LAST_UPDATED,
  PRIVACY_POLICY_SECTIONS,
  PRIVACY_POLICY_SUMMARY,
} from "@/content/privacy-policy";
import {
  ACCESSIBILITY_LAST_UPDATED,
  ACCESSIBILITY_SECTIONS,
} from "@/content/accessibility-statement";
import { SOCIAL_LINKS } from "@/constants/social";
import { PRODUCTS, PRODUCT_IDS, type ProductId } from "@/constants/products";
import { STRYGONIA_EMAIL } from "@/config/env";
import { submitToFormspree } from "@/lib/formspree";
import { useSmoothScroll, scrollToTop, scrollToId } from "@/lib/useSmoothScroll";

const {
  sidakProfile,
  glacierCave,
  arcticIce,
  careersBackground,
  productSpecBackground,
} = images;

/* ── Shared type tokens ───────────────────────────────────────────── */
const DISPLAY = "var(--ark-display)";
const BODY = "var(--ark-body)";
const MONO = "var(--ark-mono)";
const NORDIC = "var(--ark-nordic)";
const WORDMARK = "var(--ark-wordmark)";

/* ── Primitives (shadcn wrappers) ────────────────────────────────── */
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
    <Card className={`backdrop-blur-sm ${className}`} style={style}>
      {children}
    </Card>
  );
}

function Eyebrow({ children, variant = "outline" }: { children: React.ReactNode; variant?: "default" | "secondary" | "outline"; color?: string }) {
  return (
    <Badge variant={variant} className="mb-4 text-[0.68rem] tracking-[0.18em] uppercase font-normal" style={{ fontFamily: NORDIC }}>
      {children}
    </Badge>
  );
}

/* ── Social ───────────────────────────────────────────────────────── */
const SOCIAL_LINK_ICONS = {
  youtube: <Youtube size={15} />,
  instagram: <Instagram size={15} />,
  discord: <MessageCircle size={15} />,
} as const;

function SocialLinkButtons({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {SOCIAL_LINKS.map((item) => (
        <a
          key={item.id}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="ark-focus inline-flex items-center gap-2 rounded-lg px-3 py-2 border transition-colors duration-200 hover:text-foreground/90 hover:border-white/20"
          style={{ borderColor: "var(--ark-line)", background: "rgba(28,25,23,0.03)", color: "var(--ark-muted)", fontFamily: BODY, fontSize: compact ? "0.78rem" : "0.84rem", textDecoration: "none" }}
        >
          {SOCIAL_LINK_ICONS[item.id]}
          {item.label}
        </a>
      ))}
    </div>
  );
}

/* ── Announcement bar (removed — visual weight, generic pattern) ──── */

/* ── Navbar ───────────────────────────────────────────────────────── */
type NavItem =
  | { label: string; kind: "section"; section: string }
  | { label: string; kind: "page"; page: "specs" }
  | { label: string; kind: "product"; id: ProductId };

const NAV_LINKS: NavItem[] = [
  { label: "BlackBox", kind: "product", id: "blackbox" },
  { label: "Team", kind: "section", section: "team" },
  { label: "Specs", kind: "page", page: "specs" },
];

function Navbar({
  scrolled,
  onHome,
  onReserve,
  onContact,
  onSpecs,
  onProduct,
  onSection,
}: {
  scrolled: boolean;
  onHome: () => void;
  onReserve: () => void;
  onContact: () => void;
  onSpecs: () => void;
  onProduct: (id: ProductId) => void;
  onSection: (section: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const handleNav = (link: NavItem) => {
    if (link.kind === "section") onSection(link.section);
    else if (link.kind === "product") onProduct(link.id);
    else onSpecs();
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div
        className="w-full flex items-center justify-between px-6 lg:px-10 py-3 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(240,235,228,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: scrolled ? "1px solid var(--ark-line)" : "1px solid transparent",
        }}
      >
        <button className="ark-focus flex items-center gap-2.5" onClick={onHome} aria-label="Strygonia home">
          <img
            src={scrolled ? "/strygonia-icon-cream.png" : "/strygonia-icon-blue.png"}
            alt=""
            className="rounded-lg"
            style={{ width: 28, height: 28 }}
          />
          <span style={{ fontFamily: WORDMARK, fontSize: "1rem", fontWeight: 600, letterSpacing: "0.02em", color: scrolled ? "var(--ark-ink)" : "#fff" }}>
            Strygonia
          </span>
        </button>

        <ul className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <button
                type="button"
                onClick={() => handleNav(link)}
                className="ark-focus transition-colors"
                style={{ fontFamily: BODY, fontWeight: 400, fontSize: "0.85rem", color: scrolled ? "var(--ark-ink-dim)" : "rgba(255,255,255,0.7)", background: "none", border: "none", cursor: "pointer" }}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-6 lg:gap-7">
          <button onClick={onContact} className="ark-focus text-sm transition-colors px-1" style={{ fontFamily: BODY, color: scrolled ? "var(--ark-ink-dim)" : "rgba(255,255,255,0.7)", background: "none", border: "none", cursor: "pointer" }}>
            Contact
          </button>
          <Button size="sm" onClick={onReserve}>
            Reserve
          </Button>
        </div>

        <button className="ark-focus md:hidden" style={{ color: scrolled ? "var(--ark-ink-dim)" : "#fff" }} onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden p-6 border-b" style={{ background: "rgba(240,235,228,0.98)", borderColor: "var(--ark-line)" }}>
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <button type="button" onClick={() => { setOpen(false); handleNav(link); }} style={{ fontFamily: BODY, color: "var(--ark-ink-dim)", fontSize: "0.95rem", background: "none", border: "none" }}>
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-5 pt-5 border-t flex flex-col gap-3" style={{ borderColor: "var(--ark-line-soft)" }}>
            <Button variant="outline" className="w-full" onClick={() => { setOpen(false); onContact(); }}>Contact</Button>
            <Button className="w-full" onClick={() => { setOpen(false); onReserve(); }}>Reserve</Button>
          </div>
        </div>
      )}
    </header>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────── */
function Hero({ onBlackBox }: { onBlackBox: () => void }) {
  return (
    <section id="home" className="ark-dark relative w-full overflow-hidden" style={{ background: "var(--ark-bg)" }}>
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(37,99,235,0.08) 0%, transparent 70%)" }} />
      <div className="min-h-[90vh] flex flex-col items-center justify-center px-6 pt-28 pb-16 relative z-10">
        <div className="max-w-4xl text-center">
          <img
            src="/strygonia-logo-dark.png"
            alt="Strygonia"
            className="mx-auto mb-10 rounded-2xl"
            style={{ width: "clamp(100px, 16vw, 160px)", height: "auto" }}
          />
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(3rem, 7vw, 5.8rem)", lineHeight: 0.92, letterSpacing: "-0.02em", color: "#fff" }}>
            Rewind the moment
            <br />
            your board died.
          </h1>
          <p style={{ fontFamily: BODY, fontSize: "clamp(1rem, 1.6vw, 1.2rem)", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: "34rem", margin: "2rem auto 0" }}>
            BlackBox quietly records the signals your board checks first, so when it dies you play the failure back instead of hunting for it.
          </p>
          <div className="flex justify-center gap-4 mt-10">
            <Button size="lg" onClick={onBlackBox}>
              Explore BlackBox <ArrowRight size={17} />
            </Button>
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-6 pb-28">
        <RewindTimeline />
      </div>
    </section>
  );
}

/* ── "Works next to" strip — static, no scroll animation ──────────── */
function ToolMarquee() {
  const tools = ["Breadboards", "Raspberry Pi", "STM32", "ESP32", "Arduino", "Custom PCBs", "KiCad", "Saleae", "JLCPCB", "Pinecil", "Rigol scopes"];
  return (
    <section className="ark-dark relative py-16 px-6 border-y" style={{ background: "var(--ark-bg-2)", borderColor: "var(--ark-line-soft)" }}>
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.42fr_1.58fr] gap-8 lg:gap-14 items-baseline">
        <p style={{ fontFamily: MONO, fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--ark-muted)", lineHeight: 1.7 }}>
          Works next to what's already on your bench
        </p>
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
          {tools.map((t) => (
            <span key={t} style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: "1.06rem", color: "var(--ark-ink-dim)" }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Product rows ─────────────────────────────────────────────────── */
function ProductRow({
  id,
  index,
  onExplore,
  onReserve,
}: {
  id: ProductId;
  index: number;
  onExplore: (id: ProductId) => void;
  onReserve: () => void;
}) {
  const product = PRODUCTS[id];
  const flip = index % 2 === 1;

  /* Deliberately uneven: the copy column is wider, the instrument column
     overlaps it, and each row hangs at a different height. */
  return (
    <div
      className={`grid lg:grid-cols-[1.08fr_0.92fr] gap-10 lg:gap-0 items-start ${
        flip ? "lg:pt-24" : ""
      }`}
    >
      <div className={`relative z-10 ${flip ? "lg:order-2 lg:pl-16 lg:pt-10" : "lg:pr-16"}`}>
        <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(1.9rem, 3.4vw, 2.8rem)", lineHeight: 0.98, letterSpacing: "0", color: "var(--ark-ink)", marginBottom: "1rem" }}>
          {product.name}
        </h3>
        <p style={{ fontFamily: BODY, fontSize: "1.05rem", color: "var(--ark-muted)", marginBottom: "1rem" }}>{product.tagline}</p>
        <p style={{ fontFamily: BODY, fontSize: "1.02rem", color: "var(--ark-ink-dim)", lineHeight: 1.75, maxWidth: "34rem", marginBottom: "2rem" }}>{product.shortSummary}</p>
        <div className="flex flex-wrap gap-4">
          <Button size="lg" onClick={() => onExplore(id)}>
            Explore {product.name} <ArrowRight size={17} />
          </Button>
          <Button variant="light" size="lg" onClick={onReserve}>{product.reserveLabel}</Button>
        </div>
      </div>

      <div className={flip ? "lg:order-1 lg:-mr-20 lg:mt-0" : "lg:-ml-20 lg:mt-28"}>
        <Panel className="p-8">
          <DeviceMockup kind={product.mockup} className="w-full h-auto" />
        </Panel>
      </div>
    </div>
  );
}

function Products({ onProduct, onReserve }: { onProduct: (id: ProductId) => void; onReserve: () => void }) {
  return (
    <section id="products" className="ark-dark relative py-40 px-6 overflow-hidden" style={{ background: "var(--ark-bg)" }}>
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(37,99,235,0.05) 0%, transparent 60%)" }} />
      <div className="max-w-6xl mx-auto relative z-10">
        <Reveal className="max-w-2xl mb-24">
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(2.2rem, 4vw, 3.6rem)", lineHeight: 0.95, color: "var(--ark-ink)", marginBottom: "1.2rem" }}>
            For the worst part of building hardware.
          </h2>
          <p style={{ fontFamily: BODY, fontSize: "1.1rem", color: "var(--ark-ink-dim)", lineHeight: 1.8 }}>
            A board that dies and won't tell you why. We built one instrument to fix exactly that.
          </p>
        </Reveal>

        <div className="flex flex-col gap-32">
          {PRODUCT_IDS.map((id, i) => (
            <ProductRow key={id} id={id} index={i} onExplore={onProduct} onReserve={onReserve} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Team ─────────────────────────────────────────────────────────── */
const TEAM = [
  {
    name: "Sidak Mann",
    title: "Co-founder · Firmware & software",
    bio: "Sidak writes the STM32 firmware that does the real-time recording and the desktop app you rewind in. He came from distributed systems and real-time work, and cares most about catching a fault in microseconds and making the replay readable.",
    accent: "var(--ark-signal)",
    photo: sidakProfile,
    photoPosition: "center 32%",
  },
];

function Team() {
  return (
    <section id="team" className="relative py-40 px-6 overflow-hidden" style={{ background: "var(--ark-bg)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 max-w-2xl">
          <Eyebrow variant="secondary">Meet the team</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(2rem, 3.5vw, 3rem)", lineHeight: 0.98, letterSpacing: "0", color: "var(--ark-ink)" }}>
            Built by engineers, for engineers.
          </h2>
        </div>
        <div className="max-w-lg">
          {TEAM.map((m) => (
            <div key={m.name} className="flex flex-col gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0" style={{ border: "1px solid var(--ark-line)" }}>
                  <img src={m.photo} alt={`${m.name}`} className="w-full h-full object-cover" style={{ objectPosition: m.photoPosition }} />
                </div>
                <div>
                  <h3 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.3rem", color: "var(--ark-ink)" }}>{m.name}</h3>
                  <span style={{ fontFamily: BODY, fontSize: "0.78rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ark-signal)" }}>{m.title}</span>
                </div>
              </div>
              <p style={{ fontFamily: BODY, fontSize: "0.95rem", color: "var(--ark-ink-dim)", lineHeight: 1.8, maxWidth: "28rem" }}>{m.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA ──────────────────────────────────────────────────────────── */
function CTA({ onReserve, onContact }: { onReserve: () => void; onContact: () => void }) {
  return (
    <section className="ark-dark relative py-48 px-6 overflow-hidden" style={{ background: "var(--ark-bg)" }}>
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(37,99,235,0.06) 0%, transparent 65%)" }} />
      <img
        src="/strygonia-pcb.png"
        alt=""
        aria-hidden
        className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.15] pointer-events-none select-none"
        style={{ width: "clamp(300px, 45vw, 600px)", height: "auto" }}
      />
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(2.4rem, 5vw, 4rem)", lineHeight: 0.92, letterSpacing: "-0.01em", color: "var(--ark-ink)" }}>
          Reserve a prototype unit.
        </h2>
        <p style={{ fontFamily: BODY, fontSize: "1.1rem", color: "var(--ark-ink-dim)", lineHeight: 1.8, maxWidth: "32rem", margin: "1.5rem auto 0" }}>
          We're building the first BlackBox units with a small group of embedded engineers. Join the reserve list — no payment involved.
        </p>
        <div className="flex justify-center flex-wrap gap-4 mt-10">
          <Button size="lg" onClick={onReserve}>
            Reserve a unit <ArrowRight size={17} />
          </Button>
          <Button variant="light" size="lg" onClick={onContact}>Talk to us</Button>
        </div>
      </div>
    </section>
  );
}

/* ── Reserve page ─────────────────────────────────────────────────── */
const FORM_LABEL_STYLE: React.CSSProperties = { fontFamily: MONO, fontSize: "0.66rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ark-muted)" };
const FORM_FIELD_CLASS = "ark-focus w-full rounded-lg px-4 py-3 outline-none border";
const FORM_FIELD_STYLE: React.CSSProperties = { background: "rgba(28,25,23,0.04)", borderColor: "var(--ark-line)", color: "var(--ark-ink)", fontFamily: BODY };

function BackBar({ onHome, label = "Back to Strygonia" }: { onHome: () => void; label?: string }) {
  return (
    <button onClick={onHome} className="ark-focus mb-8 inline-flex items-center gap-2 text-sm" style={{ fontFamily: BODY, color: "var(--ark-ink-dim)" }}>
      <ArrowLeft size={14} /> {label}
    </button>
  );
}

function StripeCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/create-checkout-session", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Something went wrong.");
        setLoading(false);
      }
    } catch {
      setError("Could not connect to checkout. Try again.");
      setLoading(false);
    }
  };

  return (
    <Panel className="p-7">
      <div className="flex items-center justify-between mb-5">
        <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.25rem", color: "var(--ark-ink)" }}>Payment</span>
        <span className="inline-flex items-center gap-1.5" style={{ fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ark-muted)" }}>
          <Lock size={12} /> Stripe
        </span>
      </div>

      <div className="mb-6 rounded-lg px-4 py-3 flex items-start gap-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.14)" }}>
        <Lock size={15} style={{ color: "var(--ark-muted)", marginTop: "2px", flexShrink: 0 }} />
        <p style={{ fontFamily: BODY, fontSize: "0.85rem", color: "var(--ark-ink-dim)", lineHeight: 1.6 }}>
          <strong style={{ color: "var(--ark-ink)", fontWeight: 600 }}>Secure checkout.</strong> You'll be redirected to Stripe's hosted payment page. No card info touches our servers.
        </p>
      </div>

      <Button
        className="w-full mt-2"
        size="lg"
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading ? "Redirecting to Stripe..." : <><CreditCard size={16} /> Proceed to checkout</>}
      </Button>

      {error && (
        <div className="mt-4 rounded-lg px-4 py-3 border" style={{ background: "rgba(28,25,23,0.06)", borderColor: "rgba(28,25,23,0.14)", color: "var(--ark-fault-2)", fontFamily: BODY, fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      <p className="mt-4 text-center" style={{ fontFamily: MONO, fontSize: "0.64rem", letterSpacing: "0.1em", color: "var(--ark-faint)" }}>
        Secured by Stripe
      </p>
    </Panel>
  );
}

function ReservePage({ onHome }: { onHome: () => void; initialProduct?: ProductId }) {
  const product = PRODUCTS.blackbox;
  const editionName = "BlackBox: Founder's Edition";

  return (
    <main className="relative min-h-screen overflow-hidden px-6 pt-32 pb-24" style={{ background: "var(--ark-bg)" }}>
      <CircuitBackdrop tint="signal" image={glacierCave} />
      {/* Gray theme layer — a soft gray wash plus a fine gray dot grid that
          fades down the page, tying the checkout to the gray button palette. */}
      <div aria-hidden className="absolute inset-0 z-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(72,77,86,0.42) 0%, rgba(72,77,86,0.16) 30%, rgba(72,77,86,0.04) 55%, transparent 72%)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(180,188,200,0.16) 1px, transparent 0)",
            backgroundSize: "24px 24px",
            maskImage: "linear-gradient(180deg, #000 0%, rgba(0,0,0,0.35) 46%, transparent 82%)",
            WebkitMaskImage: "linear-gradient(180deg, #000 0%, rgba(0,0,0,0.35) 46%, transparent 82%)",
          }}
        />
      </div>
      <div className="relative z-20 max-w-6xl mx-auto">
        <BackBar onHome={onHome} />
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-start">
          <Reveal>
            <Eyebrow>Checkout</Eyebrow>
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "clamp(2.2rem, 4.3vw, 3.6rem)", lineHeight: 0.98, letterSpacing: "0", color: "var(--ark-ink)", marginBottom: "1.3rem" }}>
              {editionName}
            </h1>
            <p style={{ fontFamily: BODY, fontSize: "1.05rem", color: "var(--ark-ink-dim)", lineHeight: 1.8, maxWidth: "36rem" }}>
              The first production run of BlackBox, reserved for early supporters. Founders get prototype access, build updates, and founders pricing.
            </p>

            <Panel className="mt-8 p-6 max-w-lg">
              <div className="flex items-center gap-5">
                <div className="w-28 flex-shrink-0 rounded-lg overflow-hidden" style={{ border: "1px solid var(--ark-line)" }}>
                  <DeviceMockup kind="blackbox" className="w-full h-auto" />
                </div>
                <div className="min-w-0">
                  <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.05rem", color: "var(--ark-ink)" }}>{editionName}</div>
                  <div style={{ fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ark-muted)", marginTop: "3px" }}>{product.code} · {product.status}</div>
                  <div style={{ fontFamily: BODY, fontSize: "0.85rem", color: "var(--ark-ink-dim)", lineHeight: 1.55, marginTop: "0.6rem" }}>{product.tagline}</div>
                </div>
              </div>
              <div className="mt-5 pt-4 flex items-baseline justify-between" style={{ borderTop: "1px solid var(--ark-line-soft)" }}>
                <span style={{ fontFamily: BODY, fontSize: "0.9rem", color: "var(--ark-muted)" }}>Founders pricing</span>
                <span style={{ fontFamily: MONO, fontSize: "0.85rem", color: "var(--ark-ink-dim)" }}>Set at launch</span>
              </div>
            </Panel>
          </Reveal>

          <Reveal delay={0.1}>
            <StripeCheckout />
          </Reveal>
        </div>
      </div>
    </main>
  );
}

/* ── Contact page ─────────────────────────────────────────────────── */
function ContactPage({ onHome }: { onHome: () => void }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const fields = [
    ["name", "Full name", "Your name", "text", true],
    ["email", "Email", "you@example.com", "email", true],
    ["company", "Company / team", "Organization or handle", "text", false],
    ["subject", "Subject", "Partnership, support, press...", "text", false],
  ] as const;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("_subject", "[CONTACT] New Strygonia inquiry");
    formData.set("form_type", "Contact");
    formData.set("_replyto", String(formData.get("email") ?? ""));
    try {
      await submitToFormspree(formData, "contact");
      setStatus("success");
      form.reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : `Something went wrong. Email ${STRYGONIA_EMAIL} directly.`);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-6 pt-32 pb-24" style={{ background: "var(--ark-bg)" }}>
      <CircuitBackdrop tint="deep" image={arcticIce} />
      <div className="relative z-20 max-w-6xl mx-auto">
        <BackBar onHome={onHome} />
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-start">
          <Reveal>
            <Eyebrow>Contact Strygonia</Eyebrow>
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "clamp(2.2rem, 4.3vw, 3.6rem)", lineHeight: 0.98, letterSpacing: "0", color: "var(--ark-ink)" }}>
              Let's talk about<br />what you're building.
            </h1>
            <p style={{ fontFamily: BODY, fontSize: "1.02rem", color: "var(--ark-ink-dim)", lineHeight: 1.8, maxWidth: "34rem", marginTop: "1.4rem" }}>
              Want a prototype on your bench, have a bug you think BlackBox should catch, or just want to talk hardware? Send a note and we'll get back to you.
            </p>
            <Panel className="mt-8 p-6 max-w-md">
              <p style={{ ...FORM_LABEL_STYLE, marginBottom: "0.6rem" }}>Direct email</p>
              <a href={`mailto:${STRYGONIA_EMAIL}`} className="ark-focus" style={{ fontFamily: BODY, fontSize: "1rem", color: "var(--ark-signal)", textDecoration: "none" }}>{STRYGONIA_EMAIL}</a>
            </Panel>
            <Panel className="mt-4 p-6 max-w-md">
              <p style={{ ...FORM_LABEL_STYLE, marginBottom: "0.75rem" }}>Community</p>
              <SocialLinkButtons />
            </Panel>
          </Reveal>

          <Reveal delay={0.1}>
            <Panel className="p-7">
              <form className="grid gap-4" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-4">
                  {fields.map(([name, label, placeholder, type, required]) => (
                    <label key={name} className={`grid gap-2 ${name === "subject" ? "sm:col-span-2" : ""}`}>
                      <span style={FORM_LABEL_STYLE}>{label}</span>
                      <input name={name} type={type} required={required} placeholder={placeholder} className={FORM_FIELD_CLASS} style={FORM_FIELD_STYLE} />
                    </label>
                  ))}
                </div>
                <label className="grid gap-2">
                  <span style={FORM_LABEL_STYLE}>Message</span>
                  <textarea name="message" required placeholder="Tell us what you're working on and how we can help." className={`${FORM_FIELD_CLASS} min-h-32 resize-none`} style={FORM_FIELD_STYLE} />
                </label>
                <Button type="submit" disabled={status === "submitting"} className="w-full mt-2">
                  {status === "submitting" ? "Sending..." : "Send message"} {status !== "submitting" && <ArrowRight size={14} />}
                </Button>
                {status === "success" && (
                  <div className="rounded-lg px-4 py-3 border" style={{ background: "rgba(37,99,235,0.06)", borderColor: "rgba(37,99,235,0.18)", color: "var(--ark-signal)", fontFamily: BODY }}>Thanks for reaching out. We'll reply to your email soon.</div>
                )}
                {status === "error" && (
                  <div className="rounded-lg px-4 py-3 border" style={{ background: "rgba(28,25,23,0.06)", borderColor: "rgba(28,25,23,0.14)", color: "var(--ark-fault-2)", fontFamily: BODY }}>{errorMessage}</div>
                )}
                <p style={{ fontFamily: BODY, fontSize: "0.8rem", color: "var(--ark-faint)", lineHeight: 1.6 }}>You can email us at strygonia.com</p>
              </form>
            </Panel>
          </Reveal>
        </div>
      </div>
    </main>
  );
}

/* ── Careers page ─────────────────────────────────────────────────── */
function CareersPage({ onHome }: { onHome: () => void }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const fields = [
    ["name", "Full name", "Your name", "text", true],
    ["email", "Email", "you@example.com", "email", true],
    ["role", "Role of interest", "Firmware, mechanical, software...", "text", false],
  ] as const;
  const openRoles = ["Embedded firmware (STM32, C)", "Desktop software (Qt / C++, Python)", "Mechanical & CAD (enclosures, airflow)", "Community & builder relations"];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("_subject", "[APPLICATION] Strygonia job application");
    formData.set("form_type", "Application");
    formData.set("_replyto", String(formData.get("email") ?? ""));
    try {
      await submitToFormspree(formData, "contact");
      setStatus("success");
      form.reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : `Something went wrong. Email ${STRYGONIA_EMAIL} directly.`);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-6 pt-32 pb-24" style={{ background: "var(--ark-bg)" }}>
      <CircuitBackdrop tint="neutral" image={careersBackground} />
      <div className="relative z-20 max-w-6xl mx-auto">
        <BackBar onHome={onHome} />
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-start">
          <Reveal>
            <Eyebrow>Careers at Strygonia</Eyebrow>
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "clamp(2.2rem, 4.3vw, 3.6rem)", lineHeight: 0.98, letterSpacing: "0", color: "var(--ark-ink)" }}>
              Build the instruments<br />other builders trust.
            </h1>
            <p style={{ fontFamily: BODY, fontSize: "1.02rem", color: "var(--ark-ink-dim)", lineHeight: 1.8, maxWidth: "34rem", marginTop: "1.4rem" }}>
              Strygonia is a small team building bench instruments for hardware engineers. Send a short application and tell us what you'd want to build with us.
            </p>
            <Panel className="mt-8 p-6 max-w-md">
              <span style={{ ...FORM_LABEL_STYLE, display: "block", marginBottom: "0.75rem" }}>Open focus areas</span>
              <ul className="grid gap-2.5">
                {openRoles.map((r) => (
                  <li key={r} style={{ fontFamily: BODY, fontSize: "0.92rem", color: "var(--ark-ink-dim)" }}>{r}</li>
                ))}
              </ul>
            </Panel>
          </Reveal>

          <Reveal delay={0.1}>
            <Panel className="p-7">
              <form className="grid gap-4" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-4">
                  {fields.map(([name, label, placeholder, type, required]) => (
                    <label key={name} className={`grid gap-2 ${name === "role" ? "sm:col-span-2" : ""}`}>
                      <span style={FORM_LABEL_STYLE}>{label}</span>
                      <input name={name} type={type} required={required} placeholder={placeholder} className={FORM_FIELD_CLASS} style={FORM_FIELD_STYLE} />
                    </label>
                  ))}
                </div>
                <label className="grid gap-2">
                  <span style={FORM_LABEL_STYLE}>Experience</span>
                  <textarea name="experience" required placeholder="Relevant work, projects, or skills you'd bring to Strygonia." className={`${FORM_FIELD_CLASS} min-h-28 resize-none`} style={FORM_FIELD_STYLE} />
                </label>
                <label className="grid gap-2">
                  <span style={FORM_LABEL_STYLE}>Why Strygonia</span>
                  <textarea name="why_join" required placeholder="What draws you here and what do you want to help build?" className={`${FORM_FIELD_CLASS} min-h-28 resize-none`} style={FORM_FIELD_STYLE} />
                </label>
                <Button type="submit" disabled={status === "submitting"} className="w-full mt-2">
                  {status === "submitting" ? "Sending..." : "Send application"} {status !== "submitting" && <ArrowRight size={14} />}
                </Button>
                {status === "success" && (
                  <div className="rounded-lg px-4 py-3 border" style={{ background: "rgba(37,99,235,0.06)", borderColor: "rgba(37,99,235,0.18)", color: "var(--ark-signal)", fontFamily: BODY }}>Thanks for applying. We'll review and get back to you soon.</div>
                )}
                {status === "error" && (
                  <div className="rounded-lg px-4 py-3 border" style={{ background: "rgba(28,25,23,0.06)", borderColor: "rgba(28,25,23,0.14)", color: "var(--ark-fault-2)", fontFamily: BODY }}>{errorMessage}</div>
                )}
                <p style={{ fontFamily: BODY, fontSize: "0.8rem", color: "var(--ark-faint)", lineHeight: 1.6 }}>You can email us at strygonia.com</p>
              </form>
            </Panel>
          </Reveal>
        </div>
      </div>
    </main>
  );
}

/* ── Specs page (BlackBox reference) ──────────────────────────────── */
function SpecsPage({ onHome, onReserve }: { onHome: () => void; onReserve: () => void }) {
  const materials = [
    ["Processor", "A 32-bit ARM microcontroller running the real-time recording."],
    ["Sensing", "A precision high-side current sensor with protection on every input line."],
    ["Storage", "Onboard memory that keeps a rolling record of the last window."],
    ["Power & link", "A single USB-C connection carrying both power and data, regulated on board."],
    ["Interface", "A universal header and a color-coded harness for breadboards, Pi headers, and PCB test points."],
    ["Enclosure", "A 3D-printed shell over a custom-fabricated carrier board."],
  ];
  const targets = [
    ["Target 3.3V → Voltage input", "via harness"],
    ["Target GND → Ground", "via harness"],
    ["Target UART TX → Recorder RX", "via harness"],
    ["Target UART RX → Recorder TX", "via harness"],
    ["Target RESET → Digital input", "via harness"],
    ["Target GPIO → Digital input", "via harness"],
    ["Target power → INA228 inline", "current sense"],
  ];
  const roadmap = [
    { phase: "Phase 1", detail: "Custom PCB with universal pin header. Voltage, current, and UART recording to SD card." },
    { phase: "Phase 2", detail: "Desktop viewer over USB-C — timeline, graphs, event markers, zoom, search." },
    { phase: "Phase 3", detail: "GPIO recording, reset detection, trigger events, refined harness." },
    { phase: "Phase 4", detail: "Improved enclosure, expanded harness kit, field testing across breadboard, Pi, and PCB." },
  ];
  const stack = [["PCB design", "KiCad"], ["Firmware", "Embedded C toolchain"], ["Desktop app", "Qt · C++"], ["Prototyping", "Python"], ["Version control", "GitHub"]];

  return (
    <main className="relative min-h-screen overflow-hidden px-6 pt-32 pb-24" style={{ background: "var(--ark-bg)" }}>
      <CircuitBackdrop tint="signal" image={productSpecBackground} />
      <div className="relative z-20 max-w-6xl mx-auto">
        <BackBar onHome={onHome} />
        <Reveal className="max-w-3xl mb-12">
          <Eyebrow>BlackBox · SG-BB1 · V1 prototype</Eyebrow>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "clamp(2.2rem, 4.3vw, 3.6rem)", lineHeight: 0.98, letterSpacing: "0", color: "var(--ark-ink)", marginBottom: "1.2rem" }}>
            The build sheet.
          </h1>
          <p style={{ fontFamily: BODY, fontSize: "1.02rem", color: "var(--ark-ink-dim)", lineHeight: 1.8 }}>
            A look at what goes into the V1 BlackBox prototype — the materials, the connections, and where it's headed. Everything here reflects our current direction and keeps changing as we validate it.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-6">
          <Reveal>
            <Panel className="p-7">
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.4rem", color: "var(--ark-ink)", marginBottom: "1.2rem" }}>What's inside</h2>
              <div className="grid gap-0 divide-y" style={{ borderColor: "var(--ark-line-soft)" }}>
                {materials.map(([label, desc]) => (
                  <div key={label} className="grid sm:grid-cols-[0.7fr_1.3fr] gap-2 sm:gap-4 py-3.5 first:pt-0 items-baseline" style={{ borderColor: "var(--ark-line-soft)" }}>
                    <span style={{ fontFamily: MONO, fontSize: "0.66rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ark-signal)" }}>{label}</span>
                    <span style={{ fontFamily: BODY, fontSize: "0.9rem", color: "var(--ark-ink-dim)", lineHeight: 1.6 }}>{desc}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </Reveal>

          <div className="grid gap-6">
            <Reveal delay={0.06}>
              <Panel className="p-7">
                <h2 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.4rem", color: "var(--ark-ink)", marginBottom: "1.2rem" }}>V1 target connections</h2>
                <div className="grid gap-0 divide-y" style={{ borderColor: "var(--ark-line-soft)" }}>
                  {targets.map(([conn, note]) => (
                    <div key={conn} className="flex justify-between gap-3 py-2.5 first:pt-0" style={{ borderColor: "var(--ark-line-soft)" }}>
                      <span style={{ fontFamily: MONO, fontSize: "0.82rem", color: "var(--ark-ink-dim)" }}>{conn}</span>
                      <span style={{ fontFamily: MONO, fontSize: "0.7rem", color: "var(--ark-faint)" }}>{note}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </Reveal>
            <Reveal delay={0.12}>
              <Panel className="p-7">
                <h2 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.4rem", color: "var(--ark-ink)", marginBottom: "1.2rem" }}>Software stack</h2>
                <div className="flex flex-wrap gap-2">
                  {stack.map(([k, v]) => (
                    <span key={k} className="inline-flex items-baseline gap-2 px-3 py-1.5 rounded-md" style={{ border: "1px solid var(--ark-line-soft)", background: "var(--ark-bg-2)" }}>
                      <span style={{ fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.1em", color: "var(--ark-faint)" }}>{k}</span>
                      <span style={{ fontFamily: MONO, fontSize: "0.78rem", color: "var(--ark-ink)" }}>{v}</span>
                    </span>
                  ))}
                </div>
              </Panel>
            </Reveal>
          </div>
        </div>

        <Reveal className="mt-6">
          <Panel className="p-7">
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.4rem", color: "var(--ark-ink)", marginBottom: "1.4rem" }}>Development roadmap</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {roadmap.map((r) => (
                <div key={r.phase} className="p-5 rounded-lg" style={{ background: "var(--ark-bg-2)", border: "1px solid var(--ark-line-soft)" }}>
                  <div style={{ fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.1em", color: "var(--ark-signal)", marginBottom: "0.6rem" }}>{r.phase}</div>
                  <p style={{ fontFamily: BODY, fontSize: "0.85rem", color: "var(--ark-ink-dim)", lineHeight: 1.7 }}>{r.detail}</p>
                </div>
              ))}
            </div>
          </Panel>
        </Reveal>

        <div className="mt-8">
          <Button size="lg" onClick={onReserve}>Reserve a BlackBox <ArrowRight size={14} /></Button>
        </div>
      </div>
    </main>
  );
}

/* ── Legal ────────────────────────────────────────────────────────── */
function LegalPage({ type, onHome, a11y, onToggleA11y }: { type: "privacy" | "terms" | "accessibility"; onHome: () => void; a11y: boolean; onToggleA11y: () => void }) {
  const isPrivacy = type === "privacy";
  const isAccessibility = type === "accessibility";
  const sections = isPrivacy
    ? PRIVACY_POLICY_SECTIONS
    : isAccessibility
      ? ACCESSIBILITY_SECTIONS
      : [
        { title: "Use of the site", body: "This site presents Strygonia concepts, prototype information, and early-access opportunities. Product details may change as engineering validation continues." },
        { title: "Reservations", body: "Joining the reserve list is an expression of interest only. It does not reserve final inventory, guarantee price, confirm specifications, or require payment." },
        { title: "Prototype status", body: "BlackBox is in prototype development. Performance, compatibility, materials, availability, and shipping windows may change before launch." },
        { title: "Site content", body: "Strygonia names, graphics, product concepts, and site assets are presented for Strygonia and may not be reused as a competing product identity without permission." },
      ];

  return (
    <main className="relative min-h-screen overflow-hidden px-6 pt-32 pb-24" style={{ background: "var(--ark-bg)" }}>
      <CircuitBackdrop tint="neutral" image={arcticIce} />
      <div className="relative z-20 max-w-4xl mx-auto">
        <BackBar onHome={onHome} />
        <Panel className="p-8 md:p-12">
          <Eyebrow>Strygonia</Eyebrow>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "clamp(2.1rem, 4.1vw, 3.4rem)", lineHeight: 1, letterSpacing: "0", color: "var(--ark-ink)", marginBottom: "1rem" }}>
            {isPrivacy ? "Privacy Policy" : isAccessibility ? "Accessibility Statement" : "Terms of Service"}
          </h1>
          <p style={{ fontFamily: BODY, fontSize: "0.95rem", color: "var(--ark-ink-dim)", lineHeight: 1.75, maxWidth: "42rem", marginBottom: "2rem" }}>
            Last updated {isPrivacy ? PRIVACY_POLICY_LAST_UPDATED : isAccessibility ? ACCESSIBILITY_LAST_UPDATED : "July 9, 2026"}.
            {isPrivacy ? ` ${PRIVACY_POLICY_INTRO}` : isAccessibility ? " This statement describes how we approach accessibility on the Strygonia website." : " This page covers the current Strygonia prototype website and reserve flow."}
          </p>

          {isAccessibility && (
            <div className="mb-8 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.10)" }}>
              <div>
                <h2 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.2rem", color: "var(--ark-ink)", marginBottom: "0.35rem" }}>Accessibility mode</h2>
                <p style={{ fontFamily: BODY, fontSize: "0.92rem", color: "var(--ark-ink-dim)", lineHeight: 1.65 }}>Turn on high-contrast reading mode across the site.</p>
              </div>
              <button onClick={onToggleA11y} className="ark-focus inline-flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all" style={{ fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", background: a11y ? "#fff" : "rgba(28,25,23,0.05)", border: a11y ? "1px solid #000" : "1px solid var(--ark-line)", color: a11y ? "#000" : "var(--ark-ink)" }} aria-pressed={a11y} aria-label="Toggle accessibility mode">
                {a11y ? <EyeOff size={14} /> : <Eye size={14} />}
                {a11y ? "Exit accessibility mode" : "Enable accessibility mode"}
              </button>
            </div>
          )}

          {isPrivacy && (
            <div className="mb-8 p-5 rounded-xl" style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.10)" }}>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.2rem", color: "var(--ark-ink)", marginBottom: "0.75rem" }}>Summary of key points</h2>
              <ul className="grid gap-2" style={{ fontFamily: BODY, fontSize: "0.92rem", color: "var(--ark-ink-dim)", lineHeight: 1.7, paddingLeft: "1.1rem" }}>
                {PRIVACY_POLICY_SUMMARY.map((point) => (<li key={point.slice(0, 40)}>{point}</li>))}
              </ul>
            </div>
          )}

          <div className="grid gap-6">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.35rem", color: "var(--ark-ink)", marginBottom: "0.5rem" }}>{section.title}</h2>
                <p style={{ fontFamily: BODY, fontSize: "0.96rem", color: "var(--ark-ink-dim)", lineHeight: 1.75 }}>{section.body}</p>
              </section>
            ))}
          </div>
        </Panel>
      </div>
    </main>
  );
}

/* ── Footer ───────────────────────────────────────────────────────── */
type FooterLinkItem = { label: string; action: () => void };
type FooterColumn = { title: string; links: FooterLinkItem[] };

function Footer({
  onLegalPage,
  onContact,
  onCareers,
  onProduct,
  onSpecs,
  onReserve,
  onSection,
}: {
  onLegalPage: (page: "privacy" | "terms" | "accessibility") => void;
  onContact: () => void;
  onCareers: () => void;
  onProduct: (id: ProductId) => void;
  onSpecs: () => void;
  onReserve: () => void;
  onSection: (section: string) => void;
}) {
  const columns: FooterColumn[] = [
    { title: "Products", links: [{ label: "BlackBox", action: () => onProduct("blackbox") }, { label: "Reserve", action: onReserve }] },
    { title: "Explore", links: [{ label: "Specs", action: onSpecs }, { label: "Team", action: () => onSection("team") }] },
    { title: "Company", links: [{ label: "Contact", action: onContact }, { label: "Careers", action: onCareers }] },
    { title: "Legal", links: [{ label: "Privacy", action: () => onLegalPage("privacy") }, { label: "Terms", action: () => onLegalPage("terms") }, { label: "Accessibility", action: () => onLegalPage("accessibility") }] },
  ];

  return (
    <footer className="ark-dark px-6 pt-14 pb-10 border-t relative" style={{ background: "var(--ark-bg)", borderColor: "var(--ark-line-soft)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-start gap-10 sm:gap-16 mb-10">
          <img
            src="/strygonia-lockup-dark.png"
            alt="Strygonia"
            className="rounded-lg flex-shrink-0"
            style={{ width: 180, height: "auto" }}
          />
          <div className="flex flex-wrap gap-x-10 gap-y-6">
            {columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-2.5">
                <span style={{ fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ark-faint)" }}>{col.title}</span>
                {col.links.map((link) => (
                  <button key={link.label} type="button" onClick={link.action} className="ark-focus transition-colors duration-200 text-left" style={{ fontFamily: BODY, fontSize: "0.84rem", color: "var(--ark-muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    {link.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" style={{ borderTop: "1px solid var(--ark-line-soft)" }}>
          <p style={{ fontFamily: BODY, fontSize: "0.72rem", color: "var(--ark-faint)" }}>© 2026 Strygonia, Inc.</p>
          <p style={{ fontFamily: BODY, fontSize: "0.68rem", color: "var(--ark-faint)", letterSpacing: "0.04em" }}>Debug · Test · Probe · Diagnose</p>
        </div>
      </div>
    </footer>
  );
}

/* ── Root ─────────────────────────────────────────────────────────── */
type Page = "home" | "reserve" | "contact" | "specs" | "careers" | "privacy" | "terms" | "accessibility" | ProductId;

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [page, setPage] = useState<Page>("home");
  const [reserveProduct, setReserveProduct] = useState<ProductId>("blackbox");
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const [a11y, setA11y] = useState(false);

  useSmoothScroll();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("a11y-mode", a11y);
  }, [a11y]);

  const go = (next: Page) => {
    setPage(next);
    requestAnimationFrame(() => scrollToTop());
  };
  const goHome = () => go("home");
  const goReserve = (product?: ProductId) => {
    if (product) setReserveProduct(product);
    go("reserve");
  };
  const goContact = () => go("contact");
  const goSpecs = () => go("specs");
  const goCareers = () => go("careers");
  const goLegal = (p: "privacy" | "terms" | "accessibility") => go(p);
  const goProduct = (id: ProductId) => go(id);
  const goSection = (section: string) => {
    if (page !== "home") {
      // Switch to home first, then scroll once the home layout has mounted —
      // see the effect below. Scrolling synchronously here would target the
      // old page's DOM and land nowhere, forcing a second click.
      setPendingSection(section);
      setPage("home");
    } else {
      scrollToId(section);
    }
  };

  // Runs after the home page has rendered following a section request from
  // another page, so the target element exists and the scroll lands first try.
  useEffect(() => {
    if (page !== "home" || !pendingSection) return;
    const section = pendingSection;
    setPendingSection(null);
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToId(section)));
  }, [page, pendingSection]);

  return (
    <div className="relative" style={{ fontFamily: BODY, background: "var(--ark-bg)", color: "var(--ark-ink)" }}>
      <Navbar
        scrolled={scrolled}
        onHome={goHome}
        onReserve={() => goReserve()}
        onContact={goContact}
        onSpecs={goSpecs}
        onProduct={goProduct}
        onSection={goSection}
      />

      {page === "home" ? (
        <>
          <Hero onBlackBox={() => goProduct("blackbox")} />
          <ToolMarquee />
          <Products onProduct={goProduct} onReserve={() => goReserve()} />
          <div className="ark-dark">
            <BlackBoxExploded
              title="Every layer, accounted for."
              subtitle="The V1 comes apart the way it goes together: printed shell, radio module, carrier PCB, bottom plate."
            />
          </div>
          {/* gradient bridge: dark → sand */}
          <div aria-hidden style={{ height: 120, background: "linear-gradient(180deg, #0c0c0c 0%, #f0ebe4 100%)" }} />
          <Team />
          {/* gradient bridge: sand → dark */}
          <div aria-hidden style={{ height: 120, background: "linear-gradient(180deg, #f0ebe4 0%, #0c0c0c 100%)" }} />
          <CTA onReserve={() => goReserve()} onContact={goContact} />
        </>
      ) : page === "reserve" ? (
        <ReservePage onHome={goHome} initialProduct={reserveProduct} />
      ) : page === "contact" ? (
        <ContactPage onHome={goHome} />
      ) : page === "specs" ? (
        <SpecsPage onHome={goHome} onReserve={() => goReserve()} />
      ) : page === "careers" ? (
        <CareersPage onHome={goHome} />
      ) : page in PRODUCTS ? (
        <ProductDescriptionPage
          product={PRODUCTS[page as ProductId]}
          onHome={goHome}
          onBack={goHome}
          backLabel="All products"
          onReserve={() => goReserve(page as ProductId)}
          onContact={goContact}
        />
      ) : (
        <LegalPage type={page as "privacy" | "terms" | "accessibility"} onHome={goHome} a11y={a11y} onToggleA11y={() => setA11y((v) => !v)} />
      )}

      <Footer
        onLegalPage={goLegal}
        onContact={goContact}
        onCareers={goCareers}
        onProduct={goProduct}
        onSpecs={goSpecs}
        onReserve={() => goReserve()}
        onSection={goSection}
      />
      <CookieBanner onPrivacy={() => goLegal("privacy")} />
    </div>
  );
}

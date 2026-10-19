import { ArrowRight, CircuitBoard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFounders } from "@/lib/founders";

const BODY = "var(--ark-body)";
const DISPLAY = "var(--ark-display)";
const CAP = 10;

/* One tile per Founder's Edition unit: claimed units are solid blue, unclaimed ones light up in turn. */
function Tiles({ size, claimed }: { size: number; claimed: number }) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2" role="img" aria-label={`${claimed} of ${CAP} Founder's Edition units claimed`}>
      {Array.from({ length: CAP }, (_, i) => (
        <div key={i} className={`${i < claimed ? "ark-slot-claimed" : "ark-slot"} aspect-square rounded-md flex items-center justify-center`} style={{ animationDelay: `${i * 0.16}s` }}>
          <CircuitBoard size={size} />
        </div>
      ))}
    </div>
  );
}

function Badge({ soldOut }: { soldOut: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5" style={{ border: "1px solid rgba(96,165,250,0.4)", background: "rgba(37,99,235,0.14)", color: "#93c5fd", fontFamily: BODY, fontSize: "0.74rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
      {!soldOut && <span className="ark-led inline-block w-2 h-2 rounded-full" style={{ background: "#60a5fa" }} />}
      {soldOut ? "Founder's Edition · sold out" : `Founder's Edition · ${CAP} units`}
    </span>
  );
}

function Count({ remaining, soldOut }: { remaining: number; soldOut: boolean }) {
  return (
    <p style={{ fontFamily: BODY, fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.04em", color: "#93c5fd", marginTop: "0.7rem" }}>
      {soldOut ? `All ${CAP} claimed` : `${remaining} of ${CAP} left`}
    </p>
  );
}

const RULE = `The first ${CAP} BlackBox units sold are the Founder's Edition. After those ${CAP}, BlackBox is sold as the standard edition at the same $199.`;

export function FoundersEdition({ onReserve, onContact, compact = false }: { onReserve?: () => void; onContact?: () => void; compact?: boolean }) {
  const founders = useFounders();
  const claimed = founders?.claimed ?? 0;
  const soldOut = founders?.soldOut ?? false;

  if (compact) {
    return (
      <div className="ark-dark relative overflow-hidden rounded-lg p-6" style={{ background: "var(--ark-bg)", border: "1px solid rgba(96,165,250,0.3)" }}>
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(70% 80% at 0% 0%, rgba(37,99,235,0.28), transparent 70%)" }} />
        <div className="relative">
          <Badge soldOut={soldOut} />
          <p style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.6rem", lineHeight: 1.05, color: "var(--ark-ink)", margin: "1rem 0 0.5rem" }}>
            {soldOut ? "The Founder's Edition has sold out." : `One of only ${CAP}.`}
          </p>
          <p style={{ fontFamily: BODY, fontSize: "0.9rem", color: "var(--ark-ink-dim)", lineHeight: 1.65, marginBottom: "1.1rem" }}>
            {soldOut ? `All ${CAP} Founder's Edition units are claimed, so this order is a standard BlackBox at $199.` : RULE}
          </p>
          <Tiles size={14} claimed={claimed} />
          {founders && <Count remaining={founders.remaining} soldOut={soldOut} />}
        </div>
      </div>
    );
  }

  return (
    <section className="ark-dark relative overflow-hidden py-28 px-6" style={{ background: "var(--ark-bg)", borderTop: "1px solid var(--ark-line-soft)" }}>
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(55% 60% at 15% 35%, rgba(37,99,235,0.26), transparent 70%), radial-gradient(40% 50% at 90% 90%, rgba(37,99,235,0.12), transparent 70%)" }} />
      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[auto_1fr] gap-8 lg:gap-20 items-center">
        <div className="ark-shine select-none" aria-hidden style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(8rem, 20vw, 15rem)", lineHeight: 0.8, letterSpacing: "-0.04em" }}>
          {CAP}
        </div>
        <div>
          <Badge soldOut={soldOut} />
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(2.2rem, 4.4vw, 3.6rem)", lineHeight: 0.95, letterSpacing: "-0.01em", color: "var(--ark-ink)", margin: "1.2rem 0 1rem" }}>
            {soldOut ? `All ${CAP} are claimed.` : `Only the first ${CAP} boards.`}
          </h2>
          <p style={{ fontFamily: BODY, fontSize: "1.05rem", color: "var(--ark-ink-dim)", lineHeight: 1.8, maxWidth: "36rem" }}>
            {soldOut
              ? `Every Founder's Edition unit has found a home. Thank you to the first ${CAP}. BlackBox is still available as the standard edition at $199.`
              : `$199 gets you the unit, a USB-C cable, the wiring harness, and every firmware and app update as we ship them. ${RULE}`}
          </p>
          <div className="mt-8 max-w-xl">
            <Tiles size={18} claimed={claimed} />
            {founders && <Count remaining={founders.remaining} soldOut={soldOut} />}
          </div>
          {(onReserve || onContact) && (
            <div className="flex flex-wrap gap-4 mt-9">
              {onReserve && (
                <Button size="lg" onClick={onReserve}>
                  {soldOut ? "Buy BlackBox" : `Claim one of the ${CAP}`} <ArrowRight size={17} />
                </Button>
              )}
              {onContact && <Button variant="light" size="lg" onClick={onContact}>Questions?</Button>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

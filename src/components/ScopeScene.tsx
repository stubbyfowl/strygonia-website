/* The hero's backdrop: an oscilloscope screen. A faint graticule, and the 3.3 V rail
   sweeping across it until a brownout kills the board (the moment BlackBox exists to catch).
   Decorative only; the headline and copy sit on top. */

// Trace in a 1000 x 400 box, stretched to fit: healthy rail, a sag, the collapse, ringing, then dead.
const ripple = (x: number) => Math.sin(x * 0.11) * 1.6 + Math.sin(x * 0.037) * 1.2;
const HEALTHY = Array.from({ length: 194 }, (_, i) => `${i * 4},${(60 + ripple(i * 4)).toFixed(1)}`).join(" L");
const DEAD = Array.from({ length: 21 }, (_, i) => `${844 + i * 8},${(332 + ripple(i * 8) * 0.4).toFixed(1)}`).join(" L");
const TRACE = `M${HEALTHY} L786,110 L796,96 L806,330 L813,298 L820,346 L827,322 L834,338 L840,329 L${DEAD}`;

export function ScopeScene() {
  return (
    <div aria-hidden className="ark-scope absolute inset-0 pointer-events-none select-none">
      <div className="ark-scope-grid absolute inset-0" />
      <div className="ark-scope-trace absolute inset-x-0">
        <svg className="ark-scope-sweep absolute inset-0 w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
          <path d={TRACE} fill="none" stroke="#60a5fa" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </div>
  );
}

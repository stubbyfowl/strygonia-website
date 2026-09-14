import { useEffect, useMemo, useRef, useState } from "react";
import { Play } from "lucide-react";

/* ── The signature element ────────────────────────────────────────────
   A board's final seconds, recorded. Deliberately readable by someone who
   has never used an oscilloscope: one line (power), three plain-language
   moments, and a single sentence saying what just happened.
─────────────────────────────────────────────────────────────────────── */

const DURATION = 5.5; // seconds of recording
const W = 660;
const H = 150;
const PAD_L = 10;
const PLOT_W = W - PAD_L * 2;

const TOP = 18;
const BOT = 128;
const V_MIN = 0;
const V_MAX = 3.6;

type Moment = { t: number; label: string; caption: string; fault?: boolean };

/* The three beats of the story, in the customer's words — not "brownout /
   watchdog / reset", which only means something to an embedded engineer. */
const MOMENTS: Moment[] = [
  { t: 0.8, label: "Running fine", caption: "Board is powered and running normally." },
  { t: 4.3, label: "Power drops", caption: "Power dips below what the board needs to stay alive." },
  { t: 5.15, label: "Board dies", caption: "Power collapses and the board resets.", fault: true },
];

function voltageAt(t: number): number {
  if (t < 3.9) return 3.3 + Math.sin(t * 5) * 0.02; // steady
  if (t < 4.6) return 3.3 - (t - 3.9) * 0.7; // sags under load
  if (t < 5.05) return 2.81 - (t - 4.6) * 1.4; // falls off
  return 0.15; // dead
}

const xAt = (t: number) => PAD_L + (t / DURATION) * PLOT_W;
const yAt = (v: number) => BOT - ((v - V_MIN) / (V_MAX - V_MIN)) * (BOT - TOP);

function buildPath() {
  const pts: string[] = [];
  const N = 240;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * DURATION;
    pts.push(`${i === 0 ? "M" : "L"}${xAt(t).toFixed(1)} ${yAt(voltageAt(t)).toFixed(1)}`);
  }
  return pts.join(" ");
}

export function RewindTimeline() {
  const [pos, setPos] = useState(0.62); // parked while the board is still healthy
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number | null>(null);

  const path = useMemo(buildPath, []);

  const t = pos * DURATION;
  const v = voltageAt(t);
  const px = xAt(t);
  const dead = v < 1;
  const failing = v < 3.0;

  /* The most recent thing that happened at this point in the recording. */
  const moment = useMemo(() => {
    let cur = MOMENTS[0];
    for (const m of MOMENTS) if (t >= m.t) cur = m;
    return cur;
  }, [t]);

  const stop = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    setPlaying(false);
  };

  const replay = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPos(0.98);
      return;
    }
    if (raf.current) cancelAnimationFrame(raf.current);
    setPlaying(true);
    setPos(0);
    const start = performance.now();
    const dur = 4200;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setPos(p);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => {
    if (raf.current) cancelAnimationFrame(raf.current);
  }, []);

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: "var(--ark-panel-2)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid var(--ark-line)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
      }}
    >
      {/* header */}
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--ark-line-soft)" }}>
        <span style={{ fontFamily: "var(--ark-body)", fontSize: "0.95rem", fontWeight: 600, color: "var(--ark-ink)" }}>
          The last 5 seconds before a board died
        </span>
        <button
          type="button"
          onClick={playing ? stop : replay}
          className="ark-focus inline-flex items-center gap-2 px-4 py-2 rounded-md transition-colors"
          style={{
            fontFamily: "var(--ark-body)",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--ark-btn-ink)",
            background: "var(--ark-signal)",
            border: "none",
          }}
        >
          <Play size={12} />
          {playing ? "Playing" : "Play it back"}
        </button>
      </div>

      {/* one trace: power */}
      <div className="px-4 pt-5">
        <span className="block mb-1" style={{ fontFamily: "var(--ark-body)", fontSize: "0.82rem", color: "var(--ark-muted)" }}>
          Power reaching the board
        </span>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="A recording of the power reaching the board over its final seconds, dropping away at the end">
          {/* the one reference line that matters: healthy power */}
          <line x1={PAD_L} y1={yAt(3.3)} x2={W - PAD_L} y2={yAt(3.3)} stroke="var(--ark-line)" strokeWidth="1" strokeDasharray="4 5" />
          <text x={W - PAD_L} y={yAt(3.3) - 8} textAnchor="end" fontFamily="var(--ark-body)" fontSize="13" fill="var(--ark-muted)">
            Healthy level
          </text>

          {/* full recording, dimmed */}
          <path d={path} fill="none" stroke="var(--ark-signal)" strokeOpacity="0.2" strokeWidth="2.4" strokeLinecap="round" />

          {/* the part you've watched so far */}
          <clipPath id="rw-clip">
            <rect x="0" y="0" width={px} height={H} />
          </clipPath>
          <path
            d={path}
            fill="none"
            stroke={failing ? "#ffffff" : "var(--ark-signal)"}
            strokeWidth="3"
            strokeLinecap="round"
            clipPath="url(#rw-clip)"
            style={{ filter: "drop-shadow(0 0 6px rgba(168,203,232,0.45))" }}
          />

          {/* playhead */}
          <line x1={px} y1={TOP - 6} x2={px} y2={BOT + 6} stroke="#fff" strokeOpacity="0.55" strokeWidth="1.4" />
          <circle cx={px} cy={yAt(v)} r="6" fill={failing ? "#ffffff" : "var(--ark-signal)"} stroke="#05070c" strokeWidth="2" />
        </svg>
      </div>

      {/* scrubber + three plain-language moments */}
      <div className="px-5 pt-2 pb-4">
        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round(pos * 1000)}
          onChange={(e) => {
            stop();
            setPos(Number(e.target.value) / 1000);
          }}
          aria-label="Drag to rewind through the recording"
          className="ark-range w-full"
        />
        <div className="flex justify-between mt-2">
          {MOMENTS.map((m) => {
            const active = moment.label === m.label;
            return (
              <button
                key={m.label}
                type="button"
                onClick={() => {
                  stop();
                  setPos(m.t / DURATION);
                }}
                className="ark-focus"
                style={{
                  fontFamily: "var(--ark-body)",
                  fontSize: "0.82rem",
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--ark-ink)" : "var(--ark-muted)",
                  background: "none",
                  border: "none",
                  padding: "2px 0",
                  cursor: "pointer",
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* one sentence saying what's happening right now */}
      <div className="px-5 py-4 flex items-center gap-3" style={{ borderTop: "1px solid var(--ark-line-soft)", background: "var(--ark-bg-2)" }}>
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: dead ? "#ffffff" : failing ? "var(--ark-fault-2)" : "var(--ark-signal)" }}
        />
        <span style={{ fontFamily: "var(--ark-body)", fontSize: "0.92rem", color: "var(--ark-ink-dim)", lineHeight: 1.5 }}>
          {moment.caption}
        </span>
      </div>
    </div>
  );
}

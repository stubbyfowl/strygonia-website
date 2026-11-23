import { Component, Suspense, lazy, useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";

const LiquidMark = lazy(() => import("./LiquidMark"));

/* The mark's silhouette in silver: shown until the shader is ready, and for good if it can't run. */
function Silhouette() {
  return <img src="/strygonia-mark.webp" alt="" draggable={false} className="block w-full h-full object-contain" style={{ filter: "brightness(0) invert(0.82)" }} />;
}

/* A device without WebGL must not take the page down with it (this sits in the navbar). */
class ShaderGuard extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/* True while the element is on or near the screen, so shaders only run where they can be seen. */
function useNear(ref: RefObject<Element | null>) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: "300px" });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [ref]);
  return near;
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* The Strygonia mark in liquid chrome. Decorative. */
export function ChromeMark({ className = "", style }: { className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNear(ref);
  const [still] = useState(reducedMotion);
  return (
    <div ref={ref} aria-hidden className={`ark-chrome ${className}`} style={style}>
      {near ? (
        <ShaderGuard fallback={<Silhouette />}>
          <Suspense fallback={<Silhouette />}>
            <LiquidMark still={still} />
          </Suspense>
        </ShaderGuard>
      ) : (
        <Silhouette />
      )}
    </div>
  );
}

/* A word in liquid chrome. It stays real text, painted in a silver gradient (that's also what
   shows before the shader is ready, or if it can't run). The shader then draws over it, using
   the word redrawn in the element's own font so the two line up exactly. */
export function ChromeText({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const near = useNear(ref);
  const [still] = useState(reducedMotion);
  const [shape, setShape] = useState<{ src: string; padX: number; padY: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const draw = async () => {
      await document.fonts.ready;
      const cs = getComputedStyle(el);
      const size = parseFloat(cs.fontSize);
      const lineHeight = parseFloat(cs.lineHeight) || size;
      // Room around the box: glyphs overhang a tight line height.
      const padX = size * 0.2;
      const padY = size * 0.35;
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil((el.offsetWidth + 2 * padX) * scale);
      canvas.height = Math.ceil((el.offsetHeight + 2 * padY) * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(scale, scale);
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${size}px ${cs.fontFamily}`;
      const m = ctx.measureText(children);
      // Same baseline as the browser's layout: half the leading, then the font's ascent.
      const baseline = (lineHeight - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;
      ctx.fillText(children, padX, padY + baseline);
      setShape({ src: canvas.toDataURL(), padX, padY });
    };
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [children]);

  return (
    <span ref={ref} className="ark-chrome-text relative inline-block">
      {children}
      {near && shape && (
        <span aria-hidden className="ark-chrome absolute pointer-events-none" style={{ left: -shape.padX, right: -shape.padX, top: -shape.padY, bottom: -shape.padY }}>
          <ShaderGuard fallback={null}>
            <Suspense fallback={null}>
              <LiquidMark still={still} image={shape.src} />
            </Suspense>
          </ShaderGuard>
        </span>
      )}
    </span>
  );
}

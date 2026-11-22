import { Suspense, lazy, useEffect, useRef, useState, type CSSProperties } from "react";

const LiquidMark = lazy(() => import("./LiquidMark"));

/* The Strygonia mark in liquid chrome. Decorative. The shader loads only when the mark is
   near the screen, and stops when it leaves. */
export function ChromeMark({ className = "", style }: { className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [still] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: "300px" });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} aria-hidden className={`ark-chrome ${className}`} style={style}>
      {near && (
        <Suspense fallback={null}>
          <LiquidMark still={still} />
        </Suspense>
      )}
    </div>
  );
}

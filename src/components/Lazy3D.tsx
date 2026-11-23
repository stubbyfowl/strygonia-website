import { Suspense, lazy, useEffect, useRef, useState, type ComponentProps } from "react";

/* The three 3D pieces in their own chunks, so three.js stays out of the first load.
   Each placeholder takes the same space as the real thing, so nothing moves when it arrives. */
const Exploded = lazy(() => import("./BlackBoxExploded").then((m) => ({ default: m.BlackBoxExploded })));
const Viewer = lazy(() => import("./BlackBoxViewer").then((m) => ({ default: m.BlackBoxViewer })));
const Case = lazy(() => import("./CaseViewer").then((m) => ({ default: m.CaseViewer })));

const ViewerBox = () => <div className="w-full" style={{ aspectRatio: "4 / 3.2" }} />;

export function LazyBlackBoxViewer() {
  return (
    <Suspense fallback={<ViewerBox />}>
      <Viewer />
    </Suspense>
  );
}

export function LazyCaseViewer(props: ComponentProps<(typeof import("./CaseViewer"))["CaseViewer"]>) {
  return (
    <Suspense fallback={<ViewerBox />}>
      <Case {...props} />
    </Suspense>
  );
}

/* The exploded view (and its 2 MB model) loads about a screen before it scrolls into view. */
export function LazyExploded(props: ComponentProps<(typeof import("./BlackBoxExploded"))["BlackBoxExploded"]>) {
  const ref = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  const [reduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  // Same height as the exploded view's scroll track (BlackBoxExploded).
  const track = { height: reduced ? "100vh" : "320vh", background: "var(--ark-bg)" };
  if (!near) return <section ref={ref} aria-hidden style={track} />;
  return (
    <Suspense fallback={<section aria-hidden style={track} />}>
      <Exploded {...props} />
    </Suspense>
  );
}

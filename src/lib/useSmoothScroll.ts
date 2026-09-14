import { useEffect } from "react";
import Lenis from "lenis";

/* Stripe-style inertial scrolling. Disabled when the user prefers reduced
   motion, and exposes the Lenis instance on window for anchor scrolls. */
declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.16,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.5,
      syncTouch: true,
    });
    window.__lenis = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);
}

/** Smoothly scroll to top (works with or without Lenis). */
export function scrollToTop() {
  if (window.__lenis) {
    window.__lenis.scrollTo(0, { immediate: false });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/** Smoothly scroll to an element id (accounts for the fixed header). */
export function scrollToId(id: string, offset = 84) {
  const el = document.getElementById(id);
  if (!el) {
    scrollToTop();
    return;
  }
  if (window.__lenis) {
    // Recompute scroll bounds first — after a page switch the document height
    // has changed, and a stale max-scroll would clamp us short of the target.
    window.__lenis.resize();
    window.__lenis.scrollTo(el, { offset: -offset });
  } else {
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
}

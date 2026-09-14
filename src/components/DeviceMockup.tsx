/* Product render. BlackBox uses the real V1 render. */

import { images } from "@/assets/images";

const RENDERS: Record<"blackbox", { src: string; alt: string }> = {
  blackbox: { src: images.blackbox1, alt: "BlackBox V1 recorder on a workbench — USB-C, trigger button, and universal interface header visible" },
};

export function DeviceMockup({
  kind,
  className = "",
}: {
  kind: "blackbox";
  className?: string;
}) {
  const render = RENDERS[kind];
  return (
    <img
      src={render.src}
      alt={render.alt}
      loading="lazy"
      className={`block rounded-md ${className}`}
      style={{ objectFit: "contain" }}
    />
  );
}

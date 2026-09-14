/* Layout passthroughs. These used to run scroll-triggered fade-in-up
   reveals; the design calls for content to be present on arrival, so they
   now only carry layout classes. Kept as components so call sites and
   spacing stay unchanged. */

export function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
  /** Accepted for call-site compatibility; no longer animated. */
  variant?: "up" | "fade" | "scale";
  delay?: number;
  once?: boolean;
}) {
  return <div className={className}>{children}</div>;
}

export function RevealGroup({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  once?: boolean;
}) {
  return <div className={className}>{children}</div>;
}

export function RevealItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "up" | "fade" | "scale";
}) {
  return <div className={className}>{children}</div>;
}

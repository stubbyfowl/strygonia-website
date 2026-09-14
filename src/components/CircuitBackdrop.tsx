type Tint = "signal" | "deep" | "neutral";

export function CircuitBackdrop({
  grid = true,
  image,
  position = "center center",
  scrim = "none",
  className = "",
}: {
  tint?: Tint;
  grid?: boolean;
  image?: string;
  position?: string;
  scrim?: "left" | "veil" | "none";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
    >
      <div className="absolute inset-0" style={{ background: "var(--ark-bg)" }} />

      {image ? (
        <>
          <img
            src={image}
            alt=""
            decoding="async"
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: position, imageRendering: "auto" }}
          />

          {scrim === "left" && (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.28) 38%, rgba(0,0,0,0.12) 65%, transparent 100%)",
              }}
            />
          )}
          {scrim === "veil" && (
            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.3)" }} />
          )}
        </>
      ) : (
        grid && (
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(var(--ark-line-soft) 1px, transparent 1px), linear-gradient(90deg, var(--ark-line-soft) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
              maskImage: "radial-gradient(ellipse at 50% 40%, #000 40%, transparent 78%)",
              WebkitMaskImage: "radial-gradient(ellipse at 50% 40%, #000 40%, transparent 78%)",
            }}
          />
        )
      )}
    </div>
  );
}

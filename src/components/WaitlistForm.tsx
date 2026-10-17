import { useId, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitForm } from "@/lib/forms";

const BODY = "var(--ark-body)";
const DISPLAY = "var(--ark-display)";

/* Off-screen field people never see. Bots fill in every field, and the server drops those. */
export const HONEYPOT = (
  <input type="text" name="bb_hp" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] w-px h-px opacity-0" />
);

export function WaitlistForm({ page, compact = false }: { page: string; compact?: boolean }) {
  const id = useId();
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setStatus("sending");
    try {
      const result = await submitForm("waitlist", { email: String(data.get("email") ?? ""), bb_hp: String(data.get("bb_hp") ?? ""), page });
      setMessage(result.already ? "You're already on the list. We'll email you when BlackBox ships." : "You're on the list. We'll email you when BlackBox ships.");
      setStatus("done");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: DISPLAY, fontWeight: compact ? 600 : 700, fontSize: compact ? "1.4rem" : "clamp(1.8rem, 3.2vw, 2.6rem)", lineHeight: 1.05, color: "var(--ark-ink)" }}>
        Get notified when BlackBox ships
      </h2>
      <p style={{ fontFamily: BODY, fontSize: compact ? "0.95rem" : "1.02rem", color: "var(--ark-ink-dim)", lineHeight: 1.75, marginTop: compact ? "0.6rem" : "1rem", maxWidth: "34rem" }}>
        Leave your email and we'll tell you the moment it's ready.
      </p>

      {status === "done" ? (
        <p role="status" className="inline-flex items-center gap-2 mt-6 rounded-full px-5 py-3 border" style={{ fontFamily: BODY, fontSize: "0.95rem", color: "var(--ark-signal)", background: "var(--ark-signal-soft)", borderColor: "var(--ark-signal-glow)" }}>
          <Check size={17} /> {message}
        </p>
      ) : (
        <form onSubmit={onSubmit} className="relative flex flex-col sm:flex-row gap-3 mt-6 max-w-xl">
          {HONEYPOT}
          <label htmlFor={`${id}-email`} className="sr-only">Email address</label>
          <input
            id={`${id}-email`}
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            onChange={() => status === "error" && setStatus("idle")}
            className="ark-focus flex-1 min-w-0 h-14 rounded-full px-5 border outline-none"
            style={{ fontFamily: BODY, fontSize: "1rem", background: "var(--ark-panel)", borderColor: "var(--ark-line)", color: "var(--ark-ink)" }}
          />
          <Button type="submit" size="lg" disabled={status === "sending"} className="ark-pill">
            {status === "sending" ? "Adding you..." : "Notify me"} {status !== "sending" && <ArrowRight size={17} />}
          </Button>
        </form>
      )}
      {status === "error" && (
        <p role="alert" style={{ fontFamily: BODY, fontSize: "0.85rem", color: "var(--ark-fault)", marginTop: "0.6rem" }}>{message}</p>
      )}
    </div>
  );
}

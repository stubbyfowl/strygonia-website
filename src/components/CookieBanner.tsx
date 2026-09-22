import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CircuitBoard, X } from "lucide-react";

const CONSENT_KEY = "strygonia-cookie-consent";

export function CookieBanner({ onPrivacy }: { onPrivacy: () => void }) {
  const [visible, setVisible] = useState(false);
  const [decided, setDecided] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = (choice: "accepted" | "declined") => {
    localStorage.setItem(CONSENT_KEY, choice);
    setDecided(true);
    setTimeout(() => setVisible(false), 400);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cookie-banner"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: decided ? 0 : 1, y: decided ? 16 : 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-3xl px-4"
        >
          <div
            className="relative rounded-lg"
            style={{
              background: "#484d56",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
            }}
          >
            <button
              onClick={() => dismiss("declined")}
              className="absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-lg transition-colors duration-150 hover:bg-white/[0.1]"
              style={{ color: "rgba(160,200,255,0.45)" }}
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>

            <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 pr-12">
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-xl w-11 h-11"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
              >
                <CircuitBoard
                  size={20}
                  style={{ color: "#e5e7eb" }}
                  strokeWidth={1.5}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p
                  style={{
                    fontFamily: "var(--ark-body)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "#cfd3da",
                    marginBottom: "4px",
                  }}
                >
                  Cookie Preferences
                </p>
                <p
                  style={{
                    fontFamily: "var(--ark-body)",
                    fontWeight: 400,
                    fontSize: "0.875rem",
                    color: "#c8ccd2",
                    lineHeight: 1.6,
                  }}
                >
                  We use cookies to improve your experience and analyse site traffic.{" "}
                  <button
                    onClick={onPrivacy}
                    style={{
                      color: "#ffffff",
                      textDecoration: "underline",
                      textUnderlineOffset: "2px",
                      fontFamily: "inherit",
                      fontWeight: 400,
                      fontSize: "inherit",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    Privacy Policy
                  </button>
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0">
                <button
                  onClick={() => dismiss("declined")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-all duration-200 hover:bg-white/[0.06] border"
                  style={{
                    fontFamily: "var(--ark-body)",
                    fontWeight: 400,
                    background: "transparent",
                    borderColor: "rgba(255,255,255,0.28)",
                    color: "#d4d7dc",
                  }}
                >
                  Decline
                </button>
                <button
                  onClick={() => dismiss("accepted")}
                  className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-colors duration-150 hover:bg-white"
                  style={{
                    fontFamily: "var(--ark-body)",
                    fontWeight: 600,
                    background: "#e8eaee",
                    color: "#23262b",
                  }}
                >
                  <span className="relative">Accept All</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

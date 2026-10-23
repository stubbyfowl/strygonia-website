import { CASE_COLOURS, type CaseColour } from "@/constants/catalog";

const BODY = "var(--ark-body)";

/* Pill buttons for the case colour. With `allowNone`, the first option is "No case". */
export function CaseColourPicker({
  value,
  onChange,
  allowNone = false,
  priceSuffix,
}: {
  value: CaseColour | null;
  onChange: (colour: CaseColour | null) => void;
  allowNone?: boolean;
  priceSuffix?: string;
}) {
  const options: (CaseColour | null)[] = allowNone ? [null, "white", "black"] : ["white", "black"];
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Case colour">
      {options.map((c) => {
        const selected = value === c;
        return (
          <button
            key={c ?? "none"}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(c)}
            className="ark-focus inline-flex items-center gap-2 rounded-full px-3.5 py-2 transition-colors"
            style={{
              fontFamily: BODY,
              fontSize: "0.85rem",
              fontWeight: selected ? 600 : 500,
              color: selected ? "var(--ark-ink)" : "var(--ark-ink-dim)",
              background: selected ? "var(--ark-signal-soft)" : "transparent",
              border: `1.5px solid ${selected ? "var(--ark-signal)" : "var(--ark-line)"}`,
              cursor: "pointer",
            }}
          >
            {c && <span aria-hidden className="inline-block w-3.5 h-3.5 rounded-full" style={{ background: CASE_COLOURS[c].hex, border: "1px solid rgba(28,25,23,0.25)" }} />}
            {c ? CASE_COLOURS[c].name : "No case"}
            {c && priceSuffix && <span style={{ color: "var(--ark-muted)", fontWeight: 400 }}>{priceSuffix}</span>}
          </button>
        );
      })}
    </div>
  );
}

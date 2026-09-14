export type ProductId = "blackbox";

/* Icon keys are resolved to lucide components on the product page — keeping
   them as strings lets this stay a plain data module. */
export type SignalIcon = "gauge" | "activity" | "terminal" | "zap" | "board" | "radio";

export type ProductSpec = {
  id: ProductId;
  code: string;
  division: "instruments";
  name: string;
  kind: string;
  tagline: string;
  /* The homepage teaser. The full `summary` belongs on the product page —
     the index should sell the idea, not deliver the whole datasheet. */
  shortSummary: string;
  summary: string;
  features: string[];
  /* Full detail, product page only. */
  chain: { step: string; detail: string }[];
  signals: { icon: SignalIcon; title: string; body: string }[];
  inTheBox: string[];
  specs: { label: string; value: string }[];
  status: string;
  mockup: "blackbox";
  reserveLabel: string;
};

export const PRODUCTS: Record<ProductId, ProductSpec> = {
  blackbox: {
    id: "blackbox",
    code: "SG-BB1",
    division: "instruments",
    name: "BlackBox",
    kind: "Hardware flight recorder",
    tagline: "Rewind the moment your board died.",
    shortSummary:
      "A small module you clip onto almost any embedded system and leave running. When the board dies, you scrub back through the recording and watch it happen instead of trying to make it happen again.",
    summary:
      "BlackBox is a small module you clip onto almost any embedded system — a breadboard, a Raspberry Pi, a custom PCB — and leave running. It keeps a rolling record of the signals you check first when something goes wrong. So instead of trying to make a crash happen again, you just scrub back through the timeline and watch it play out.",
    features: [
      "Watches power-rail voltage on up to two rails and flags brownouts and startup dips",
      "Tracks board current the whole time, and marks the spikes and odd draws when they happen",
      "Captures every line of UART — boot logs, debug prints — each one timestamped",
      "Catches resets as they land, whether it's the watchdog, a brownout, or your finger on the button",
      "Four GPIO inputs you can name, plus one analog channel for whatever else you're watching",
      "One color-coded harness for breadboards, Pi headers, and test points; one USB-C cable to the app",
    ],
    chain: [
      { step: "Your board", detail: "Whatever you're already working on — breadboard, Raspberry Pi, or a custom PCB." },
      { step: "The harness", detail: "One color-coded bundle clips onto power, ground, UART, reset, and the pins you pick." },
      { step: "BlackBox", detail: "Sits beside the board and samples every channel against one shared clock." },
      { step: "Rolling buffer", detail: "Onboard memory keeps the most recent window, overwriting the oldest as it goes." },
      { step: "USB-C", detail: "A single cable carries both power and the recording back to your machine." },
      { step: "The timeline", detail: "Desktop app you scrub through — graphs, event markers, and the serial log lined up." },
    ],
    signals: [
      { icon: "gauge", title: "Power rails", body: "Up to 2 rails, with brownout and startup-dip detection. Every change is timestamped, so you can see exactly when the voltage left its healthy band." },
      { icon: "activity", title: "Current", body: "Board current the whole time, from a high-side sensor that flags spikes and unusual draws as they happen — the tell for a short or a stalled motor." },
      { icon: "terminal", title: "UART", body: "Full serial capture. Boot logs and firmware debug output, timestamped against the same clock as the analog channels so the print lines up with the fault." },
      { icon: "zap", title: "Reset line", body: "Watchdog, brownout, and manual resets, caught the moment they land — so you know whether the board fell over or was pushed." },
      { icon: "board", title: "GPIO ×4", body: "Four configurable inputs you name yourself. Motor Enable, Fault Pin, chip select — whatever you happen to be chasing this week." },
      { icon: "radio", title: "Analog in", body: "One spare configurable channel for a battery rail, a thermistor, or any sensor output you want on the same timeline." },
    ],
    inTheBox: [
      "BlackBox V1 recorder in a printed enclosure",
      "Color-coded wiring harness with labelled leads",
      "USB-C cable for power and data",
      "Desktop timeline app for macOS, Windows, and Linux",
    ],
    specs: [
      { label: "Processor", value: "32-bit ARM microcontroller" },
      { label: "Current sensor", value: "High-side, precision" },
      { label: "Storage", value: "Onboard, rolling buffer" },
      { label: "Link", value: "USB-C to USB-C, power + data" },
      { label: "Targets", value: "Breadboard / Raspberry Pi / custom PCB" },
      { label: "Status", value: "V1 prototype" },
    ],
    status: "V1 prototype",
    mockup: "blackbox",
    reserveLabel: "Reserve a BlackBox",
  },
};

export const PRODUCT_IDS: ProductId[] = ["blackbox"];

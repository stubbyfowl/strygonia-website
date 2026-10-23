import { useSyncExternalStore } from "react";
import { CATALOG, MAX_QTY, type Sku } from "@/constants/catalog";

export type CartLine = { sku: Sku; qty: number };

const KEY = "strygonia-cart";

/* Cart lives in this browser only (localStorage), shared by every page and tab. */
function read(): CartLine[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((l): l is CartLine => !!l && typeof l === "object" && (l as CartLine).sku in CATALOG && Number.isInteger((l as CartLine).qty) && (l as CartLine).qty > 0)
      .map((l) => ({ sku: l.sku, qty: Math.min(l.qty, MAX_QTY) }));
  } catch {
    return [];
  }
}

let lines: CartLine[] = read();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

function save(next: CartLine[]) {
  lines = next.filter((l) => l.qty > 0);
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    // Storage blocked: the cart still works for this visit.
  }
  notify();
}

const qtyOf = (sku: Sku) => lines.find((l) => l.sku === sku)?.qty ?? 0;

export const cart = {
  setQty(sku: Sku, qty: number) {
    const q = Math.max(0, Math.min(MAX_QTY, Math.round(qty)));
    save(lines.some((l) => l.sku === sku) ? lines.map((l) => (l.sku === sku ? { ...l, qty: q } : l)) : [...lines, { sku, qty: q }]);
  },
  add(sku: Sku, qty = 1) {
    cart.setQty(sku, qtyOf(sku) + qty);
  },
  /* "Buy" buttons: make sure it's in the cart without stacking a second one on every click. */
  ensure(sku: Sku) {
    if (!qtyOf(sku)) cart.add(sku);
  },
  remove(sku: Sku) {
    save(lines.filter((l) => l.sku !== sku));
  },
  clear() {
    save([]);
  },
};

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      lines = read();
      notify();
    }
  });
}

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function useCart() {
  const current = useSyncExternalStore(subscribe, () => lines);
  return {
    lines: current,
    count: current.reduce((n, l) => n + l.qty, 0),
    total: current.reduce((n, l) => n + l.qty * CATALOG[l.sku].price, 0),
    has: (sku: Sku) => current.some((l) => l.sku === sku),
  };
}

import { images } from "@/assets/images";

export type Sku = "blackbox" | "case-white" | "case-black";
export type CaseColour = "white" | "black";

export const CASE_COLOURS: Record<CaseColour, { sku: Sku; name: string; hex: string }> = {
  white: { sku: "case-white", name: "Arctic White", hex: "#e6e6e4" },
  black: { sku: "case-black", name: "Stealth Black", hex: "#29292b" },
};

/* Display prices only. The charge itself comes from the server's own price list in
   api/create-payment-intent.js, so a visitor can't change what they pay. */
export const CATALOG: Record<Sku, { name: string; variant?: string; price: number; image: string }> = {
  blackbox: { name: "BlackBox", price: 199, image: images.blackbox1 },
  "case-white": { name: "BlackBox Case", variant: "Arctic White", price: 25, image: "/products/case/white-front-right.jpg" },
  "case-black": { name: "BlackBox Case", variant: "Stealth Black", price: 25, image: "/products/case/black-front-right.jpg" },
};

export const MAX_QTY = 10;

export const usd = (dollars: number) => `$${Number.isInteger(dollars) ? dollars : dollars.toFixed(2)}`;

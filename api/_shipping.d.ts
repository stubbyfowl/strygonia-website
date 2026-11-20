/* Types for the browser side of api/_shipping.js. */
export const DOMESTIC: Set<string>;
export const SHIP_COUNTRIES: string[];
export function quoteShipping(qty: Record<string, number>, address: { country: string; postal_code?: string }): { cents: number; service: string } | null;

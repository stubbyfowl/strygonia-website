import { useEffect, useState } from "react";

export type FoundersStatus = { cap: number; claimed: number; remaining: number; soldOut: boolean };

let request: Promise<FoundersStatus | null> | null = null;

/* Live Founder's Edition count from /api/founders: one fetch per page load, shared by every
   component that shows it. null while loading or if the count can't be fetched. */
export function useFounders() {
  const [status, setStatus] = useState<FoundersStatus | null>(null);
  useEffect(() => {
    request ??= fetch("/api/founders").then((r) => (r.ok ? r.json() : null)).catch(() => null);
    let live = true;
    request.then((s) => live && setStatus(s));
    return () => {
      live = false;
    };
  }, []);
  return status;
}

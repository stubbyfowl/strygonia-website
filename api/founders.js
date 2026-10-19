import { assignEditions, FOUNDERS_CAP } from "./_founders.js";

// Public count for the site's "N of 10 left" display. Cached at the edge for 30 s.
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { claimed } = await assignEditions();
    res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
    return res.status(200).json({ cap: FOUNDERS_CAP, claimed, remaining: FOUNDERS_CAP - claimed, soldOut: claimed >= FOUNDERS_CAP });
  } catch (err) {
    console.error("founders:", err.message);
    return res.status(500).json({ error: "Count unavailable" });
  }
}

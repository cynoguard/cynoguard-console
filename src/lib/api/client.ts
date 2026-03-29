// ─── Central API base URL ─────────────────────────────────────────
// Set NEXT_PUBLIC_API_URL in your .env.local (dev) or Vercel/hosting
// dashboard (production).
//
// Dev:        NEXT_PUBLIC_API_URL=http://localhost:4000
// Production: NEXT_PUBLIC_API_URL=https://api.cynoguard.com

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
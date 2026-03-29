// Proxy: GET /api/social-monitoring/stats
// → Fastify: GET /api/v1/projects/:projectId/mentions/stats

import { NextResponse } from "next/server";

const BACKEND = "https://api.cynoguard.com";
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID ?? "test-project-001";

export async function GET() {
  try {
    const res = await fetch(
      `${BACKEND}/api/v1/projects/${PROJECT_ID}/mentions/stats`,
      { cache: "no-store" }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}



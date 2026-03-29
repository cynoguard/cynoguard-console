// Proxy: POST /api/social-monitoring/scan
// → Fastify: POST /api/v1/projects/:projectId/mentions/scan

import { NextResponse } from "next/server";

const BACKEND = "https://api.cynoguard.com";
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID ?? "";

export async function POST() {
  try {
    const res = await fetch(
      `${BACKEND}/api/v1/projects/${PROJECT_ID}/mentions/scan`,
      { method: "POST", cache: "no-store" }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}
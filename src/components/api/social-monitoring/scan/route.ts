// Proxy: POST /api/social-monitoring/scan
// → Fastify: POST /api/v1/projects/:projectId/mentions/scan

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:4000";
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID ?? "test-project-001";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const res = await fetch(
      `${BACKEND}/api/v1/projects/${PROJECT_ID}/mentions/scan`,
      {
        method: "POST",
        cache: "no-store",
        headers: authHeader ? { Authorization: authHeader } : undefined,
      }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}

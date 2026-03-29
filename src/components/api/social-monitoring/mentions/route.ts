// Proxy: GET  /api/social-monitoring/mentions?page=&limit=&riskLevel=&status=&sentiment=
//        PATCH /api/social-monitoring/mentions/:id  (via ?id= param)
// → Fastify: GET  /api/v1/projects/:projectId/mentions
//            PATCH /api/v1/projects/:projectId/mentions/:mentionId

import { NextRequest, NextResponse } from "next/server";

const BACKEND = "https://api.cynoguard.com";
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID ?? "test-project-001";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const qs = request.nextUrl.searchParams.toString();
    const url = `${BACKEND}/api/v1/projects/${PROJECT_ID}/mentions${qs ? `?${qs}` : ""}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: authHeader ? { Authorization: authHeader } : undefined,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}

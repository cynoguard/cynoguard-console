// Proxy: GET  /api/social-monitoring/keywords
//        POST /api/social-monitoring/keywords
// → Fastify: GET  /api/v1/projects/:projectId/keywords
//            POST /api/v1/projects/:projectId/keywords

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:4000";
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID ?? "test-project-001";
const BASE = `${BACKEND}/api/v1/projects/${PROJECT_ID}/keywords`;

export async function GET() {
  try {
    const res = await fetch(BASE, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}



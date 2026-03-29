// Proxy: PATCH /api/social-monitoring/mentions/:mentionId
// → Fastify: PATCH /api/v1/projects/:projectId/mentions/:mentionId

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:4000";
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID ?? "test-project-001";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ mentionId: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const { mentionId } = await params;
    const body = await request.json();
    const res = await fetch(
      `${BACKEND}/api/v1/projects/${PROJECT_ID}/mentions/${mentionId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}



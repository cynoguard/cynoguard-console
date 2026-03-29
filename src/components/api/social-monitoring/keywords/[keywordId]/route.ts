// Proxy: PATCH  /api/social-monitoring/keywords/:keywordId
//        DELETE /api/social-monitoring/keywords/:keywordId
// → Fastify: PATCH  /api/v1/projects/:projectId/keywords/:keywordId
//            DELETE /api/v1/projects/:projectId/keywords/:keywordId

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:4000";
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID ?? "test-project-001";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ keywordId: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const { keywordId } = await params;
    const body = await request.json();
    const res = await fetch(
      `${BACKEND}/api/v1/projects/${PROJECT_ID}/keywords/${keywordId}`,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ keywordId: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const { keywordId } = await params;
    const res = await fetch(
      `${BACKEND}/api/v1/projects/${PROJECT_ID}/keywords/${keywordId}`,
      {
        method: "DELETE",
        headers: authHeader ? { Authorization: authHeader } : undefined,
      }
    );
    if (res.status === 204) return new NextResponse(null, { status: 204 });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}



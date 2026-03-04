import { NextResponse } from "next/server"
import { mockKeywords } from "@/lib/data/mock-alerts"

/** GET /api/keywords  — mirrors GET /projects/:id/keywords */
export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return NextResponse.json(mockKeywords)
}

/** POST /api/keywords  — mirrors POST /projects/:id/keywords */
export async function POST(request: Request) {
  const body = await request.json()
  const { value } = body as { value: string }

  if (!value || value.trim().length < 2) {
    return NextResponse.json(
      { error: "Keyword must be at least 2 characters" },
      { status: 400 }
    )
  }

  const newKeyword = {
    id: `kw-${Date.now()}`,
    projectId: "proj-001",
    value: value.trim(),
    isActive: true,
    createdAt: new Date().toISOString(),
    mentionCount: 0,
  }

  return NextResponse.json(newKeyword, { status: 201 })
}

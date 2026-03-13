import { NextResponse } from "next/server"
import { mockAlerts } from "@/lib/mock-data"
import { mockKeywords } from "@/lib/mock-keywords"
/** GET /api/keywords */
export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return NextResponse.json(mockAlerts)
}

/** POST /api/keywords */
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
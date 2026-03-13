import { NextResponse } from "next/server"
import { mockAlerts } from "@/lib/mock-data"

/** GET /api/social-alerts  — mirrors GET /projects/:id/dashboard */
export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 600))
    return NextResponse.json(mockAlerts)
}

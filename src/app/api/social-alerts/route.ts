import { NextResponse } from "next/server"
import { mockDashboardData } from "@/lib/data/mock-alerts"

/** GET /api/social-alerts  — mirrors GET /projects/:id/dashboard */
export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 600))
  return NextResponse.json(mockDashboardData)
}

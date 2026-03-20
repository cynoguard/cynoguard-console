import { NextResponse } from "next/server";

// POST /api/watchlist/:id/scan → trigger scan
export async function POST() {
    return NextResponse.json({ scanId: `scan-${Date.now()}` });
}

import { NextResponse } from "next/server";
import { generateMockScans } from "../../_mock-data";

// GET /api/watchlist/:id/scans
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") ?? "10", 10);

    const scans = generateMockScans();
    const total = scans.length;
    const start = (page - 1) * pageSize;
    const items = scans.slice(start, start + pageSize);

    return NextResponse.json({ items, page, pageSize, total });
}

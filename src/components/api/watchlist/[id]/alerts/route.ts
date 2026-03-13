import { NextResponse } from "next/server";
import { mockWatchlist, generateMockAlerts } from "../../_mock-data";

type Params = { params: Promise<{ id: string }> };

// GET /api/watchlist/:id/alerts
export async function GET(request: Request, { params }: Params) {
    const { id } = await params;
    const entry = mockWatchlist.find((w) => w.id === id);
    if (!entry) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") ?? "10", 10);

    const alerts = generateMockAlerts(entry.officialDomainNormalized);
    const total = alerts.length;
    const start = (page - 1) * pageSize;
    const items = alerts.slice(start, start + pageSize);

    return NextResponse.json({ items, page, pageSize, total });
}

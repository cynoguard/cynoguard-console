import { NextResponse } from "next/server";
import { mockWatchlist } from "./_mock-data";

// GET /api/watchlist → list all
export async function GET() {
    return NextResponse.json(mockWatchlist);
}

// POST /api/watchlist → add new domain
export async function POST(request: Request) {
    const body = await request.json();
    const domain: string = body.domain ?? "";
    const intervalHours: number = body.intervalHours ?? 6;

    // Normalize domain
    const normalized = domain
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/.*$/, "")
        .trim()
        .toLowerCase();

    if (!normalized || !/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/.test(normalized)) {
        return NextResponse.json({ message: "Invalid domain" }, { status: 400 });
    }

    const newEntry = {
        id: `wl-${Date.now()}`,
        officialDomainRaw: domain,
        officialDomainNormalized: normalized,
        active: true,
        intervalHours,
        lastScanStatus: "idle" as const,
        suspiciousCount: 0,
    };

    return NextResponse.json(newEntry, { status: 201 });
}

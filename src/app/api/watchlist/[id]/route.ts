import { NextResponse } from "next/server";
import { mockWatchlist } from "../_mock-data";

type Params = { params: Promise<{ id: string }> };

// GET /api/watchlist/:id
export async function GET(_request: Request, { params }: Params) {
    const { id } = await params;
    const entry = mockWatchlist.find((w) => w.id === id);
    if (!entry) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json(entry);
}

// PATCH /api/watchlist/:id
export async function PATCH(request: Request, { params }: Params) {
    const { id } = await params;
    const entry = mockWatchlist.find((w) => w.id === id);
    if (!entry) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const updated = { ...entry, ...body };
    return NextResponse.json(updated);
}

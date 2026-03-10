import { NextResponse } from "next/server";
import { mockWatchlist, generateMockFindings } from "../../_mock-data";

type Params = { params: Promise<{ id: string }> };

// GET /api/watchlist/:id/findings
export async function GET(request: Request, { params }: Params) {
    const { id } = await params;
    const entry = mockWatchlist.find((w) => w.id === id);
    if (!entry) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.toLowerCase() ?? "";
    const minSimilarity = parseFloat(searchParams.get("minSimilarity") ?? "0");
    const isLive = searchParams.get("isLive");
    const sort = searchParams.get("sort") ?? "similarity_desc";
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") ?? "10", 10);

    let findings = generateMockFindings(entry.officialDomainNormalized);

    // Filter
    if (query) {
        findings = findings.filter((f) =>
            f.candidateDomain.toLowerCase().includes(query)
        );
    }
    if (minSimilarity > 0) {
        findings = findings.filter((f) => f.similarityScore >= minSimilarity);
    }
    if (isLive === "true") {
        findings = findings.filter((f) => f.isLive);
    }
    if (isLive === "false") {
        findings = findings.filter((f) => !f.isLive);
    }

    // Sort
    switch (sort) {
        case "similarity_desc":
            findings.sort((a, b) => b.similarityScore - a.similarityScore);
            break;
        case "last_seen_desc":
            findings.sort(
                (a, b) =>
                    new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime()
            );
            break;
        case "first_seen_desc":
            findings.sort(
                (a, b) =>
                    new Date(b.firstSeenAt).getTime() - new Date(a.firstSeenAt).getTime()
            );
            break;
    }

    const total = findings.length;
    const start = (page - 1) * pageSize;
    const items = findings.slice(start, start + pageSize);

    return NextResponse.json({ items, page, pageSize, total });
}

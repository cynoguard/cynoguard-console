import { NextRequest, NextResponse } from "next/server";

const BACKEND = "https://api.cynoguard.com";

interface ForwardOptions {
  request: NextRequest;
  pathname: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  includeQuery?: boolean;
  includeBody?: boolean;
}

export async function forwardSocialMonitoringRequest({
  request,
  pathname,
  method,
  includeQuery = false,
  includeBody = false,
}: ForwardOptions) {
  try {
    const incomingAuth = request.headers.get("authorization");
    const query = includeQuery ? request.nextUrl.search : "";

    const headers: HeadersInit = {
      ...(incomingAuth ? { Authorization: incomingAuth } : {}),
      ...(includeBody ? { "Content-Type": "application/json" } : {}),
    };

    const response = await fetch(`${BACKEND}${pathname}${query}`, {
      method,
      headers,
      body: includeBody ? JSON.stringify(await request.json()) : undefined,
      cache: "no-store",
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}

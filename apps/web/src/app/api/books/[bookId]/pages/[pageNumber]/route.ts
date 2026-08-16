import { NextResponse } from "next/server";
import { getValidAccessToken } from "@/shared/lib/authenticated-fetch";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

interface RouteParams {
  params: Promise<{ bookId: string; pageNumber: string }>;
}

/**
 * Raw byte/JSON passthrough for a single reader page — comic pages come back
 * as an image (consumed via `<img src>`, which can't carry an Authorization
 * header), TXT pages come back as JSON. Both are forwarded as-is.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { bookId, pageNumber } = await params;

  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return NextResponse.json({ message: "No hay sesión activa." }, { status: 401 });
  }

  const upstream = await fetch(
    `${API_URL}/books/${bookId}/pages/${pageNumber}`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" },
  );

  const contentType = upstream.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = await upstream.json();
    return NextResponse.json(body, { status: upstream.status });
  }

  const buffer = await upstream.arrayBuffer();
  return new NextResponse(buffer, {
    status: upstream.status,
    headers: { "content-type": contentType || "application/octet-stream" },
  });
}

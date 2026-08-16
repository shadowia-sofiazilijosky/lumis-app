import { NextResponse } from "next/server";
import { ApiError } from "@/shared/lib/api-server";
import { authenticatedApiFetch } from "@/shared/lib/authenticated-fetch";

interface RouteParams {
  params: Promise<{ shelfId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { shelfId } = await params;
  const body = await request.text();

  try {
    await authenticatedApiFetch(`/shelves/${shelfId}/books`, {
      method: "POST",
      body,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}

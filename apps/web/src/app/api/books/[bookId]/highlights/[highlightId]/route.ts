import { NextResponse } from "next/server";
import { ApiError } from "@/shared/lib/api-server";
import { authenticatedApiFetch } from "@/shared/lib/authenticated-fetch";

interface RouteParams {
  params: Promise<{ bookId: string; highlightId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { bookId, highlightId } = await params;
  const body = await request.text();

  try {
    const highlight = await authenticatedApiFetch(
      `/books/${bookId}/highlights/${highlightId}`,
      { method: "PATCH", body },
    );
    return NextResponse.json(highlight);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { bookId, highlightId } = await params;

  try {
    await authenticatedApiFetch(
      `/books/${bookId}/highlights/${highlightId}`,
      { method: "DELETE" },
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}

import { NextResponse } from "next/server";
import { ApiError } from "@/shared/lib/api-server";
import { authenticatedApiFetch } from "@/shared/lib/authenticated-fetch";

interface RouteParams {
  params: Promise<{ shelfId: string; bookId: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { shelfId, bookId } = await params;

  try {
    await authenticatedApiFetch(`/shelves/${shelfId}/books/${bookId}`, {
      method: "DELETE",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}

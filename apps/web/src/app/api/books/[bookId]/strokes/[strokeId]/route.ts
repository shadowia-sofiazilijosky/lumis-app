import { NextResponse } from "next/server";
import { ApiError } from "@/shared/lib/api-server";
import { authenticatedApiFetch } from "@/shared/lib/authenticated-fetch";

interface RouteParams {
  params: Promise<{ bookId: string; strokeId: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { bookId, strokeId } = await params;

  try {
    await authenticatedApiFetch(`/books/${bookId}/strokes/${strokeId}`, {
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

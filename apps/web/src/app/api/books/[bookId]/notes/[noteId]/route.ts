import { NextResponse } from "next/server";
import { ApiError } from "@/shared/lib/api-server";
import { authenticatedApiFetch } from "@/shared/lib/authenticated-fetch";

interface RouteParams {
  params: Promise<{ bookId: string; noteId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { bookId, noteId } = await params;
  const body = await request.text();

  try {
    const note = await authenticatedApiFetch(
      `/books/${bookId}/notes/${noteId}`,
      { method: "PATCH", body },
    );
    return NextResponse.json(note);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { bookId, noteId } = await params;

  try {
    await authenticatedApiFetch(`/books/${bookId}/notes/${noteId}`, {
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

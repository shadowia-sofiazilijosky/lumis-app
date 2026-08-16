import { NextResponse } from "next/server";
import { ApiError } from "@/shared/lib/api-server";
import { authenticatedApiFetch } from "@/shared/lib/authenticated-fetch";

interface RouteParams {
  params: Promise<{ bookId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { bookId } = await params;

  try {
    const book = await authenticatedApiFetch(`/books/${bookId}`);
    return NextResponse.json(book);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { bookId } = await params;

  try {
    await authenticatedApiFetch(`/books/${bookId}`, { method: "DELETE" });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}

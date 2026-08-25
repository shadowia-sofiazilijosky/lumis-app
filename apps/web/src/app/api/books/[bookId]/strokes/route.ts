import { NextResponse } from "next/server";
import { ApiError } from "@/shared/lib/api-server";
import { authenticatedApiFetch } from "@/shared/lib/authenticated-fetch";

interface RouteParams {
  params: Promise<{ bookId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { bookId } = await params;

  try {
    const strokes = await authenticatedApiFetch(`/books/${bookId}/strokes`);
    return NextResponse.json(strokes);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  const { bookId } = await params;
  const body = await request.text();

  try {
    const stroke = await authenticatedApiFetch(`/books/${bookId}/strokes`, {
      method: "POST",
      body,
    });
    return NextResponse.json(stroke);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}

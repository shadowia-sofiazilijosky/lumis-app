import { NextResponse } from "next/server";
import { ApiError } from "@/shared/lib/api-server";
import { authenticatedApiFetch } from "@/shared/lib/authenticated-fetch";

interface RouteParams {
  params: Promise<{ bookId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { bookId } = await params;

  try {
    const progress = await authenticatedApiFetch(`/books/${bookId}/progress`);
    return NextResponse.json(progress);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { bookId } = await params;
  const body = await request.text();

  try {
    const progress = await authenticatedApiFetch(`/books/${bookId}/progress`, {
      method: "PUT",
      body,
    });
    return NextResponse.json(progress);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}

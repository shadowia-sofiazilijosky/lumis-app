import { NextResponse } from "next/server";
import { ApiError } from "@/shared/lib/api-server";
import { authenticatedApiFetch } from "@/shared/lib/authenticated-fetch";

interface RouteParams {
  params: Promise<{ bookId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { bookId } = await params;

  try {
    const review = await authenticatedApiFetch(`/books/${bookId}/review`);
    return NextResponse.json(review);
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
    const review = await authenticatedApiFetch(`/books/${bookId}/review`, {
      method: "PUT",
      body,
    });
    return NextResponse.json(review);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}

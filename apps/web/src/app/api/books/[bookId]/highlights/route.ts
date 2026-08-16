import { NextResponse } from "next/server";
import { ApiError } from "@/shared/lib/api-server";
import { authenticatedApiFetch } from "@/shared/lib/authenticated-fetch";

interface RouteParams {
  params: Promise<{ bookId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { bookId } = await params;

  try {
    const highlights = await authenticatedApiFetch(
      `/books/${bookId}/highlights`,
    );
    return NextResponse.json(highlights);
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
    const highlight = await authenticatedApiFetch(
      `/books/${bookId}/highlights`,
      { method: "POST", body },
    );
    return NextResponse.json(highlight);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}

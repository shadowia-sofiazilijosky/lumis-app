import { NextResponse } from "next/server";
import { ApiError } from "@/shared/lib/api-server";
import { authenticatedApiFetch } from "@/shared/lib/authenticated-fetch";

interface RouteParams {
  params: Promise<{ shelfId: string; bookId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { shelfId, bookId } = await params;

  // Forward the incoming multipart body as-is, same as the book upload route.
  const formData = await request.formData();

  try {
    const result = await authenticatedApiFetch(
      `/shelves/${shelfId}/books/${bookId}/spine-image`,
      { method: "POST", body: formData },
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}

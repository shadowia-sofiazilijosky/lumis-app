import { NextResponse } from "next/server";
import { ApiError } from "@/shared/lib/api-server";
import { authenticatedApiFetch } from "@/shared/lib/authenticated-fetch";

export async function GET(request: Request) {
  const { search } = new URL(request.url);

  try {
    const books = await authenticatedApiFetch(`/books${search}`);
    return NextResponse.json(books);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}

export async function POST(request: Request) {
  // Forward the incoming multipart body as-is — re-parsing into FormData
  // and handing that same instance to fetch() preserves the file content
  // and lets fetch compute the correct multipart boundary itself.
  const formData = await request.formData();

  try {
    const book = await authenticatedApiFetch("/books", {
      method: "POST",
      body: formData,
    });
    return NextResponse.json(book);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}

import { NextResponse } from "next/server";
import { ApiError } from "@/shared/lib/api-server";
import { authenticatedApiFetch } from "@/shared/lib/authenticated-fetch";

export async function POST(request: Request) {
  // Forward the incoming multipart body as-is — re-parsing into FormData and
  // handing that same instance to fetch() preserves the file content and
  // lets fetch compute the correct multipart boundary itself.
  const formData = await request.formData();

  try {
    const user = await authenticatedApiFetch("/users/me/avatar", {
      method: "POST",
      body: formData,
    });
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}

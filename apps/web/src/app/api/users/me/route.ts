import { NextResponse } from "next/server";
import { ApiError } from "@/shared/lib/api-server";
import { authenticatedApiFetch } from "@/shared/lib/authenticated-fetch";

export async function PATCH(request: Request) {
  const body = await request.text();

  try {
    const user = await authenticatedApiFetch("/users/me", {
      method: "PATCH",
      body,
    });
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}

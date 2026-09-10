import { NextResponse } from "next/server";
import { ApiError } from "@/shared/lib/api-server";
import { authenticatedApiFetch } from "@/shared/lib/authenticated-fetch";

export async function GET(request: Request) {
  const { search } = new URL(request.url);

  try {
    const calendar = await authenticatedApiFetch(`/stats/streak-calendar${search}`);
    return NextResponse.json(calendar);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}

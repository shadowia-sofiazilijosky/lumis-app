import { NextResponse } from "next/server";
import { ApiError } from "@/shared/lib/api-server";
import { authenticatedApiFetch } from "@/shared/lib/authenticated-fetch";

export async function GET() {
  try {
    const shelves = await authenticatedApiFetch("/shelves");
    return NextResponse.json(shelves);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}

export async function POST(request: Request) {
  const body = await request.text();

  try {
    const shelf = await authenticatedApiFetch("/shelves", {
      method: "POST",
      body,
    });
    return NextResponse.json(shelf);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}

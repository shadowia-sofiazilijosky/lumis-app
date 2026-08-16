import { NextResponse } from "next/server";
import { ApiError } from "@/shared/lib/api-server";
import { authenticatedApiFetch } from "@/shared/lib/authenticated-fetch";

interface RouteParams {
  params: Promise<{ shelfId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { shelfId } = await params;

  try {
    const shelf = await authenticatedApiFetch(`/shelves/${shelfId}`);
    return NextResponse.json(shelf);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { shelfId } = await params;
  const body = await request.text();

  try {
    const shelf = await authenticatedApiFetch(`/shelves/${shelfId}`, {
      method: "PATCH",
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

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { shelfId } = await params;

  try {
    await authenticatedApiFetch(`/shelves/${shelfId}`, { method: "DELETE" });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}

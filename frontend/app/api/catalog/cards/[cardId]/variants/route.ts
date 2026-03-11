import { NextRequest, NextResponse } from "next/server";

import { getAccessToken } from "@/lib/auth";

const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000";

type Context = {
  params: Promise<{
    cardId: string;
  }>;
};

export async function GET(_: NextRequest, { params }: Context) {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await params;

  const response = await fetch(`${API_BASE_URL}/catalog/cards/${cardId}/variants`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  return NextResponse.json(data, { status: response.status });
}

export async function POST(request: NextRequest, { params }: Context) {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await params;
  const body = await request.text();

  const response = await fetch(`${API_BASE_URL}/catalog/cards/${cardId}/variants`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body,
  });

  const data = await response.json().catch(() => null);

  return NextResponse.json(data, { status: response.status });
}
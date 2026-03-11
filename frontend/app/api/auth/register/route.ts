import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const contentType = request.headers.get("content-type") || "application/json";

  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
    },
    body,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(
      { error: data?.detail || data?.error || "Registration failed" },
      { status: response.status }
    );
  }

  return NextResponse.json(data ?? { ok: true }, { status: response.status });
}
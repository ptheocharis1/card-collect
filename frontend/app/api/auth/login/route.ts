import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  const body = await request.text();

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
    },
    body,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(
      { error: data?.detail || data?.error || "Invalid credentials" },
      { status: response.status }
    );
  }

  const accessToken = data?.access_token;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Login succeeded but no access token was returned" },
      { status: 500 }
    );
  }

  const res = NextResponse.json({ ok: true });

  res.cookies.set("access_token", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return res;
}
import { redirect } from "next/navigation";
import { getAccessToken } from "@/lib/auth";

const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000";

export async function backendFetch(path: string, init: RequestInit = {}) {
  const token = await getAccessToken();

  if (!token) {
    redirect("/login");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    redirect("/login");
  }

  return response;
}
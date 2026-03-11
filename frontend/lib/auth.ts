import { cookies } from "next/headers";

export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value ?? null;
}

export async function getAuthHeader() {
  const token = await getAccessToken();

  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
  };
}
import { redirect } from "next/navigation";

import TopNav from "@/app/components/top-nav";
import { getAccessToken, getAuthHeader } from "@/lib/auth";

const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000";

type MeResponse = {
  id: number;
  email: string;
  is_superuser: boolean;
};

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getAccessToken();

  if (!token) {
    redirect("/login");
  }

  const authHeaders = await getAuthHeader();

  const meRes = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: authHeaders,
    cache: "no-store",
  });

  if (meRes.status === 401) {
    redirect("/login");
  }

  if (!meRes.ok) {
    throw new Error(`Failed to load current user (${meRes.status})`);
  }

  const me: MeResponse = await meRes.json();

  return (
    <div className="app-shell">
      <TopNav isSuperuser={Boolean(me.is_superuser)} />
      <main className="app-main">
        <div className="page-container">{children}</div>
      </main>
    </div>
  );
}
import { redirect } from "next/navigation";
import { getAccessToken } from "@/lib/auth";
import TopNav from "@/app/components/top-nav";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getAccessToken();

  if (!token) {
    redirect("/login");
  }

  return (
    <div className="app-shell">
      <TopNav />
      <main className="app-main">
        <div className="page-container">{children}</div>
      </main>
    </div>
  );
}
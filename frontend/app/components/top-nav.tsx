"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type TopNavProps = {
  isSuperuser?: boolean;
};

export default function TopNav({ isSuperuser = false }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/cards", label: "Cards" },
    { href: "/collections", label: "Collections" },
    { href: "/cards/new", label: "Add Card" },
    ...(isSuperuser
      ? [{ href: "/dashboard/catalog", label: "Catalog" }]
      : []),
  ];

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/dashboard" className="brand">
          <div className="brand-mark">FC</div>
          <div className="brand-copy">
            <div className="brand-title">Freak Collector V1</div>
            <div className="brand-subtitle">Modern Collector App</div>
          </div>
        </Link>

        <div className="topbar-spacer" />

        <nav className="topnav-links">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${active ? "nav-link-active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="topbar-actions">
          <button
            type="button"
            className="button button-secondary topbar-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/cards", label: "Cards" },
  { href: "/collections", label: "Collections" },
  { href: "/cards/new", label: "Add Card" },
];

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();

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
            <span className="brand-title">Freak Collector V1</span>
            <span className="brand-subtitle">Modern Collector App</span>
          </div>
        </Link>

        <div className="topbar-spacer" />

        <nav className="topnav-links" aria-label="Primary">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "nav-link nav-link-active" : "nav-link"}
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
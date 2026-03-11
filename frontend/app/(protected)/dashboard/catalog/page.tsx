import { redirect } from "next/navigation";

import CatalogManager from "@/app/components/catalog-manager";
import { getAccessToken, getAuthHeader } from "@/lib/auth";

const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000";

type MeResponse = {
  id: number;
  email: string;
  is_superuser: boolean;
};

type Product = {
  id: number;
  year: number | null;
  manufacturer: string | null;
  brand: string | null;
  product_name: string | null;
  sport_or_universe: string | null;
  release_type: string | null;
  release_date: string | null;
};

export default async function CatalogPage() {
  const token = await getAccessToken();

  if (!token) {
    redirect("/login");
  }

  const authHeaders = await getAuthHeader();

  const [meRes, productsRes] = await Promise.all([
    fetch(`${API_BASE_URL}/auth/me`, {
      headers: authHeaders,
      cache: "no-store",
    }),
    fetch(`${API_BASE_URL}/catalog/products`, {
      headers: authHeaders,
      cache: "no-store",
    }),
  ]);

  if (meRes.status === 401 || productsRes.status === 401) {
    redirect("/login");
  }

  if (!meRes.ok) {
    throw new Error(`Failed to load current user (${meRes.status})`);
  }

  const me: MeResponse = await meRes.json();

  if (!me.is_superuser) {
    redirect("/dashboard");
  }

  if (!productsRes.ok) {
    throw new Error(`Failed to load catalog products (${productsRes.status})`);
  }

  const products: Product[] = await productsRes.json();

  return <CatalogManager initialProducts={products} />;
}
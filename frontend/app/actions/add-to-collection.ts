"use server";

import { redirect } from "next/navigation";
import { getAccessToken, getAuthHeader } from "@/lib/auth";

const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000";

export async function addToCollection(formData: FormData) {
  const token = await getAccessToken();

  if (!token) {
    redirect("/login");
  }

  const collectionId = String(formData.get("collectionId") || "");
  const cardVariantId = Number(formData.get("cardVariantId"));
  const quantity = Number(formData.get("quantity") || 1);
  const returnTo = String(formData.get("returnTo") || "/cards");

  if (!collectionId || !cardVariantId || quantity < 1) {
    redirect(returnTo);
  }

  const res = await fetch(`${API_BASE_URL}/collections/${collectionId}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeader()),
    },
    body: JSON.stringify({
      card_variant_id: cardVariantId,
      quantity,
    }),
    cache: "no-store",
  });

  if (res.status === 401) {
    redirect("/login");
  }

  redirect(returnTo);
}
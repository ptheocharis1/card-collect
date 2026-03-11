import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAccessToken, getAuthHeader } from "@/lib/auth";

const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Collection = {
  id: number;
  name: string;
  description?: string | null;
};

type CollectionItem = {
  id: number;
  collection_id: number;
  quantity: number;
  card: {
    id: number;
    name: string | null;
    player_name: string | null;
    team_or_franchise: string | null;
    card_number: string | null;
    variant_name: string | null;
    rookie_card: boolean | null;
  };
  variant: {
    id: number;
    parallel_name: string | null;
    variation_name: string | null;
    autograph_flag: boolean | null;
    autograph_type: string | null;
    relic_flag: boolean | null;
    patch_flag: boolean | null;
    relic_type: string | null;
    serial_total: number | null;
  };
  product: {
    id: number;
    year: number | null;
    manufacturer: string | null;
    brand: string | null;
    product_name: string | null;
    sport_or_universe: string | null;
    release_type: string | null;
    release_date: string | null;
  };
};

function joinParts(parts: Array<string | number | null | undefined>) {
  return parts.filter(Boolean).join(" • ");
}

function titleFor(item: CollectionItem) {
  return item.card.name || item.card.player_name || "Unknown card";
}

function subtitleFor(item: CollectionItem) {
  return joinParts([item.card.player_name, item.card.team_or_franchise]);
}

function setFor(item: CollectionItem) {
  return joinParts([
    item.product.year,
    item.product.brand || item.product.manufacturer,
    item.product.product_name,
  ]);
}

function variantFor(item: CollectionItem) {
  return joinParts([
    item.card.variant_name,
    item.variant.parallel_name,
    item.variant.variation_name,
  ]);
}

function badgeClassName(kind: "default" | "accent" = "default") {
  if (kind === "accent") {
    return "badge border-[rgba(124,58,237,0.38)] bg-[rgba(124,58,237,0.16)] text-white";
  }

  return "badge";
}

function labelClassName() {
  return "text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]";
}

function initialsFor(item: CollectionItem) {
  const source = titleFor(item);
  const words = source.split(" ").filter(Boolean).slice(0, 2);
  if (words.length === 0) return "CC";
  return words.map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function mediaTone(item: CollectionItem) {
  const sport = (item.product.sport_or_universe || "").toLowerCase();

  if (sport.includes("nba") || sport.includes("basketball")) {
    return "from-orange-500/20 via-red-500/10 to-transparent";
  }
  if (sport.includes("nfl") || sport.includes("football")) {
    return "from-emerald-500/20 via-lime-500/10 to-transparent";
  }
  if (sport.includes("mlb") || sport.includes("baseball")) {
    return "from-sky-500/20 via-cyan-500/10 to-transparent";
  }
  if (sport.includes("soccer")) {
    return "from-green-500/20 via-emerald-500/10 to-transparent";
  }
  if (sport.includes("pokemon") || sport.includes("tcg")) {
    return "from-yellow-400/20 via-blue-500/10 to-transparent";
  }

  return "from-violet-500/20 via-fuchsia-500/10 to-transparent";
}

function MediaPanel({ item }: { item: CollectionItem }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c1015]">
      <div className={`absolute inset-0 bg-gradient-to-br ${mediaTone(item)}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_35%)]" />
      <div className="relative aspect-[3/4] p-4">
        <div className="flex h-full flex-col justify-between rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-gray-200">
              {item.product.brand || item.product.manufacturer || "Collection"}
            </div>
            {item.card.card_number && (
              <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-300">
                #{item.card.card_number}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-3xl font-semibold tracking-tight text-white shadow-inner">
              {initialsFor(item)}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-gray-500">
              {item.product.sport_or_universe || "Collection"}
            </div>
            <div className="mt-1 line-clamp-2 text-base font-semibold text-white">
              {titleFor(item)}
            </div>
            <div className="mt-1 line-clamp-2 text-sm text-gray-400">
              {variantFor(item) || "Base"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function updateQuantityAction(formData: FormData) {
  "use server";

  const token = await getAccessToken();
  if (!token) {
    redirect("/login");
  }

  const collectionId = String(formData.get("collectionId") || "");
  const itemId = String(formData.get("itemId") || "");
  const nextQuantity = Number(formData.get("nextQuantity") || 0);

  if (!collectionId || !itemId) {
    redirect("/collections");
  }

  if (nextQuantity <= 0) {
    const deleteRes = await fetch(`${API_BASE_URL}/collection-items/${itemId}`, {
      method: "DELETE",
      headers: await getAuthHeader(),
      cache: "no-store",
    });

    if (deleteRes.status === 401) {
      redirect("/login");
    }
  } else {
    const updateRes = await fetch(`${API_BASE_URL}/collection-items/${itemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(await getAuthHeader()),
      },
      body: JSON.stringify({ quantity: nextQuantity }),
      cache: "no-store",
    });

    if (updateRes.status === 401) {
      redirect("/login");
    }
  }

  revalidatePath(`/collections/${collectionId}`);
  redirect(`/collections/${collectionId}`);
}

async function deleteItemAction(formData: FormData) {
  "use server";

  const token = await getAccessToken();
  if (!token) {
    redirect("/login");
  }

  const collectionId = String(formData.get("collectionId") || "");
  const itemId = String(formData.get("itemId") || "");

  if (!collectionId || !itemId) {
    redirect("/collections");
  }

  const res = await fetch(`${API_BASE_URL}/collection-items/${itemId}`, {
    method: "DELETE",
    headers: await getAuthHeader(),
    cache: "no-store",
  });

  if (res.status === 401) {
    redirect("/login");
  }

  revalidatePath(`/collections/${collectionId}`);
  redirect(`/collections/${collectionId}`);
}

export default async function CollectionDetailsPage({ params }: PageProps) {
  const token = await getAccessToken();

  if (!token) {
    redirect("/login");
  }

  const { id } = await params;

  const authHeaders = await getAuthHeader();

  const [collectionRes, itemsRes] = await Promise.all([
    fetch(`${API_BASE_URL}/collections/${id}`, {
      headers: authHeaders,
      cache: "no-store",
    }),
    fetch(`${API_BASE_URL}/collections/${id}/items`, {
      headers: authHeaders,
      cache: "no-store",
    }),
  ]);

  if (collectionRes.status === 401 || itemsRes.status === 401) {
    redirect("/login");
  }

  if (collectionRes.status === 404 || itemsRes.status === 404) {
    return (
      <div className="grid-auto gap-6">
        <div className="page-header">
          <div className="page-header-copy">
            <h1 className="text-[32px] font-semibold tracking-tight">Collection not found</h1>
            <p className="page-description">
              The collection does not exist or you do not have access to it.
            </p>
          </div>
        </div>

        <div className="panel">
          <Link href="/collections" className="button button-secondary">
            Back to Collections
          </Link>
        </div>
      </div>
    );
  }

  if (!collectionRes.ok || !itemsRes.ok) {
    throw new Error(
      `Failed to load collection (${collectionRes.status}/${itemsRes.status})`
    );
  }

  const collection: Collection = await collectionRes.json();
  const items: CollectionItem[] = await itemsRes.json();

  return (
    <div className="grid-auto gap-6">
      <div className="page-header">
        <div className="page-header-copy">
          <Link href="/collections" className="nav-link inline-flex px-0 py-0 text-sm">
            ← Back to collections
          </Link>
          <h1 className="mt-3 text-[32px] font-semibold tracking-tight">
            {collection.name}
          </h1>
          <p className="page-description">
            {items.length} {items.length === 1 ? "item" : "items"}
            {collection.description ? ` • ${collection.description}` : ""}
          </p>
        </div>

        <div className="badge">
          {items.length} {items.length === 1 ? "card" : "cards"}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="text-base font-semibold text-white">
            No cards in this collection yet
          </div>
          <div className="mt-2">
            Add cards from the Cards page to start building this collection.
          </div>
          <div className="mt-4">
            <Link href="/cards" className="button button-primary">
              Browse Cards
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,30,53,0.92),rgba(12,19,36,0.96))] transition hover:border-indigo-400/40 hover:shadow-[0_8px_24px_rgba(79,70,229,0.15)]"
            >
              <div className="grid grid-cols-1 gap-0 xl:grid-cols-[200px_minmax(0,1fr)]">
                <div className="p-4">
                  <MediaPanel item={item} />
                </div>

                <div className="min-w-0 p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="break-words text-[22px] font-semibold leading-tight text-white">
                        {titleFor(item)}
                      </h2>
                      <p className="mt-1 break-words text-sm text-gray-400">
                        {subtitleFor(item) || "—"}
                      </p>
                    </div>

                    {item.card.card_number && (
                      <div className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-gray-300">
                        #{item.card.card_number}
                      </div>
                    )}
                  </div>

                  <div className="mb-4 rounded-xl border border-white/10 bg-black/10 p-3">
                    <div className={labelClassName()}>Set</div>
                    <div className="mt-1 break-words text-sm text-gray-200">
                      {setFor(item) || "-"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                      <div className={labelClassName()}>Variant</div>
                      <div className="mt-1 break-words text-sm text-gray-200">
                        {variantFor(item) || "-"}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                      <div className={labelClassName()}>Quantity</div>
                      <div className="mt-1 text-sm text-gray-200">{item.quantity}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.card.rookie_card && <span className={badgeClassName("accent")}>RC</span>}
                    {item.variant.autograph_flag && (
                      <span className={badgeClassName("accent")}>
                        {item.variant.autograph_type
                          ? `Auto: ${item.variant.autograph_type}`
                          : "Auto"}
                      </span>
                    )}
                    {item.variant.relic_flag && (
                      <span className={badgeClassName()}>
                        {item.variant.relic_type ? `Relic: ${item.variant.relic_type}` : "Relic"}
                      </span>
                    )}
                    {item.variant.patch_flag && <span className={badgeClassName()}>Patch</span>}
                    {item.variant.serial_total && (
                      <span className={badgeClassName()}>/{item.variant.serial_total}</span>
                    )}
                    {item.product.release_type && (
                      <span className={badgeClassName()}>{item.product.release_type}</span>
                    )}
                    {item.product.sport_or_universe && (
                      <span className={badgeClassName()}>{item.product.sport_or_universe}</span>
                    )}
                  </div>

                  <div className="mt-4 border-t border-white/10 pt-4">
                    <div className={labelClassName()}>Manage</div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <form action={updateQuantityAction}>
                        <input type="hidden" name="collectionId" value={item.collection_id} />
                        <input type="hidden" name="itemId" value={item.id} />
                        <input type="hidden" name="nextQuantity" value={item.quantity - 1} />
                        <button
                          type="submit"
                          className="button button-secondary min-w-[44px]"
                        >
                          −
                        </button>
                      </form>

                      <form action={updateQuantityAction}>
                        <input type="hidden" name="collectionId" value={item.collection_id} />
                        <input type="hidden" name="itemId" value={item.id} />
                        <input type="hidden" name="nextQuantity" value={item.quantity + 1} />
                        <button
                          type="submit"
                          className="button button-secondary min-w-[44px]"
                        >
                          +
                        </button>
                      </form>

                      <form action={deleteItemAction}>
                        <input type="hidden" name="collectionId" value={item.collection_id} />
                        <input type="hidden" name="itemId" value={item.id} />
                        <button
                          type="submit"
                          className="button"
                          style={{
                            color: "#fca5a5",
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.22)",
                          }}
                        >
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
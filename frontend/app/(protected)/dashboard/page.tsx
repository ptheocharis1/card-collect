import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccessToken, getAuthHeader } from "@/lib/auth";

const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000";

type Collection = {
  id: number;
  name: string;
};

type CardRow = {
  id: number;
  card: {
    name: string | null;
    player_name: string | null;
  };
  product: {
    year: number | null;
    brand: string | null;
    manufacturer: string | null;
    product_name: string | null;
    sport_or_universe: string | null;
    release_type: string | null;
  };
  variant: {
    parallel_name: string | null;
    variation_name: string | null;
    autograph_flag: boolean | null;
  };
};

type CountItem = {
  label: string;
  count: number;
};

function cardTitle(card: CardRow) {
  return card.card.name || card.card.player_name || "Unknown card";
}

function cardSubtitle(card: CardRow) {
  const setName = [
    card.product.year,
    card.product.brand || card.product.manufacturer,
    card.product.product_name,
  ]
    .filter(Boolean)
    .join(" • ");

  const variant = [card.variant.parallel_name, card.variant.variation_name]
    .filter(Boolean)
    .join(" • ");

  return [setName, variant].filter(Boolean).join(" • ");
}

function countBy(
  items: CardRow[],
  selector: (card: CardRow) => string | null | undefined
): CountItem[] {
  const map = new Map<string, number>();

  for (const item of items) {
    const key = selector(item)?.trim();
    if (!key) continue;
    map.set(key, (map.get(key) || 0) + 1);
  }

  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, count }));
}

export default async function DashboardPage() {
  const token = await getAccessToken();

  if (!token) {
    redirect("/login");
  }

  const authHeaders = await getAuthHeader();

  const [cardsRes, collectionsRes] = await Promise.all([
    fetch(`${API_BASE_URL}/cards`, {
      headers: authHeaders,
      cache: "no-store",
    }),
    fetch(`${API_BASE_URL}/collections/`, {
      headers: authHeaders,
      cache: "no-store",
    }),
  ]);

  if (cardsRes.status === 401 || collectionsRes.status === 401) {
    redirect("/login");
  }

  if (!cardsRes.ok || !collectionsRes.ok) {
    throw new Error(
      `Failed to load dashboard (${cardsRes.status}/${collectionsRes.status})`
    );
  }

  const cards: CardRow[] = await cardsRes.json();
  const collections: Collection[] = await collectionsRes.json();

  const recentCards = [...cards].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 6);

  const bySport = countBy(cards, (card) => card.product.sport_or_universe).slice(0, 6);
  const byBrand = countBy(
    cards,
    (card) => card.product.brand || card.product.manufacturer
  ).slice(0, 6);
  const bySet = countBy(
    cards,
    (card) =>
      [
        card.product.year,
        card.product.brand || card.product.manufacturer,
        card.product.product_name,
      ]
        .filter(Boolean)
        .join(" • ") || null
  ).slice(0, 6);
  const byReleaseType = countBy(cards, (card) => card.product.release_type).slice(0, 6);

  return (
    <div className="grid-auto gap-6">
      <div className="page-header">
        <div className="page-header-copy">
          <h1 className="text-[32px] font-semibold tracking-tight">Dashboard</h1>
          <p className="page-description">
            Welcome to Freak Collector V1. Manage your collection, explore your cards,
            and jump into your next action.
          </p>
        </div>

        <div className="row">
          <Link href="/cards/new" className="button button-primary">
            Add Card
          </Link>
          <Link href="/collections" className="button button-secondary">
            View Collections
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/cards"
          className="panel transition hover:border-indigo-400/40 hover:shadow-[0_8px_24px_rgba(79,70,229,0.15)]"
        >
          <div className="label">Total Cards</div>
          <div className="mt-3 text-3xl font-semibold text-white">{cards.length}</div>
          <div className="mt-2 text-sm text-[var(--muted)]">
            All cards in your personal inventory.
          </div>
        </Link>

        <Link
          href="/collections"
          className="panel transition hover:border-indigo-400/40 hover:shadow-[0_8px_24px_rgba(79,70,229,0.15)]"
        >
          <div className="label">Collections</div>
          <div className="mt-3 text-3xl font-semibold text-white">{collections.length}</div>
          <div className="mt-2 text-sm text-[var(--muted)]">
            Organized groups for favorite themes and sets.
          </div>
        </Link>

        <Link
          href="/cards?auto=yes"
          className="panel transition hover:border-indigo-400/40 hover:shadow-[0_8px_24px_rgba(79,70,229,0.15)]"
        >
          <div className="label">Autographs</div>
          <div className="mt-3 text-3xl font-semibold text-white">
            {cards.filter((card) => Boolean(card.variant.autograph_flag)).length}
          </div>
          <div className="mt-2 text-sm text-[var(--muted)]">
            Signed cards currently tracked in your collection.
          </div>
        </Link>

        <div className="panel">
          <div className="label">Quick Access</div>
          <div className="mt-4 grid gap-2">
            <Link href="/cards" className="button button-secondary">
              Browse Cards
            </Link>
            <Link href="/collections" className="button button-secondary">
              Open Collections
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="panel">
          <div className="row-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Recent Cards</h2>
              <p className="page-description">
                Your latest additions, ready for quick access.
              </p>
            </div>

            <Link href="/cards" className="button button-secondary">
              View All
            </Link>
          </div>

          {recentCards.length === 0 ? (
            <div className="empty-state mt-5">
              <div className="text-base font-semibold text-white">No cards yet</div>
              <div className="mt-2">Start your collection by adding your first card.</div>
              <div className="mt-4">
                <Link href="/cards/new" className="button button-primary">
                  Add First Card
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {recentCards.map((card) => (
                <Link
                  key={card.id}
                  href={`/cards?q=${encodeURIComponent(cardTitle(card))}`}
                  className="rounded-2xl border border-white/10 bg-black/10 p-4 transition hover:border-indigo-400/40 hover:shadow-[0_8px_24px_rgba(79,70,229,0.15)]"
                >
                  <div className="row-between">
                    <div className="min-w-0">
                      <div className="break-words text-base font-semibold text-white">
                        {cardTitle(card)}
                      </div>
                      <div className="mt-1 break-words text-sm text-[var(--muted)]">
                        {cardSubtitle(card) || "No additional details"}
                      </div>
                    </div>

                    {card.variant.autograph_flag ? (
                      <span className="badge border-[rgba(124,58,237,0.38)] bg-[rgba(124,58,237,0.16)] text-white">
                        Auto
                      </span>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="row-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Collections</h2>
              <p className="page-description">
                Jump into your organized collector sets.
              </p>
            </div>

            <Link href="/collections" className="button button-secondary">
              View All
            </Link>
          </div>

          {collections.length === 0 ? (
            <div className="empty-state mt-5">
              <div className="text-base font-semibold text-white">No collections yet</div>
              <div className="mt-2">Create one to group your cards by theme or set.</div>
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {collections.slice(0, 6).map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.id}`}
                  className="rounded-2xl border border-white/10 bg-black/10 p-4 transition hover:border-indigo-400/40 hover:shadow-[0_8px_24px_rgba(79,70,229,0.15)]"
                >
                  <div className="row-between">
                    <div className="min-w-0">
                      <div className="break-words text-base font-semibold text-white">
                        {collection.name}
                      </div>
                      <div className="mt-1 text-sm text-[var(--muted)]">
                        Open collection
                      </div>
                    </div>

                    <span className="badge">#{collection.id}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-4">
        <div className="panel">
          <h2 className="text-xl font-semibold text-white">By Sport / Universe</h2>
          <p className="page-description">Your collection distribution by category.</p>

          {bySport.length === 0 ? (
            <div className="empty-state mt-5">No sport or universe data yet.</div>
          ) : (
            <div className="mt-5 grid gap-3">
              {bySport.map((item) => (
                <Link
                  key={item.label}
                  href={`/cards?sport=${encodeURIComponent(item.label)}`}
                  className="row-between rounded-2xl border border-white/10 bg-black/10 p-4 transition hover:border-indigo-400/40 hover:shadow-[0_8px_24px_rgba(79,70,229,0.15)]"
                >
                  <span className="break-words text-white">{item.label}</span>
                  <span className="badge">{item.count}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <h2 className="text-xl font-semibold text-white">Top Sets</h2>
          <p className="page-description">Most represented sets in your collection.</p>

          {bySet.length === 0 ? (
            <div className="empty-state mt-5">No set data yet.</div>
          ) : (
            <div className="mt-5 grid gap-3">
              {bySet.map((item) => (
                <Link
                  key={item.label}
                  href={`/cards?q=${encodeURIComponent(item.label)}`}
                  className="row-between rounded-2xl border border-white/10 bg-black/10 p-4 transition hover:border-indigo-400/40 hover:shadow-[0_8px_24px_rgba(79,70,229,0.15)]"
                >
                  <span className="break-words text-white">{item.label}</span>
                  <span className="badge">{item.count}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <h2 className="text-xl font-semibold text-white">Top Brands</h2>
          <p className="page-description">Brands and manufacturers across your cards.</p>

          {byBrand.length === 0 ? (
            <div className="empty-state mt-5">No brand data yet.</div>
          ) : (
            <div className="mt-5 grid gap-3">
              {byBrand.map((item) => (
                <Link
                  key={item.label}
                  href={`/cards?brand=${encodeURIComponent(item.label)}`}
                  className="row-between rounded-2xl border border-white/10 bg-black/10 p-4 transition hover:border-indigo-400/40 hover:shadow-[0_8px_24px_rgba(79,70,229,0.15)]"
                >
                  <span className="break-words text-white">{item.label}</span>
                  <span className="badge">{item.count}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <h2 className="text-xl font-semibold text-white">Release Types</h2>
          <p className="page-description">Browse your collection by release category.</p>

          {byReleaseType.length === 0 ? (
            <div className="empty-state mt-5">No release type data yet.</div>
          ) : (
            <div className="mt-5 grid gap-3">
              {byReleaseType.map((item) => (
                <Link
                  key={item.label}
                  href={`/cards?releaseType=${encodeURIComponent(item.label)}`}
                  className="row-between rounded-2xl border border-white/10 bg-black/10 p-4 transition hover:border-indigo-400/40 hover:shadow-[0_8px_24px_rgba(79,70,229,0.15)]"
                >
                  <span className="break-words text-white">{item.label}</span>
                  <span className="badge">{item.count}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
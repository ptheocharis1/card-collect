"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type CardRow = {
  id: number;
  user_id: number | null;
  condition: {
    type: string | null;
    estimate: string | null;
    grader: string | null;
    grade: string | null;
    serial_number_observed: string | null;
  };
  purchase: {
    purchase_price: string | null;
    purchase_date: string | null;
    purchase_source: string | null;
  };
  notes: string | null;
  created_at: string | null;
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

type CollectionRow = {
  id: number;
  name: string;
};

type FilterChip = {
  key:
    | "query"
    | "sport"
    | "brand"
    | "year"
    | "releaseType"
    | "condition"
    | "auto";
  label: string;
  value: string;
};

function joinParts(parts: Array<string | number | null | undefined>) {
  return parts.filter(Boolean).join(" • ");
}

function formatMoney(value: string | null) {
  if (!value) return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return `$${num.toFixed(2)}`;
}

function titleFor(card: CardRow) {
  return card.card.name || card.card.player_name || "Unknown card";
}

function subtitleFor(card: CardRow) {
  return joinParts([card.card.player_name, card.card.team_or_franchise]);
}

function brandFor(card: CardRow) {
  return card.product.brand || card.product.manufacturer || null;
}

function setFor(card: CardRow) {
  return joinParts([
    card.product.year,
    brandFor(card),
    card.product.product_name,
  ]);
}

function variantFor(card: CardRow) {
  return joinParts([
    card.card.variant_name,
    card.variant.parallel_name,
    card.variant.variation_name,
  ]);
}

function conditionFor(card: CardRow) {
  return joinParts([
    card.condition.type,
    card.condition.estimate,
    card.condition.grade ? `Grade ${card.condition.grade}` : null,
    card.condition.grader,
  ]);
}

function searchableText(card: CardRow) {
  return [
    titleFor(card),
    subtitleFor(card),
    brandFor(card),
    setFor(card),
    variantFor(card),
    card.card.card_number,
    card.product.sport_or_universe,
    card.product.release_type,
    card.purchase.purchase_source,
    card.notes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
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

function initialsFor(card: CardRow) {
  const source = titleFor(card);
  const words = source.split(" ").filter(Boolean).slice(0, 2);
  if (words.length === 0) return "CC";
  return words.map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function mediaTone(card: CardRow) {
  const sport = (card.product.sport_or_universe || "").toLowerCase();

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

function MediaPanel({ card }: { card: CardRow }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c1015]">
      <div className={`absolute inset-0 bg-gradient-to-br ${mediaTone(card)}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_35%)]" />
      <div className="relative aspect-[3/4] p-4">
        <div className="flex h-full flex-col justify-between rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-gray-200">
              {brandFor(card) || "Collection"}
            </div>
            {card.card.card_number && (
              <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-300">
                #{card.card.card_number}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-3xl font-semibold tracking-tight text-white shadow-inner">
              {initialsFor(card)}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-gray-500">
              {card.product.sport_or_universe || "Collection"}
            </div>
            <div className="mt-1 line-clamp-2 text-base font-semibold text-white">
              {titleFor(card)}
            </div>
            <div className="mt-1 line-clamp-2 text-sm text-gray-400">
              {variantFor(card) || "Base"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CardsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [cards, setCards] = useState<CardRow[]>([]);
  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [addingVariantId, setAddingVariantId] = useState<number | null>(null);
  const [selectedCollections, setSelectedCollections] = useState<Record<number, string>>({});

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [sportFilter, setSportFilter] = useState(searchParams.get("sport") || "all");
  const [brandFilter, setBrandFilter] = useState(searchParams.get("brand") || "all");
  const [yearFilter, setYearFilter] = useState(searchParams.get("year") || "all");
  const [releaseTypeFilter, setReleaseTypeFilter] = useState(
    searchParams.get("releaseType") || "all"
  );
  const [conditionFilter, setConditionFilter] = useState(
    searchParams.get("condition") || "all"
  );
  const [hasAutoFilter, setHasAutoFilter] = useState(
    searchParams.get("auto") || "all"
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setSportFilter(searchParams.get("sport") || "all");
    setBrandFilter(searchParams.get("brand") || "all");
    setYearFilter(searchParams.get("year") || "all");
    setReleaseTypeFilter(searchParams.get("releaseType") || "all");
    setConditionFilter(searchParams.get("condition") || "all");
    setHasAutoFilter(searchParams.get("auto") || "all");
    setSortBy(searchParams.get("sort") || "newest");
  }, [searchParams]);

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (query.trim()) nextParams.set("q", query.trim());
    if (sportFilter !== "all") nextParams.set("sport", sportFilter);
    if (brandFilter !== "all") nextParams.set("brand", brandFilter);
    if (yearFilter !== "all") nextParams.set("year", yearFilter);
    if (releaseTypeFilter !== "all") {
      nextParams.set("releaseType", releaseTypeFilter);
    }
    if (conditionFilter !== "all") {
      nextParams.set("condition", conditionFilter);
    }
    if (hasAutoFilter !== "all") nextParams.set("auto", hasAutoFilter);
    if (sortBy !== "newest") nextParams.set("sort", sortBy);

    const nextQuery = nextParams.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery !== currentQuery) {
      router.replace(nextQuery ? `/cards?${nextQuery}` : "/cards", {
        scroll: false,
      });
    }
  }, [
    router,
    searchParams,
    query,
    sportFilter,
    brandFilter,
    yearFilter,
    releaseTypeFilter,
    conditionFilter,
    hasAutoFilter,
    sortBy,
  ]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        const [cardsResponse, collectionsResponse] = await Promise.all([
          fetch("/api/cards", { cache: "no-store" }),
          fetch("/api/collections", { cache: "no-store" }),
        ]);

        if (cardsResponse.status === 401 || collectionsResponse.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (!cardsResponse.ok) {
          throw new Error(`Failed to fetch cards (${cardsResponse.status})`);
        }

        if (!collectionsResponse.ok) {
          throw new Error(`Failed to fetch collections (${collectionsResponse.status})`);
        }

        const cardsData = await cardsResponse.json();
        const collectionsData = await collectionsResponse.json();

        setCards(Array.isArray(cardsData) ? cardsData : []);
        setCollections(Array.isArray(collectionsData) ? collectionsData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load cards");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  async function handleAddToCollection(card: CardRow) {
    const collectionId = selectedCollections[card.variant.id];

    if (!collectionId) {
      setError("Please select a collection first.");
      setSuccessMessage(null);
      return;
    }

    try {
      setAddingVariantId(card.variant.id);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`/api/collections/${collectionId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          card_variant_id: card.variant.id,
          quantity: 1,
        }),
      });

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Failed to add card (${response.status})`);
      }

      const collectionName =
        collections.find((collection) => String(collection.id) === collectionId)?.name ||
        "collection";

      setSuccessMessage(`Added "${titleFor(card)}" to ${collectionName}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add card to collection");
      setSuccessMessage(null);
    } finally {
      setAddingVariantId(null);
    }
  }

  function clearFilters() {
    setQuery("");
    setSportFilter("all");
    setBrandFilter("all");
    setYearFilter("all");
    setReleaseTypeFilter("all");
    setConditionFilter("all");
    setHasAutoFilter("all");
    setSortBy("newest");
    router.replace("/cards");
  }

  const hasActiveFilters =
    query.trim() !== "" ||
    sportFilter !== "all" ||
    brandFilter !== "all" ||
    yearFilter !== "all" ||
    releaseTypeFilter !== "all" ||
    conditionFilter !== "all" ||
    hasAutoFilter !== "all" ||
    sortBy !== "newest";

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (query.trim()) count += 1;
    if (sportFilter !== "all") count += 1;
    if (brandFilter !== "all") count += 1;
    if (yearFilter !== "all") count += 1;
    if (releaseTypeFilter !== "all") count += 1;
    if (conditionFilter !== "all") count += 1;
    if (hasAutoFilter !== "all") count += 1;
    if (sortBy !== "newest") count += 1;
    return count;
  }, [
    query,
    sportFilter,
    brandFilter,
    yearFilter,
    releaseTypeFilter,
    conditionFilter,
    hasAutoFilter,
    sortBy,
  ]);

  const sportOptions = useMemo(() => {
    const values = Array.from(
      new Set(cards.map((c) => c.product.sport_or_universe).filter(Boolean))
    ) as string[];
    return values.sort((a, b) => a.localeCompare(b));
  }, [cards]);

  const brandOptions = useMemo(() => {
    const values = Array.from(
      new Set(cards.map((c) => brandFor(c)).filter(Boolean))
    ) as string[];
    return values.sort((a, b) => a.localeCompare(b));
  }, [cards]);

  const yearOptions = useMemo(() => {
    const values = Array.from(
      new Set(cards.map((c) => c.product.year).filter((v): v is number => typeof v === "number"))
    );
    return values.sort((a, b) => b - a);
  }, [cards]);

  const releaseTypeOptions = useMemo(() => {
    const values = Array.from(
      new Set(cards.map((c) => c.product.release_type).filter(Boolean))
    ) as string[];
    return values.sort((a, b) => a.localeCompare(b));
  }, [cards]);

  const conditionOptions = useMemo(() => {
    const values = Array.from(
      new Set(cards.map((c) => c.condition.estimate || c.condition.type).filter(Boolean))
    ) as string[];
    return values.sort((a, b) => a.localeCompare(b));
  }, [cards]);

  const activeChips = useMemo<FilterChip[]>(() => {
    const chips: FilterChip[] = [];

    if (query.trim()) {
      chips.push({ key: "query", label: "Search", value: query.trim() });
    }

    if (sportFilter !== "all") {
      chips.push({ key: "sport", label: "Sport", value: sportFilter });
    }

    if (brandFilter !== "all") {
      chips.push({ key: "brand", label: "Brand", value: brandFilter });
    }

    if (yearFilter !== "all") {
      chips.push({ key: "year", label: "Year", value: yearFilter });
    }

    if (releaseTypeFilter !== "all") {
      chips.push({
        key: "releaseType",
        label: "Release",
        value: releaseTypeFilter,
      });
    }

    if (conditionFilter !== "all") {
      chips.push({
        key: "condition",
        label: "Condition",
        value: conditionFilter,
      });
    }

    if (hasAutoFilter === "yes") {
      chips.push({
        key: "auto",
        label: "Autograph",
        value: "Auto only",
      });
    } else if (hasAutoFilter === "no") {
      chips.push({
        key: "auto",
        label: "Autograph",
        value: "Non-auto",
      });
    }

    return chips;
  }, [
    query,
    sportFilter,
    brandFilter,
    yearFilter,
    releaseTypeFilter,
    conditionFilter,
    hasAutoFilter,
  ]);

  function removeChip(key: FilterChip["key"]) {
    switch (key) {
      case "query":
        setQuery("");
        break;
      case "sport":
        setSportFilter("all");
        break;
      case "brand":
        setBrandFilter("all");
        break;
      case "year":
        setYearFilter("all");
        break;
      case "releaseType":
        setReleaseTypeFilter("all");
        break;
      case "condition":
        setConditionFilter("all");
        break;
      case "auto":
        setHasAutoFilter("all");
        break;
    }
  }

  const filteredCards = useMemo(() => {
    let result = [...cards];

    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery) {
      result = result.filter((card) => searchableText(card).includes(normalizedQuery));
    }

    if (sportFilter !== "all") {
      result = result.filter((card) => card.product.sport_or_universe === sportFilter);
    }

    if (brandFilter !== "all") {
      result = result.filter((card) => brandFor(card) === brandFilter);
    }

    if (yearFilter !== "all") {
      result = result.filter((card) => String(card.product.year || "") === yearFilter);
    }

    if (releaseTypeFilter !== "all") {
      result = result.filter((card) => card.product.release_type === releaseTypeFilter);
    }

    if (conditionFilter !== "all") {
      result = result.filter(
        (card) =>
          card.condition.estimate === conditionFilter ||
          card.condition.type === conditionFilter
      );
    }

    if (hasAutoFilter === "yes") {
      result = result.filter((card) => Boolean(card.variant.autograph_flag));
    } else if (hasAutoFilter === "no") {
      result = result.filter((card) => !card.variant.autograph_flag);
    }

    result.sort((a, b) => {
      if (sortBy === "name") {
        return titleFor(a).localeCompare(titleFor(b));
      }

      if (sortBy === "year_desc") {
        return (b.product.year || 0) - (a.product.year || 0);
      }

      if (sortBy === "year_asc") {
        return (a.product.year || 0) - (b.product.year || 0);
      }

      if (sortBy === "price_desc") {
        return (
          (Number(b.purchase.purchase_price) || 0) -
          (Number(a.purchase.purchase_price) || 0)
        );
      }

      if (sortBy === "price_asc") {
        return (
          (Number(a.purchase.purchase_price) || 0) -
          (Number(b.purchase.purchase_price) || 0)
        );
      }

      return (b.id || 0) - (a.id || 0);
    });

    return result;
  }, [
    cards,
    query,
    sportFilter,
    brandFilter,
    yearFilter,
    releaseTypeFilter,
    conditionFilter,
    hasAutoFilter,
    sortBy,
  ]);

  return (
    <div className="grid-auto gap-6">
      <div className="page-header">
        <div className="page-header-copy">
          <h1 className="text-[32px] font-semibold tracking-tight">Cards</h1>
          <p className="page-description">
            Browse, filter, and organize your personal collection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="badge">
            {loading ? "Loading..." : `${filteredCards.length} of ${cards.length} cards`}
          </div>

          <Link href="/cards/new" className="button button-primary">
            Add Card
          </Link>
        </div>
      </div>

      <div className="sticky top-20 z-20">
        <div className="panel space-y-4 border-white/10 bg-[rgba(10,14,24,0.84)] backdrop-blur-xl">
          <div className="row-between gap-4">
            <div>
              <div className="text-sm text-[var(--muted)]">
                Refine your collection by search, category, set details, condition, and autograph status.
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                  {loading ? "Loading cards" : `Showing ${filteredCards.length} of ${cards.length}`}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                  {activeFilterCount} active filter{activeFilterCount === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            {hasActiveFilters ? (
              <button
                type="button"
                className="button button-secondary"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
            <div className="min-w-0 2xl:col-span-2">
              <label className="label">Search</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search player, card, set..."
                className="input w-full min-w-0"
              />
            </div>

            <div className="min-w-0">
              <label className="label">Sport / Universe</label>
              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                className="select w-full min-w-0"
              >
                <option value="all">All</option>
                {sportOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label className="label">Brand</label>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="select w-full min-w-0"
              >
                <option value="all">All</option>
                {brandOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label className="label">Year</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="select w-full min-w-0"
              >
                <option value="all">All</option>
                {yearOptions.map((option) => (
                  <option key={option} value={String(option)}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label className="label">Release Type</label>
              <select
                value={releaseTypeFilter}
                onChange={(e) => setReleaseTypeFilter(e.target.value)}
                className="select w-full min-w-0"
              >
                <option value="all">All</option>
                {releaseTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label className="label">Condition</label>
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="select w-full min-w-0"
              >
                <option value="all">All</option>
                {conditionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label className="label">Autograph</label>
              <select
                value={hasAutoFilter}
                onChange={(e) => setHasAutoFilter(e.target.value)}
                className="select w-full min-w-0"
              >
                <option value="all">All</option>
                <option value="yes">Auto only</option>
                <option value="no">Non-auto</option>
              </select>
            </div>

            <div className="min-w-0">
              <label className="label">Sort</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select w-full min-w-0"
              >
                <option value="newest">Newest</option>
                <option value="name">Name</option>
                <option value="year_desc">Year ↓</option>
                <option value="year_asc">Year ↑</option>
                <option value="price_desc">Price ↓</option>
                <option value="price_asc">Price ↑</option>
              </select>
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeChips.map((chip) => (
                <div
                  key={chip.key}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-200"
                >
                  <span className="text-gray-400">{chip.label}:</span>
                  <span className="font-medium text-white">{chip.value}</span>
                  <button
                    type="button"
                    onClick={() => removeChip(chip.key)}
                    className="text-gray-400 transition hover:text-white"
                    aria-label={`Remove ${chip.label} filter`}
                    title={`Remove ${chip.label} filter`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && <div className="panel">Loading cards...</div>}

      {error && (
        <div
          className="panel"
          style={{
            borderColor: "rgba(239,68,68,0.35)",
            color: "#fecaca",
          }}
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          className="panel"
          style={{
            borderColor: "rgba(34,197,94,0.35)",
            color: "#bbf7d0",
          }}
        >
          {successMessage}
        </div>
      )}

      {!loading && !error && filteredCards.length === 0 && (
        <div className="empty-state">
          <div className="text-base font-semibold text-white">No cards found</div>
          <div className="mt-2">
            {cards.length === 0
              ? "Your collection is empty. Add your first card to get started."
              : "No cards match the selected filters. Try clearing a few filters and search again."}
          </div>
          <div className="mt-4 flex justify-center gap-3">
            {hasActiveFilters ? (
              <button
                type="button"
                className="button button-secondary"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            ) : null}
            <Link href="/cards/new" className="button button-primary">
              Add Card
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && filteredCards.length > 0 && (
        <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">
          {filteredCards.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,30,53,0.92),rgba(12,19,36,0.96))] transition hover:border-indigo-400/40 hover:shadow-[0_8px_24px_rgba(79,70,229,0.15)]"
            >
              <div className="grid grid-cols-1 gap-0 xl:grid-cols-[200px_minmax(0,1fr)]">
                <div className="p-4">
                  <MediaPanel card={item} />
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
                      <div className={labelClassName()}>Condition</div>
                      <div className="mt-1 break-words text-sm text-gray-200">
                        {conditionFor(item) || "-"}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/10 p-3 md:col-span-2">
                      <div className={labelClassName()}>Purchase</div>
                      <div className="mt-1 break-words text-sm text-gray-200">
                        {formatMoney(item.purchase.purchase_price)}
                        {item.purchase.purchase_source
                          ? ` • ${item.purchase.purchase_source}`
                          : ""}
                        {item.purchase.purchase_date ? ` • ${item.purchase.purchase_date}` : ""}
                      </div>
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
                    {brandFor(item) && <span className={badgeClassName()}>{brandFor(item)}</span>}
                  </div>

                  {item.notes && (
                    <div className="mt-4 border-t border-white/10 pt-4">
                      <div className={labelClassName()}>Notes</div>
                      <div className="mt-1 break-words text-sm text-gray-300">{item.notes}</div>
                    </div>
                  )}

                  <div className="mt-4 border-t border-white/10 pt-4">
                    <div className={labelClassName()}>Add to collection</div>

                    {collections.length === 0 ? (
                      <div className="mt-2 text-sm text-gray-400">
                        No collections yet. Create one from the Collections page.
                      </div>
                    ) : (
                      <div className="mt-2 flex flex-col gap-2 lg:flex-row">
                        <select
                          value={selectedCollections[item.variant.id] || ""}
                          onChange={(e) =>
                            setSelectedCollections((prev) => ({
                              ...prev,
                              [item.variant.id]: e.target.value,
                            }))
                          }
                          className="select"
                        >
                          <option value="">Select collection</option>
                          {collections.map((collection) => (
                            <option key={collection.id} value={collection.id}>
                              {collection.name}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => handleAddToCollection(item)}
                          disabled={addingVariantId === item.variant.id}
                          className="button button-secondary shrink-0"
                        >
                          {addingVariantId === item.variant.id ? "Adding..." : "Add"}
                        </button>
                      </div>
                    )}
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
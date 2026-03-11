"use client";

import { useEffect, useMemo, useState } from "react";

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

type ChecklistCard = {
  id: number;
  product_id: number;
  player_name: string | null;
  team_or_franchise: string | null;
  card_number: string | null;
  card_name: string | null;
  variant_name: string | null;
  rookie_card: boolean | null;
};

type CardVariant = {
  id: number;
  checklist_card_id: number;
  parallel_name: string | null;
  variation_name: string | null;
  autograph_flag: boolean | null;
  autograph_type: string | null;
  relic_flag: boolean | null;
  patch_flag: boolean | null;
  relic_type: string | null;
  serial_total: number | null;
};

type Props = {
  initialProducts: Product[];
};

type ProductForm = {
  year: string;
  manufacturer: string;
  brand: string;
  product_name: string;
  sport_or_universe: string;
  release_type: string;
  release_date: string;
};

type CardForm = {
  player_name: string;
  team_or_franchise: string;
  card_number: string;
  card_name: string;
  variant_name: string;
  rookie_card: boolean;
};

type VariantForm = {
  parallel_name: string;
  variation_name: string;
  autograph_flag: boolean;
  autograph_type: string;
  relic_flag: boolean;
  patch_flag: boolean;
  relic_type: string;
  serial_total: string;
};

const emptyProductForm: ProductForm = {
  year: "",
  manufacturer: "",
  brand: "",
  product_name: "",
  sport_or_universe: "",
  release_type: "",
  release_date: "",
};

const emptyCardForm: CardForm = {
  player_name: "",
  team_or_franchise: "",
  card_number: "",
  card_name: "",
  variant_name: "",
  rookie_card: false,
};

const emptyVariantForm: VariantForm = {
  parallel_name: "",
  variation_name: "",
  autograph_flag: false,
  autograph_type: "",
  relic_flag: false,
  patch_flag: false,
  relic_type: "",
  serial_total: "",
};

function productLabel(product: Product) {
  return [
    product.year,
    product.brand || product.manufacturer,
    product.product_name,
    product.sport_or_universe,
    product.release_type,
  ]
    .filter(Boolean)
    .join(" • ");
}

function cardLabel(card: ChecklistCard) {
  return [card.player_name, card.card_number, card.card_name]
    .filter(Boolean)
    .join(" • ");
}

export default function CatalogManager({ initialProducts }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProducts[0] ? String(initialProducts[0].id) : ""
  );
  const [selectedCardId, setSelectedCardId] = useState<string>("");

  const [cards, setCards] = useState<ChecklistCard[]>([]);
  const [variants, setVariants] = useState<CardVariant[]>([]);

  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [cardForm, setCardForm] = useState<CardForm>(emptyCardForm);
  const [variantForm, setVariantForm] = useState<VariantForm>(emptyVariantForm);

  const [loadingCards, setLoadingCards] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [submitting, setSubmitting] = useState<
    "product" | "card" | "variant" | null
  >(null);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedProduct = useMemo(
    () => products.find((product) => String(product.id) === selectedProductId) || null,
    [products, selectedProductId]
  );

  const selectedCard = useMemo(
    () => cards.find((card) => String(card.id) === selectedCardId) || null,
    [cards, selectedCardId]
  );

  useEffect(() => {
    async function loadCards() {
      if (!selectedProductId) {
        setCards([]);
        setSelectedCardId("");
        return;
      }

      try {
        setLoadingCards(true);
        const response = await fetch(`/api/catalog/products/${selectedProductId}/cards`, {
          cache: "no-store",
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.detail || "Failed to load checklist cards");
        }

        setCards(Array.isArray(data) ? data : []);
        setSelectedCardId("");
        setVariants([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load checklist cards");
      } finally {
        setLoadingCards(false);
      }
    }

    loadCards();
  }, [selectedProductId]);

  useEffect(() => {
    async function loadVariants() {
      if (!selectedCardId) {
        setVariants([]);
        return;
      }

      try {
        setLoadingVariants(true);
        const response = await fetch(`/api/catalog/cards/${selectedCardId}/variants`, {
          cache: "no-store",
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.detail || "Failed to load variants");
        }

        setVariants(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load variants");
      } finally {
        setLoadingVariants(false);
      }
    }

    loadVariants();
  }, [selectedCardId]);

  async function refreshProducts(nextSelectedId?: string) {
    const response = await fetch("/api/catalog/products", {
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.detail || "Failed to reload products");
    }

    const nextProducts = Array.isArray(data) ? data : [];
    setProducts(nextProducts);

    if (nextSelectedId) {
      setSelectedProductId(nextSelectedId);
    } else if (!nextProducts.find((item) => String(item.id) === selectedProductId)) {
      setSelectedProductId(nextProducts[0] ? String(nextProducts[0].id) : "");
    }
  }

  async function refreshCards(productId: string, nextCardId?: string) {
    const response = await fetch(`/api/catalog/products/${productId}/cards`, {
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.detail || "Failed to reload checklist cards");
    }

    const nextCards = Array.isArray(data) ? data : [];
    setCards(nextCards);

    if (nextCardId) {
      setSelectedCardId(nextCardId);
    }
  }

  async function refreshVariants(cardId: string) {
    const response = await fetch(`/api/catalog/cards/${cardId}/variants`, {
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.detail || "Failed to reload variants");
    }

    setVariants(Array.isArray(data) ? data : []);
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting("product");
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/catalog/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year: productForm.year ? Number(productForm.year) : null,
          manufacturer: productForm.manufacturer || null,
          brand: productForm.brand || null,
          product_name: productForm.product_name || null,
          sport_or_universe: productForm.sport_or_universe || null,
          release_type: productForm.release_type || null,
          release_date: productForm.release_date || null,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to create product");
      }

      await refreshProducts(String(data.id));
      setProductForm(emptyProductForm);
      setSuccessMessage("Product created successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setSubmitting(null);
    }
  }

  async function handleCreateCard(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedProductId) {
      setError("Please select a product first.");
      return;
    }

    setSubmitting("card");
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/catalog/products/${selectedProductId}/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player_name: cardForm.player_name || null,
          team_or_franchise: cardForm.team_or_franchise || null,
          card_number: cardForm.card_number || null,
          card_name: cardForm.card_name || null,
          variant_name: cardForm.variant_name || null,
          rookie_card: cardForm.rookie_card,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to create checklist card");
      }

      await refreshCards(selectedProductId, String(data.id));
      setCardForm(emptyCardForm);
      setSuccessMessage("Checklist card created successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create checklist card");
    } finally {
      setSubmitting(null);
    }
  }

  async function handleCreateVariant(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedCardId) {
      setError("Please select a checklist card first.");
      return;
    }

    setSubmitting("variant");
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/catalog/cards/${selectedCardId}/variants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parallel_name: variantForm.parallel_name || null,
          variation_name: variantForm.variation_name || null,
          autograph_flag: variantForm.autograph_flag,
          autograph_type: variantForm.autograph_type || null,
          relic_flag: variantForm.relic_flag,
          patch_flag: variantForm.patch_flag,
          relic_type: variantForm.relic_type || null,
          serial_total: variantForm.serial_total
            ? Number(variantForm.serial_total)
            : null,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to create variant");
      }

      await refreshVariants(selectedCardId);
      setVariantForm(emptyVariantForm);
      setSuccessMessage("Variant created successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create variant");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="grid-auto gap-6">
      <div className="page-header">
        <div className="page-header-copy">
          <h1 className="text-[32px] font-semibold tracking-tight">Catalog Manager</h1>
          <p className="page-description">
            Create products, checklist cards, and variants for the shared collector catalog.
          </p>
        </div>

        <div className="badge">
          {products.length} product{products.length === 1 ? "" : "s"}
        </div>
      </div>

      {error ? (
        <div
          className="panel"
          style={{
            borderColor: "rgba(239,68,68,0.35)",
            color: "#fecaca",
          }}
        >
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div
          className="panel"
          style={{
            borderColor: "rgba(34,197,94,0.35)",
            color: "#bbf7d0",
          }}
        >
          {successMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="panel space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Create Product</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Add a new set or release to the master catalog.
            </p>
          </div>

          <form onSubmit={handleCreateProduct} className="grid gap-4">
            <div>
              <label className="label">Year</label>
              <input
                className="input"
                type="number"
                value={productForm.year}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, year: e.target.value }))
                }
                placeholder="2024"
              />
            </div>

            <div>
              <label className="label">Manufacturer</label>
              <input
                className="input"
                value={productForm.manufacturer}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    manufacturer: e.target.value,
                  }))
                }
                placeholder="Panini"
              />
            </div>

            <div>
              <label className="label">Brand</label>
              <input
                className="input"
                value={productForm.brand}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, brand: e.target.value }))
                }
                placeholder="Prizm"
              />
            </div>

            <div>
              <label className="label">Product Name</label>
              <input
                className="input"
                value={productForm.product_name}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    product_name: e.target.value,
                  }))
                }
                placeholder="Basketball"
              />
            </div>

            <div>
              <label className="label">Sport / Universe</label>
              <input
                className="input"
                value={productForm.sport_or_universe}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    sport_or_universe: e.target.value,
                  }))
                }
                placeholder="Basketball"
              />
            </div>

            <div>
              <label className="label">Release Type</label>
              <input
                className="input"
                value={productForm.release_type}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    release_type: e.target.value,
                  }))
                }
                placeholder="Hobby"
              />
            </div>

            <div>
              <label className="label">Release Date</label>
              <input
                className="input"
                type="date"
                value={productForm.release_date}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    release_date: e.target.value,
                  }))
                }
              />
            </div>

            <button
              type="submit"
              className="button button-primary"
              disabled={submitting === "product"}
            >
              {submitting === "product" ? "Creating..." : "Create Product"}
            </button>
          </form>
        </section>

        <section className="panel space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Add Checklist Card</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Select a product, then add a player/card entry to its checklist.
            </p>
          </div>

          <div>
            <label className="label">Product</label>
            <select
              className="select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {productLabel(product)}
                </option>
              ))}
            </select>
          </div>

          {selectedProduct ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-gray-300">
              {productLabel(selectedProduct)}
            </div>
          ) : null}

          <form onSubmit={handleCreateCard} className="grid gap-4">
            <div>
              <label className="label">Player Name</label>
              <input
                className="input"
                value={cardForm.player_name}
                onChange={(e) =>
                  setCardForm((prev) => ({ ...prev, player_name: e.target.value }))
                }
                placeholder="Victor Wembanyama"
              />
            </div>

            <div>
              <label className="label">Team / Franchise</label>
              <input
                className="input"
                value={cardForm.team_or_franchise}
                onChange={(e) =>
                  setCardForm((prev) => ({
                    ...prev,
                    team_or_franchise: e.target.value,
                  }))
                }
                placeholder="Spurs"
              />
            </div>

            <div>
              <label className="label">Card Number</label>
              <input
                className="input"
                value={cardForm.card_number}
                onChange={(e) =>
                  setCardForm((prev) => ({ ...prev, card_number: e.target.value }))
                }
                placeholder="136"
              />
            </div>

            <div>
              <label className="label">Card Name</label>
              <input
                className="input"
                value={cardForm.card_name}
                onChange={(e) =>
                  setCardForm((prev) => ({ ...prev, card_name: e.target.value }))
                }
                placeholder="Base"
              />
            </div>

            <div>
              <label className="label">Variant Name</label>
              <input
                className="input"
                value={cardForm.variant_name}
                onChange={(e) =>
                  setCardForm((prev) => ({ ...prev, variant_name: e.target.value }))
                }
                placeholder="Rookie"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={cardForm.rookie_card}
                onChange={(e) =>
                  setCardForm((prev) => ({
                    ...prev,
                    rookie_card: e.target.checked,
                  }))
                }
              />
              Rookie card
            </label>

            <button
              type="submit"
              className="button button-primary"
              disabled={submitting === "card" || !selectedProductId}
            >
              {submitting === "card" ? "Creating..." : "Create Checklist Card"}
            </button>
          </form>

          <div className="border-t border-white/10 pt-4">
            <div className="mb-2 text-sm font-medium text-white">Existing Cards</div>
            {loadingCards ? (
              <div className="text-sm text-gray-400">Loading cards...</div>
            ) : cards.length === 0 ? (
              <div className="text-sm text-gray-400">No checklist cards for this product yet.</div>
            ) : (
              <div className="space-y-2">
                {cards.slice(0, 8).map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setSelectedCardId(String(card.id))}
                    className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                      String(card.id) === selectedCardId
                        ? "border-indigo-400/50 bg-indigo-500/10 text-white"
                        : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20"
                    }`}
                  >
                    {cardLabel(card)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="panel space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Add Variant</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Select a checklist card, then add a parallel, auto, relic, or numbered variation.
            </p>
          </div>

          <div>
            <label className="label">Checklist Card</label>
            <select
              className="select"
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              disabled={!cards.length}
            >
              <option value="">Select checklist card</option>
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {cardLabel(card)}
                </option>
              ))}
            </select>
          </div>

          {selectedCard ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-gray-300">
              {cardLabel(selectedCard)}
            </div>
          ) : null}

          <form onSubmit={handleCreateVariant} className="grid gap-4">
            <div>
              <label className="label">Parallel Name</label>
              <input
                className="input"
                value={variantForm.parallel_name}
                onChange={(e) =>
                  setVariantForm((prev) => ({
                    ...prev,
                    parallel_name: e.target.value,
                  }))
                }
                placeholder="Silver"
              />
            </div>

            <div>
              <label className="label">Variation Name</label>
              <input
                className="input"
                value={variantForm.variation_name}
                onChange={(e) =>
                  setVariantForm((prev) => ({
                    ...prev,
                    variation_name: e.target.value,
                  }))
                }
                placeholder="Prizm"
              />
            </div>

            <div>
              <label className="label">Serial Total</label>
              <input
                className="input"
                type="number"
                value={variantForm.serial_total}
                onChange={(e) =>
                  setVariantForm((prev) => ({
                    ...prev,
                    serial_total: e.target.value,
                  }))
                }
                placeholder="10"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={variantForm.autograph_flag}
                onChange={(e) =>
                  setVariantForm((prev) => ({
                    ...prev,
                    autograph_flag: e.target.checked,
                  }))
                }
              />
              Autograph
            </label>

            <div>
              <label className="label">Autograph Type</label>
              <input
                className="input"
                value={variantForm.autograph_type}
                onChange={(e) =>
                  setVariantForm((prev) => ({
                    ...prev,
                    autograph_type: e.target.value,
                  }))
                }
                placeholder="On-card"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={variantForm.relic_flag}
                onChange={(e) =>
                  setVariantForm((prev) => ({
                    ...prev,
                    relic_flag: e.target.checked,
                  }))
                }
              />
              Relic
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={variantForm.patch_flag}
                onChange={(e) =>
                  setVariantForm((prev) => ({
                    ...prev,
                    patch_flag: e.target.checked,
                  }))
                }
              />
              Patch
            </label>

            <div>
              <label className="label">Relic Type</label>
              <input
                className="input"
                value={variantForm.relic_type}
                onChange={(e) =>
                  setVariantForm((prev) => ({
                    ...prev,
                    relic_type: e.target.value,
                  }))
                }
                placeholder="Jersey"
              />
            </div>

            <button
              type="submit"
              className="button button-primary"
              disabled={submitting === "variant" || !selectedCardId}
            >
              {submitting === "variant" ? "Creating..." : "Create Variant"}
            </button>
          </form>

          <div className="border-t border-white/10 pt-4">
            <div className="mb-2 text-sm font-medium text-white">Existing Variants</div>
            {loadingVariants ? (
              <div className="text-sm text-gray-400">Loading variants...</div>
            ) : variants.length === 0 ? (
              <div className="text-sm text-gray-400">No variants for this checklist card yet.</div>
            ) : (
              <div className="space-y-2">
                {variants.slice(0, 8).map((variant) => (
                  <div
                    key={variant.id}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300"
                  >
                    {[
                      variant.parallel_name,
                      variant.variation_name,
                      variant.autograph_flag ? "Auto" : null,
                      variant.relic_flag ? "Relic" : null,
                      variant.patch_flag ? "Patch" : null,
                      variant.serial_total ? `/${variant.serial_total}` : null,
                    ]
                      .filter(Boolean)
                      .join(" • ") || "Base"}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = "http://127.0.0.1:8000";

type Product = {
  id: number;
  year: number;
  manufacturer: string;
  brand: string;
  product_name: string;
  sport_or_universe: string;
  release_type?: string | null;
};

type ChecklistCard = {
  id: number;
  product_id: number;
  player_name: string;
  team_or_franchise?: string | null;
  card_number?: string | null;
  card_name: string;
  variant_name?: string | null;
  rookie_card: boolean;
};

type CardVariant = {
  id: number;
  checklist_card_id: number;
  parallel_name?: string | null;
  variation_name?: string | null;
  autograph_flag: boolean;
  autograph_type?: string | null;
  relic_flag: boolean;
  patch_flag: boolean;
  relic_type?: string | null;
  serial_total?: number | null;
};

type Collection = {
  id: number;
  name: string;
};

type FormState = {
  productId: string;
  checklistCardId: string;
  cardVariantId: string;
  collectionId: string;
  conditionType: "raw" | "graded";
  rawConditionEstimate: string;
  grader: string;
  grade: string;
  serialNumberObserved: string;
  purchasePrice: string;
  purchaseDate: string;
  purchaseSource: string;
  notes: string;
};

const initialForm: FormState = {
  productId: "",
  checklistCardId: "",
  cardVariantId: "",
  collectionId: "",
  conditionType: "raw",
  rawConditionEstimate: "near_mint",
  grader: "",
  grade: "",
  serialNumberObserved: "",
  purchasePrice: "",
  purchaseDate: "",
  purchaseSource: "",
  notes: "",
};

export default function NewCardForm() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [checklistCards, setChecklistCards] = useState<ChecklistCard[]>([]);
  const [variants, setVariants] = useState<CardVariant[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  const [form, setForm] = useState<FormState>(initialForm);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingChecklistCards, setLoadingChecklistCards] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoadingProducts(true);
        setError("");

        const res = await fetch(`${API_BASE}/catalog/products`);
        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || `Failed to load products (${res.status})`);
        }

        const data: Product[] = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function loadCollections() {
      try {
        setLoadingCollections(true);

        const res = await fetch("/api/collections", { cache: "no-store" });

        if (res.status === 401) {
          router.push("/login");
          return;
        }

        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || `Failed to load collections (${res.status})`);
        }

        const data: Collection[] = await res.json();
        setCollections(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load collections");
      } finally {
        setLoadingCollections(false);
      }
    }

    loadCollections();
  }, [router]);

  useEffect(() => {
    async function loadChecklistCards() {
      if (!form.productId) {
        setChecklistCards([]);
        setVariants([]);
        setForm((prev) => ({
          ...prev,
          checklistCardId: "",
          cardVariantId: "",
        }));
        return;
      }

      try {
        setLoadingChecklistCards(true);
        setError("");
        setChecklistCards([]);
        setVariants([]);

        const res = await fetch(`${API_BASE}/catalog/products/${form.productId}/cards`);
        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || `Failed to load checklist cards (${res.status})`);
        }

        const data: ChecklistCard[] = await res.json();
        setChecklistCards(data);
        setForm((prev) => ({
          ...prev,
          checklistCardId: "",
          cardVariantId: "",
        }));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load checklist cards"
        );
      } finally {
        setLoadingChecklistCards(false);
      }
    }

    loadChecklistCards();
  }, [form.productId]);

  useEffect(() => {
    async function loadVariants() {
      if (!form.checklistCardId) {
        setVariants([]);
        setForm((prev) => ({
          ...prev,
          cardVariantId: "",
        }));
        return;
      }

      try {
        setLoadingVariants(true);
        setError("");
        setVariants([]);

        const res = await fetch(`${API_BASE}/catalog/cards/${form.checklistCardId}/variants`);
        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || `Failed to load variants (${res.status})`);
        }

        const data: CardVariant[] = await res.json();
        setVariants(data);
        setForm((prev) => ({
          ...prev,
          cardVariantId: "",
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load variants");
      } finally {
        setLoadingVariants(false);
      }
    }

    loadVariants();
  }, [form.checklistCardId]);

  const selectedProduct = useMemo(
    () => products.find((p) => String(p.id) === form.productId) ?? null,
    [products, form.productId]
  );

  const selectedChecklistCard = useMemo(
    () => checklistCards.find((c) => String(c.id) === form.checklistCardId) ?? null,
    [checklistCards, form.checklistCardId]
  );

  const selectedVariant = useMemo(
    () => variants.find((v) => String(v.id) === form.cardVariantId) ?? null,
    [variants, form.cardVariantId]
  );

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.cardVariantId) {
      setError("Please select a variant.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        card_variant_id: Number(form.cardVariantId),
        condition_type: form.conditionType,
        raw_condition_estimate:
          form.conditionType === "raw" ? form.rawConditionEstimate || null : null,
        grader: form.conditionType === "graded" ? form.grader || null : null,
        grade: form.conditionType === "graded" ? form.grade || null : null,
        serial_number_observed: form.serialNumberObserved
          ? Number(form.serialNumberObserved)
          : null,
        purchase_price: form.purchasePrice ? Number(form.purchasePrice) : null,
        purchase_date: form.purchaseDate || null,
        purchase_source: form.purchaseSource || null,
        notes: form.notes || null,
      };

      const saveRes = await fetch(`/api/cards/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (saveRes.status === 401) {
        router.push("/login");
        return;
      }

      if (!saveRes.ok) {
        const body = await saveRes.text();
        throw new Error(body || "Failed to save card");
      }

      if (form.collectionId) {
        const addRes = await fetch(`/api/collections/${form.collectionId}/items`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            card_variant_id: Number(form.cardVariantId),
            quantity: 1,
          }),
        });

        if (addRes.status === 401) {
          router.push("/login");
          return;
        }

        if (!addRes.ok) {
          const body = await addRes.text();
          throw new Error(body || "Card saved, but failed to add to collection");
        }
      }

      router.push("/cards");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save card");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid-auto gap-6">
      <div className="page-header">
        <div className="page-header-copy">
          <Link href="/cards" className="nav-link inline-flex px-0 py-0 text-sm">
            ← Back to cards
          </Link>
          <h1 className="mt-3 text-[32px] font-semibold tracking-tight">Add Card</h1>
          <p className="page-description">
            Select a product, card, and variant, then enter your owned-copy details.
          </p>
        </div>

        <div className="badge">
          {selectedVariant ? "Ready to save" : "Select a variant"}
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid-auto gap-6">
        <div className="panel">
          <SectionTitle title="Catalog Selection" />

          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Product"
              value={form.productId}
              onChange={(v) => updateField("productId", v)}
              disabled={loadingProducts}
              options={[
                {
                  value: "",
                  label: loadingProducts ? "Loading products..." : "Select product",
                },
                ...products.map((product) => ({
                  value: String(product.id),
                  label: `${product.year} ${product.brand} ${product.product_name}`,
                })),
              ]}
            />

            <SelectField
              label="Checklist Card"
              value={form.checklistCardId}
              onChange={(v) => updateField("checklistCardId", v)}
              disabled={!form.productId || loadingChecklistCards}
              options={[
                {
                  value: "",
                  label: !form.productId
                    ? "Select product first"
                    : loadingChecklistCards
                      ? "Loading cards..."
                      : "Select card",
                },
                ...checklistCards.map((card) => ({
                  value: String(card.id),
                  label: `${card.player_name}${card.card_number ? ` • #${card.card_number}` : ""}${
                    card.rookie_card ? " • Rookie" : ""
                  }`,
                })),
              ]}
            />

            <SelectField
              label="Variant"
              value={form.cardVariantId}
              onChange={(v) => updateField("cardVariantId", v)}
              disabled={!form.checklistCardId || loadingVariants}
              options={[
                {
                  value: "",
                  label: !form.checklistCardId
                    ? "Select card first"
                    : loadingVariants
                      ? "Loading variants..."
                      : "Select variant",
                },
                ...variants.map((variant) => ({
                  value: String(variant.id),
                  label: buildVariantLabel(variant),
                })),
              ]}
            />

            <SelectField
              label="Add to Collection (optional)"
              value={form.collectionId}
              onChange={(v) => updateField("collectionId", v)}
              disabled={loadingCollections}
              options={[
                {
                  value: "",
                  label: loadingCollections ? "Loading collections..." : "Do not add now",
                },
                ...collections.map((collection) => ({
                  value: String(collection.id),
                  label: collection.name,
                })),
              ]}
            />
          </div>
        </div>

        <SelectionSummary
          product={selectedProduct}
          checklistCard={selectedChecklistCard}
          variant={selectedVariant}
        />

        <div className="panel">
          <SectionTitle title="Owned Copy Details" />

          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Condition Type"
              value={form.conditionType}
              onChange={(v) =>
                updateField("conditionType", v as FormState["conditionType"])
              }
              options={[
                { value: "raw", label: "Raw" },
                { value: "graded", label: "Graded" },
              ]}
            />

            {form.conditionType === "raw" ? (
              <SelectField
                label="Raw Condition Estimate"
                value={form.rawConditionEstimate}
                onChange={(v) => updateField("rawConditionEstimate", v)}
                options={[
                  { value: "near_mint_mint", label: "Near Mint-Mint" },
                  { value: "near_mint", label: "Near Mint" },
                  { value: "excellent", label: "Excellent" },
                  { value: "very_good", label: "Very Good" },
                  { value: "good", label: "Good" },
                ]}
              />
            ) : (
              <>
                <Field
                  label="Grader"
                  value={form.grader}
                  onChange={(v) => updateField("grader", v)}
                />
                <Field
                  label="Grade"
                  value={form.grade}
                  onChange={(v) => updateField("grade", v)}
                />
              </>
            )}

            <Field
              label="Observed Serial Number"
              type="number"
              value={form.serialNumberObserved}
              onChange={(v) => updateField("serialNumberObserved", v)}
            />
            <Field
              label="Purchase Price"
              type="number"
              step="0.01"
              value={form.purchasePrice}
              onChange={(v) => updateField("purchasePrice", v)}
            />
            <Field
              label="Purchase Date"
              type="date"
              value={form.purchaseDate}
              onChange={(v) => updateField("purchaseDate", v)}
            />
            <Field
              label="Purchase Source"
              value={form.purchaseSource}
              onChange={(v) => updateField("purchaseSource", v)}
            />
          </div>

          <div className="mt-4">
            <label className="label">Notes</label>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              className="textarea"
              placeholder="Add any details about this copy..."
            />
          </div>
        </div>

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

        <div className="row">
          <button
            type="submit"
            disabled={saving || !form.cardVariantId}
            className="button button-primary"
          >
            {saving ? "Saving..." : "Save Card"}
          </button>

          <Link href="/cards" className="button button-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function buildVariantLabel(variant: CardVariant) {
  const parts: string[] = [];

  parts.push(variant.parallel_name || "Base");

  if (variant.variation_name) {
    parts.push(variant.variation_name);
  }

  if (variant.autograph_flag) {
    parts.push(
      variant.autograph_type ? `Auto (${variant.autograph_type})` : "Auto"
    );
  }

  if (variant.relic_flag) {
    parts.push("Relic");
  }

  if (variant.patch_flag) {
    parts.push("Patch");
  }

  if (variant.relic_type) {
    parts.push(variant.relic_type);
  }

  if (variant.serial_total != null) {
    parts.push(`/${variant.serial_total}`);
  }

  return parts.join(" • ");
}

function SelectionSummary({
  product,
  checklistCard,
  variant,
}: {
  product: Product | null;
  checklistCard: ChecklistCard | null;
  variant: CardVariant | null;
}) {
  if (!product && !checklistCard && !variant) {
    return null;
  }

  return (
    <div className="panel">
      <SectionTitle title="Selected Card" />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <InfoRow
          label="Product"
          value={
            product
              ? `${product.year} ${product.brand} ${product.product_name}`
              : "—"
          }
        />
        <InfoRow
          label="Player / Character"
          value={checklistCard?.player_name || "—"}
        />
        <InfoRow
          label="Team / Franchise"
          value={checklistCard?.team_or_franchise || "—"}
        />
        <InfoRow
          label="Card Number"
          value={checklistCard?.card_number || "—"}
        />
        <InfoRow
          label="Card Name"
          value={checklistCard?.card_name || "—"}
        />
        <InfoRow
          label="Rookie"
          value={checklistCard ? (checklistCard.rookie_card ? "Yes" : "No") : "—"}
        />
        <InfoRow
          label="Variant"
          value={variant ? buildVariantLabel(variant) : "—"}
        />
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/10 p-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 break-words text-sm text-white">{value}</p>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  step?: string;
};

function Field({
  label,
  value,
  onChange,
  required = false,
  type = "text",
  step,
}: FieldProps) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        step={step}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
    </div>
  );
}

type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
};

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: SelectFieldProps) {
  return (
    <div>
      <label className="label">{label}</label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="select"
      >
        {options.map((option) => (
          <option key={`${label}-${option.value}-${option.label}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
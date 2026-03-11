import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccessToken, getAuthHeader } from "@/lib/auth";

const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000";

async function createCollection(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();

  if (!name) {
    return;
  }

  const response = await fetch(`${API_BASE_URL}/collections/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeader()),
    },
    body: JSON.stringify({ name }),
    cache: "no-store",
  });

  if (response.status === 401) {
    redirect("/login");
  }

  redirect("/collections");
}

export default async function CollectionsPage() {
  const token = await getAccessToken();

  if (!token) {
    redirect("/login");
  }

  const res = await fetch(`${API_BASE_URL}/collections/`, {
    headers: await getAuthHeader(),
    cache: "no-store",
  });

  if (res.status === 401) {
    redirect("/login");
  }

  if (!res.ok) {
    throw new Error(`Failed to load collections (${res.status})`);
  }

  const collections = await res.json();

  return (
    <div className="grid-auto gap-6">
      <div className="page-header">
        <div className="page-header-copy">
          <h1 className="text-[32px] font-semibold tracking-tight">Collections</h1>
          <p className="page-description">
            Organize your cards into themed groups and personal sets.
          </p>
        </div>

        <div className="badge">
          {Array.isArray(collections) ? `${collections.length} collections` : "0 collections"}
        </div>
      </div>

      <div className="panel">
        <form action={createCollection} className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <label htmlFor="name" className="label">
              New collection
            </label>
            <input
              id="name"
              className="input"
              type="text"
              name="name"
              placeholder="Enter a collection name"
              required
            />
          </div>

          <div className="flex items-end">
            <button className="button button-primary" type="submit">
              Create Collection
            </button>
          </div>
        </form>
      </div>

      {!Array.isArray(collections) || collections.length === 0 ? (
        <div className="empty-state">
          <div className="text-base font-semibold text-white">No collections yet</div>
          <div className="mt-2">
            Create your first collection to start grouping your cards.
          </div>
        </div>
      ) : (
        <div className="collection-grid">
          {collections.map((collection: { id: number; name: string }) => (
            <div
              key={collection.id}
              className="item-card transition hover:border-indigo-400/40 hover:shadow-[0_8px_24px_rgba(79,70,229,0.15)]"
            >
              <div className="row-between">
                <div className="min-w-0">
                  <h2 className="break-words text-xl font-semibold text-white">
                    {collection.name}
                  </h2>
                  <p className="item-card-subtitle">Personal collection</p>
                </div>

                <div className="badge">#{collection.id}</div>
              </div>

              <div className="item-card-meta">
                <span className="badge">Collector Set</span>
              </div>

              <div className="mt-5">
                <Link
                  href={`/collections/${collection.id}`}
                  className="button button-secondary"
                >
                  Open Collection
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
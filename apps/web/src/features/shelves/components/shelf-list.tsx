"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import type { ShelfListItem } from "@lumis/shared-types";
import { Plus } from "lucide-react";
import { createShelf, fetchShelves } from "../api/shelves-client";
import { ShelfCard } from "./shelf-card";

export function ShelfList() {
  const router = useRouter();
  const t = useTranslations("shelvesList");
  const [shelves, setShelves] = useState<ShelfListItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [newShelfName, setNewShelfName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateCard, setShowCreateCard] = useState(false);

  useEffect(() => {
    fetchShelves()
      .then((data) => {
        setShelves(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!newShelfName.trim()) return;

    setIsCreating(true);
    try {
      const shelf = await createShelf({ name: newShelfName.trim() });
      router.push(`/shelves/${shelf.id}`);
    } finally {
      setIsCreating(false);
    }
  }

  if (status === "loading") return <p>{t("loading")}</p>;
  if (status === "error") return <p>{t("loadError")}</p>;

  return (
    <div>
      <div className="shelf-list-header">
        <h1>{t("title")}</h1>
      </div>

      <div className="shelf-grid">
        {shelves.map((shelf, index) => (
          <ShelfCard key={shelf.id} shelf={shelf} index={index} />
        ))}

        <div className="shelf-create-card">
          {showCreateCard ? (
            <form className="shelf-create-card-form" onSubmit={handleCreate}>
              <input
                autoFocus
                value={newShelfName}
                onChange={(event) => setNewShelfName(event.target.value)}
                placeholder={t("namePlaceholder")}
                onBlur={() => {
                  if (!newShelfName.trim()) setShowCreateCard(false);
                }}
              />
              <button type="submit" disabled={isCreating}>
                {isCreating ? t("creating") : t("create")}
              </button>
            </form>
          ) : (
            <button
              type="button"
              className="shelf-create-card-trigger"
              onClick={() => setShowCreateCard(true)}
            >
              <span className="shelf-create-card-icon">
                <Plus size={22} />
              </span>
              <span className="shelf-create-card-title">{t("createNew")}</span>
              <span className="shelf-create-card-subtitle">{t("createSubtitle")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

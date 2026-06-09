"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import {
  addProductToList,
  createSavedList,
  deleteSavedList,
  removeProductFromList,
  renameSavedList,
  setListVisibility,
} from "@/lib/actions/lists";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  ProductPickerOption,
  SavedListItemRow,
  SavedListSummary,
} from "@/lib/db/lists";

export function ListsManager({
  initialLists,
  initialItemsByList,
  initialProducts,
}: {
  initialLists: SavedListSummary[];
  initialItemsByList: Record<string, SavedListItemRow[]>;
  initialProducts: ProductPickerOption[];
}) {
  const router = useRouter();
  const [lists, setLists] = useState(initialLists);
  const [itemsByList, setItemsByList] = useState(initialItemsByList);
  const [activeListId, setActiveListId] = useState<string | null>(
    initialLists[0]?.id ?? null,
  );
  const [newListName, setNewListName] = useState("");
  const [renameValue, setRenameValue] = useState(
    initialLists[0]?.name ?? "",
  );
  const [productQuery, setProductQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLists(initialLists);
    setItemsByList(initialItemsByList);
    if (!activeListId && initialLists[0]) {
      setActiveListId(initialLists[0].id);
      setRenameValue(initialLists[0].name);
    }
  }, [initialLists, initialItemsByList, activeListId]);

  const activeList = lists.find((l) => l.id === activeListId) ?? null;
  const activeItems = activeListId ? itemsByList[activeListId] ?? [] : [];

  const filteredProducts = initialProducts.filter((p) => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.brand ?? "").toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q)
    );
  });

  function refresh() {
    router.refresh();
  }

  function handleCreateList() {
    setError(null);
    startTransition(async () => {
      const result = await createSavedList({ name: newListName });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNewListName("");
      refresh();
    });
  }

  function handleRename() {
    if (!activeList) return;
    setError(null);
    startTransition(async () => {
      const result = await renameSavedList(activeList.id, renameValue);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      refresh();
    });
  }

  function handleDeleteList(listId: string) {
    if (!confirm("Delete this list and all saved products on it?")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteSavedList(listId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (activeListId === listId) setActiveListId(null);
      refresh();
    });
  }

  function handleToggleVisibility() {
    if (!activeList) return;
    const next = activeList.visibility === "public" ? "private" : "public";
    startTransition(async () => {
      const result = await setListVisibility(activeList.id, next);
      if (!result.ok) setError(result.error);
      else refresh();
    });
  }

  function handleAddProduct() {
    if (!activeList || !selectedProductId) return;
    setError(null);
    startTransition(async () => {
      const result = await addProductToList(activeList.id, selectedProductId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSelectedProductId("");
      refresh();
    });
  }

  function handleRemoveItem(itemId: string) {
    if (!activeList) return;
    startTransition(async () => {
      const result = await removeProductFromList(activeList.id, itemId);
      if (!result.ok) setError(result.error);
      else refresh();
    });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          My lists
        </h1>
        <p className="mt-2 text-muted-foreground">
          Save products to lists — public lists appear on your profile.
        </p>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        <Input
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="New list name"
          className="max-w-xs"
          disabled={isPending}
        />
        <Button type="button" onClick={handleCreateList} disabled={isPending}>
          <Plus className="size-4" />
          Create list
        </Button>
      </div>

      {lists.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            You haven&apos;t saved any lists yet — create one to start collecting
            products.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="flex flex-col gap-2">
            {lists.map((list) => (
              <button
                key={list.id}
                type="button"
                onClick={() => {
                  setActiveListId(list.id);
                  setRenameValue(list.name);
                }}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition",
                  activeListId === list.id
                    ? "border-foreground bg-secondary"
                    : "border-border bg-card hover:border-foreground",
                )}
              >
                <div className="font-medium">{list.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {list.itemCount} product{list.itemCount === 1 ? "" : "s"} ·{" "}
                  {list.visibility}
                </div>
              </button>
            ))}
          </div>

          {activeList ? (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="max-w-xs"
                  disabled={isPending}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRename}
                  disabled={isPending}
                >
                  <Pencil className="size-3.5" />
                  Rename
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleToggleVisibility}
                  disabled={isPending}
                >
                  Make {activeList.visibility === "public" ? "private" : "public"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteList(activeList.id)}
                  disabled={isPending}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              </div>

              <div className="mt-6 border-t border-border pt-5">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Add a product
                </h3>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                    placeholder="Search approved products…"
                    disabled={isPending}
                  />
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    disabled={isPending}
                    className="h-11 rounded-lg border border-border bg-card px-3 text-sm"
                  >
                    <option value="">Select product</option>
                    {filteredProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.brand ? `${p.brand} · ` : ""}
                        {p.name} ({p.categoryName})
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    onClick={handleAddProduct}
                    disabled={isPending || !selectedProductId}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <ul className="mt-6 flex flex-col gap-2">
                {activeItems.length === 0 ? (
                  <li className="text-sm text-muted-foreground">
                    No products on this list yet.
                  </li>
                ) : (
                  activeItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/categories/${item.categorySlug}/${item.productSlug}`}
                          className="block truncate font-medium hover:text-coral"
                        >
                          {item.productBrand ? `${item.productBrand} · ` : ""}
                          {item.productName}
                        </Link>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isPending}
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                        aria-label="Remove from list"
                      >
                        <X className="size-4" />
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

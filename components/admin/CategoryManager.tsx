"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import {
  createCategory,
  deleteCategory,
  setCategoryActive,
  setCategoryFeatured,
  updateCategory,
} from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AdminCategoryRow } from "@/lib/db/admin";

export function CategoryManager({
  categories,
}: {
  categories: AdminCategoryRow[];
}) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function refresh() {
    router.refresh();
  }

  function startEdit(category: AdminCategoryRow) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditSlug(category.slug);
    setEditDescription(category.description ?? "");
  }

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createCategory({
        name: newName,
        slug: newSlug || undefined,
        description: newDescription || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setShowCreate(false);
      setNewName("");
      setNewSlug("");
      setNewDescription("");
      refresh();
    });
  }

  function handleSaveEdit(categoryId: string) {
    setError(null);
    startTransition(async () => {
      const result = await updateCategory(categoryId, {
        name: editName,
        slug: editSlug,
        description: editDescription,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditingId(null);
      refresh();
    });
  }

  function handleDelete(categoryId: string, name: string) {
    if (!confirm(`Delete category "${name}"? This only works when empty.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteCategory(categoryId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      refresh();
    });
  }

  function handleToggleFeatured(categoryId: string, current: boolean) {
    startTransition(async () => {
      const result = await setCategoryFeatured(categoryId, !current);
      if (!result.ok) setError(result.error);
      else refresh();
    });
  }

  function handleToggleActive(categoryId: string, current: boolean) {
    startTransition(async () => {
      const result = await setCategoryActive(categoryId, !current);
      if (!result.ok) setError(result.error);
      else refresh();
    });
  }

  return (
    <div>
      {error ? (
        <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {!showCreate ? (
        <Button type="button" className="mb-6" onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          Add category
        </Button>
      ) : (
        <div className="mb-6 rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold">New category</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-name">Name</Label>
              <Input
                id="new-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-slug">Slug (optional)</Label>
              <Input
                id="new-slug"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="new-desc">Description</Label>
              <Input
                id="new-desc"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="button" disabled={isPending} onClick={handleCreate}>
              Create
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                Products
              </th>
              <th className="px-4 py-3 font-semibold">Featured</th>
              <th className="px-4 py-3 font-semibold">Active</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) =>
              editingId === category.id ? (
                <tr key={category.id} className="border-t border-border">
                  <td colSpan={5} className="px-4 py-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={isPending}
                        placeholder="Name"
                      />
                      <Input
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        disabled={isPending}
                        placeholder="Slug"
                      />
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        disabled={isPending}
                        placeholder="Description"
                      />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleSaveEdit(category.id)}
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={category.id} className="border-t border-border">
                  <td className="px-4 py-4">
                    <div className="font-medium">{category.name}</div>
                    <div className="text-muted-foreground">/{category.slug}</div>
                  </td>
                  <td className="hidden px-4 py-4 text-muted-foreground sm:table-cell">
                    {category.productCount}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        handleToggleFeatured(category.id, category.isFeatured)
                      }
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        category.isFeatured
                          ? "bg-coral text-white"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {category.isFeatured ? "Yes" : "No"}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        handleToggleActive(category.id, category.isActive)
                      }
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        category.isActive
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => startEdit(category)}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
                        aria-label="Edit category"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        disabled={isPending || category.productCount > 0}
                        onClick={() => handleDelete(category.id, category.name)}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-destructive hover:bg-secondary disabled:opacity-40"
                        aria-label="Delete category"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ChevronDown, Upload } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import {
  checkProductDuplicate,
  submitProduct,
  uploadProductImage,
} from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { SubmissionCategory } from "@/lib/db/categories";

const selectClass =
  "flex h-11 w-full appearance-none rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground outline-none transition hover:border-foreground focus-visible:border-foreground focus-visible:ring-4 focus-visible:ring-foreground/5";

export function SubmitProductForm({
  categories,
}: {
  categories: SubmissionCategory[];
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<{
    existingStatus?: string;
  } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  function resetDuplicateWarning() {
    setDuplicateWarning(null);
  }

  async function performSubmit(skipDuplicateCheck = false) {
    setError(null);

    if (!skipDuplicateCheck) {
      const dup = await checkProductDuplicate(categoryId, name, brand);
      if (!dup.ok) {
        setError(dup.error);
        return;
      }
      if (dup.data?.isDuplicate) {
        setDuplicateWarning({ existingStatus: dup.data.existingStatus });
        return;
      }
    }

    let imagePath: string | undefined;
    if (imageFile) {
      const formData = new FormData();
      formData.set("file", imageFile);
      const upload = await uploadProductImage(formData);
      if (!upload.ok) {
        setError(upload.error);
        return;
      }
      imagePath = upload.data?.path;
    }

    const result = await submitProduct({
      categoryId,
      name,
      brand,
      description,
      productUrl,
      imagePath,
      allowDuplicate: skipDuplicateCheck,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setDuplicateWarning(null);
    setSubmitted(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => {
      void performSubmit(false);
    });
  }

  function handleConfirmDuplicate() {
    startTransition(() => {
      void performSubmit(true);
    });
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center md:p-10">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-tier-c/30 font-display text-2xl font-black text-emerald-700">
          ✓
        </div>
        <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight">
          Thanks — your submission is in review
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          We&apos;ll take a look and add it to the rankings if it fits. You can
          track status on your submissions page.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/profile/submissions">View my submissions</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/categories">Keep browsing</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {duplicateWarning ? (
        <div className="rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-4 text-sm text-amber-950 dark:bg-amber-950/20 dark:text-amber-100">
          <p className="font-semibold">Possible duplicate</p>
          <p className="mt-1">
            <span className="font-medium">{brand}</span> ·{" "}
            <span className="font-medium">{name}</span> already exists in this
            category
            {duplicateWarning.existingStatus
              ? ` (${duplicateWarning.existingStatus})`
              : ""}
            . Submit anyway?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={isPending}
              onClick={handleConfirmDuplicate}
            >
              Submit anyway
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={resetDuplicateWarning}
            >
              Go back and edit
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="product-name">Product name</Label>
          <Input
            id="product-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              resetDuplicateWarning();
            }}
            required
            placeholder="HD 6XX Open-Back"
            disabled={isPending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="product-brand">Brand</Label>
          <Input
            id="product-brand"
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              resetDuplicateWarning();
            }}
            required
            placeholder="Sennheiser × Drop"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="product-category">Category</Label>
        <div className="relative">
          <select
            id="product-category"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              resetDuplicateWarning();
            }}
            required
            disabled={isPending}
            className={cn(selectClass, "pr-10")}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="product-url">Product URL</Label>
        <Input
          id="product-url"
          type="url"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          placeholder="https://manufacturer.com/product"
          disabled={isPending}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="product-description">Description</Label>
        <textarea
          id="product-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          disabled={isPending}
          placeholder="What is it, and why does the community need to rank it?"
          className="flex w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:ring-4 focus-visible:ring-foreground/5 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="product-image">Product image (optional)</Label>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="size-4" />
            {imageFile ? "Change image" : "Upload image"}
          </Button>
          {imageFile ? (
            <span className="text-sm text-muted-foreground">{imageFile.name}</span>
          ) : (
            <span className="text-sm text-muted-foreground">
              JPEG, PNG, WebP, or GIF · max 5 MB
            </span>
          )}
        </div>
        <input
          ref={fileRef}
          id="product-image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          disabled={isPending}
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <Button type="submit" className="mt-2 w-full sm:w-auto" disabled={isPending}>
        {isPending ? "Submitting…" : "Submit product"}
      </Button>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { signUp } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const username = String(form.get("username") ?? "");
    const password = String(form.get("password") ?? "");

    startTransition(async () => {
      const result = await signUp({ email, username, password });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@somewhere.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          minLength={3}
          maxLength={20}
          pattern="[A-Za-z0-9_]{3,20}"
          title="3–20 characters: letters, numbers, and underscores only"
          placeholder="letters, numbers, underscores"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="at least 6 characters"
        />
      </div>

      <Button type="submit" className="mt-1 w-full" disabled={isPending}>
        {isPending ? "Creating account…" : "Sign up"}
      </Button>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        By signing up you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}

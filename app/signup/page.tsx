import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/AuthCard";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Sign up",
  description:
    "Join Stier — vote on the best products, write reviews, and build lists.",
};

export default function SignupPage() {
  return (
    <AuthCard
      title="Join the community"
      subtitle="Rank the products worth owning — with people who actually own them."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-foreground underline underline-offset-2 hover:text-coral"
          >
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}

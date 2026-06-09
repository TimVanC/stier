import type { Metadata } from "next";

import { SettingsForm } from "@/components/profile/SettingsForm";
import { requireAuth } from "@/lib/auth-guard";
import { getCurrentUserProfile } from "@/lib/db/profile";
import { createClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your Stier account settings.",
};

export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage() {
  const user = await requireAuth("/profile/settings");
  const profile = await getCurrentUserProfile();
  if (!profile) {
    return (
      <p className="text-sm text-muted-foreground">
        Could not load your profile. Try logging in again.
      </p>
    );
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          Settings
        </h1>
        <p className="mt-2 text-muted-foreground">
          Update your profile, password, and privacy preferences.
        </p>
      </div>
      <SettingsForm profile={profile} email={authUser?.email ?? user.email ?? ""} />
    </div>
  );
}

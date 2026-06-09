import { ProfileDashboardNav } from "@/components/profile/ProfileDashboardNav";
import { getCurrentUserProfile } from "@/lib/db/profile";

export default async function ProfileDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentUserProfile();

  return (
    <div className="container py-8 md:py-12">
      <ProfileDashboardNav username={profile?.username ?? null} />
      {children}
    </div>
  );
}

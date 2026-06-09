import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * Minimal admin dashboard: shows products awaiting moderation. The layout's
 * requireAdmin() already gated this route; the query below is additionally
 * protected by RLS (only admins can read pending products).
 */
export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: pending } = await supabase
    .from("products")
    .select("id, name, brand, status, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = pending ?? [];

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
        Moderation queue
      </h1>
      <p className="mt-2 text-muted-foreground">
        {rows.length} product{rows.length === 1 ? "" : "s"} awaiting review.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-border">
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            Nothing in the queue. All caught up.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Brand</th>
                <th className="px-4 py-3 font-semibold">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.brand ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

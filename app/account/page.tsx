import Link from "next/link";
import { redirect } from "next/navigation";
import AccountNav from "@/components/layout/AccountNav";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/supabase/user";

export default async function AccountPage() {
  if (!hasSupabaseEnv()) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8">
        <p className="font-ui text-xs tracking-[0.16em] text-ember">AUTH NOT CONFIGURED</p>
        <h1 className="mt-3 font-title text-5xl text-ivory">Connect Supabase</h1>
        <p className="mt-3 max-w-2xl font-body text-lg text-stone">
          Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your
          `.env.local` file to enable login and account protection.
        </p>
      </div>
    );
  }

  const user = await getServerUser({ timeoutMs: 1400 });

  if (!user) {
    redirect("/auth/login?next=/account");
  }

  const displayName = user.user_metadata?.full_name ?? user.email ?? "Reader";
  const supabase = await createSupabaseServerClient();

  const [ordersCountResult, wishlistCountResult] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("wishlist")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const totalOrders = ordersCountResult.count ?? 0;
  const wishlistItems = wishlistCountResult.count ?? 0;

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-16 md:grid-cols-[220px_1fr] md:px-8">
      <AccountNav />

      <div>
        <div className="editorial-panel rounded-2xl p-6 md:p-8">
          <p className="font-ui text-xs tracking-[0.16em] text-gold">ACCOUNT DASHBOARD</p>
          <h1 className="mt-3 text-safe font-title text-5xl text-ivory">Welcome, {displayName}</h1>
          <p className="mt-3 max-w-2xl font-body text-lg text-stone">
            Your reader account is synced with Supabase. Track orders, saved books, and purchase
            history.
          </p>
          <div className="mt-4 ink-divider" />

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="fx-card rounded-xl border border-smoke bg-obsidian p-5">
              <p className="font-ui text-xs tracking-[0.14em] text-stone">TOTAL ORDERS</p>
              <p className="mt-3 font-mono text-4xl text-ivory">{totalOrders}</p>
            </div>
            <div className="fx-card rounded-xl border border-smoke bg-obsidian p-5">
              <p className="font-ui text-xs tracking-[0.14em] text-stone">WISHLIST ITEMS</p>
              <p className="mt-3 font-mono text-4xl text-ivory">{wishlistItems}</p>
            </div>
            <div className="fx-card rounded-xl border border-smoke bg-obsidian p-5">
              <p className="font-ui text-xs tracking-[0.14em] text-stone">MEMBER SINCE</p>
              <p className="mt-3 font-mono text-sm text-parchment">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/account/orders"
              className="fx-button rounded-full border border-gold bg-gold px-5 py-2.5 font-ui text-xs tracking-[0.14em] text-void transition hover:bg-gold-dim"
            >
              VIEW ORDERS
            </Link>
            <Link
              href="/account/wishlist"
              className="fx-button rounded-full border border-smoke bg-obsidian px-5 py-2.5 font-ui text-xs tracking-[0.14em] text-parchment transition hover:border-gold hover:text-gold"
            >
              VIEW WISHLIST
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

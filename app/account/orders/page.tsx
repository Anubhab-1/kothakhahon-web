import Link from "next/link";
import { redirect } from "next/navigation";
import AccountNav from "@/components/layout/AccountNav";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/supabase/user";
import { formatINR } from "@/lib/utils";

function formatDate(value: string) {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function OrdersPage() {
  if (!hasSupabaseEnv()) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8">
        <p className="font-ui text-xs tracking-[0.16em] text-ember">ORDERS UNAVAILABLE</p>
        <h1 className="mt-3 font-title text-5xl text-ivory">Connect Supabase</h1>
      </div>
    );
  }

  const user = await getServerUser({ timeoutMs: 1400 });
  if (!user) {
    redirect("/auth/login?next=/account/orders");
  }

  const supabase = await createSupabaseServerClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id,created_at,total_amount,status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-16 md:grid-cols-[220px_1fr] md:px-8">
      <AccountNav />

      <div>
        <div className="editorial-panel rounded-2xl p-6 md:p-8">
          <p className="font-ui text-xs tracking-[0.16em] text-gold">ORDER HISTORY</p>
          <h1 className="mt-3 font-title text-5xl text-ivory">Your Orders</h1>
          <p className="mt-3 max-w-2xl font-body text-lg text-stone">
            Track every purchase and open order detail for payment and shipping metadata.
          </p>
          <div className="mt-4 ink-divider" />
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-smoke bg-obsidian">
          <div className="grid grid-cols-4 border-b border-smoke px-4 py-3 font-ui text-[11px] tracking-[0.12em] text-stone">
            <span>ORDER ID</span>
            <span>DATE</span>
            <span>TOTAL</span>
            <span>STATUS</span>
          </div>

          {orders && orders.length > 0 ? (
            orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="grid grid-cols-4 border-b border-smoke/60 px-4 py-3 font-body text-sm text-parchment transition hover:bg-ash/40"
              >
                <span className="truncate font-mono text-xs">{order.id}</span>
                <span>{formatDate(order.created_at)}</span>
                <span>{formatINR(Number(order.total_amount))}</span>
                <span className="uppercase tracking-wide text-gold">{order.status}</span>
              </Link>
            ))
          ) : (
            <div className="px-4 py-6 font-body text-sm text-stone">
              No orders yet. Visit{" "}
              <Link href="/books" className="text-gold hover:text-gold-dim">
                Books
              </Link>{" "}
              to start your first order.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

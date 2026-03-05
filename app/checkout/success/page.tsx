import Link from "next/link";
import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/supabase/user";
import { formatINR } from "@/lib/utils";

interface CheckoutSuccessPageProps {
  searchParams: Promise<{
    order?: string;
  }>;
}

function formatDate(value: string) {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  if (!hasSupabaseEnv()) {
    redirect("/checkout");
  }

  const user = await getServerUser({ timeoutMs: 1400 });
  if (!user) {
    redirect("/auth/login?next=/checkout/success");
  }

  const { order: orderId } = await searchParams;
  if (!orderId) {
    redirect("/account/orders");
  }

  const supabase = await createSupabaseServerClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id,status,total_amount,created_at")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order || order.status !== "paid") {
    redirect(`/checkout/failed?order=${encodeURIComponent(orderId)}`);
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center md:px-8">
      <div className="editorial-panel w-full rounded-2xl p-8 md:p-10">
        <p className="font-ui text-xs tracking-[0.16em] text-gold">PAYMENT SUCCESS</p>
        <h1 className="mt-3 font-title text-5xl text-ivory">Order Confirmed</h1>
        <p className="mt-4 font-body text-lg text-stone">
          Thank you. Your payment has been received and your order is being processed.
        </p>
        <div className="mt-4 ink-divider" />
        <div className="mt-6 rounded-xl border border-smoke bg-obsidian p-5 text-left">
          <p className="font-ui text-xs tracking-[0.12em] text-stone">ORDER ID</p>
          <p className="mt-1 font-mono text-xs text-parchment">{order.id}</p>
          <p className="mt-3 font-ui text-xs tracking-[0.12em] text-stone">PAID ON</p>
          <p className="mt-1 font-body text-sm text-parchment">{formatDate(order.created_at)}</p>
          <p className="mt-3 font-ui text-xs tracking-[0.12em] text-stone">AMOUNT</p>
          <p className="mt-1 font-title text-3xl text-ivory">
            {formatINR(Number(order.total_amount))}
          </p>
        </div>
        <Link
          href="/account/orders"
          className="fx-button mt-8 rounded-full border border-gold bg-gold px-6 py-3 font-ui text-xs tracking-[0.16em] text-void transition hover:bg-gold-dim"
        >
          VIEW ORDER HISTORY
        </Link>
      </div>
    </div>
  );
}

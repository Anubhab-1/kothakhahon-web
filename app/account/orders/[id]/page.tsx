import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AccountNav from "@/components/layout/AccountNav";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/supabase/user";
import { formatINR } from "@/lib/utils";

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
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

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  if (!hasSupabaseEnv()) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-16 md:px-8">
        <p className="font-ui text-xs tracking-[0.16em] text-ember">ORDER DETAIL UNAVAILABLE</p>
        <h1 className="mt-3 font-title text-5xl text-ivory">Connect Supabase</h1>
      </div>
    );
  }

  const user = await getServerUser({ timeoutMs: 1400 });
  if (!user) {
    redirect("/auth/login?next=/account/orders");
  }

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id,status,total_amount,created_at,shipping_address,razorpay_order_id,razorpay_payment_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) {
    notFound();
  }

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("id,book_id,book_title,quantity,price")
    .eq("order_id", id);

  const shippingAddress =
    order.shipping_address && typeof order.shipping_address === "object"
      ? (order.shipping_address as Record<string, unknown>)
      : null;

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-16 md:grid-cols-[220px_1fr] md:px-8">
      <AccountNav />

      <div>
        <div className="editorial-panel rounded-2xl p-6 md:p-8">
          <p className="font-ui text-xs tracking-[0.16em] text-gold">ORDER DETAIL</p>
          <h1 className="mt-3 text-safe font-title text-5xl text-ivory">Order #{id}</h1>
          <p className="mt-3 font-body text-lg text-stone">
            Placed on {formatDate(order.created_at)} | Status:{" "}
            <span className="uppercase text-gold">{order.status}</span>
          </p>
          <div className="mt-4 ink-divider" />
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-smoke bg-obsidian">
          <div className="grid grid-cols-4 border-b border-smoke px-4 py-3 font-ui text-[11px] tracking-[0.12em] text-stone">
            <span>TITLE</span>
            <span>BOOK ID</span>
            <span>QTY</span>
            <span>PRICE</span>
          </div>
          {(orderItems ?? []).map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-4 border-b border-smoke/60 px-4 py-3 font-body text-sm text-parchment"
            >
              <span>{item.book_title}</span>
              <span className="truncate font-mono text-xs">{item.book_id}</span>
              <span>{item.quantity}</span>
              <span>{formatINR(Number(item.price) * Math.max(1, item.quantity))}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="fx-card rounded-xl border border-smoke bg-obsidian p-5">
            <p className="font-ui text-xs tracking-[0.12em] text-stone">PAYMENT</p>
            <p className="mt-2 font-body text-sm text-parchment">
              Razorpay Order: {order.razorpay_order_id ?? "Pending"}
            </p>
            <p className="mt-1 font-body text-sm text-parchment">
              Razorpay Payment: {order.razorpay_payment_id ?? "Pending"}
            </p>
            <p className="mt-3 font-mono text-3xl text-ivory">
              {formatINR(Number(order.total_amount))}
            </p>
          </div>

          <div className="fx-card rounded-xl border border-smoke bg-obsidian p-5">
            <p className="font-ui text-xs tracking-[0.12em] text-stone">SHIPPING ADDRESS</p>
            {shippingAddress ? (
              <div className="mt-2 space-y-1 font-body text-sm text-parchment">
                <p>{String(shippingAddress.fullName ?? "")}</p>
                <p>{String(shippingAddress.addressLine1 ?? "")}</p>
                {shippingAddress.addressLine2 ? <p>{String(shippingAddress.addressLine2)}</p> : null}
                <p>
                  {String(shippingAddress.city ?? "")}, {String(shippingAddress.state ?? "")}{" "}
                  {String(shippingAddress.postalCode ?? "")}
                </p>
                <p>{String(shippingAddress.country ?? "")}</p>
                <p>{String(shippingAddress.phone ?? "")}</p>
              </div>
            ) : (
              <p className="mt-2 font-body text-sm text-stone">No shipping address available.</p>
            )}
          </div>
        </div>

        <Link
          href="/account/orders"
          className="fx-button mt-8 inline-flex rounded-full border border-smoke bg-obsidian px-5 py-2.5 font-ui text-xs tracking-[0.14em] text-parchment transition hover:border-gold hover:text-gold"
        >
          BACK TO ORDERS
        </Link>
      </div>
    </div>
  );
}

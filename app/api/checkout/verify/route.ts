import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const verifySchema = z.object({
  orderId: z.string().uuid(),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

function getExpectedSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySecret: string,
) {
  return crypto
    .createHmac("sha256", razorpaySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
}

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 },
    );
  }

  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!razorpaySecret) {
    return NextResponse.json(
      { error: "Razorpay is not configured." },
      { status: 503 },
    );
  }

  let payload: z.infer<typeof verifySchema>;
  try {
    payload = verifySchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Invalid payment verification payload." },
      { status: 400 },
    );
  }

  const expectedSignature = getExpectedSignature(
    payload.razorpayOrderId,
    payload.razorpayPaymentId,
    razorpaySecret,
  );

  if (expectedSignature !== payload.razorpaySignature) {
    return NextResponse.json(
      { error: "Payment signature verification failed." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "You must be logged in to verify payment." },
      { status: 401 },
    );
  }

  const { data: order, error: orderFetchError } = await supabase
    .from("orders")
    .select("id,status,razorpay_order_id")
    .eq("id", payload.orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (orderFetchError || !order) {
    return NextResponse.json(
      { error: "Order not found." },
      { status: 404 },
    );
  }

  if (order.status === "cancelled") {
    return NextResponse.json(
      { error: "Order is cancelled." },
      { status: 400 },
    );
  }

  if (!order.razorpay_order_id || order.razorpay_order_id !== payload.razorpayOrderId) {
    return NextResponse.json(
      { error: "Order identifier mismatch." },
      { status: 400 },
    );
  }

  if (order.status !== "paid") {
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        razorpay_order_id: payload.razorpayOrderId,
        razorpay_payment_id: payload.razorpayPaymentId,
      })
      .eq("id", payload.orderId)
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Could not update order payment state." },
        { status: 500 },
      );
    }
  }

  // Clearing user cart after a successful payment is safe and idempotent.
  await supabase.from("cart_items").delete().eq("user_id", user.id);

  return NextResponse.json({ success: true });
}

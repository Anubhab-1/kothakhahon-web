import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAllBooks, hasSanityEnv } from "@/lib/sanity";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const shippingAddressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(8),
  addressLine1: z.string().min(4),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(4),
  country: z.string().min(2),
});

const requestSchema = z.object({
  shippingAddress: shippingAddressSchema,
});

interface CartRow {
  book_id: string;
  book_title: string;
  book_cover_url: string | null;
  quantity: number;
}

interface PricedCartRow {
  bookId: string;
  bookTitle: string;
  bookCoverUrl: string | null;
  quantity: number;
  price: number;
}

function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? keyId ?? "";

  return {
    keyId: keyId ?? "",
    keySecret: keySecret ?? "",
    publicKey,
  };
}

async function getAuthoritativePricedItems(items: CartRow[]) {
  if (!hasSanityEnv()) {
    return {
      items: [] as PricedCartRow[],
      error: "Catalog is not configured. Checkout is unavailable.",
    };
  }

  try {
    const books = await getAllBooks();
    const bookMap = new Map<
      string,
      {
        title: string;
        price: number;
        coverImageUrl: string | null;
      }
    >();

    books.forEach((book) => {
      if (typeof book.price !== "number" || Number.isNaN(book.price) || book.price < 0) {
        return;
      }
      const bookData = {
        title: book.title,
        price: book.price,
        coverImageUrl: book.coverImageUrl ?? null,
      };
      if (book._id) {
        bookMap.set(book._id, bookData);
      }
      if (book.slug) {
        bookMap.set(book.slug, bookData);
      }
    });

    const missingBookIds: string[] = [];
    const pricedItems: PricedCartRow[] = items
      .map((item) => {
        const mapped = bookMap.get(item.book_id);
        if (!mapped) {
          missingBookIds.push(item.book_id);
          return null;
        }
        return {
          bookId: item.book_id,
          bookTitle: mapped.title,
          bookCoverUrl: mapped.coverImageUrl ?? item.book_cover_url ?? null,
          quantity: Math.max(1, Number(item.quantity ?? 1)),
          price: mapped.price,
        };
      })
      .filter((item): item is PricedCartRow => Boolean(item));

    if (missingBookIds.length > 0) {
      return {
        items: [] as PricedCartRow[],
        error: `Some cart items are no longer available: ${missingBookIds.join(", ")}`,
      };
    }

    return { items: pricedItems, error: null as string | null };
  } catch {
    return {
      items: [] as PricedCartRow[],
      error: "Failed to load authoritative book prices.",
    };
  }
}

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 },
    );
  }

  const { keyId, keySecret, publicKey } = getRazorpayConfig();
  if (!keyId || !keySecret || !publicKey) {
    return NextResponse.json(
      { error: "Razorpay is not configured." },
      { status: 503 },
    );
  }

  let payload: z.infer<typeof requestSchema>;
  try {
    const body = await request.json();
    payload = requestSchema.parse(body);
  } catch {
    return NextResponse.json(
      { error: "Invalid checkout payload." },
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
      { error: "You must be logged in to checkout." },
      { status: 401 },
    );
  }

  const { data: cartRows, error: cartError } = await supabase
    .from("cart_items")
    .select("book_id,book_title,book_cover_url,quantity")
    .eq("user_id", user.id);

  if (cartError) {
    return NextResponse.json(
      { error: "Failed to load cart items." },
      { status: 500 },
    );
  }

  const items = (cartRows ?? []) as CartRow[];
  if (items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const pricedResult = await getAuthoritativePricedItems(items);
  if (pricedResult.error) {
    return NextResponse.json({ error: pricedResult.error }, { status: 400 });
  }
  const authoritativeItems = pricedResult.items;

  const totalAmount = authoritativeItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (totalAmount <= 0) {
    return NextResponse.json(
      { error: "Cart total is invalid." },
      { status: 400 },
    );
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      total_amount: totalAmount,
      shipping_address: payload.shippingAddress,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: "Could not create order." },
      { status: 500 },
    );
  }

  const orderItems = authoritativeItems.map((item) => ({
    order_id: order.id,
    book_id: item.bookId,
    book_title: item.bookTitle,
    book_cover_url: item.bookCoverUrl,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: orderItemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (orderItemsError) {
    await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order.id)
      .eq("user_id", user.id);
    return NextResponse.json(
      { error: "Could not create order items." },
      { status: 500 },
    );
  }

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: order.id.slice(0, 40),
      notes: {
        local_order_id: order.id,
      },
    });

    const { error: updateError } = await supabase
      .from("orders")
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq("id", order.id)
      .eq("user_id", user.id);

    if (updateError) {
      await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", order.id)
        .eq("user_id", user.id);
      return NextResponse.json(
        { error: "Could not finalize checkout order." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: publicKey,
    });
  } catch {
    await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order.id)
      .eq("user_id", user.id);
    return NextResponse.json(
      { error: "Razorpay order creation failed." },
      { status: 500 },
    );
  }
}

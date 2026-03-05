"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Lock, MapPinHouse, ShieldCheck } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { formatINR } from "@/lib/utils";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Enter your full name."),
  phone: z.string().min(8, "Enter a valid phone number."),
  addressLine1: z.string().min(4, "Enter a complete address."),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "Enter city."),
  state: z.string().min(2, "Enter state."),
  postalCode: z.string().min(4, "Enter postal code."),
  country: z.string().min(2, "Enter country."),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface CreateOrderResponse {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
}

export default function CheckoutClient() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);

  const shippingFee = 0;
  const total = subtotal + shippingFee;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: "India",
    },
  });

  useEffect(() => {
    const scriptId = "razorpay-checkout-js";
    if (document.getElementById(scriptId)) {
      setRazorpayReady(true);
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayReady(true);
    script.onerror = () => setSubmitError("Failed to load payment gateway. Please refresh.");
    document.body.appendChild(script);
  }, []);

  const hasItems = useMemo(() => items.length > 0, [items.length]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    if (!hasItems) {
      setSubmitError("Your cart is empty.");
      return;
    }

    if (!razorpayReady || typeof window.Razorpay === "undefined") {
      setSubmitError("Payment gateway is not ready yet. Please try again.");
      return;
    }

    setSubmitting(true);

    let createData: CreateOrderResponse;

    try {
      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shippingAddress: values,
        }),
      });

      const body = (await response.json()) as CreateOrderResponse | { error?: string };

      if (!response.ok || !("orderId" in body)) {
        const errorMessage =
          "error" in body && body.error ? body.error : "Failed to initialize checkout.";
        setSubmitError(errorMessage);
        setSubmitting(false);
        return;
      }

      createData = body;
    } catch {
      setSubmitError("Network error while creating order. Please try again.");
      setSubmitting(false);
      return;
    }

    const checkout = new window.Razorpay({
      key: createData.key,
      amount: createData.amount,
      currency: createData.currency,
      name: "Kothakhahon Prokashoni",
      description: "Book purchase",
      order_id: createData.razorpayOrderId,
      prefill: {
        name: values.fullName,
        contact: values.phone,
      },
      theme: {
        color: "#c9973a",
      },
      handler: async (razorpayResponse) => {
        try {
          const verifyResponse = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId: createData.orderId,
              razorpayOrderId: razorpayResponse.razorpay_order_id,
              razorpayPaymentId: razorpayResponse.razorpay_payment_id,
              razorpaySignature: razorpayResponse.razorpay_signature,
            }),
          });

          if (!verifyResponse.ok) {
            router.push(`/checkout/failed?order=${encodeURIComponent(createData.orderId)}`);
            setSubmitting(false);
            return;
          }

          clearCart();
          router.push(`/checkout/success?order=${encodeURIComponent(createData.orderId)}`);
        } catch {
          router.push(`/checkout/failed?order=${encodeURIComponent(createData.orderId)}`);
        } finally {
          setSubmitting(false);
        }
      },
      modal: {
        ondismiss: () => {
          router.push(`/checkout/failed?order=${encodeURIComponent(createData.orderId)}`);
          setSubmitting(false);
        },
      },
    });

    checkout.open();
  });

  if (!hasItems) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-16 md:px-8">
        <div className="editorial-panel rounded-2xl p-8 md:p-10">
          <p className="font-ui text-xs tracking-[0.16em] text-gold">CHECKOUT</p>
          <h1 className="mt-3 font-title text-5xl text-ivory">Your Cart Is Empty</h1>
          <p className="mt-4 max-w-2xl font-body text-lg text-stone">
            Add books to your cart before proceeding to checkout.
          </p>
          <Link
            href="/books"
            className="fx-button mt-8 inline-flex rounded-full border border-gold bg-gold px-6 py-3 font-ui text-xs tracking-[0.16em] text-void transition hover:bg-gold-dim"
          >
            BROWSE BOOKS
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8">
      <div className="editorial-panel rounded-2xl p-6 md:p-8">
        <p className="font-ui text-xs tracking-[0.16em] text-gold">CHECKOUT</p>
        <h1 className="mt-3 font-title text-5xl text-ivory">Complete Your Order</h1>
        <p className="mt-3 max-w-3xl font-body text-lg text-stone">
          Confirm shipping details and pay securely through Razorpay.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-ui text-[10px] tracking-[0.12em] text-gold">
            <span className="inline-flex items-center gap-1">
              <Lock className="h-3.5 w-3.5" />
              SECURE PAYMENT
            </span>
          </span>
          <span className="rounded-full border border-smoke px-3 py-1 font-ui text-[10px] tracking-[0.12em] text-parchment">
            {items.length} ITEMS
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={onSubmit} className="editorial-panel space-y-5 rounded-2xl p-6 md:p-7">
          <h2 className="font-title text-4xl text-ivory">Shipping Address</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="font-ui text-xs tracking-[0.13em] text-parchment">FULL NAME</label>
              <input
                type="text"
                {...register("fullName")}
                className="w-full rounded-xl border border-smoke bg-void px-3 py-2.5 font-body text-base text-ivory outline-none ring-gold transition focus:ring-1"
              />
              {errors.fullName ? <p className="text-sm text-ember">{errors.fullName.message}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="font-ui text-xs tracking-[0.13em] text-parchment">PHONE</label>
              <input
                type="text"
                {...register("phone")}
                className="w-full rounded-xl border border-smoke bg-void px-3 py-2.5 font-body text-base text-ivory outline-none ring-gold transition focus:ring-1"
              />
              {errors.phone ? <p className="text-sm text-ember">{errors.phone.message}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-ui text-xs tracking-[0.13em] text-parchment">ADDRESS LINE 1</label>
            <input
              type="text"
              {...register("addressLine1")}
              className="w-full rounded-xl border border-smoke bg-void px-3 py-2.5 font-body text-base text-ivory outline-none ring-gold transition focus:ring-1"
            />
            {errors.addressLine1 ? <p className="text-sm text-ember">{errors.addressLine1.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="font-ui text-xs tracking-[0.13em] text-parchment">ADDRESS LINE 2 (OPTIONAL)</label>
            <input
              type="text"
              {...register("addressLine2")}
              className="w-full rounded-xl border border-smoke bg-void px-3 py-2.5 font-body text-base text-ivory outline-none ring-gold transition focus:ring-1"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="font-ui text-xs tracking-[0.13em] text-parchment">CITY</label>
              <input
                type="text"
                {...register("city")}
                className="w-full rounded-xl border border-smoke bg-void px-3 py-2.5 font-body text-base text-ivory outline-none ring-gold transition focus:ring-1"
              />
              {errors.city ? <p className="text-sm text-ember">{errors.city.message}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="font-ui text-xs tracking-[0.13em] text-parchment">STATE</label>
              <input
                type="text"
                {...register("state")}
                className="w-full rounded-xl border border-smoke bg-void px-3 py-2.5 font-body text-base text-ivory outline-none ring-gold transition focus:ring-1"
              />
              {errors.state ? <p className="text-sm text-ember">{errors.state.message}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="font-ui text-xs tracking-[0.13em] text-parchment">POSTAL CODE</label>
              <input
                type="text"
                {...register("postalCode")}
                className="w-full rounded-xl border border-smoke bg-void px-3 py-2.5 font-body text-base text-ivory outline-none ring-gold transition focus:ring-1"
              />
              {errors.postalCode ? <p className="text-sm text-ember">{errors.postalCode.message}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="font-ui text-xs tracking-[0.13em] text-parchment">COUNTRY</label>
              <input
                type="text"
                {...register("country")}
                className="w-full rounded-xl border border-smoke bg-void px-3 py-2.5 font-body text-base text-ivory outline-none ring-gold transition focus:ring-1"
              />
              {errors.country ? <p className="text-sm text-ember">{errors.country.message}</p> : null}
            </div>
          </div>

          {submitError ? <p className="text-sm text-ember">{submitError}</p> : null}

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="fx-button w-full rounded-full border border-gold bg-gold px-6 py-3 font-ui text-xs tracking-[0.16em] text-void transition hover:bg-gold-dim disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "PROCESSING..." : `PAY SECURELY ${formatINR(total)}`}
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setSubmitting(true);
                setTimeout(() => {
                  clearCart();
                  router.push(`/checkout/success?order=demo-${Date.now()}`);
                }, 1500); // Simulate network delay
              }}
              className="fx-button w-full rounded-full border border-smoke bg-obsidian px-6 py-3 font-ui text-xs tracking-[0.16em] text-parchment transition hover:border-ivory hover:text-ivory disabled:cursor-not-allowed disabled:opacity-70"
            >
              BYPASS PAYMENT (CLIENT DEMO)
            </button>
          </div>

          <p className="text-center font-body text-sm text-stone">
            By placing this order, you agree to provide accurate delivery details for dispatch.
          </p>
        </form>

        <aside className="editorial-panel rounded-2xl p-6">
          <p className="font-ui text-xs tracking-[0.12em] text-gold">ORDER SUMMARY</p>
          <div className="mt-4 space-y-3 border-b border-smoke pb-4">
            {items.map((item) => (
              <div key={item.bookId} className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-body text-base text-ivory">{item.title}</p>
                  <p className="font-mono text-xs text-stone">Qty {item.quantity}</p>
                </div>
                <p className="font-mono text-xs text-parchment">{formatINR(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-body text-sm text-parchment">Subtotal</p>
              <p className="font-mono text-sm text-parchment">{formatINR(subtotal)}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-body text-sm text-parchment">Shipping</p>
              <p className="font-mono text-sm text-parchment">{formatINR(shippingFee)}</p>
            </div>
          </div>

          <div className="mt-4 border-t border-smoke pt-4">
            <div className="flex items-center justify-between">
              <p className="font-ui text-xs tracking-[0.14em] text-stone">TOTAL</p>
              <p className="font-mono text-3xl text-ivory">{formatINR(total)}</p>
            </div>
          </div>

          <div className="mt-5 space-y-2 rounded-xl border border-smoke bg-ash/40 p-4">
            <p className="flex items-center gap-2 font-body text-sm text-parchment">
              <ShieldCheck className="h-4 w-4 text-gold" />
              Razorpay secured payment session.
            </p>
            <p className="flex items-center gap-2 font-body text-sm text-parchment">
              <MapPinHouse className="h-4 w-4 text-gold" />
              Shipping updates are available in your account.
            </p>
            {submitting ? (
              <p className="flex items-center gap-2 font-body text-sm text-gold">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Initializing payment...
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setSubmitError("Supabase auth is not configured in .env.local.");
      setSubmitting(false);
      return;
    }

    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const supabase = createSupabaseBrowserClient();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${origin}/auth/callback?next=/auth/login`,
      });

      if (error) {
        setSubmitError(error.message);
        setSubmitting(false);
        return;
      }
    } catch {
      setSubmitError(
        "Network request failed. Disable browser extensions for localhost and try again.",
      );
      setSubmitting(false);
      return;
    }

    reset();
    setSuccessMessage("Password reset link sent. Check your email.");
    setSubmitting(false);
  });

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-20 md:px-8">
      <div className="fx-card rounded-2xl border border-smoke bg-obsidian p-8 md:p-10">
        <p className="font-ui text-xs tracking-[0.18em] text-gold">SECURITY</p>
        <h1 className="mt-3 font-title text-4xl text-ivory">Forgot Password</h1>
        <p className="mt-2 font-body text-base text-stone">
          Enter your account email to receive a password reset link.
        </p>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="font-ui text-xs tracking-[0.14em] text-parchment">EMAIL</label>
            <input
              type="email"
              {...register("email")}
              className="w-full rounded-md border border-smoke bg-void px-3 py-2.5 font-body text-base text-ivory outline-none ring-gold transition focus:ring-1"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-sm text-ember">{errors.email.message}</p>}
          </div>

          {submitError && <p className="text-sm text-ember">{submitError}</p>}
          {successMessage && <p className="text-sm text-gold">{successMessage}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="fx-button w-full rounded-full border border-gold bg-gold px-5 py-3 font-ui text-xs tracking-[0.16em] text-void transition hover:bg-gold-dim disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "SENDING..." : "SEND RESET LINK"}
          </button>
        </form>

        <div className="mt-6 text-right font-body text-sm text-stone">
          <Link href="/auth/login" className="fx-link hover:text-gold">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

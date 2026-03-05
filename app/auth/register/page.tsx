"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name."),
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
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

    const supabase = createSupabaseBrowserClient();
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
          emailRedirectTo: `${origin}/auth/callback`,
        },
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
    setSuccessMessage("Check your inbox to confirm your email and complete sign-up.");
    setSubmitting(false);
  });

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-20 md:px-8">
      <div className="fx-card rounded-2xl border border-smoke bg-obsidian p-8 md:p-10">
        <p className="font-ui text-xs tracking-[0.18em] text-gold">NEW ACCOUNT</p>
        <h1 className="mt-3 font-title text-4xl text-ivory">Register</h1>
        <p className="mt-2 font-body text-base text-stone">
          Create your account to track orders and save books you love.
        </p>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="font-mono text-xs tracking-wider text-parchment">FULL NAME</label>
            <input
              type="text"
              {...register("fullName")}
              className="w-full rounded-md border border-smoke bg-void px-3 py-2.5 font-body text-base text-ivory outline-none ring-gold transition focus:ring-1"
              placeholder="Your name"
            />
            {errors.fullName && <p className="text-sm text-ember">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs tracking-wider text-parchment">EMAIL</label>
            <input
              type="email"
              {...register("email")}
              className="w-full rounded-md border border-smoke bg-void px-3 py-2.5 font-body text-base text-ivory outline-none ring-gold transition focus:ring-1"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-sm text-ember">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs tracking-wider text-parchment">PASSWORD</label>
            <input
              type="password"
              {...register("password")}
              className="w-full rounded-md border border-smoke bg-void px-3 py-2.5 font-body text-base text-ivory outline-none ring-gold transition focus:ring-1"
              placeholder="At least 8 characters"
            />
            {errors.password && <p className="text-sm text-ember">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs tracking-wider text-parchment">
              CONFIRM PASSWORD
            </label>
            <input
              type="password"
              {...register("confirmPassword")}
              className="w-full rounded-md border border-smoke bg-void px-3 py-2.5 font-body text-base text-ivory outline-none ring-gold transition focus:ring-1"
              placeholder="Repeat password"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-ember">{errors.confirmPassword.message}</p>
            )}
          </div>

          {submitError && <p className="text-sm text-ember">{submitError}</p>}
          {successMessage && <p className="text-sm text-gold">{successMessage}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="fx-button w-full rounded-full border border-gold bg-gold px-5 py-3 font-mono text-sm font-medium tracking-widest text-void shadow-lg transition hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "CREATING..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <div className="mt-6 text-right font-body text-sm text-stone">
          <Link href="/auth/login" className="fx-link hover:text-gold">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
}

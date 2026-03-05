"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nextPath = useMemo(() => {
    if (typeof window === "undefined") return "/account";
    const value = new URLSearchParams(window.location.search).get("next");
    return value && value.startsWith("/") ? value : "/account";
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setSubmitting(true);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setSubmitError("Supabase auth is not configured in .env.local.");
      setSubmitting(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    try {
      const { error } = await supabase.auth.signInWithPassword(values);

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

    router.replace(nextPath);
    router.refresh();
  });

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-20 md:px-8">
      <div className="fx-card rounded-2xl border border-smoke bg-obsidian p-8 md:p-10">
        <p className="font-ui text-xs tracking-[0.18em] text-gold">ACCOUNT ACCESS</p>
        <h1 className="mt-3 font-title text-4xl text-ivory">Login</h1>
        <p className="mt-2 font-body text-base text-stone">
          Sign in to access your dashboard, orders, and wishlist.
        </p>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
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
              placeholder="••••••••"
            />
            {errors.password && <p className="text-sm text-ember">{errors.password.message}</p>}
          </div>

          {submitError && <p className="text-sm text-ember">{submitError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="fx-button w-full rounded-full border border-gold bg-gold px-5 py-3 font-mono text-sm font-medium tracking-widest text-void shadow-lg transition hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "SIGNING IN..." : "LOGIN"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between font-body text-sm text-stone">
          <Link href="/auth/forgot-password" className="fx-link hover:text-gold">
            Forgot password?
          </Link>
          <Link href="/auth/register" className="fx-link hover:text-gold">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

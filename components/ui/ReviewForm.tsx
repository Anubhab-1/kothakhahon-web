"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import StarRating from "@/components/ui/StarRating";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface ReviewFormProps {
  bookId: string;
  bookTitle: string;
  onReviewSubmitted: () => void;
}

const ratingLabels: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export default function ReviewForm({ bookId, bookTitle, onReviewSubmitted }: ReviewFormProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  useEffect(() => {
    if (!supabaseConfigured) {
      setIsLoggedIn(false);
      return;
    }

    let active = true;
    const supabase = createSupabaseBrowserClient();

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (active) {
        setIsLoggedIn(Boolean(user));
      }
    };

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setIsLoggedIn(Boolean(session?.user));
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabaseConfigured]);

  const ratingLabel = useMemo(() => {
    if (selectedRating < 1 || selectedRating > 5) {
      return "Select your rating";
    }
    return ratingLabels[selectedRating];
  }, [selectedRating]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedRating === 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          book_id: bookId,
          rating: selectedRating,
          review_text: reviewText.trim() || undefined,
        }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Could not submit review.");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitted(true);
      setReviewText("");
      onReviewSubmitted();
    } catch {
      setError("Network request failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!supabaseConfigured || !isLoggedIn) {
    return (
      <div>
        <p className="font-body text-base text-stone">Sign in to leave a review</p>
        <Link
          href="/auth/login"
          className="mt-5 inline-flex border border-gold px-6 py-3 font-ui text-xs tracking-[0.16em] text-gold transition-all duration-300 hover:bg-gold hover:text-void"
        >
          SIGN IN
        </Link>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="py-2 text-center">
        <p className="text-2xl text-gold">{"\u2726"}</p>
        <h4 className="mt-4 font-title text-3xl text-ivory">Thank you for your review.</h4>
        <p className="mt-3 font-body text-lg italic text-stone">Your review will appear after approval.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <h4 className="mb-2 font-ui text-xs tracking-[0.16em] text-stone">WRITE A REVIEW</h4>
      <p className="font-body text-base text-stone">{bookTitle}</p>

      <div className="mt-6">
        <StarRating
          rating={selectedRating}
          interactive
          onRatingChange={setSelectedRating}
          size="lg"
          showCount={false}
        />
        <p className="mt-2 font-mono text-xs text-gold">{ratingLabel}</p>
      </div>

      <div className="mt-6">
        <textarea
          value={reviewText}
          onChange={(event) => setReviewText(event.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Share your thoughts about this book... (optional)"
          className="w-full resize-none border-b border-smoke bg-transparent py-3 font-body text-base text-parchment transition-colors duration-300 placeholder:text-stone/50 focus:border-gold focus:outline-none"
        />
        <p className="text-right font-mono text-xs text-stone">{reviewText.length}/1000</p>
      </div>

      <button
        type="submit"
        disabled={selectedRating === 0 || isSubmitting}
        className="mt-6 w-full bg-gold px-8 py-4 font-ui text-xs tracking-[0.16em] text-void transition-all duration-300 hover:bg-gold-dim disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isSubmitting ? "SUBMITTING..." : "SUBMIT REVIEW"}
      </button>

      {error ? <p className="mt-3 font-mono text-xs text-ember">{error}</p> : null}
    </form>
  );
}

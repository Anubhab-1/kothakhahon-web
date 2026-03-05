"use client";

import { useEffect, useState } from "react";
import ReviewCard from "@/components/ui/ReviewCard";
import ReviewForm from "@/components/ui/ReviewForm";
import StarRating from "@/components/ui/StarRating";
import type { Review, ReviewStats } from "@/lib/types";

interface ReviewsSectionProps {
  bookId: string;
  bookTitle: string;
}

const emptyStats: ReviewStats = {
  average_rating: 0,
  total_reviews: 0,
  rating_breakdown: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  },
};

export default function ReviewsSection({ bookId, bookTitle }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadReviews = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/reviews?book_id=${encodeURIComponent(bookId)}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          setReviews([]);
          setStats(emptyStats);
          setLoading(false);
          return;
        }

        const result = (await response.json()) as {
          reviews?: Review[];
          stats?: ReviewStats;
        };

        setReviews(result.reviews ?? []);
        setStats(result.stats ?? emptyStats);
      } catch {
        if (!controller.signal.aborted) {
          setReviews([]);
          setStats(emptyStats);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadReviews();

    return () => {
      controller.abort();
    };
  }, [bookId, refreshKey]);

  const hasReviews = stats.total_reviews > 0;

  return (
    <section className="bg-obsidian px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <div>
            <p className="mb-4 font-ui text-xs tracking-[0.16em] text-gold">READER REVIEWS</p>
            <div className="mb-6 h-px w-10 bg-gold" />

            {hasReviews ? (
              <div>
                <div className="flex items-end gap-2">
                  <p className="font-title text-7xl leading-none text-gold font-light">
                    {stats.average_rating.toFixed(1)}
                  </p>
                  <p className="font-title text-4xl text-stone">/5</p>
                </div>
                <div className="mt-3">
                  <StarRating rating={stats.average_rating} size="md" showCount={false} />
                </div>
                <p className="mt-2 font-mono text-xs text-stone">{stats.total_reviews} reviews</p>
              </div>
            ) : (
              <p className="font-title text-3xl italic text-stone">No reviews yet.</p>
            )}
          </div>

          {hasReviews ? (
            <div className="w-full max-w-sm space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.rating_breakdown[rating as keyof ReviewStats["rating_breakdown"]];
                const width = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;

                return (
                  <div key={`breakdown-${rating}`} className="flex items-center gap-3">
                    <span className="w-4 font-mono text-xs text-stone">{rating}</span>
                    <div className="relative h-1 flex-1 overflow-hidden rounded bg-smoke">
                      <div
                        className="h-full rounded bg-gold"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className="w-4 font-mono text-xs text-stone">{count}</span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        <hr className="my-12 h-px border-0 bg-gold/55" />

        <ReviewForm
          bookId={bookId}
          bookTitle={bookTitle}
          onReviewSubmitted={() => {
            setRefreshKey((prev) => prev + 1);
          }}
        />

        <hr className="my-12 h-px border-0 bg-gold/55" />

        <div>
          {loading ? (
            <div>
              {[0, 1, 2].map((index) => (
                <div key={`review-skeleton-${index}`} className="mb-4 h-24 animate-pulse bg-ash" />
              ))}
            </div>
          ) : null}

          {!loading && reviews.length > 0 ? (
            <div>
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

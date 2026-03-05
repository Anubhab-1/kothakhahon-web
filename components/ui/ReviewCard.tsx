import StarRating from "@/components/ui/StarRating";
import type { Review } from "@/lib/types";

interface ReviewCardProps {
  review: Review;
}

function formatDate(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }

  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const reviewText = review.review_text?.trim() ?? "";
  const reviewerName = review.user_name?.trim() || "Reader";

  return (
    <article className="border-b border-smoke py-6">
      <div className="flex items-start justify-between gap-4">
        <p className="font-ui text-xs tracking-[0.12em] text-ivory">{reviewerName.toUpperCase()}</p>
        <p className="font-mono text-xs text-stone">{formatDate(review.created_at)}</p>
      </div>
      <div className="mt-2">
        <StarRating rating={review.rating} size="sm" showCount={false} />
      </div>
      {reviewText ? (
        <p className="mt-3 font-body text-base leading-relaxed text-parchment">{reviewText}</p>
      ) : null}
    </article>
  );
}

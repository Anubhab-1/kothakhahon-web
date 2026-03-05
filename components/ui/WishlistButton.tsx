"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  isAuthenticated: boolean;
  redirectPath: string;
  bookId: string;
  bookTitle: string;
  bookCoverUrl?: string;
  variant?: "icon" | "full";
  className?: string;
}

export default function WishlistButton({
  isAuthenticated,
  redirectPath,
  bookId,
  bookTitle,
  bookCoverUrl,
  variant = "icon",
  className,
}: WishlistButtonProps) {
  const router = useRouter();
  const [wished, setWished] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    let active = true;

    const loadExistingWishlistState = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || !active) return;

        const { data } = await supabase
          .from("wishlist")
          .select("id")
          .eq("user_id", user.id)
          .eq("book_id", bookId)
          .maybeSingle();

        if (active) {
          setWished(Boolean(data));
        }
      } catch {
        if (active) {
          setWished(false);
        }
      }
    };

    void loadExistingWishlistState();

    return () => {
      active = false;
    };
  }, [bookId, isAuthenticated]);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        if (!isAuthenticated) {
          const next = encodeURIComponent(redirectPath);
          router.push(`/auth/login?next=${next}`);
          return;
        }

        setLoading(true);

        try {
          const supabase = createSupabaseBrowserClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            router.push(`/auth/login?next=${encodeURIComponent(redirectPath)}`);
            setLoading(false);
            return;
          }

          if (wished) {
            const { error } = await supabase
              .from("wishlist")
              .delete()
              .eq("user_id", user.id)
              .eq("book_id", bookId);

            if (!error) {
              setWished(false);
            }
          } else {
            const { error } = await supabase.from("wishlist").upsert(
              {
                user_id: user.id,
                book_id: bookId,
                book_title: bookTitle,
                book_cover_url: bookCoverUrl ?? null,
              },
              { onConflict: "user_id,book_id" },
            );

            if (!error) {
              setWished(true);
            }
          }
        } finally {
          setLoading(false);
        }
      }}
      className={cn(
        variant === "icon"
          ? "fx-button inline-flex h-9 w-9 items-center justify-center rounded-full border border-smoke bg-void/85 text-parchment transition hover:border-gold hover:text-gold"
          : "fx-button inline-flex items-center justify-center gap-2 rounded-full border border-smoke bg-obsidian px-6 py-3 font-ui text-xs tracking-[0.14em] text-parchment transition hover:border-gold hover:text-gold",
        wished && "border-gold text-gold",
        loading && "cursor-not-allowed opacity-70",
        className,
      )}
      aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wished}
      title={
        isAuthenticated
          ? loading
            ? "Updating wishlist..."
            : wished
              ? "Remove from wishlist"
              : "Add to wishlist"
          : "Login to use wishlist"
      }
    >
      <Heart className={cn("h-4 w-4", wished && "fill-gold")} />
      {variant === "full" ? (wished ? "IN WISHLIST" : "ADD TO WISHLIST") : null}
    </button>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Review, ReviewStats } from "@/lib/types";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const reviewSchema = z.object({
  book_id: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  review_text: z.string().max(1000).optional(),
});

interface ReviewRow {
  id: string;
  user_id: string;
  book_id: string;
  rating: number;
  review_text: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at?: string;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

function emptyStats(): ReviewStats {
  return {
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
}

function normalizeReview(
  row: ReviewRow,
  profileMap: Map<string, ProfileRow>,
): Review {
  const profile = profileMap.get(row.user_id);
  return {
    id: row.id,
    user_id: row.user_id,
    book_id: row.book_id,
    rating: Number(row.rating),
    review_text: row.review_text && row.review_text.trim().length > 0 ? row.review_text : null,
    is_approved: Boolean(row.is_approved),
    created_at: row.created_at,
    updated_at: row.updated_at ?? row.created_at,
    user_name: profile?.full_name ?? undefined,
    user_avatar: profile?.avatar_url ?? undefined,
  };
}

function buildStats(reviews: Review[]): ReviewStats {
  if (reviews.length === 0) {
    return emptyStats();
  }

  const totalReviews = reviews.length;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  const breakdown: ReviewStats["rating_breakdown"] = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  reviews.forEach((review) => {
    const bucket = Math.min(5, Math.max(1, Math.round(review.rating))) as keyof ReviewStats["rating_breakdown"];
    breakdown[bucket] += 1;
  });

  return {
    average_rating: Math.round((sum / totalReviews) * 10) / 10,
    total_reviews: totalReviews,
    rating_breakdown: breakdown,
  };
}

async function getApprovedReviewRows(bookId: string) {
  const supabase = await createSupabaseServerClient();

  const withUpdatedAt = await supabase
    .from("reviews")
    .select("id,user_id,book_id,rating,review_text,is_approved,created_at,updated_at")
    .eq("book_id", bookId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (!withUpdatedAt.error) {
    return {
      rows: (withUpdatedAt.data ?? []) as ReviewRow[],
      error: null as string | null,
    };
  }

  if (!withUpdatedAt.error.message.toLowerCase().includes("updated_at")) {
    return {
      rows: [] as ReviewRow[],
      error: withUpdatedAt.error.message,
    };
  }

  const fallback = await supabase
    .from("reviews")
    .select("id,user_id,book_id,rating,review_text,is_approved,created_at")
    .eq("book_id", bookId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (fallback.error) {
    return {
      rows: [] as ReviewRow[],
      error: fallback.error.message,
    };
  }

  return {
    rows: (fallback.data ?? []) as ReviewRow[],
    error: null as string | null,
  };
}

async function getProfileMap(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, ProfileRow>();
  }

  const supabaseAdmin = createSupabaseAdminClient();
  if (!supabaseAdmin) {
    return new Map<string, ProfileRow>();
  }

  const { data } = await supabaseAdmin
    .from("sqlusers")
    .select("id,full_name,avatar_url")
    .in("id", userIds);

  const entries = ((data ?? []) as ProfileRow[]).map((profile) => [profile.id, profile] as const);
  return new Map<string, ProfileRow>(entries);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get("book_id");

  if (!bookId) {
    return NextResponse.json({ error: "book_id required" }, { status: 400 });
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ reviews: [], stats: emptyStats() });
  }

  try {
    const { rows, error } = await getApprovedReviewRows(bookId);
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    const userIds = [...new Set(rows.map((row) => row.user_id))];
    const profileMap = await getProfileMap(userIds);
    const reviews = rows.map((row) => normalizeReview(row, profileMap));

    return NextResponse.json({
      reviews,
      stats: buildStats(reviews),
    });
  } catch {
    return NextResponse.json({ error: "Could not fetch reviews." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Reviews backend is not configured." }, { status: 503 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let payload: z.infer<typeof reviewSchema>;
  try {
    payload = reviewSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const normalizedText = payload.review_text?.trim() ?? "";

  const { data: existing, error: existingError } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", user.id)
    .eq("book_id", payload.book_id)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (existing?.id) {
    const { data, error } = await supabase
      .from("reviews")
      .update({
        rating: payload.rating,
        review_text: normalizedText,
        is_approved: false,
      })
      .eq("id", existing.id)
      .select("id,user_id,book_id,rating,review_text,is_approved,created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const review = normalizeReview(data as ReviewRow, new Map<string, ProfileRow>());
    return NextResponse.json({ review, updated: true });
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      user_id: user.id,
      book_id: payload.book_id,
      rating: payload.rating,
      review_text: normalizedText,
      is_approved: false,
    })
    .select("id,user_id,book_id,rating,review_text,is_approved,created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const review = normalizeReview(data as ReviewRow, new Map<string, ProfileRow>());
  return NextResponse.json({ review, updated: false }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Reviews backend is not configured." }, { status: 503 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get("book_id");

  if (!bookId) {
    return NextResponse.json({ error: "book_id required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("user_id", user.id)
    .eq("book_id", bookId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

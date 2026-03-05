import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";

const manuscriptSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  city: z.string().min(2),
  manuscriptTitle: z.string().min(2),
  genre: z.string().min(2),
  wordCount: z.number().int().min(1000).max(400000),
  language: z.string().min(2),
  synopsis: z.string().min(120).max(4000),
});

function getClientIdentifier(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit({
    key: `manuscript:${clientId}`,
    limit: 4,
    windowMs: 60_000,
  });

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many manuscript submissions. Please try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)),
        },
      },
    );
  }

  const supabaseAdmin = createSupabaseAdminClient();
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Manuscript backend is not configured." },
      { status: 503 },
    );
  }

  let payload: z.infer<typeof manuscriptSchema>;
  try {
    const parsed = await request.json();
    payload = manuscriptSchema.parse(parsed);
  } catch {
    return NextResponse.json(
      { error: "Invalid manuscript payload." },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin.from("manuscript_submissions").insert({
    full_name: payload.fullName,
    email: payload.email.toLowerCase(),
    phone: payload.phone,
    city: payload.city,
    manuscript_title: payload.manuscriptTitle,
    genre: payload.genre,
    word_count: payload.wordCount,
    language: payload.language,
    synopsis: payload.synopsis,
    status: "new",
  });

  if (error) {
    const errorText = `${error.message} ${error.details ?? ""}`.toLowerCase();
    if (errorText.includes("fetch failed") || errorText.includes("connect timeout")) {
      return NextResponse.json(
        { error: "Manuscript backend is unreachable right now. Please try again shortly." },
        { status: 503 },
      );
    }

    if (error.code === "42P01") {
      return NextResponse.json(
        {
          error:
            "Manuscript tables are missing. Run supabase/migrations/20260303_phase14_forms_tables.sql.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Could not submit manuscript." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

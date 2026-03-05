import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";

const newsletterSchema = z.object({
  email: z.string().email(),
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
    key: `newsletter:${clientId}`,
    limit: 10,
    windowMs: 60_000,
  });

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many subscription attempts. Please try again shortly." },
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
      { error: "Newsletter backend is not configured." },
      { status: 503 },
    );
  }

  let payload: z.infer<typeof newsletterSchema>;
  try {
    payload = newsletterSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Invalid newsletter payload." },
      { status: 400 },
    );
  }

  const normalizedEmail = payload.email.toLowerCase();
  const { error } = await supabaseAdmin.from("newsletter_subscribers").upsert(
    {
      email: normalizedEmail,
      is_active: true,
    },
    { onConflict: "email" },
  );

  if (error) {
    const errorText = `${error.message} ${error.details ?? ""}`.toLowerCase();
    if (errorText.includes("fetch failed") || errorText.includes("connect timeout")) {
      return NextResponse.json(
        { error: "Newsletter backend is unreachable right now. Please try again shortly." },
        { status: 503 },
      );
    }

    if (error.code === "42P01") {
      return NextResponse.json(
        {
          error:
            "Newsletter tables are missing. Run supabase/migrations/20260303_phase14_forms_tables.sql.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Could not subscribe email." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

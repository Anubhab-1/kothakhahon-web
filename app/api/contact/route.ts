import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";

const contactSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  department: z.string().min(2),
  message: z.string().min(30).max(1800),
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
    key: `contact:${clientId}`,
    limit: 6,
    windowMs: 60_000,
  });

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many contact submissions. Please try again shortly." },
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
      { error: "Contact backend is not configured." },
      { status: 503 },
    );
  }

  let payload: z.infer<typeof contactSchema>;
  try {
    payload = contactSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid contact payload." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("contact_messages").insert({
    full_name: payload.fullName,
    email: payload.email.toLowerCase(),
    department: payload.department,
    message: payload.message,
  });

  if (error) {
    const errorText = `${error.message} ${error.details ?? ""}`.toLowerCase();
    if (errorText.includes("fetch failed") || errorText.includes("connect timeout")) {
      return NextResponse.json(
        { error: "Contact backend is unreachable right now. Please try again shortly." },
        { status: 503 },
      );
    }

    if (error.code === "42P01") {
      return NextResponse.json(
        {
          error:
            "Contact tables are missing. Run supabase/migrations/20260303_phase14_forms_tables.sql.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Could not submit contact message." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

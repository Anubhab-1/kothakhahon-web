import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

async function logout(request: Request) {
  if (hasSupabaseEnv()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/", request.url));
}

export async function POST(request: Request) {
  return logout(request);
}

export async function GET(request: Request) {
  return logout(request);
}

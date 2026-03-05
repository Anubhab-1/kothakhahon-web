import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const safeNext = next && next.startsWith("/") ? next : "/account";

  if (code && hasSupabaseEnv()) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("sqlusers").upsert(
          {
            id: user.id,
            email: user.email ?? "",
            full_name: user.user_metadata?.full_name ?? null,
            avatar_url: user.user_metadata?.avatar_url ?? null,
          },
          { onConflict: "id" },
        );
      }
    }
  }

  return NextResponse.redirect(new URL(safeNext, request.url));
}

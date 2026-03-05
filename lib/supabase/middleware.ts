import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/env";

const protectedPrefixes = ["/account", "/checkout"];

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!hasSupabaseEnv()) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(
          ({
            name,
            value,
          }: {
            name: string;
            value: string;
            options: CookieOptions;
          }) => request.cookies.set(name, value),
        );

        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });

        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const user = await Promise.race([
    supabase.auth
      .getUser()
      .then(({ data }) => data.user ?? null)
      .catch(() => null),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200)),
  ]);

  if (!user) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set(
      "next",
      `${pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

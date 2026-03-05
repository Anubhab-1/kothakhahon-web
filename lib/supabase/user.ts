import type { User } from "@supabase/supabase-js";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface ServerUserOptions {
  timeoutMs?: number;
}

export async function getServerUser(options: ServerUserOptions = {}): Promise<User | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const timeoutMs = options.timeoutMs ?? 1500;

  try {
    const supabase = await createSupabaseServerClient();

    const userPromise = supabase.auth
      .getUser()
      .then(({ data }) => data.user ?? null)
      .catch(() => null);

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), timeoutMs);
    });

    return await Promise.race([userPromise, timeoutPromise]);
  } catch {
    return null;
  }
}

export async function getIsAuthenticated(options: ServerUserOptions = {}) {
  const user = await getServerUser(options);
  return Boolean(user);
}

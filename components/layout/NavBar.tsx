import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getServerUser } from "@/lib/supabase/user";
import NavBarClient from "@/components/layout/NavBarClient";

export interface NavUser {
  id: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}

export default async function NavBar() {
  if (!hasSupabaseEnv()) {
    return <NavBarClient user={null} />;
  }

  const user = await getServerUser({ timeoutMs: 1200 });

  const navUser: NavUser | null = user
    ? {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name,
        avatarUrl: user.user_metadata?.avatar_url,
      }
    : null;

  return <NavBarClient user={navUser} />;
}

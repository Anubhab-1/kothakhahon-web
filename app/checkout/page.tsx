import CheckoutClient from "@/app/checkout/CheckoutClient";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default function CheckoutPage() {
  if (!hasSupabaseEnv()) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-16 md:px-8">
        <div className="editorial-panel rounded-2xl p-8 md:p-10">
          <p className="font-ui text-xs tracking-[0.16em] text-ember">CHECKOUT UNAVAILABLE</p>
          <h1 className="mt-3 font-title text-5xl text-ivory">Connect Supabase First</h1>
          <p className="mt-4 max-w-2xl font-body text-lg text-stone">
            Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` to
            enable checkout.
          </p>
        </div>
      </div>
    );
  }

  return <CheckoutClient />;
}

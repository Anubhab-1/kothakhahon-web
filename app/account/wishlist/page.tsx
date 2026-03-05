import Link from "next/link";
import { redirect } from "next/navigation";
import AccountNav from "@/components/layout/AccountNav";
import { getAllBooks, hasSanityEnv } from "@/lib/sanity";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/supabase/user";

interface WishlistRow {
  id: string;
  book_id: string;
  book_title: string;
  added_at: string;
}

interface WishlistViewRow extends WishlistRow {
  book_slug: string;
}

function formatDate(value: string) {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function WishlistPage() {
  if (!hasSupabaseEnv()) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8">
        <p className="font-ui text-xs tracking-[0.16em] text-ember">WISHLIST UNAVAILABLE</p>
        <h1 className="mt-3 font-title text-5xl text-ivory">Connect Supabase</h1>
      </div>
    );
  }

  const user = await getServerUser({ timeoutMs: 1400 });
  if (!user) {
    redirect("/auth/login?next=/account/wishlist");
  }

  const supabase = await createSupabaseServerClient();
  const { data: wishlistData } = await supabase
    .from("wishlist")
    .select("id,book_id,book_title,added_at")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  const wishlist = (wishlistData ?? []) as WishlistRow[];
  const slugMap = new Map<string, string>();

  if (hasSanityEnv() && wishlist.length > 0) {
    try {
      const books = await getAllBooks();
      books.forEach((book) => {
        if (!book.slug) return;
        if (book._id) {
          slugMap.set(book._id, book.slug);
        }
        slugMap.set(book.slug, book.slug);
      });
    } catch {
      // Keep using stored book_id values when CMS lookup fails.
    }
  }

  const viewRows: WishlistViewRow[] = wishlist.map((item) => ({
    ...item,
    book_slug: slugMap.get(item.book_id) ?? item.book_id,
  }));

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-16 md:grid-cols-[220px_1fr] md:px-8">
      <AccountNav />

      <div>
        <div className="editorial-panel rounded-2xl p-6 md:p-8">
          <p className="font-ui text-xs tracking-[0.16em] text-gold">WISHLIST</p>
          <h1 className="mt-3 font-title text-5xl text-ivory">Saved Books</h1>
          <p className="mt-3 max-w-2xl font-body text-lg text-stone">
            Keep a shortlist of books to buy next. Each item links to its latest catalog page.
          </p>
          <div className="mt-4 ink-divider" />
        </div>

        {viewRows.length > 0 ? (
          <div className="mt-8 space-y-3">
            {viewRows.map((item) => (
              <article
                key={item.id}
                className="fx-card flex flex-wrap items-center justify-between gap-3 rounded-xl border border-smoke bg-obsidian p-5"
              >
                <div>
                  <p className="text-safe font-title text-3xl text-ivory">{item.book_title}</p>
                  <p className="mt-1 font-mono text-xs text-stone">
                    Saved on {formatDate(item.added_at)}
                  </p>
                </div>

                <Link
                  href={`/books/${item.book_slug}`}
                  className="fx-button rounded-full border border-gold bg-gold px-5 py-2.5 font-ui text-xs tracking-[0.14em] text-void transition hover:bg-gold-dim"
                >
                  VIEW BOOK
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-smoke bg-obsidian p-8">
            <p className="font-body text-base text-stone">
              You have no saved books yet. Browse the{" "}
              <Link href="/books" className="text-gold hover:text-gold-dim">
                catalog
              </Link>{" "}
              and start building your list.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

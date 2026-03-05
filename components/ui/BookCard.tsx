import Image from "next/image";
import Link from "next/link";
import type { Book } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import TiltCard from "@/components/ui/TiltCard";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const firstChar = book.title.trim().charAt(0).toUpperCase();

  return (
    <TiltCard>
      <Link
        href={`/books/${book.slug}`}
        className="fx-card group block rounded-2xl border border-smoke bg-obsidian/80 p-4 transition hover:border-gold/60"
        aria-label={`Open ${book.title}`}
      >
        <article>
          <div className="book-edge relative aspect-[3/4] overflow-hidden rounded-xl">
            {book.coverImageUrl ? (
              <Image
                src={book.coverImageUrl}
                alt={book.title}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover transition duration-500 group-hover:scale-[1.04]"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-b from-[#2d261d] via-[#1d1914] to-[#12110f]">
                <span className="font-title text-7xl text-gold/25">{firstChar}</span>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/90 via-transparent to-transparent" />

            <div className="absolute top-3 left-3 rounded-full border border-gold/40 bg-void/80 px-2.5 py-1 font-ui text-[10px] tracking-[0.14em] text-gold">
              FEATURED
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <h3 className="line-clamp-2 text-safe font-title text-[1.8rem] text-ivory">{book.title}</h3>
            <p className="font-body text-sm text-stone">{book.author?.name ?? "Unknown Author"}</p>

            <div className="ink-divider mt-2" />

            <div className="flex items-center justify-between pt-1">
              <p className="rounded-full border border-smoke px-2.5 py-1 font-mono text-xs text-parchment">
                {formatINR(book.price)}
              </p>
              <span className="fx-link font-ui text-[11px] tracking-[0.14em] text-gold transition group-hover:text-gold-dim">
                VIEW EDITION
              </span>
            </div>
          </div>
        </article>
      </Link>
    </TiltCard>
  );
}


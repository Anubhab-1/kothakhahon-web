"use client";

import Image from "next/image";
import Link from "next/link";
import type { CatalogBook } from "@/lib/types";
import WishlistButton from "@/components/ui/WishlistButton";
import { formatINR } from "@/lib/utils";
import TiltCard from "@/components/ui/TiltCard";

interface CatalogBookCardProps {
  book: CatalogBook;
  isAuthenticated: boolean;
}

const fallbackPalettes = [
  "from-[#1E1C1A] to-[#2D2114]",
  "from-[#192024] to-[#1C2732]",
  "from-[#231A17] to-[#2E2419]",
  "from-[#181A21] to-[#232A35]",
  "from-[#221F1A] to-[#2F2A23]",
];

function getFallbackPalette(seed: string) {
  const hash = seed.split("").reduce((value, char) => value + char.charCodeAt(0), 0);
  return fallbackPalettes[hash % fallbackPalettes.length];
}

export default function CatalogBookCard({ book, isAuthenticated }: CatalogBookCardProps) {
  const fallbackPalette = getFallbackPalette(book.id);
  const firstChar = book.title.trim().charAt(0).toUpperCase();

  return (
    <TiltCard>
      <article
        className="fx-card group relative rounded-2xl border border-smoke bg-obsidian/85 p-4 transition hover:border-gold/60 hover:shadow-[0_16px_45px_rgba(201,151,58,0.22)]"
      >
        <Link
          href={`/books/${book.slug}`}
          className="absolute inset-0 z-10 rounded-2xl"
          aria-label={`Open ${book.title}`}
        />

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
            <div className={`flex h-full items-center justify-center bg-gradient-to-b ${fallbackPalette}`}>
              <span className="font-title text-7xl text-gold/30">{firstChar}</span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/90 via-transparent to-transparent" />

          <div className="absolute top-3 left-3 rounded-full border border-gold/40 bg-void/80 px-2.5 py-1 font-ui text-[10px] tracking-[0.14em] text-gold">
            BOOK
          </div>

          <WishlistButton
            isAuthenticated={isAuthenticated}
            redirectPath={`/books/${book.slug}`}
            bookId={book.slug}
            bookTitle={book.title}
            bookCoverUrl={book.coverImageUrl}
            className="absolute top-3 right-3 z-20"
          />
        </div>

        <div className="relative z-20 mt-4 space-y-2">
          <h3 className="line-clamp-2 text-safe font-title text-[1.8rem] text-ivory">{book.title}</h3>
          <p className="font-body text-sm text-stone">{book.authorName}</p>

          <div className="flex flex-wrap gap-1.5">
            {book.genreNames.slice(0, 2).map((genre) => (
              <span
                key={`${book.id}-${genre}`}
                className="rounded-full border border-smoke px-2 py-1 font-mono text-[10px] text-stone"
              >
                {genre}
              </span>
            ))}
          </div>

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
    </TiltCard>
  );
}

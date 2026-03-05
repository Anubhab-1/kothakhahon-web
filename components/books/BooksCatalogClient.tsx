"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import type { CatalogBook } from "@/lib/types";
import CatalogBookCard from "@/components/books/CatalogBookCard";

interface BooksCatalogClientProps {
  books: CatalogBook[];
  isAuthenticated: boolean;
}

type SortOption = "newest" | "oldest" | "price-low" | "price-high" | "title-az";

const PAGE_SIZE = 16;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

function getComparableDate(dateValue?: string) {
  if (!dateValue) return 0;
  const parsed = Date.parse(dateValue);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return pages;
}

export default function BooksCatalogClient({ books, isAuthenticated }: BooksCatalogClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const genres = useMemo(() => {
    const genreSet = new Set<string>();
    books.forEach((book) => {
      book.genreNames.forEach((genre) => genreSet.add(genre));
    });
    return Array.from(genreSet).sort((a, b) => a.localeCompare(b));
  }, [books]);

  const filteredBooks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const filtered = books.filter((book) => {
      const inGenre =
        selectedGenre === "all" || book.genreNames.some((genre) => genre === selectedGenre);
      if (!inGenre) return false;

      if (!query) return true;
      const searchable = `${book.title} ${book.authorName} ${book.genreNames.join(" ")}`.toLowerCase();
      return searchable.includes(query);
    });

    filtered.sort((a, b) => {
      switch (sortOption) {
        case "title-az":
          return a.title.localeCompare(b.title);
        case "price-low":
          return (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY);
        case "price-high":
          return (b.price ?? 0) - (a.price ?? 0);
        case "oldest":
          return getComparableDate(a.publicationDate) - getComparableDate(b.publicationDate);
        case "newest":
        default:
          return getComparableDate(b.publicationDate) - getComparableDate(a.publicationDate);
      }
    });

    return filtered;
  }, [books, searchTerm, selectedGenre, sortOption]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const visibleBooks = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredBooks.slice(start, start + PAGE_SIZE);
  }, [safeCurrentPage, filteredBooks]);

  const visiblePages = getVisiblePages(safeCurrentPage, totalPages);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8">
      <div className="editorial-panel rounded-2xl p-6 md:p-8">
        <p className="font-ui text-xs tracking-[0.18em] text-gold">BOOKSTORE</p>
        <h1 className="mt-3 font-title text-5xl text-ivory md:text-6xl">Browse All Books</h1>
        <p className="mt-3 max-w-3xl font-body text-lg text-stone">
          Discover our complete catalog. Search by title or author, filter by genre, and sort by
          date or price.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-xs">
          <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-ui tracking-[0.13em] text-gold">
            {filteredBooks.length} RESULTS
          </span>
          <span className="rounded-full border border-smoke px-3 py-1 font-ui tracking-[0.13em] text-parchment">
            {books.length} TOTAL TITLES
          </span>
          <span className="rounded-full border border-smoke px-3 py-1 font-ui tracking-[0.13em] text-parchment">
            {genres.length} GENRES
          </span>
        </div>
      </div>

      <section className="sticky top-24 z-10 mt-8 rounded-2xl border border-smoke bg-void/95 p-4 backdrop-blur md:p-5">
        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search title, author, or genre..."
              className="w-full rounded-md border border-smoke bg-obsidian px-9 py-2.5 font-body text-base text-ivory outline-none ring-gold transition focus:ring-1"
            />
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-gold" />
              <button
                type="button"
                onClick={() => {
                  setSelectedGenre("all");
                  setCurrentPage(1);
                }}
                className={`fx-button shrink-0 rounded-full border px-3 py-1.5 font-ui text-[11px] tracking-[0.12em] transition ${selectedGenre === "all"
                    ? "border-gold bg-gold text-void"
                    : "border-smoke bg-obsidian text-parchment hover:border-gold hover:text-gold"
                  }`}
              >
                ALL
              </button>

              {genres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => {
                    setSelectedGenre(genre);
                    setCurrentPage(1);
                  }}
                  className={`fx-button shrink-0 rounded-full border px-3 py-1.5 font-ui text-[11px] tracking-[0.12em] transition ${selectedGenre === genre
                      ? "border-gold bg-gold text-void"
                      : "border-smoke bg-obsidian text-parchment hover:border-gold hover:text-gold"
                    }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className="font-ui text-[11px] tracking-[0.12em] text-stone">SORT</label>
              <select
                value={sortOption}
                onChange={(event) => {
                  setSortOption(event.target.value as SortOption);
                  setCurrentPage(1);
                }}
                className="rounded-md border border-smoke bg-obsidian px-3 py-2 font-body text-sm text-ivory outline-none ring-gold transition focus:ring-1"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="title-az">Title: A to Z</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {filteredBooks.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-smoke bg-obsidian p-8 text-center">
          <h2 className="font-title text-3xl text-ivory">No books found</h2>
          <p className="mt-2 font-body text-base text-stone">
            Try changing filters or clearing your search.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setSelectedGenre("all");
              setSortOption("newest");
              setCurrentPage(1);
            }}
            className="fx-button mt-5 rounded-full border border-gold bg-gold px-5 py-2.5 font-ui text-xs tracking-[0.14em] text-void transition hover:bg-gold-dim"
          >
            CLEAR FILTERS
          </button>
        </div>
      ) : (
        <>
          <motion.div
            key={`${selectedGenre}-${sortOption}-${searchTerm}-${safeCurrentPage}`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {visibleBooks.map((book) => (
              <motion.div key={book.id} variants={itemVariants} transition={{ duration: 0.25 }}>
                <CatalogBookCard book={book} isAuthenticated={isAuthenticated} />
              </motion.div>
            ))}
          </motion.div>

          {totalPages > 1 ? (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, Math.min(page, totalPages) - 1))}
                className="fx-button rounded-md border border-smoke px-3 py-2 font-ui text-[11px] tracking-[0.12em] text-parchment transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-50"
              >
                PREV
              </button>

              {visiblePages.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`fx-button rounded-md border px-3 py-2 font-ui text-[11px] tracking-[0.12em] transition ${safeCurrentPage === page
                      ? "border-gold bg-gold text-void"
                      : "border-smoke text-parchment hover:border-gold hover:text-gold"
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                className="fx-button rounded-md border border-smoke px-3 py-2 font-ui text-[11px] tracking-[0.12em] text-parchment transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-50"
              >
                NEXT
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}


import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BookDetailClient from "@/components/books/BookDetailClient";
import { getIsAuthenticated } from "@/lib/supabase/user";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getAllBooks,
  getBookBySlug,
  getRelatedBooks,
  hasSanityEnv,
  urlFor,
} from "@/lib/sanity";
import type { Book, BookDetailView, BookReviewView, RelatedBook } from "@/lib/types";

interface BookDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 60;

const fallbackBooks: Book[] = [
  {
    _id: "book-1",
    title: "Shobder Nodi",
    titleEn: "River of Words",
    slug: "shobder-nodi",
    author: {
      _id: "author-1",
      name: "Arindam Sen",
      slug: "arindam-sen",
      bio: "Arindam Sen writes literary fiction centered on memory, migration, and fractured city lives.",
    },
    genre: [
      { _id: "genre-fiction", name: "Literary Fiction", slug: "literary-fiction" },
      { _id: "genre-contemporary", name: "Contemporary", slug: "contemporary" },
    ],
    synopsis:
      "A drifting narrator returns to his river town after two decades and discovers that language itself has changed. As old relationships reopen, he confronts family silence, political erasure, and the unfinished letters his mother left behind.",
    pullQuote: "Some rivers do not carry water. They carry unfinished sentences.",
    price: 450,
    publicationDate: "2024-03-11",
    pageCount: 284,
    isbn: "978-93-00000-11-7",
    language: "Bengali",
    chapterPreview:
      "On the morning train, the river came first, then the town. It always arrived like that in memory: a silver line before the names of people.\n\nHe had promised himself he would not write about this place again. Yet every notebook he opened began with the same crooked sentence.\n\nBy noon, the old station clock had stopped exactly where he remembered. The tea vendor looked younger than his own son.",
    averageRating: 4.6,
    reviewCount: 126,
    featured: true,
  },
  {
    _id: "book-2",
    title: "Nirjan Pathshala",
    slug: "nirjan-pathshala",
    author: {
      _id: "author-2",
      name: "Moumita Das",
      slug: "moumita-das",
      bio: "Moumita Das is a poet and essayist whose work explores intimacy and urban solitude.",
    },
    genre: [{ _id: "genre-poetry", name: "Poetry", slug: "poetry" }],
    synopsis:
      "A poetry collection mapping loneliness across classrooms, hostels, ferries, and borrowed rooms.",
    pullQuote: "Silence is not empty. It is full of unsent names.",
    price: 390,
    publicationDate: "2023-11-09",
    pageCount: 146,
    isbn: "978-93-00000-06-3",
    language: "Bengali",
    chapterPreview:
      "In the corridor light, her notebook looked like a second window.\n\nEvery poem began where conversation failed.",
    averageRating: 4.4,
    reviewCount: 74,
  },
  {
    _id: "book-3",
    title: "Dhonir Bhasha",
    slug: "dhonir-bhasha",
    author: {
      _id: "author-3",
      name: "Sagnik Roy",
      slug: "sagnik-roy",
      bio: "Sagnik Roy writes criticism and long-form essays on language politics in South Asia.",
    },
    genre: [
      { _id: "genre-essays", name: "Essays", slug: "essays" },
      { _id: "genre-nonfiction", name: "Non-Fiction", slug: "non-fiction" },
    ],
    synopsis:
      "A provocative essay collection on sound, language, identity, and how speech is disciplined in public space.",
    pullQuote: "Accent is history wearing the mask of grammar.",
    price: 520,
    publicationDate: "2025-01-18",
    pageCount: 332,
    isbn: "978-93-00000-14-8",
    language: "Bengali",
    chapterPreview:
      "When we say a language is pure, we often mean someone else must remain unheard.\n\nThe first violence is always phonetic.",
    averageRating: 4.7,
    reviewCount: 198,
  },
  {
    _id: "book-4",
    title: "Onubader Ayna",
    slug: "onubader-ayna",
    author: {
      _id: "author-4",
      name: "Lopamudra Bose",
      slug: "lopamudra-bose",
      bio: "Lopamudra Bose is a translator and editor interested in multilingual literary archives.",
    },
    genre: [{ _id: "genre-nonfiction", name: "Non-Fiction", slug: "non-fiction" }],
    synopsis:
      "A reflective account of translation, distortion, and literary memory between Bengali and English.",
    pullQuote: "Every translation is an argument with time.",
    price: 410,
    publicationDate: "2024-09-01",
    pageCount: 256,
    isbn: "978-93-00000-09-4",
    language: "Bengali",
    chapterPreview:
      "The original text sat like a mirror tilted toward another century.\n\nMy work was to change its angle, not its light.",
    averageRating: 4.5,
    reviewCount: 89,
  },
  {
    _id: "book-5",
    title: "Rate Jhora Pata",
    slug: "rate-jhora-pata",
    author: {
      _id: "author-5",
      name: "Kaushik Saha",
      slug: "kaushik-saha",
      bio: "Kaushik Saha writes social realist fiction rooted in changing peri-urban Bengal.",
    },
    genre: [{ _id: "genre-fiction", name: "Literary Fiction", slug: "literary-fiction" }],
    synopsis:
      "A layered portrait of a small-town neighborhood where aspiration, debt, and friendship collide over one monsoon season.",
    pullQuote: "Some nights do not pass. They sediment.",
    price: 360,
    publicationDate: "2022-04-20",
    pageCount: 238,
    isbn: "978-93-00000-15-5",
    language: "Bengali",
    chapterPreview:
      "The shutters had closed before rain arrived. Still, water found every crack in the lane.\n\nBy midnight, all promises sounded practical and therefore suspect.",
    averageRating: 4.3,
    reviewCount: 61,
  },
  {
    _id: "book-6",
    title: "Kobitar Khata",
    slug: "kobitar-khata",
    author: {
      _id: "author-6",
      name: "Nabanita Paul",
      slug: "nabanita-paul",
      bio: "Nabanita Paul is known for intimate lyric poetry and precise editorial craft.",
    },
    genre: [{ _id: "genre-poetry", name: "Poetry", slug: "poetry" }],
    synopsis:
      "A notebook-like poetry sequence on family archives, letters, and unfinished conversations.",
    pullQuote: "Poems are what remain after the house has gone quiet.",
    price: 280,
    publicationDate: "2024-02-14",
    pageCount: 124,
    isbn: "978-93-00000-16-2",
    language: "Bengali",
    chapterPreview:
      "On the first page, she wrote only a date.\n\nOn the second, she crossed it out and wrote a season instead.",
    averageRating: 4.2,
    reviewCount: 48,
  },
  {
    _id: "book-7",
    title: "Nagarik Rupkatha",
    slug: "nagarik-rupkatha",
    author: {
      _id: "author-7",
      name: "Tanmoy Ghosh",
      slug: "tanmoy-ghosh",
      bio: "Tanmoy Ghosh explores urban anxiety, labor precarity, and class aspiration in fiction.",
    },
    genre: [{ _id: "genre-fiction", name: "Literary Fiction", slug: "literary-fiction" }],
    synopsis:
      "A contemporary city fable where delivery workers, startup founders, and students cross each other in a week of civic unrest.",
    pullQuote: "Every city tells fairy tales in administrative language.",
    price: 470,
    publicationDate: "2025-02-02",
    pageCount: 302,
    isbn: "978-93-00000-17-9",
    language: "Bengali",
    chapterPreview:
      "By afternoon the flyover had become a queue of brakes and impatience.\n\nFrom the twelfth floor, all traffic looked like punctuation marks.",
    averageRating: 4.4,
    reviewCount: 83,
  },
  {
    _id: "book-8",
    title: "Boi o Bangla",
    slug: "boi-o-bangla",
    author: {
      _id: "author-8",
      name: "Debolina Dhar",
      slug: "debolina-dhar",
      bio: "Debolina Dhar writes essays on reading cultures, translation, and Bengali print history.",
    },
    genre: [{ _id: "genre-essays", name: "Essays", slug: "essays" }],
    synopsis:
      "An essay collection on bookstores, little magazines, translation politics, and why reading communities matter.",
    pullQuote: "A language survives in how its readers gather.",
    price: 340,
    publicationDate: "2023-08-12",
    pageCount: 210,
    isbn: "978-93-00000-18-6",
    language: "Bengali",
    chapterPreview:
      "The first bookshop I remember had no signboard, only a blue curtain.\n\nInside, every shelf seemed organized by affection, not category.",
    averageRating: 4.1,
    reviewCount: 39,
  },
  {
    _id: "book-9",
    title: "Smritir Map",
    titleEn: "Map of Memory",
    slug: "smritir-map",
    author: {
      _id: "author-1",
      name: "Arindam Sen",
      slug: "arindam-sen",
      bio: "Arindam Sen writes literary fiction centered on memory, migration, and fractured city lives.",
    },
    genre: [
      { _id: "genre-fiction", name: "Literary Fiction", slug: "literary-fiction" },
      { _id: "genre-contemporary", name: "Contemporary", slug: "contemporary" },
    ],
    synopsis:
      "A son returns to catalog his late father's notebooks and finds a parallel history of a vanished neighborhood. As he traces landmarks that no longer exist, family memory starts to conflict with official records.",
    pullQuote: "Maps forget what people keep repeating at dinner tables.",
    price: 430,
    publicationDate: "2024-12-05",
    pageCount: 268,
    isbn: "978-93-00000-19-3",
    language: "Bengali",
    chapterPreview:
      "The municipal map called it Ward 17.\n\nMy father still called it by the name of a cinema that burned down before I was born.\n\nOn his last page, he drew the lane as if memory had its own scale.",
    averageRating: 4.5,
    reviewCount: 67,
    featured: true,
  },
  {
    _id: "book-10",
    title: "Chhaya Shohor",
    titleEn: "Shadow City",
    slug: "chhaya-shohor",
    author: {
      _id: "author-7",
      name: "Tanmoy Ghosh",
      slug: "tanmoy-ghosh",
      bio: "Tanmoy Ghosh explores urban anxiety, labor precarity, and class aspiration in fiction.",
    },
    genre: [{ _id: "genre-fiction", name: "Literary Fiction", slug: "literary-fiction" }],
    synopsis:
      "Set over forty-eight hours during an extended blackout, this novel follows riders, nurses, and call-center workers navigating a city that suddenly has no digital memory.",
    pullQuote: "When the lights go out, every shortcut becomes a confession.",
    price: 495,
    publicationDate: "2025-09-14",
    pageCount: 318,
    isbn: "978-93-00000-20-9",
    language: "Bengali",
    chapterPreview:
      "By 7:12 PM, the signal towers had gone silent.\n\nPeople stood on balconies holding phones like lanterns, waiting for bars that did not return.\n\nIn the dark, the city began introducing itself again, one voice at a time.",
    averageRating: 4.6,
    reviewCount: 92,
    featured: true,
  },
  {
    _id: "book-11",
    title: "Bangla Boi Archive",
    titleEn: "The Bengali Book Archive",
    slug: "bangla-boi-archive",
    author: {
      _id: "author-8",
      name: "Debolina Dhar",
      slug: "debolina-dhar",
      bio: "Debolina Dhar writes essays on reading cultures, translation, and Bengali print history.",
    },
    genre: [
      { _id: "genre-essays", name: "Essays", slug: "essays" },
      { _id: "genre-nonfiction", name: "Non-Fiction", slug: "non-fiction" },
    ],
    synopsis:
      "An archival narrative on little magazines, district libraries, and out-of-print catalogs that shaped twentieth-century Bengali reading communities.",
    pullQuote: "Every missing edition leaves a fingerprint on collective memory.",
    price: 560,
    publicationDate: "2025-06-21",
    pageCount: 352,
    isbn: "978-93-00000-21-6",
    language: "Bengali",
    chapterPreview:
      "In Krishnanagar, the librarian unlocked a steel trunk before opening the main register.\n\nInside lay subscription slips, folded reviews, and three books no catalog admitted having.\n\nPreservation begins where official inventory ends.",
    averageRating: 4.7,
    reviewCount: 105,
    featured: true,
  },
];

const fallbackReviews: BookReviewView[] = [
  {
    id: "review-1",
    reviewerName: "S. Chatterjee",
    rating: 5,
    text: "Brilliantly written. The emotional pace is slow but devastating in the best way.",
    createdAt: "12 Jan 2026",
  },
  {
    id: "review-2",
    reviewerName: "M. Rahman",
    rating: 4.5,
    text: "One of the most careful Bengali editions I have read this year.",
    createdAt: "03 Dec 2025",
  },
  {
    id: "review-3",
    reviewerName: "P. Dutta",
    rating: 4,
    text: "Excellent prose and editing quality. A few sections felt dense, but worth it.",
    createdAt: "17 Oct 2025",
  },
];

interface ReviewRow {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
}

function formatReviewDate(input: string) {
  const parsed = Date.parse(input);
  if (Number.isNaN(parsed)) return input;
  return new Date(parsed).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getAggregatedRatings(reviews: BookReviewView[]) {
  if (reviews.length === 0) {
    return null;
  }
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return {
    average: Number((sum / reviews.length).toFixed(1)),
    count: reviews.length,
  };
}

async function getApprovedReviews(bookId: string, bookSlug: string) {
  if (!hasSupabaseEnv()) {
    return fallbackReviews;
  }

  try {
    const supabase = await createSupabaseServerClient();

    const byId = await supabase
      .from("reviews")
      .select("id,rating,review_text,created_at")
      .eq("book_id", bookId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    let rows = (byId.data ?? []) as ReviewRow[];

    if (rows.length === 0) {
      const bySlug = await supabase
        .from("reviews")
        .select("id,rating,review_text,created_at")
        .eq("book_id", bookSlug)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      rows = (bySlug.data ?? []) as ReviewRow[];
    }

    return rows.map((row, index) => ({
      id: row.id,
      reviewerName: `Reader ${index + 1}`,
      rating: Number(row.rating),
      text: row.review_text,
      createdAt: formatReviewDate(row.created_at),
    }));
  } catch {
    return [];
  }
}

function mapBookToDetail(book: Book): BookDetailView {
  const mappedGenres = (book.genre ?? []).map((genre) => genre.name).filter(Boolean);

  return {
    id: book._id,
    slug: book.slug,
    title: book.title,
    titleEn: book.titleEn,
    coverImageUrl:
      book.coverImageUrl ??
      (book.coverImage
        ? urlFor(book.coverImage).width(900).height(1300).fit("crop").quality(85).url()
        : undefined),
    authorName: book.author?.name ?? "Unknown Author",
    authorSlug: book.author?.slug,
    authorBio: book.author?.bio,
    genres: mappedGenres.length > 0 ? mappedGenres : ["Literary Fiction"],
    synopsis:
      book.synopsis ??
      "A compelling literary work exploring identity, memory, and the changing social texture of Bengal.",
    pullQuote:
      book.pullQuote ?? "Stories remain where official history refuses to look.",
    chapterPreview:
      book.chapterPreview ??
      "The first page opened with dust and a date.\n\nHe did not yet know that every room in this house had kept a different version of the same story.",
    price: book.price,
    buyLink: book.buyLink,
    publicationDate: book.publicationDate,
    pageCount: book.pageCount,
    isbn: book.isbn,
    language: book.language,
    averageRating: book.averageRating ?? 4.5,
    reviewCount: book.reviewCount ?? 0,
  };
}

function mapRelatedBook(book: Book): RelatedBook {
  return {
    id: book._id,
    slug: book.slug,
    title: book.title,
    authorName: book.author?.name ?? "Unknown Author",
    price: book.price,
    coverImageUrl:
      book.coverImageUrl ??
      (book.coverImage
        ? urlFor(book.coverImage).width(520).height(760).fit("crop").quality(80).url()
        : undefined),
  };
}

function getFallbackBookBySlug(slug: string) {
  return fallbackBooks.find((book) => book.slug === slug) ?? null;
}

function getFallbackRelated(slug: string) {
  return fallbackBooks.filter((book) => book.slug !== slug).slice(0, 6).map(mapRelatedBook);
}

export async function generateStaticParams() {
  const fallback = fallbackBooks.map((book) => ({ slug: book.slug }));

  if (!hasSanityEnv()) {
    return fallback;
  }

  try {
    const books = await getAllBooks();
    if (books.length === 0) {
      return fallback;
    }

    return books
      .filter((book) => Boolean(book.slug))
      .map((book) => ({ slug: book.slug as string }));
  } catch {
    return fallback;
  }
}

async function getBookData(slug: string) {
  if (!hasSanityEnv()) {
    const fallbackBook = getFallbackBookBySlug(slug);
    if (!fallbackBook) return null;
    return {
      book: mapBookToDetail(fallbackBook),
      related: getFallbackRelated(slug),
    };
  }

  try {
    const book = await getBookBySlug(slug);
    if (!book) return null;

    let relatedBooks: Book[] = [];
    if (book.author?._id) {
      relatedBooks = await getRelatedBooks(slug, book.author._id);
    }

    if (relatedBooks.length === 0) {
      const allBooks = await getAllBooks();
      relatedBooks = allBooks
        .filter((candidate) => candidate.slug !== slug)
        .slice(0, 6);
    }

    return {
      book: mapBookToDetail(book),
      related: relatedBooks.slice(0, 6).map(mapRelatedBook),
    };
  } catch {
    const fallbackBook = getFallbackBookBySlug(slug);
    if (!fallbackBook) return null;
    return {
      book: mapBookToDetail(fallbackBook),
      related: getFallbackRelated(slug),
    };
  }
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { slug } = await params;
  const [bookData, isAuthenticated] = await Promise.all([
    getBookData(slug),
    getIsAuthenticated({ timeoutMs: 900 }),
  ]);

  if (!bookData) {
    notFound();
  }

  const reviews = await getApprovedReviews(bookData.book.id, bookData.book.slug);
  const ratings = getAggregatedRatings(reviews);

  const bookWithRatings: BookDetailView = {
    ...bookData.book,
    averageRating: ratings?.average ?? bookData.book.averageRating,
    reviewCount: ratings?.count ?? bookData.book.reviewCount,
  };

  return (
    <BookDetailClient
      book={bookWithRatings}
      relatedBooks={bookData.related}
      isAuthenticated={isAuthenticated}
    />
  );
}

export async function generateMetadata({ params }: BookDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBookData(slug);

  if (!data) {
    notFound();
  }

  return {
    title: data.book.title,
    description: data.book.synopsis.slice(0, 160),
  };
}

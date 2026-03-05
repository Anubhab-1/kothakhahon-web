import BooksCatalogClient from "@/components/books/BooksCatalogClient";
import { getIsAuthenticated } from "@/lib/supabase/user";
import { getAllBooks, hasSanityEnv, urlFor } from "@/lib/sanity";
import type { CatalogBook } from "@/lib/types";

export const revalidate = 60;

const fallbackBooks: CatalogBook[] = [
  {
    id: "fallback-1",
    slug: "shobder-nodi",
    title: "Shobder Nodi",
    authorName: "Arindam Sen",
    genreNames: ["Literary Fiction"],
    price: 450,
    publicationDate: "2024-03-11",
  },
  {
    id: "fallback-2",
    slug: "nirjan-pathshala",
    title: "Nirjan Pathshala",
    authorName: "Moumita Das",
    genreNames: ["Poetry"],
    price: 390,
    publicationDate: "2023-11-09",
  },
  {
    id: "fallback-3",
    slug: "dhonir-bhasha",
    title: "Dhonir Bhasha",
    authorName: "Sagnik Roy",
    genreNames: ["Essays", "Non-Fiction"],
    price: 520,
    publicationDate: "2025-01-18",
  },
  {
    id: "fallback-4",
    slug: "onubader-ayna",
    title: "Onubader Ayna",
    authorName: "Lopamudra Bose",
    genreNames: ["Non-Fiction"],
    price: 410,
    publicationDate: "2024-09-01",
  },
  {
    id: "fallback-5",
    slug: "rate-jhora-pata",
    title: "Rate Jhora Pata",
    authorName: "Kaushik Saha",
    genreNames: ["Literary Fiction"],
    price: 360,
    publicationDate: "2022-04-20",
  },
  {
    id: "fallback-6",
    slug: "kobitar-khata",
    title: "Kobitar Khata",
    authorName: "Nabanita Paul",
    genreNames: ["Poetry"],
    price: 280,
    publicationDate: "2024-02-14",
  },
  {
    id: "fallback-7",
    slug: "nagarik-rupkatha",
    title: "Nagarik Rupkatha",
    authorName: "Tanmoy Ghosh",
    genreNames: ["Literary Fiction"],
    price: 470,
    publicationDate: "2025-02-02",
  },
  {
    id: "fallback-8",
    slug: "boi-o-bangla",
    title: "Boi o Bangla",
    authorName: "Debolina Dhar",
    genreNames: ["Essays"],
    price: 340,
    publicationDate: "2023-08-12",
  },
  {
    id: "fallback-9",
    slug: "smritir-map",
    title: "Smritir Map",
    authorName: "Arindam Sen",
    genreNames: ["Literary Fiction", "Contemporary"],
    price: 430,
    publicationDate: "2024-12-05",
  },
  {
    id: "fallback-10",
    slug: "chhaya-shohor",
    title: "Chhaya Shohor",
    authorName: "Tanmoy Ghosh",
    genreNames: ["Literary Fiction"],
    price: 495,
    publicationDate: "2025-09-14",
  },
  {
    id: "fallback-11",
    slug: "bangla-boi-archive",
    title: "Bangla Boi Archive",
    authorName: "Debolina Dhar",
    genreNames: ["Essays", "Non-Fiction"],
    price: 560,
    publicationDate: "2025-06-21",
  },
];

async function getCatalogBooks() {
  if (!hasSanityEnv()) {
    return fallbackBooks;
  }

  try {
    const books = await getAllBooks();

    const mapped = books
      .map((book) => ({
        id: book._id,
        slug: book.slug,
        title: book.title,
        authorName: book.author?.name ?? "Unknown Author",
        genreNames: (book.genre ?? []).map((genre) => genre.name).filter(Boolean),
        price: book.price,
        publicationDate: book.publicationDate,
        coverImageUrl:
          book.coverImageUrl ??
          (book.coverImage
            ? urlFor(book.coverImage).width(640).height(960).fit("crop").quality(80).url()
            : undefined),
      }))
      .filter((book) => Boolean(book.id && book.slug && book.title));

    return mapped.length > 0 ? mapped : fallbackBooks;
  } catch {
    return fallbackBooks;
  }
}

export default async function BooksPage() {
  const [books, isAuthenticated] = await Promise.all([
    getCatalogBooks(),
    getIsAuthenticated({ timeoutMs: 900 }),
  ]);

  return <BooksCatalogClient books={books} isAuthenticated={isAuthenticated} />;
}

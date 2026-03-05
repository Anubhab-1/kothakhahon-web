import { notFound } from "next/navigation";
import AuthorDetailClient, {
  type AuthorBookItem,
  type AuthorDetailItem,
} from "@/components/authors/AuthorDetailClient";
import {
  getAllAuthors,
  getAllBooks,
  getAuthorBySlug,
  getBooksByAuthor,
  hasSanityEnv,
  urlFor,
} from "@/lib/sanity";
import type { Author, Book } from "@/lib/types";

interface AuthorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 60;

const fallbackAuthors: Author[] = [
  {
    _id: "author-1",
    name: "Arindam Sen",
    slug: "arindam-sen",
    bio: "Arindam Sen writes literary fiction centered on memory, migration, and fractured city lives.",
    awards: ["Bengal Fiction Award"],
  },
  {
    _id: "author-2",
    name: "Moumita Das",
    slug: "moumita-das",
    bio: "Moumita Das is a poet and essayist whose work explores intimacy and urban solitude.",
    awards: ["Young Poet Citation"],
  },
  {
    _id: "author-3",
    name: "Sagnik Roy",
    slug: "sagnik-roy",
    bio: "Sagnik Roy writes criticism and long-form essays on language politics in South Asia.",
    awards: ["Editorial Excellence Mention"],
  },
  {
    _id: "author-4",
    name: "Lopamudra Bose",
    slug: "lopamudra-bose",
    bio: "Lopamudra Bose is a translator and editor interested in multilingual literary archives.",
    awards: ["Translation Fellowship"],
  },
  {
    _id: "author-5",
    name: "Kaushik Saha",
    slug: "kaushik-saha",
    bio: "Kaushik Saha writes social realist Bengali fiction rooted in peri-urban life.",
  },
  {
    _id: "author-6",
    name: "Nabanita Paul",
    slug: "nabanita-paul",
    bio: "Nabanita Paul is a contemporary poet with a voice shaped by intimacy and memory.",
  },
  {
    _id: "author-7",
    name: "Tanmoy Ghosh",
    slug: "tanmoy-ghosh",
    bio: "Tanmoy Ghosh explores modern aspiration, class anxiety, and city life in his fiction.",
  },
  {
    _id: "author-8",
    name: "Debolina Dhar",
    slug: "debolina-dhar",
    bio: "Debolina Dhar writes essays and narrative non-fiction on language and culture.",
  },
];

const fallbackBooks: Book[] = [
  {
    _id: "fallback-1",
    slug: "shobder-nodi",
    title: "Shobder Nodi",
    price: 450,
    author: { _id: "author-1", name: "Arindam Sen", slug: "arindam-sen" },
    genre: [{ _id: "g-1", name: "Literary Fiction", slug: "literary-fiction" }],
    language: "Bengali",
  },
  {
    _id: "fallback-2",
    slug: "nirjan-pathshala",
    title: "Nirjan Pathshala",
    price: 390,
    author: { _id: "author-2", name: "Moumita Das", slug: "moumita-das" },
    genre: [{ _id: "g-2", name: "Poetry", slug: "poetry" }],
    language: "Bengali",
  },
  {
    _id: "fallback-3",
    slug: "dhonir-bhasha",
    title: "Dhonir Bhasha",
    price: 520,
    author: { _id: "author-3", name: "Sagnik Roy", slug: "sagnik-roy" },
    genre: [
      { _id: "g-3", name: "Essays", slug: "essays" },
      { _id: "g-4", name: "Non-Fiction", slug: "non-fiction" },
    ],
    language: "Bengali",
  },
  {
    _id: "fallback-4",
    slug: "onubader-ayna",
    title: "Onubader Ayna",
    price: 410,
    author: { _id: "author-4", name: "Lopamudra Bose", slug: "lopamudra-bose" },
    genre: [{ _id: "g-5", name: "Non-Fiction", slug: "non-fiction" }],
    language: "Bengali",
  },
  {
    _id: "fallback-5",
    slug: "rate-jhora-pata",
    title: "Rate Jhora Pata",
    price: 360,
    author: { _id: "author-5", name: "Kaushik Saha", slug: "kaushik-saha" },
    genre: [{ _id: "g-6", name: "Literary Fiction", slug: "literary-fiction" }],
    language: "Bengali",
  },
  {
    _id: "fallback-6",
    slug: "kobitar-khata",
    title: "Kobitar Khata",
    price: 280,
    author: { _id: "author-6", name: "Nabanita Paul", slug: "nabanita-paul" },
    genre: [{ _id: "g-7", name: "Poetry", slug: "poetry" }],
    language: "Bengali",
  },
  {
    _id: "fallback-7",
    slug: "nagarik-rupkatha",
    title: "Nagarik Rupkatha",
    price: 470,
    author: { _id: "author-7", name: "Tanmoy Ghosh", slug: "tanmoy-ghosh" },
    genre: [{ _id: "g-8", name: "Literary Fiction", slug: "literary-fiction" }],
    language: "Bengali",
  },
  {
    _id: "fallback-8",
    slug: "boi-o-bangla",
    title: "Boi o Bangla",
    price: 340,
    author: { _id: "author-8", name: "Debolina Dhar", slug: "debolina-dhar" },
    genre: [{ _id: "g-9", name: "Essays", slug: "essays" }],
    language: "Bengali",
  },
  {
    _id: "fallback-9",
    slug: "smritir-map",
    title: "Smritir Map",
    price: 430,
    author: { _id: "author-1", name: "Arindam Sen", slug: "arindam-sen" },
    genre: [
      { _id: "g-10", name: "Literary Fiction", slug: "literary-fiction" },
      { _id: "g-11", name: "Contemporary", slug: "contemporary" },
    ],
    language: "Bengali",
  },
  {
    _id: "fallback-10",
    slug: "chhaya-shohor",
    title: "Chhaya Shohor",
    price: 495,
    author: { _id: "author-7", name: "Tanmoy Ghosh", slug: "tanmoy-ghosh" },
    genre: [{ _id: "g-12", name: "Literary Fiction", slug: "literary-fiction" }],
    language: "Bengali",
  },
  {
    _id: "fallback-11",
    slug: "bangla-boi-archive",
    title: "Bangla Boi Archive",
    price: 560,
    author: { _id: "author-8", name: "Debolina Dhar", slug: "debolina-dhar" },
    genre: [
      { _id: "g-13", name: "Essays", slug: "essays" },
      { _id: "g-14", name: "Non-Fiction", slug: "non-fiction" },
    ],
    language: "Bengali",
  },
];

function mapAuthor(author: Author): AuthorDetailItem {
  return {
    id: author._id,
    slug: author.slug,
    name: author.name,
    bio: author.bio,
    photoUrl:
      author.photoUrl ??
      (author.photo ? urlFor(author.photo).width(640).height(640).fit("crop").quality(80).url() : undefined),
    awards: author.awards,
  };
}

function mapAuthorBook(book: Book): AuthorBookItem {
  return {
    id: book._id,
    slug: book.slug,
    title: book.title,
    price: book.price,
    coverImageUrl:
      book.coverImageUrl ??
      (book.coverImage
        ? urlFor(book.coverImage).width(640).height(960).fit("crop").quality(80).url()
        : undefined),
    genres: (book.genre ?? []).map((genre) => genre.name).filter(Boolean),
    language: book.language,
  };
}

function getFallbackData(slug: string) {
  const author = fallbackAuthors.find((item) => item.slug === slug) ?? null;
  if (!author) {
    return null;
  }

  const books = fallbackBooks.filter((book) => book.author?.slug === slug);
  return {
    author: mapAuthor(author),
    books: books.map(mapAuthorBook),
  };
}

async function getAuthorData(slug: string) {
  if (!hasSanityEnv()) {
    return getFallbackData(slug);
  }

  try {
    const author = await getAuthorBySlug(slug);
    if (!author) {
      return getFallbackData(slug);
    }

    let books = await getBooksByAuthor(slug);
    if (books.length === 0) {
      const allBooks = await getAllBooks();
      books = allBooks.filter((book) => book.author?.slug === slug);
    }

    return {
      author: mapAuthor(author),
      books: books.map(mapAuthorBook),
    };
  } catch {
    return getFallbackData(slug);
  }
}

export async function generateStaticParams() {
  const fallback = fallbackAuthors.map((author) => ({ slug: author.slug }));

  if (!hasSanityEnv()) {
    return fallback;
  }

  try {
    const authors = await getAllAuthors();
    if (authors.length === 0) {
      return fallback;
    }

    return authors.map((author) => ({ slug: author.slug }));
  } catch {
    return fallback;
  }
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const data = await getAuthorData(slug);

  if (!data) {
    notFound();
  }

  return <AuthorDetailClient author={data.author} books={data.books} />;
}

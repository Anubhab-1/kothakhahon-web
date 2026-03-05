import AuthorsIndexClient, {
  type AuthorIndexItem,
} from "@/components/authors/AuthorsIndexClient";
import { getAllAuthors, getAllBooks, hasSanityEnv, urlFor } from "@/lib/sanity";
import type { Author, Book } from "@/lib/types";

export const revalidate = 60;

const fallbackAuthors: Author[] = [
  {
    _id: "author-1",
    name: "Arindam Sen",
    slug: "arindam-sen",
    bio: "Writes literary fiction on memory, migration, and city life.",
    featured: true,
    awards: ["Bengal Fiction Award"],
  },
  {
    _id: "author-2",
    name: "Moumita Das",
    slug: "moumita-das",
    bio: "Poet and essayist exploring intimacy and urban solitude.",
    awards: ["Young Poet Citation"],
  },
  {
    _id: "author-3",
    name: "Sagnik Roy",
    slug: "sagnik-roy",
    bio: "Critic and long-form essayist on language politics.",
    awards: ["Editorial Excellence Mention"],
  },
  {
    _id: "author-4",
    name: "Lopamudra Bose",
    slug: "lopamudra-bose",
    bio: "Translator and editor focused on multilingual archives.",
    awards: ["Translation Fellowship"],
  },
  {
    _id: "author-5",
    name: "Kaushik Saha",
    slug: "kaushik-saha",
    bio: "Novelist focusing on social realism and contemporary Bengal.",
  },
  {
    _id: "author-6",
    name: "Nabanita Paul",
    slug: "nabanita-paul",
    bio: "Poet known for lyrical, intimate modern verse.",
  },
  {
    _id: "author-7",
    name: "Tanmoy Ghosh",
    slug: "tanmoy-ghosh",
    bio: "Fiction writer documenting urban anxiety and aspiration.",
  },
  {
    _id: "author-8",
    name: "Debolina Dhar",
    slug: "debolina-dhar",
    bio: "Essayist and cultural commentator.",
  },
];

const fallbackBooks: Book[] = [
  {
    _id: "fallback-1",
    slug: "shobder-nodi",
    title: "Shobder Nodi",
    author: { _id: "author-1", name: "Arindam Sen", slug: "arindam-sen" },
    genre: [{ _id: "g-1", name: "Literary Fiction", slug: "literary-fiction" }],
    language: "Bengali",
  },
  {
    _id: "fallback-2",
    slug: "nirjan-pathshala",
    title: "Nirjan Pathshala",
    author: { _id: "author-2", name: "Moumita Das", slug: "moumita-das" },
    genre: [{ _id: "g-2", name: "Poetry", slug: "poetry" }],
    language: "Bengali",
  },
  {
    _id: "fallback-3",
    slug: "dhonir-bhasha",
    title: "Dhonir Bhasha",
    author: { _id: "author-3", name: "Sagnik Roy", slug: "sagnik-roy" },
    genre: [{ _id: "g-3", name: "Essays", slug: "essays" }],
    language: "Bengali",
  },
  {
    _id: "fallback-4",
    slug: "onubader-ayna",
    title: "Onubader Ayna",
    author: { _id: "author-4", name: "Lopamudra Bose", slug: "lopamudra-bose" },
    genre: [{ _id: "g-4", name: "Non-Fiction", slug: "non-fiction" }],
    language: "Bengali",
  },
  {
    _id: "fallback-5",
    slug: "rate-jhora-pata",
    title: "Rate Jhora Pata",
    author: { _id: "author-5", name: "Kaushik Saha", slug: "kaushik-saha" },
    genre: [{ _id: "g-5", name: "Literary Fiction", slug: "literary-fiction" }],
    language: "Bengali",
  },
  {
    _id: "fallback-6",
    slug: "kobitar-khata",
    title: "Kobitar Khata",
    author: { _id: "author-6", name: "Nabanita Paul", slug: "nabanita-paul" },
    genre: [{ _id: "g-6", name: "Poetry", slug: "poetry" }],
    language: "Bengali",
  },
  {
    _id: "fallback-7",
    slug: "nagarik-rupkatha",
    title: "Nagarik Rupkatha",
    author: { _id: "author-7", name: "Tanmoy Ghosh", slug: "tanmoy-ghosh" },
    genre: [{ _id: "g-7", name: "Literary Fiction", slug: "literary-fiction" }],
    language: "Bengali",
  },
  {
    _id: "fallback-8",
    slug: "boi-o-bangla",
    title: "Boi o Bangla",
    author: { _id: "author-8", name: "Debolina Dhar", slug: "debolina-dhar" },
    genre: [{ _id: "g-8", name: "Essays", slug: "essays" }],
    language: "Bengali",
  },
  {
    _id: "fallback-9",
    slug: "smritir-map",
    title: "Smritir Map",
    author: { _id: "author-1", name: "Arindam Sen", slug: "arindam-sen" },
    genre: [
      { _id: "g-9", name: "Literary Fiction", slug: "literary-fiction" },
      { _id: "g-10", name: "Contemporary", slug: "contemporary" },
    ],
    language: "Bengali",
  },
  {
    _id: "fallback-10",
    slug: "chhaya-shohor",
    title: "Chhaya Shohor",
    author: { _id: "author-7", name: "Tanmoy Ghosh", slug: "tanmoy-ghosh" },
    genre: [{ _id: "g-11", name: "Literary Fiction", slug: "literary-fiction" }],
    language: "Bengali",
  },
  {
    _id: "fallback-11",
    slug: "bangla-boi-archive",
    title: "Bangla Boi Archive",
    author: { _id: "author-8", name: "Debolina Dhar", slug: "debolina-dhar" },
    genre: [
      { _id: "g-12", name: "Essays", slug: "essays" },
      { _id: "g-13", name: "Non-Fiction", slug: "non-fiction" },
    ],
    language: "Bengali",
  },
];

function mapAuthorsToIndex(authors: Author[], books: Book[]): AuthorIndexItem[] {
  return authors
    .map((author) => {
      const authoredBooks = books.filter((book) => book.author?.slug === author.slug);
      const photoUrl =
        author.photoUrl ??
        (author.photo ? urlFor(author.photo).width(300).height(300).fit("crop").url() : undefined);

      return {
        id: author._id,
        slug: author.slug,
        name: author.name,
        bio: author.bio,
        photoUrl,
        bookCount: authoredBooks.length,
      };
    })
    .filter((author) => Boolean(author.id && author.slug && author.name))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function getAuthorsData() {
  if (!hasSanityEnv()) {
    return mapAuthorsToIndex(fallbackAuthors, fallbackBooks);
  }

  try {
    const [authors, books] = await Promise.all([getAllAuthors(), getAllBooks()]);
    if (authors.length === 0) {
      return mapAuthorsToIndex(fallbackAuthors, fallbackBooks);
    }

    return mapAuthorsToIndex(authors, books.length > 0 ? books : fallbackBooks);
  } catch {
    return mapAuthorsToIndex(fallbackAuthors, fallbackBooks);
  }
}

export default async function AuthorsPage() {
  const authors = await getAuthorsData();
  return <AuthorsIndexClient authors={authors} />;
}

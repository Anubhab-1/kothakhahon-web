import HomePageClient from "@/components/home/HomePageClient";
import {
  getAllAuthors,
  getFeaturedBooks,
  getLatestBlogPosts,
  getSiteSettings,
  hasSanityEnv,
} from "@/lib/sanity";
import type { Author, BlogPost, Book } from "@/lib/types";

export const revalidate = 60;

const fallbackBooks: Book[] = [
  {
    _id: "fallback-book-1",
    title: "Shobder Nodi",
    slug: "shobder-nodi",
    author: { _id: "a-1", name: "Arindam Sen", slug: "arindam-sen" },
    price: 450,
  },
  {
    _id: "fallback-book-2",
    title: "Nirjan Pathshala",
    slug: "nirjan-pathshala",
    author: { _id: "a-2", name: "Moumita Das", slug: "moumita-das" },
    price: 380,
  },
  {
    _id: "fallback-book-3",
    title: "Dhonir Bhasha",
    slug: "dhonir-bhasha",
    author: { _id: "a-3", name: "Sagnik Roy", slug: "sagnik-roy" },
    price: 520,
  },
  {
    _id: "fallback-book-4",
    title: "Onubader Ayna",
    slug: "onubader-ayna",
    author: { _id: "a-4", name: "Lopamudra Bose", slug: "lopamudra-bose" },
    price: 410,
  },
  {
    _id: "fallback-book-5",
    title: "Smritir Map",
    slug: "smritir-map",
    author: { _id: "a-1", name: "Arindam Sen", slug: "arindam-sen" },
    price: 430,
  },
  {
    _id: "fallback-book-6",
    title: "Chhaya Shohor",
    slug: "chhaya-shohor",
    author: { _id: "a-7", name: "Tanmoy Ghosh", slug: "tanmoy-ghosh" },
    price: 495,
  },
  {
    _id: "fallback-book-7",
    title: "Bangla Boi Archive",
    slug: "bangla-boi-archive",
    author: { _id: "a-8", name: "Debolina Dhar", slug: "debolina-dhar" },
    price: 560,
  },
];

const fallbackPosts: BlogPost[] = [
  {
    _id: "fallback-post-1",
    title: "Why Bengali Literary Editing Still Matters",
    slug: "why-bengali-literary-editing-still-matters",
    category: "Editorial",
    excerpt:
      "A short note from our editorial desk about language standards, rhythm, and reader trust.",
  },
  {
    _id: "fallback-post-2",
    title: "Building a Publisher Catalog That Ages Well",
    slug: "building-a-publisher-catalog-that-ages-well",
    category: "Publishing",
    excerpt:
      "How we think about balance between classics, experiments, and contemporary voices.",
  },
  {
    _id: "fallback-post-3",
    title: "Inside the Manuscript Review Process",
    slug: "inside-the-manuscript-review-process",
    category: "For Authors",
    excerpt:
      "A transparent look at what we read for, how long it takes, and what feedback we give.",
  },
];

const fallbackAuthor: Author = {
  _id: "fallback-author",
  name: "Featured Author",
  slug: "featured-author",
  bio: "A major contemporary Bengali voice shaping new literary conversations.",
};

function isFulfilled<T>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T> {
  return result.status === "fulfilled";
}

export default async function HomePage() {
  let featuredBooks = fallbackBooks;
  let latestPosts = fallbackPosts;
  let featuredAuthor: Author | null = fallbackAuthor;
  let heroTagline: string | undefined;
  let heroTaglineEn: string | undefined;
  let missionStatement: string | undefined;

  if (hasSanityEnv()) {
    const [settingsResult, booksResult, postsResult, authorsResult] = await Promise.allSettled([
      getSiteSettings(),
      getFeaturedBooks(),
      getLatestBlogPosts(),
      getAllAuthors(),
    ]);

    const settings = isFulfilled(settingsResult) ? settingsResult.value : null;
    const books = isFulfilled(booksResult) ? booksResult.value : [];
    const posts = isFulfilled(postsResult) ? postsResult.value : [];
    const authors = isFulfilled(authorsResult) ? authorsResult.value : [];

    const settingsFeaturedBooks = settings?.featuredBooks ?? [];
    featuredBooks =
      books.length > 0 ? books : settingsFeaturedBooks.length > 0 ? settingsFeaturedBooks : fallbackBooks;
    latestPosts = posts.length > 0 ? posts : fallbackPosts;
    featuredAuthor = settings?.featuredAuthor ?? authors[0] ?? fallbackAuthor;
    heroTagline = settings?.heroTagline;
    heroTaglineEn = settings?.heroTaglineEn;
    missionStatement = settings?.missionStatement;
  }

  return (
    <HomePageClient
      featuredBooks={featuredBooks}
      latestPosts={latestPosts}
      featuredAuthor={featuredAuthor}
      heroTagline={heroTagline}
      heroTaglineEn={heroTaglineEn}
      missionStatement={missionStatement}
    />
  );
}

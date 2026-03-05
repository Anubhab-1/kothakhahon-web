import type { MetadataRoute } from "next";
import {
  getAllAuthors,
  getAllBlogPosts,
  getAllBooks,
  hasSanityEnv,
} from "@/lib/sanity";

const staticRoutes = [
  "",
  "/books",
  "/authors",
  "/about",
  "/for-authors",
  "/blog",
  "/contact",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
];

function toDateOrNow(value?: string) {
  if (!value) return new Date();
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return new Date();
  return new Date(parsed);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  if (!hasSanityEnv()) {
    return entries;
  }

  try {
    const [books, authors, posts] = await Promise.all([
      getAllBooks(),
      getAllAuthors(),
      getAllBlogPosts(),
    ]);

    books.forEach((book) => {
      if (!book.slug) return;
      entries.push({
        url: `${baseUrl}/books/${book.slug}`,
        lastModified: toDateOrNow(book.publicationDate),
        changeFrequency: "weekly",
        priority: 0.75,
      });
    });

    authors.forEach((author) => {
      if (!author.slug) return;
      entries.push({
        url: `${baseUrl}/authors/${author.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.65,
      });
    });

    posts.forEach((post) => {
      if (!post.slug) return;
      entries.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: toDateOrNow(post.publishedAt),
        changeFrequency: "weekly",
        priority: 0.72,
      });
    });
  } catch {
    // Keep static routes when CMS data is unavailable.
  }

  return entries;
}

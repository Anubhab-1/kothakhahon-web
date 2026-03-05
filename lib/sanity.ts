import { createClient, groq } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { Author, BlogPost, Book, SiteSettings } from "@/lib/types";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = "2025-01-01";

if (!projectId || !dataset) {
  console.warn(
    "Sanity env vars are missing. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET.",
  );
}

export function hasSanityEnv() {
  return Boolean(projectId && dataset);
}

export const sanityClient = createClient({
  projectId: projectId ?? "",
  dataset: dataset ?? "production",
  apiVersion,
  useCdn: true,
});

const builder = createImageUrlBuilder(sanityClient);

async function fetchWithTimeout<T>(
  query: string,
  params?: Record<string, unknown>,
  timeoutMs = 5000,
) {
  async function runAttempt(currentTimeoutMs: number) {
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    try {
      const fetchPromise = sanityClient.fetch<T>(query, (params ?? {}) as never, {
        signal: controller.signal,
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          controller.abort();
          reject(new Error("Sanity fetch timed out"));
        }, currentTimeoutMs);
      });

      return await Promise.race([fetchPromise, timeoutPromise]);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "AbortError" || error.message === "Sanity fetch timed out")
      ) {
        throw new Error("Sanity fetch timed out");
      }
      throw error;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  try {
    return await runAttempt(timeoutMs);
  } catch (error) {
    if (error instanceof Error && error.message === "Sanity fetch timed out") {
      // Retry once with a longer timeout to avoid unnecessary fallback content.
      return runAttempt(Math.min(timeoutMs * 2, 12000));
    }
    throw error;
  }
}

export function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}

export const queries = {
  siteSettings: groq`*[_type == "siteSettings"][0]{
    ...,
    featuredBooks[]->{
      ...,
      "slug": slug.current,
      "coverImageUrl": coverImage.asset->url,
      author->{name, "slug": slug.current}
    },
    featuredAuthor->{
      ...,
      "slug": slug.current,
      "photoUrl": photo.asset->url
    }
  }`,
  featuredBooks: groq`*[_type == "book" && featured == true] | order(publicationDate desc)[0...6]{
    ...,
    "slug": slug.current,
    "coverImageUrl": coverImage.asset->url,
    author->{name, "slug": slug.current},
    genre[]->{name, "slug": slug.current}
  }`,
  allBooks: groq`*[_type == "book"] | order(publicationDate desc){
    ...,
    "slug": slug.current,
    "coverImageUrl": coverImage.asset->url,
    author->{name, "slug": slug.current},
    genre[]->{name, "slug": slug.current}
  }`,
  bookBySlug: groq`*[_type == "book" && slug.current == $slug][0]{
    ...,
    "slug": slug.current,
    "coverImageUrl": coverImage.asset->url,
    author->{
      ...,
      "slug": slug.current,
      "photoUrl": photo.asset->url
    },
    genre[]->{name, "slug": slug.current}
  }`,
  relatedBooks: groq`*[_type == "book" && slug.current != $slug && references($authorId)] | order(publicationDate desc)[0...6]{
    ...,
    "slug": slug.current,
    "coverImageUrl": coverImage.asset->url,
    author->{name, "slug": slug.current}
  }`,
  allAuthors: groq`*[_type == "author"] | order(name asc){
    ...,
    "slug": slug.current,
    "photoUrl": photo.asset->url
  }`,
  authorBySlug: groq`*[_type == "author" && slug.current == $slug][0]{
    ...,
    "slug": slug.current,
    "photoUrl": photo.asset->url
  }`,
  booksByAuthor: groq`*[_type == "book" && author->slug.current == $slug] | order(publicationDate desc){
    ...,
    "slug": slug.current,
    "coverImageUrl": coverImage.asset->url,
    author->{name, "slug": slug.current}
  }`,
  allBlogPosts: groq`*[_type == "blogPost"] | order(publishedAt desc){
    ...,
    "slug": slug.current,
    "coverImageUrl": coverImage.asset->url,
    author->{name, "slug": slug.current, bio}
  }`,
  blogPostBySlug: groq`*[_type == "blogPost" && slug.current == $slug][0]{
    ...,
    "slug": slug.current,
    "coverImageUrl": coverImage.asset->url,
    author->{name, "slug": slug.current, bio}
  }`,
  latestBlogPosts: groq`*[_type == "blogPost"] | order(publishedAt desc)[0...3]{
    ...,
    "slug": slug.current,
    "coverImageUrl": coverImage.asset->url,
    author->{name, "slug": slug.current}
  }`,
};

export async function getSiteSettings() {
  return fetchWithTimeout<SiteSettings | null>(queries.siteSettings);
}

export async function getFeaturedBooks() {
  return fetchWithTimeout<Book[]>(queries.featuredBooks);
}

export async function getAllBooks() {
  return fetchWithTimeout<Book[]>(queries.allBooks);
}

export async function getBookBySlug(slug: string) {
  return fetchWithTimeout<Book | null>(queries.bookBySlug, { slug });
}

export async function getRelatedBooks(slug: string, authorId: string) {
  return fetchWithTimeout<Book[]>(queries.relatedBooks, { slug, authorId });
}

export async function getAllBlogPosts() {
  return fetchWithTimeout<BlogPost[]>(queries.allBlogPosts);
}

export async function getBlogPostBySlug(slug: string) {
  return fetchWithTimeout<BlogPost | null>(queries.blogPostBySlug, { slug });
}

export async function getLatestBlogPosts() {
  return fetchWithTimeout<BlogPost[]>(queries.latestBlogPosts);
}

export async function getAllAuthors() {
  return fetchWithTimeout<Author[]>(queries.allAuthors);
}

export async function getAuthorBySlug(slug: string) {
  return fetchWithTimeout<Author | null>(queries.authorBySlug, { slug });
}

export async function getBooksByAuthor(slug: string) {
  return fetchWithTimeout<Book[]>(queries.booksByAuthor, { slug });
}

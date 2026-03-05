import BlogIndexClient from "@/components/blog/BlogIndexClient";
import { getAllBlogPosts, hasSanityEnv, urlFor } from "@/lib/sanity";
import type { BlogPost, BlogPostCardView } from "@/lib/types";

export const revalidate = 60;

const fallbackPosts: BlogPost[] = [
  {
    _id: "post-1",
    title: "Why Bengali Literary Editing Still Matters",
    slug: "why-bengali-literary-editing-still-matters",
    category: "Editorial",
    excerpt:
      "A note from our desk on rhythm, syntax, and why editorial rigor protects the reader.",
    publishedAt: "2026-01-12",
    featured: true,
    author: {
      _id: "author-1",
      name: "Editorial Desk",
      slug: "editorial-desk",
    },
  },
  {
    _id: "post-2",
    title: "Building A Publisher Catalog That Ages Well",
    slug: "building-a-publisher-catalog-that-ages-well",
    category: "Publishing",
    excerpt:
      "How we balance backlist strategy, debut voices, and long-term discoverability.",
    publishedAt: "2025-12-04",
    author: {
      _id: "author-2",
      name: "Ritobroto Das",
      slug: "ritobroto-das",
    },
  },
  {
    _id: "post-3",
    title: "Inside The Manuscript Review Process",
    slug: "inside-the-manuscript-review-process",
    category: "For Authors",
    excerpt:
      "A transparent walkthrough of our internal editorial review stages and timelines.",
    publishedAt: "2025-11-18",
    author: {
      _id: "author-1",
      name: "Editorial Desk",
      slug: "editorial-desk",
    },
  },
  {
    _id: "post-4",
    title: "Designing Covers For Serious Fiction",
    slug: "designing-covers-for-serious-fiction",
    category: "Design",
    excerpt:
      "Cover systems that support literary identity instead of over-selling a single season.",
    publishedAt: "2025-10-10",
    author: {
      _id: "author-3",
      name: "Anirban Choudhury",
      slug: "anirban-choudhury",
    },
  },
];

function mapPostToCard(post: BlogPost): BlogPostCardView {
  return {
    id: post._id,
    slug: post.slug,
    title: post.title,
    category: post.category ?? "Journal",
    excerpt: post.excerpt ?? "Read the full article in The Kothakhahon Journal.",
    coverImageUrl: post.coverImage
      ? urlFor(post.coverImage).width(1280).height(720).fit("crop").quality(82).url()
      : undefined,
    authorName: post.author?.name ?? "Kothakhahon Team",
    authorSlug: post.author?.slug,
    publishedAt: post.publishedAt,
    featured: Boolean(post.featured),
  };
}

async function getBlogCards() {
  if (!hasSanityEnv()) {
    return fallbackPosts.map(mapPostToCard);
  }

  try {
    const posts = await getAllBlogPosts();
    if (!posts.length) {
      return fallbackPosts.map(mapPostToCard);
    }
    return posts.map(mapPostToCard);
  } catch {
    return fallbackPosts.map(mapPostToCard);
  }
}

export default async function BlogPage() {
  const posts = await getBlogCards();
  return <BlogIndexClient posts={posts} />;
}

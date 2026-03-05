import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPostClient from "@/components/blog/BlogPostClient";
import { getAllBlogPosts, getBlogPostBySlug, hasSanityEnv, urlFor } from "@/lib/sanity";
import type { BlogPost, BlogPostCardView, BlogPostDetailView } from "@/lib/types";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

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
      bio: "The in-house editorial team of Kothakhahon Prokashoni.",
    },
    body: [
      {
        _type: "block",
        style: "normal",
        children: [
          {
            _type: "span",
            text: "Editing is often invisible when done well, but its effect is everywhere: pacing, tone, and trust.",
          },
        ],
      },
      {
        _type: "block",
        style: "normal",
        children: [
          {
            _type: "span",
            text: "At Kothakhahon, editorial rigor is not cosmetic polish. It is structural work that helps a manuscript become readable across generations.",
          },
        ],
      },
      {
        _type: "block",
        style: "blockquote",
        children: [{ _type: "span", text: "Good editing protects both the writer and the reader." }],
      },
    ],
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
      bio: "Publishing lead at Kothakhahon, working across production and catalog planning.",
    },
    body: [
      {
        _type: "block",
        style: "normal",
        children: [
          {
            _type: "span",
            text: "A strong catalog is not a set of isolated hits. It is a coherent conversation over time.",
          },
        ],
      },
    ],
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
      bio: "The in-house editorial team of Kothakhahon Prokashoni.",
    },
    body: [
      {
        _type: "block",
        style: "normal",
        children: [
          {
            _type: "span",
            text: "Our review process prioritizes clarity, voice, and editorial potential, not just immediate market fit.",
          },
        ],
      },
    ],
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
      bio: "Editorial director and visual strategist for Kothakhahon titles.",
    },
    body: [
      {
        _type: "block",
        style: "normal",
        children: [
          {
            _type: "span",
            text: "Typography, contrast, and restraint are often more durable than trend-driven visual gimmicks.",
          },
        ],
      },
    ],
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
      ? urlFor(post.coverImage).width(1200).height(760).fit("crop").quality(82).url()
      : undefined,
    authorName: post.author?.name ?? "Kothakhahon Team",
    authorSlug: post.author?.slug,
    publishedAt: post.publishedAt,
    featured: Boolean(post.featured),
  };
}

function mapPostToDetail(post: BlogPost): BlogPostDetailView {
  return {
    id: post._id,
    slug: post.slug,
    title: post.title,
    category: post.category ?? "Journal",
    excerpt: post.excerpt ?? "Read the full article in The Kothakhahon Journal.",
    coverImageUrl: post.coverImage
      ? urlFor(post.coverImage).width(1600).height(900).fit("crop").quality(84).url()
      : undefined,
    authorName: post.author?.name ?? "Kothakhahon Team",
    authorSlug: post.author?.slug,
    authorBio: post.author?.bio,
    publishedAt: post.publishedAt,
    body: post.body ?? [],
  };
}

function getFallbackPost(slug: string) {
  return fallbackPosts.find((post) => post.slug === slug) ?? null;
}

function getFallbackRelated(slug: string, category: string) {
  const byCategory = fallbackPosts.filter(
    (post) => post.slug !== slug && (post.category ?? "Journal") === category,
  );
  const fallback = byCategory.length > 0 ? byCategory : fallbackPosts.filter((post) => post.slug !== slug);
  return fallback.slice(0, 3).map(mapPostToCard);
}

export async function generateStaticParams() {
  const fallback = fallbackPosts.map((post) => ({ slug: post.slug }));

  if (!hasSanityEnv()) {
    return fallback;
  }

  try {
    const posts = await getAllBlogPosts();
    if (posts.length === 0) {
      return fallback;
    }

    return posts
      .filter((post) => Boolean(post.slug))
      .map((post) => ({ slug: post.slug as string }));
  } catch {
    return fallback;
  }
}

async function getPostData(slug: string) {
  if (!hasSanityEnv()) {
    const post = getFallbackPost(slug);
    if (!post) return null;
    return {
      post: mapPostToDetail(post),
      relatedPosts: getFallbackRelated(slug, post.category ?? "Journal"),
    };
  }

  try {
    const post = await getBlogPostBySlug(slug);
    if (!post) return null;

    const allPosts = await getAllBlogPosts();
    const category = post.category ?? "Journal";

    const related = allPosts
      .filter((candidate) => candidate.slug !== slug)
      .sort((a, b) => {
        const aMatchesCategory = (a.category ?? "Journal") === category ? -1 : 0;
        const bMatchesCategory = (b.category ?? "Journal") === category ? -1 : 0;
        if (aMatchesCategory !== bMatchesCategory) {
          return aMatchesCategory - bMatchesCategory;
        }
        const aDate = Date.parse(a.publishedAt ?? "");
        const bDate = Date.parse(b.publishedAt ?? "");
        return (Number.isNaN(bDate) ? 0 : bDate) - (Number.isNaN(aDate) ? 0 : aDate);
      })
      .slice(0, 3)
      .map(mapPostToCard);

    return {
      post: mapPostToDetail(post),
      relatedPosts: related,
    };
  } catch {
    const post = getFallbackPost(slug);
    if (!post) return null;
    return {
      post: mapPostToDetail(post),
      relatedPosts: getFallbackRelated(slug, post.category ?? "Journal"),
    };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const data = await getPostData(slug);

  if (!data) {
    notFound();
  }

  return <BlogPostClient post={data.post} relatedPosts={data.relatedPosts} />;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPostData(slug);

  if (!data) {
    notFound();
  }

  return {
    title: data.post.title,
    description: data.post.excerpt,
  };
}

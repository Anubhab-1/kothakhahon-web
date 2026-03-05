"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring, Variants } from "framer-motion";
import type { Author, BlogPost, Book } from "@/lib/types";
import { cn } from "@/lib/utils";
import BookCard from "@/components/ui/BookCard";
import SectionHeader from "@/components/ui/SectionHeader";
import NewsletterForm from "@/components/ui/NewsletterForm";

interface HomePageClientProps {
  featuredBooks: Book[];
  latestPosts: BlogPost[];
  featuredAuthor: Author | null;
  heroTagline?: string;
  heroTaglineEn?: string;
  missionStatement?: string;
}

const genreCards = [
  {
    name: "Literary Fiction",
    description: "Narratives shaped by character depth, social texture, and language craft.",
  },
  {
    name: "Essays",
    description: "Long-form arguments and reflective writing from contemporary thinkers.",
  },
  {
    name: "Poetry",
    description: "Curated voices from modern and classical traditions in elegant editions.",
  },
  {
    name: "Narrative Non-Fiction",
    description: "Biography, criticism, and cultural writing for serious readers.",
  },
];

const sectionTransition = { duration: 0.56, ease: "easeOut" as const };

const heroStackClasses = [
  "left-4 md:left-8 top-0 rotate-[-6deg] z-10",
  "right-4 md:right-6 top-8 md:top-12 rotate-[4deg] z-20",
  "left-8 md:left-14 top-16 md:top-24 rotate-[-2deg] z-30",
];

function containsBengali(text?: string) {
  if (!text) return false;
  return /[\u0980-\u09FF]/.test(text);
}

function withFallbackText(value: string | undefined, fallback: string) {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : fallback;
}

const splitTextToChars = (text: string) => text.trim().split(/\s+/);
const charVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  reveal: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: "easeOut" } }
};

export default function HomePageClient({
  featuredBooks,
  latestPosts,
  featuredAuthor,
  heroTagline,
  heroTaglineEn,
  missionStatement,
}: HomePageClientProps) {
  const heroBooks = featuredBooks.slice(0, 3);
  const heroHeading = withFallbackText(heroTagline, "Books With Editorial Soul");
  const heroSubheading = withFallbackText(
    heroTaglineEn,
    "A publishing house and storefront for stories that matter, beautifully produced and built to endure.",
  );
  const missionCopy = withFallbackText(
    missionStatement,
    "We publish not only for immediate reading, but for conversations that continue for years.",
  );
  const heroIsBengali = containsBengali(heroHeading);
  const missionIsBengali = containsBengali(missionCopy);
  const words = splitTextToChars(heroHeading);

  // 3D Tilt Setup
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 25, stiffness: 120 };
  const smoothX = useSpring(useTransform(mouseX, [0, 1], [-7, 7]), springConfig);
  const smoothY = useSpring(useTransform(mouseY, [0, 1], [7, -7]), springConfig);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handlePointerLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <div className="grain-overlay">
      <section className="relative overflow-hidden border-b border-gold/20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_14%,rgba(201,151,58,0.18),transparent_34%),radial-gradient(circle_at_86%_4%,rgba(143,161,143,0.16),transparent_30%)]" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={sectionTransition}
          className="relative mx-auto grid min-h-[86vh] w-full max-w-7xl gap-14 px-4 py-16 md:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-center"
        >
          <div className="space-y-8">
            <span className="editorial-badge inline-flex rounded-full px-4 py-1.5 font-ui text-[10px] tracking-[0.2em]">
              INDEPENDENT BENGALI PUBLISHER
            </span>

            <div className="space-y-5">
              <motion.h1
                initial="hidden"
                animate="reveal"
                transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
                className={cn(
                  "gold-shimmer inline-flex flex-wrap gap-x-3 pt-[0.16em] pb-[0.1em] text-5xl text-ivory md:text-7xl",
                  heroIsBengali ? "bn-safe font-bn" : "text-safe font-title",
                )}
              >
                {words.map((word, i) => (
                  <motion.span key={i} variants={charVariants}>
                    {word}
                  </motion.span>
                ))}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="max-w-2xl font-body text-xl text-parchment/95 md:text-2xl"
              >
                {heroSubheading}
              </motion.p>
            </div>

            <div className="flex flex-col items-start gap-3 sm:flex-row">
              <Link
                href="/books"
                className="fx-button rounded-full border border-gold bg-gold px-7 py-3 font-ui text-xs tracking-[0.16em] text-void transition hover:bg-gold-dim"
              >
                SHOP BOOKS
              </Link>
              <Link
                href="/for-authors"
                className="fx-button rounded-full border border-smoke bg-obsidian px-7 py-3 font-ui text-xs tracking-[0.16em] text-parchment transition hover:border-gold hover:text-gold"
              >
                SUBMIT MANUSCRIPT
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="fx-pulse-border rounded-xl border border-gold/20 bg-obsidian/75 p-4">
                <p className="font-ui text-[10px] tracking-[0.12em] text-stone">FEATURED TITLES</p>
                <p className="mt-2 font-mono text-3xl text-ivory">{featuredBooks.length}</p>
              </div>
              <div className="fx-pulse-border rounded-xl border border-gold/20 bg-obsidian/75 p-4">
                <p className="font-ui text-[10px] tracking-[0.12em] text-stone">LATEST ESSAYS</p>
                <p className="mt-2 font-mono text-3xl text-ivory">{latestPosts.length}</p>
              </div>
              <div className="fx-pulse-border rounded-xl border border-gold/20 bg-obsidian/75 p-4">
                <p className="font-ui text-[10px] tracking-[0.12em] text-stone">OPEN SUBMISSIONS</p>
                <p className="mt-2 font-ui text-3xl text-ivory">YES</p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[500px]" style={{ perspective: 1200 }}>
            <motion.div
              className="relative h-[460px] w-full"
              style={{ rotateX: smoothY, rotateY: smoothX, transformStyle: "preserve-3d" }}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
            >
              <div className="absolute inset-0 z-[-1] animate-pulse bg-gold/10 blur-3xl rounded-full" />
              {heroBooks.length > 0 ? (
                heroBooks.map((book, index) => {
                  const firstChar = book.title.trim().charAt(0).toUpperCase();
                  const stackClass = heroStackClasses[index] ?? heroStackClasses[heroStackClasses.length - 1];

                  return (
                    <motion.div
                      key={book._id}
                      initial={{ opacity: 0, y: 20, rotate: -3 }}
                      animate={{ opacity: 1, y: 0, rotate: 0 }}
                      transition={{ duration: 0.45, delay: 0.12 + index * 0.08 }}
                      className={`absolute w-[74%] ${stackClass} shadow-2xl will-change-transform`}
                    >
                      <Link
                        href={`/books/${book.slug}`}
                        className="fx-card fx-float-book book-edge group block overflow-hidden rounded-2xl bg-obsidian border-white/10"
                        style={{ animationDelay: `${index * 0.45}s` }}
                      >
                        <div className="relative aspect-[3/4]">
                          {book.coverImageUrl ? (
                            <Image
                              src={book.coverImageUrl}
                              alt={book.title}
                              fill
                              sizes="(max-width: 1024px) 60vw, 320px"
                              className="object-cover transition duration-500 group-hover:scale-[1.05]"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-b from-[#2f2a1f] via-[#1f1b15] to-[#12110f]">
                              <span className="font-title text-8xl text-gold/35">{firstChar}</span>
                            </div>
                          )}
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/95 via-void/25 to-transparent" />
                        </div>
                        <div className="space-y-1 p-4">
                          <p className="line-clamp-2 text-safe font-title text-2xl text-ivory">
                            {book.title}
                          </p>
                          <p className="font-body text-sm text-stone">{book.author?.name ?? "Author"}</p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })
              ) : (
                <div className="editorial-panel flex h-full items-center justify-center rounded-2xl p-8 text-center">
                  <p className="font-body text-lg text-stone">Featured books appear here after publishing.</p>
                </div>
              )}

            </motion.div>
          </div>
        </motion.div>
      </section>

      <div className="border-y border-smoke bg-obsidian/70 py-3">
        <div className="animate-[ticker_20s_linear_infinite] whitespace-nowrap font-ui text-[11px] tracking-[0.2em] text-parchment">
          NEW RELEASES · PRE-ORDER WINDOWS · EDITORIAL NOTES · BOOK CLUB PICKS · NEW RELEASES · PRE-ORDER WINDOWS · EDITORIAL NOTES · BOOK CLUB PICKS ·
        </div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={sectionTransition}
        className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8"
      >
        <SectionHeader
          eyebrow="FEATURED STORE"
          title="Books Ready To Read, Gift, and Collect"
          description="A rotating storefront from our strongest titles."
        />
        <div className="mt-4 ink-divider" />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {featuredBooks.length > 0 ? (
            featuredBooks.slice(0, 8).map((book) => <BookCard key={book._id} book={book} />)
          ) : (
            <div className="col-span-full rounded-xl border border-smoke bg-obsidian p-6">
              <p className="font-body text-base text-stone">
                No featured books found yet. Publish books in Sanity and mark them as featured.
              </p>
            </div>
          )}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={sectionTransition}
        className="mx-auto w-full max-w-6xl px-4 pb-20 md:px-8"
      >
        <div className="editorial-panel rounded-2xl p-8 md:p-12">
          <p className="font-ui text-xs tracking-[0.16em] text-gold">OUR EDITORIAL PROMISE</p>
          <blockquote
            className={cn(
              "mt-4 text-4xl text-ivory md:text-5xl",
              missionIsBengali ? "bn-safe font-bn" : "text-safe font-title",
            )}
          >
            {missionCopy}
          </blockquote>
          <p className="mt-5 max-w-3xl font-body text-lg text-stone">
            We back every title with deliberate editing, design discipline, and thoughtful distribution.
          </p>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={sectionTransition}
        className="mx-auto w-full max-w-7xl px-4 pb-20 md:px-8"
      >
        <SectionHeader eyebrow="PUBLISHING PROGRAMS" title="Explore What We Print" />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {genreCards.map((genre) => (
            <article
              key={genre.name}
              className="fx-card group rounded-xl border border-smoke bg-obsidian p-6 transition hover:border-gold/60"
            >
              <p className="font-ui text-[10px] tracking-[0.16em] text-gold">CATEGORY</p>
              <h3 className="mt-2 text-safe font-title text-3xl text-ivory">{genre.name}</h3>
              <p className="mt-3 font-body text-base text-stone transition group-hover:text-parchment">
                {genre.description}
              </p>
            </article>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={sectionTransition}
        className="mx-auto w-full max-w-7xl px-4 pb-20 md:px-8"
      >
        <SectionHeader eyebrow="AUTHOR SPOTLIGHT" title="Voices We Champion" />
        <Link
          href={featuredAuthor ? `/authors/${featuredAuthor.slug}` : "/authors"}
          className="fx-card group mt-8 grid gap-6 rounded-2xl border border-smoke bg-obsidian p-6 transition hover:border-gold/60 md:grid-cols-[240px_1fr] md:p-8"
          aria-label={`Open author ${featuredAuthor?.name ?? "profile"}`}
        >
          <div className="book-edge relative aspect-square overflow-hidden rounded-xl border border-smoke bg-gradient-to-br from-ash to-void">
            {featuredAuthor?.photoUrl ? (
              <Image
                src={featuredAuthor.photoUrl}
                alt={featuredAuthor.name}
                fill
                sizes="240px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="font-title text-6xl text-gold/30">
                  {(featuredAuthor?.name?.trim().charAt(0) ?? "A").toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-safe font-title text-4xl text-ivory">
              {featuredAuthor?.name ?? "Featured Author"}
            </h3>
            <p className="mt-4 font-body text-lg text-parchment/90">
              {featuredAuthor?.bio ??
                "A contemporary literary voice bridging memory, politics, and emotional depth."}
            </p>
            <span className="fx-link mt-6 inline-block font-ui text-xs tracking-[0.14em] text-gold transition group-hover:text-gold-dim">
              READ PROFILE
            </span>
          </div>
        </Link>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={sectionTransition}
        className="mx-auto w-full max-w-7xl px-4 pb-20 md:px-8"
      >
        <div className="fx-card rounded-2xl border border-gold/45 bg-gradient-to-r from-obsidian via-ash to-obsidian p-8 text-center md:p-12">
          <p className="font-ui text-xs tracking-[0.18em] text-gold">FOR WRITERS</p>
          <h3 className="mt-3 text-safe font-title text-4xl text-ivory md:text-5xl">
            Have a manuscript worth publishing?
          </h3>
          <p className="mx-auto mt-3 max-w-2xl font-body text-lg text-stone">
            We are currently open to Bengali fiction, essays, and narrative non-fiction with strong editorial potential.
          </p>
          <Link
            href="/for-authors"
            className="fx-button mt-6 inline-flex rounded-full border border-gold bg-gold px-6 py-3 font-ui text-xs tracking-[0.16em] text-void transition hover:bg-gold-dim"
          >
            SUBMIT NOW
          </Link>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={sectionTransition}
        className="mx-auto w-full max-w-7xl px-4 pb-20 md:px-8"
      >
        <SectionHeader
          eyebrow="LATEST WRITING"
          title="From The Kothakhahon Journal"
          description="Editorial notes, author conversations, and long-form reflections."
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {latestPosts.length > 0 ? (
            latestPosts.map((post) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                className="fx-card group block rounded-xl border border-smoke bg-obsidian p-5 transition hover:border-gold/60"
                aria-label={`Open blog post ${post.title}`}
              >
                <p className="font-ui text-[10px] tracking-[0.14em] text-gold">
                  {(post.category ?? "Journal").toUpperCase()}
                </p>
                <h3 className="mt-3 text-safe font-title text-3xl text-ivory">{post.title}</h3>
                <p className="mt-3 font-body text-base text-parchment/90">
                  {post.excerpt ?? "Read the full article in our journal."}
                </p>
                <span className="fx-link mt-4 inline-block font-ui text-[11px] tracking-[0.14em] text-gold transition group-hover:text-gold-dim">
                  READ ARTICLE
                </span>
              </Link>
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-smoke bg-obsidian p-6">
              <p className="font-body text-base text-stone">
                No blog posts found yet. Add your first blog post in Sanity.
              </p>
            </div>
          )}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={sectionTransition}
        className="mx-auto w-full max-w-7xl px-4 pb-24 md:px-8"
      >
        <div className="editorial-panel rounded-2xl p-8 md:p-12">
          <SectionHeader
            align="center"
            eyebrow="READER CLUB"
            title="Get New Releases Before Everyone Else"
            description="Receive launch updates, essay drops, and early chapter previews."
            className="mx-auto max-w-3xl"
          />
          <div className="mt-8 flex justify-center">
            <NewsletterForm />
          </div>
        </div>
      </motion.section>
    </div>
  );
}

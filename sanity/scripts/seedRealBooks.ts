import { getCliClient } from "sanity/cli";

type SeedGenre = {
  slug: string;
  name: string;
  description: string;
};

type SeedAuthor = {
  slug: string;
  name: string;
  bio: string;
  featured?: boolean;
  awards?: string[];
};

type SeedBook = {
  slug: string;
  title: string;
  titleEn?: string;
  authorSlug: string;
  genreSlugs: string[];
  synopsis: string;
  pullQuote: string;
  price: number;
  publicationDate: string;
  pageCount: number;
  featured?: boolean;
  chapterPreview?: string;
  coverId: number;
};

const apiVersion = "2025-01-01";

const genres: SeedGenre[] = [
  {
    slug: "literary-fiction",
    name: "Literary Fiction",
    description: "Character-driven fiction with strong stylistic and social depth.",
  },
  {
    slug: "classics",
    name: "Classics",
    description: "Canonical works that continue to shape Bengali literary conversations.",
  },
  {
    slug: "poetry",
    name: "Poetry",
    description: "Verse collections and lyrical works across periods and movements.",
  },
  {
    slug: "historical-fiction",
    name: "Historical Fiction",
    description: "Narratives set in specific political and historical contexts.",
  },
  {
    slug: "social-fiction",
    name: "Social Fiction",
    description: "Works focused on class, labor, communities, and social change.",
  },
];

const authors: SeedAuthor[] = [
  {
    slug: "bibhutibhushan-bandyopadhyay",
    name: "Bibhutibhushan Bandyopadhyay",
    bio: "One of Bengal's major novelists, known for rural realism and reflective prose.",
    featured: true,
    awards: ["Posthumous Classic Recognition"],
  },
  {
    slug: "rabindranath-tagore",
    name: "Rabindranath Tagore",
    bio: "Poet, novelist, and polymath whose writing transformed modern Bengali literature.",
    featured: true,
    awards: ["Nobel Prize in Literature (1913)"],
  },
  {
    slug: "sarat-chandra-chattopadhyay",
    name: "Sarat Chandra Chattopadhyay",
    bio: "Widely read Bengali novelist known for social critique and emotionally direct narratives.",
    awards: ["Long-standing Popular and Critical Legacy"],
  },
  {
    slug: "manik-bandopadhyay",
    name: "Manik Bandopadhyay",
    bio: "Modernist Bengali novelist recognized for psychological and social realism.",
    awards: ["Major Figure in 20th-Century Bengali Fiction"],
  },
  {
    slug: "sunil-gangopadhyay",
    name: "Sunil Gangopadhyay",
    bio: "Poet and novelist whose historical and contemporary fiction remains widely influential.",
    awards: ["Sahitya Akademi Award"],
  },
];

const books: SeedBook[] = [
  {
    slug: "pather-panchali",
    title: "Pather Panchali",
    titleEn: "Song of the Little Road",
    authorSlug: "bibhutibhushan-bandyopadhyay",
    genreSlugs: ["literary-fiction", "classics"],
    synopsis:
      "A landmark coming-of-age novel centered on Apu's childhood, family hardship, and the changing rhythms of village life.",
    pullQuote: "In poverty and wonder, childhood keeps inventing its own horizon.",
    price: 399,
    publicationDate: "1929-01-01",
    pageCount: 320,
    featured: true,
    chapterPreview:
      "The lane to Nischindipur was narrow, dusty, and full of rumors of distant places.\n\nApu ran through it as if every bend held a new country.",
    coverId: 6975329,
  },
  {
    slug: "aranyak",
    title: "Aranyak",
    titleEn: "Of the Forest",
    authorSlug: "bibhutibhushan-bandyopadhyay",
    genreSlugs: ["literary-fiction", "classics"],
    synopsis:
      "A reflective novel on ecology, memory, and guilt, told by an urban man transformed by years in the forests of Bihar.",
    pullQuote: "The forest records what the city forgets.",
    price: 349,
    publicationDate: "1939-01-01",
    pageCount: 232,
    featured: true,
    chapterPreview:
      "When I first arrived, I thought the trees were only timber and survey lines.\n\nBy the end, each clearing had become a page of my own conscience.",
    coverId: 6949053,
  },
  {
    slug: "chokher-bali",
    title: "Chokher Bali",
    titleEn: "A Grain of Sand",
    authorSlug: "rabindranath-tagore",
    genreSlugs: ["literary-fiction", "classics"],
    synopsis:
      "A sharply observed novel of desire, friendship, jealousy, and social convention in colonial Bengal.",
    pullQuote: "A single unresolved desire can reorder an entire household.",
    price: 379,
    publicationDate: "1903-01-01",
    pageCount: 304,
    featured: true,
    chapterPreview:
      "The house appeared calm from outside.\n\nInside, each glance had already become a sentence no one dared to speak aloud.",
    coverId: 13599517,
  },
  {
    slug: "gora",
    title: "Gora",
    authorSlug: "rabindranath-tagore",
    genreSlugs: ["literary-fiction", "classics"],
    synopsis:
      "A major political and philosophical novel examining nationalism, identity, caste, and faith in nineteenth-century Bengal.",
    pullQuote: "Identity breaks open exactly where certainty feels strongest.",
    price: 599,
    publicationDate: "1910-01-01",
    pageCount: 736,
    featured: true,
    chapterPreview:
      "His convictions were precise, inherited, and loud.\n\nHistory, however, had already prepared a quieter and more difficult answer.",
    coverId: 10954609,
  },
  {
    slug: "gitanjali",
    title: "Gitanjali",
    titleEn: "Song Offerings",
    authorSlug: "rabindranath-tagore",
    genreSlugs: ["poetry", "classics"],
    synopsis:
      "A foundational poetry collection of devotion, inwardness, and the search for spiritual freedom.",
    pullQuote: "Where language bows, song begins.",
    price: 299,
    publicationDate: "1910-01-01",
    pageCount: 240,
    featured: true,
    chapterPreview:
      "I came with a crowded voice and left with a single note.\n\nThe poem kept only what could be offered.",
    coverId: 8246100,
  },
  {
    slug: "devdas",
    title: "Devdas",
    authorSlug: "sarat-chandra-chattopadhyay",
    genreSlugs: ["literary-fiction", "classics"],
    synopsis:
      "A tragic novel of unfulfilled love, social pressure, and self-destruction that remains central to South Asian literary memory.",
    pullQuote: "Sometimes hesitation writes the ending before life can begin.",
    price: 329,
    publicationDate: "1917-01-01",
    pageCount: 208,
    chapterPreview:
      "By the time he chose a direction, every road had already chosen for him.\n\nIn the silence, Paro's name returned like an old accusation.",
    coverId: 111014,
  },
  {
    slug: "padma-nadir-majhi",
    title: "Padma Nadir Majhi",
    titleEn: "Boatman of the River Padma",
    authorSlug: "manik-bandopadhyay",
    genreSlugs: ["social-fiction", "classics"],
    synopsis:
      "A riverine novel of labor, hunger, community, and the lure of utopian promises on the margins of survival.",
    pullQuote: "The river feeds, destroys, and remembers without explanation.",
    price: 429,
    publicationDate: "1936-01-01",
    pageCount: 320,
    chapterPreview:
      "The net came up nearly empty, and the evening market had already decided the price of tomorrow's hunger.\n\nStill, they pushed the boat back into the current.",
    coverId: 9183016,
  },
  {
    slug: "pather-dabi",
    title: "Pather Dabi",
    titleEn: "Demand for a Path",
    authorSlug: "sarat-chandra-chattopadhyay",
    genreSlugs: ["historical-fiction", "classics"],
    synopsis:
      "A controversial political novel on anti-colonial underground networks, revolutionary thought, and moral ambiguity.",
    pullQuote: "Revolution begins as a whisper before it becomes a charge sheet.",
    price: 549,
    publicationDate: "1926-01-01",
    pageCount: 560,
    chapterPreview:
      "The message arrived folded into an ordinary receipt.\n\nBy midnight, everyone in the room understood that ordinary life had ended.",
    coverId: 14412535,
  },
  {
    slug: "sei-somoy",
    title: "Sei Somoy",
    titleEn: "Those Days",
    authorSlug: "sunil-gangopadhyay",
    genreSlugs: ["historical-fiction", "literary-fiction"],
    synopsis:
      "An expansive historical novel mapping the Bengal Renaissance through reform, print culture, and competing modernities.",
    pullQuote: "Every age calls itself modern, then becomes someone else's archive.",
    price: 699,
    publicationDate: "1981-01-01",
    pageCount: 704,
    featured: true,
    chapterPreview:
      "Calcutta was learning to argue in new vocabularies.\n\nIn classrooms, clubs, and pressrooms, history had started speaking in plural.",
    coverId: 10847045,
  },
];

const client = getCliClient({ apiVersion });

async function upsertGenre(genre: SeedGenre) {
  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type == "genre" && slug.current == $slug][0]{_id}`,
    { slug: genre.slug },
  );

  const _id = existing?._id ?? `genre-${genre.slug}`;
  await client.createOrReplace({
    _id,
    _type: "genre",
    name: genre.name,
    slug: { _type: "slug", current: genre.slug },
    description: genre.description,
  });

  return { slug: genre.slug, id: _id };
}

async function upsertAuthor(author: SeedAuthor) {
  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type == "author" && slug.current == $slug][0]{_id}`,
    { slug: author.slug },
  );

  const _id = existing?._id ?? `author-${author.slug}`;
  await client.createOrReplace({
    _id,
    _type: "author",
    name: author.name,
    slug: { _type: "slug", current: author.slug },
    bio: author.bio,
    featured: author.featured ?? false,
    awards: author.awards ?? [],
  });

  return { slug: author.slug, id: _id };
}

async function uploadCoverImage(coverId: number, slug: string) {
  const coverUrl = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg?default=false`;
  const response = await fetch(coverUrl, { redirect: "follow" });

  if (!response.ok) {
    throw new Error(`Cover fetch failed for ${slug} (${coverUrl}) - ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") ?? "image/jpeg";

  return client.assets.upload("image", Buffer.from(arrayBuffer), {
    filename: `${slug}.jpg`,
    contentType,
  });
}

async function upsertBook(
  book: SeedBook,
  authorIdBySlug: Record<string, string>,
  genreIdBySlug: Record<string, string>,
) {
  const existing = await client.fetch<{ _id: string; coverImage?: { asset?: { _ref?: string } } } | null>(
    `*[_type == "book" && slug.current == $slug][0]{_id, coverImage{asset->{_id}}}`,
    { slug: book.slug },
  );

  const _id = existing?._id ?? `book-${book.slug}`;
  const existingCoverRef = existing?.coverImage?.asset?._ref;
  const uploadedAsset = existingCoverRef ? null : await uploadCoverImage(book.coverId, book.slug);
  const coverRef = existingCoverRef ?? uploadedAsset?._id;

  if (!coverRef) {
    throw new Error(`No cover asset available for ${book.slug}`);
  }

  const authorRef = authorIdBySlug[book.authorSlug];
  if (!authorRef) {
    throw new Error(`Missing author reference for ${book.slug}`);
  }

  const genreRefs = book.genreSlugs.map((genreSlug) => {
    const ref = genreIdBySlug[genreSlug];
    if (!ref) {
      throw new Error(`Missing genre reference (${genreSlug}) for ${book.slug}`);
    }
    return {
      _type: "reference",
      _ref: ref,
      _key: `${book.slug}-${genreSlug}`,
    };
  });

  await client.createOrReplace({
    _id,
    _type: "book",
    title: book.title,
    titleEn: book.titleEn,
    slug: { _type: "slug", current: book.slug },
    author: { _type: "reference", _ref: authorRef },
    coverImage: {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: coverRef,
      },
      alt: `Cover of ${book.title}`,
    },
    genre: genreRefs,
    synopsis: book.synopsis,
    pullQuote: book.pullQuote,
    price: book.price,
    publicationDate: book.publicationDate,
    pageCount: book.pageCount,
    language: "Bengali",
    featured: book.featured ?? false,
    chapterPreview: book.chapterPreview,
  });

  return { slug: book.slug, id: _id };
}

async function run() {
  console.log("Seeding genres...");
  const seededGenres = await Promise.all(genres.map((genre) => upsertGenre(genre)));
  const genreIdBySlug = Object.fromEntries(seededGenres.map((genre) => [genre.slug, genre.id]));

  console.log("Seeding authors...");
  const seededAuthors = await Promise.all(authors.map((author) => upsertAuthor(author)));
  const authorIdBySlug = Object.fromEntries(seededAuthors.map((author) => [author.slug, author.id]));

  console.log("Seeding books with cover images...");
  for (const book of books) {
    const result = await upsertBook(book, authorIdBySlug, genreIdBySlug);
    console.log(`- upserted ${result.slug} (${result.id})`);
  }

  console.log(`Done. Seeded ${books.length} books, ${authors.length} authors, ${genres.length} genres.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

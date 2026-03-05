"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, PenSquare, Newspaper, Copyright } from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";
import SectionHeader from "@/components/ui/SectionHeader";

const heroVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.52,
      ease: "easeOut" as const,
      staggerChildren: 0.08,
    },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const contacts = [
  {
    title: "Editorial",
    email: "editor@kothakhahon.com",
    description: "General editorial communication and publishing inquiries.",
    icon: PenSquare,
  },
  {
    title: "Submissions",
    email: "submissions@kothakhahon.com",
    description: "Manuscript submissions and author-related process questions.",
    icon: Newspaper,
  },
  {
    title: "Rights & Licensing",
    email: "rights@kothakhahon.com",
    description: "Translation rights, adaptations, and licensing discussions.",
    icon: Copyright,
  },
];

export default function ContactPageClient() {
  return (
    <div className="grain-overlay">
      <motion.section
        variants={heroVariants}
        initial="hidden"
        animate="show"
        className="mx-auto flex min-h-[52vh] w-full max-w-7xl items-center px-4 py-16 md:px-8"
      >
        <div className="space-y-6">
          <motion.p variants={heroItem} className="font-ui text-xs tracking-[0.2em] text-gold">
            CONTACT
          </motion.p>
          <motion.h1
            variants={heroItem}
            className="text-safe font-title text-5xl text-ivory md:text-7xl"
          >
            Let&apos;s Talk About Books.
          </motion.h1>
          <motion.p
            variants={heroItem}
            className="max-w-3xl font-body text-xl text-parchment/90"
          >
            Reach the right team directly, or send us a message through the form below.
          </motion.p>
        </div>
      </motion.section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 md:px-8">
        <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            {contacts.map((contact) => {
              const Icon = contact.icon;
              return (
                <article
                  key={contact.title}
                  className="fx-card rounded-xl border border-smoke bg-obsidian p-5 transition hover:border-gold/55"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="mt-1 h-5 w-5 text-gold" />
                    <div>
                      <p className="text-safe font-title text-3xl text-ivory">{contact.title}</p>
                      <a
                        href={`mailto:${contact.email}`}
                        className="fx-link mt-1 inline-flex items-center gap-2 font-body text-base text-parchment transition hover:text-gold"
                      >
                        <Mail className="h-4 w-4" />
                        {contact.email}
                      </a>
                      <p className="mt-2 font-body text-base text-stone">{contact.description}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div>
            <ContactForm />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-24 md:px-8">
        <div className="fx-card rounded-2xl border border-gold/45 bg-gradient-to-r from-obsidian to-ash p-8 text-center md:p-11">
          <SectionHeader
            align="center"
            eyebrow="NEXT READ"
            title="Explore Our Latest Titles"
            description="If you came for books, we have a catalog waiting for you."
            className="mx-auto max-w-3xl"
          />
          <Link
            href="/books"
            className="fx-button mt-6 inline-flex rounded-full border border-gold bg-gold px-7 py-3 font-ui text-xs tracking-[0.16em] text-void transition hover:bg-gold-dim"
          >
            BROWSE BOOKS
          </Link>
        </div>
      </section>
    </div>
  );
}

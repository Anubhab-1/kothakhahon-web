import Link from "next/link";
import { Clock3, Mail, MapPin } from "lucide-react";
import BrandLogo from "@/components/layout/BrandLogo";
import NewsletterForm from "@/components/ui/NewsletterForm";
import { getSiteSettings, hasSanityEnv } from "@/lib/sanity";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/books", label: "Books" },
  { href: "/authors", label: "Authors" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const publisherLinks = [
  { href: "/for-authors", label: "Submit Manuscript" },
  { href: "/account", label: "Reader Account" },
  { href: "/checkout", label: "Checkout" },
];

const socialConfig = [
  { key: "facebook", label: "FACEBOOK" },
  { key: "instagram", label: "INSTAGRAM" },
  { key: "youtube", label: "YOUTUBE" },
] as const;

export default async function Footer() {
  let socialLinks: Partial<Record<(typeof socialConfig)[number]["key"], string>> = {};

  if (hasSanityEnv()) {
    try {
      const settings = await getSiteSettings();
      socialLinks = {
        facebook: settings?.social?.facebook ?? "",
        instagram: settings?.social?.instagram ?? "",
        youtube: settings?.social?.youtube ?? "",
      };
    } catch {
      socialLinks = {};
    }
  }

  return (
    <footer className="border-t border-smoke bg-obsidian/95">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 md:grid-cols-2 md:px-8 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-2">
          <BrandLogo imageSize={56} />
          <p className="max-w-xl font-body text-sm text-stone">
            Kothakhahon is a book publishing and selling platform for contemporary Bengali writing.
            We combine editorial rigor with a modern reader experience, from manuscript review to
            final purchase.
          </p>
          <div className="flex flex-wrap gap-3 font-ui text-[10px] tracking-[0.16em] text-parchment">
            {socialConfig.map((social) => {
              const href = socialLinks[social.key];
              if (!href) {
                return (
                  <span key={social.key} className="rounded-full border border-smoke px-3 py-1 text-stone">
                    {social.label}
                  </span>
                );
              }

              return (
                <a
                  key={social.key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fx-link rounded-full border border-smoke px-3 py-1 transition hover:border-gold hover:text-gold"
                >
                  {social.label}
                </a>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <p className="font-ui text-xs tracking-[0.16em] text-gold">EXPLORE</p>
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="fx-link font-body text-sm text-parchment transition hover:text-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="pt-3 font-ui text-xs tracking-[0.16em] text-gold">PUBLISHING</p>
          <ul className="space-y-2">
            {publisherLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="fx-link font-body text-sm text-parchment transition hover:text-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <p className="font-ui text-xs tracking-[0.16em] text-gold">CONTACT</p>
          <a
            href="mailto:editor@kothakhahon.com"
            className="fx-link flex items-center gap-2 font-body text-sm text-parchment transition hover:text-gold"
          >
            <Mail className="h-4 w-4" />
            editor@kothakhahon.com
          </a>
          <p className="flex items-start gap-2 font-body text-sm text-stone">
            <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            Editorial desk replies within 2-3 business days.
          </p>
          <p className="flex items-start gap-2 font-body text-sm text-stone">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            Kolkata, India
          </p>

          <div className="space-y-3 pt-2">
            <p className="block font-ui text-xs tracking-[0.14em] text-stone">NEWSLETTER</p>
            <NewsletterForm className="max-w-none" />
          </div>
        </div>
      </div>

      <div className="border-t border-smoke px-4 py-4 md:px-8">
        <p className="text-center font-mono text-xs text-stone">
          {"(c)"} {new Date().getFullYear()} Kothakhahon Prokashoni. Crafted for readers and writers.
        </p>
      </div>
    </footer>
  );
}


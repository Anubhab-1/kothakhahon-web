"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavUser } from "@/components/layout/NavBar";
import BrandLogo from "@/components/layout/BrandLogo";
import CartIcon from "@/components/ui/CartIcon";
import Magnetic from "@/components/ui/Magnetic";

interface NavBarClientProps {
  user: NavUser | null;
}

const links = [
  { href: "/", label: "HOME" },
  { href: "/books", label: "BOOKS" },
  { href: "/authors", label: "AUTHORS" },
  { href: "/blog", label: "BLOG" },
  { href: "/about", label: "ABOUT" },
  { href: "/contact", label: "CONTACT" },
];

export default function NavBarClient({ user }: NavBarClientProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrolled = false;

  const userInitial = (user?.fullName?.[0] ?? user?.email?.[0] ?? "U").toUpperCase();

  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-smoke/70 bg-obsidian/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 md:px-8">
          <p className="font-ui text-[10px] tracking-[0.16em] text-stone">
            CURATED BENGALI BOOKSTORE AND PUBLISHING HOUSE
          </p>
          <Link
            href="/for-authors"
            className="fx-link font-ui text-[10px] tracking-[0.14em] text-gold transition hover:text-gold-dim"
          >
            OPEN SUBMISSIONS
          </Link>
        </div>
      </div>

      <div
        className={cn(
          "border-b bg-void/90 backdrop-blur transition-colors",
          scrolled ? "border-gold/45" : "border-smoke",
        )}
      >
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-8">
          <div
            className={cn(
              "flex items-center justify-between rounded-2xl border px-3 py-3 transition md:px-4",
              scrolled
                ? "border-gold/30 bg-obsidian/90 shadow-[0_10px_30px_rgba(0,0,0,0.34)]"
                : "border-smoke bg-obsidian/70",
            )}
          >
            <Link href="/" className="fx-link transition hover:text-gold" aria-label="Kothakhahon home">
              <BrandLogo />
            </Link>

            <nav className="hidden items-center gap-2 lg:flex">
              {links.map((link) => {
                const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Magnetic key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "rounded-full px-3 py-1.5 font-ui text-[10px] tracking-[0.16em] transition",
                        active
                          ? "border border-gold/40 bg-gold/15 text-gold"
                          : "text-parchment hover:bg-gold/10 hover:text-gold",
                      )}
                    >
                      {link.label}
                    </Link>
                  </Magnetic>
                );
              })}
            </nav>

            <div className="hidden items-center gap-2 md:flex">
              <CartIcon />

              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/account"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/55 bg-ash text-xs font-semibold text-gold"
                    title={user.email ?? "Account"}
                  >
                    {userInitial}
                  </Link>
                  <form action="/auth/logout" method="post">
                    <button
                      type="submit"
                      className="fx-button rounded-full border border-smoke px-3 py-1.5 font-ui text-[10px] tracking-[0.12em] text-parchment transition hover:border-gold hover:text-gold"
                    >
                      LOGOUT
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="fx-button rounded-full border border-smoke px-3 py-1.5 font-ui text-[10px] tracking-[0.12em] text-parchment transition hover:border-gold hover:text-gold"
                >
                  LOGIN
                </Link>
              )}

              <Link
                href="/for-authors"
                className="fx-button rounded-full border border-gold bg-gold px-4 py-2 font-ui text-[10px] tracking-[0.14em] text-void transition hover:bg-gold-dim"
              >
                SUBMIT
              </Link>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <CartIcon />
              <button
                type="button"
                className="rounded-md border border-smoke p-2 text-parchment"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="border-b border-smoke bg-obsidian px-4 py-4 md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-3">
              {links.map((link) => {
                const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-md border px-3 py-2 font-ui text-xs tracking-[0.14em] transition",
                      active
                        ? "border-gold/45 bg-gold/10 text-gold"
                        : "border-smoke text-parchment hover:border-gold hover:text-gold",
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <Link
                href="/for-authors"
                className="fx-button rounded-full border border-gold bg-gold px-4 py-2 text-center font-ui text-xs tracking-[0.14em] text-void transition hover:bg-gold-dim"
                onClick={() => setMobileOpen(false)}
              >
                SUBMIT MANUSCRIPT
              </Link>

              {user ? (
                <form action="/auth/logout" method="post">
                  <button
                    type="submit"
                    className="fx-button w-full rounded-full border border-smoke px-4 py-2 font-ui text-xs tracking-[0.14em] text-parchment transition hover:border-gold hover:text-gold"
                  >
                    LOGOUT
                  </button>
                </form>
              ) : (
                <Link
                  href="/auth/login"
                  className="fx-button rounded-full border border-smoke px-4 py-2 text-center font-ui text-xs tracking-[0.14em] text-parchment transition hover:border-gold hover:text-gold"
                  onClick={() => setMobileOpen(false)}
                >
                  LOGIN
                </Link>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

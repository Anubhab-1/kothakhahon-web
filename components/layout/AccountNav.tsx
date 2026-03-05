"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/wishlist", label: "Wishlist" },
];

export default function AccountNav() {
  const pathname = usePathname();

  return (
    <aside className="editorial-panel rounded-2xl p-4 md:sticky md:top-28 md:h-fit">
      <p className="mb-3 font-ui text-xs tracking-[0.14em] text-gold">ACCOUNT</p>
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-xl border px-3 py-2 font-ui text-xs tracking-[0.12em] transition",
                active
                  ? "border-gold/45 bg-gold/12 text-gold"
                  : "border-smoke text-parchment hover:border-gold/40 hover:bg-ash/35 hover:text-gold",
              )}
            >
              {link.label.toUpperCase()}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

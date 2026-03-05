import type { Metadata } from "next";
import {
  Cinzel,
  Cormorant_Garamond,
  DM_Mono,
  EB_Garamond,
  Noto_Serif_Bengali,
} from "next/font/google";
import "./globals.css";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/ui/PageTransition";
import ScrollToTop from "@/components/ui/ScrollToTop";
import CartDrawer from "@/components/ui/CartDrawer";
import { CartProvider } from "@/components/providers/CartProvider";
import { LenisProvider } from "@/components/providers/LenisProvider";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const notoSerifBengali = Noto_Serif_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Kothakhahon Prokashoni",
    template: "%s | Kothakhahon Prokashoni",
  },
  description:
    "Kothakhahon Prokashoni is an independent Bengali publishing house for literary fiction, essays, and enduring contemporary voices.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Kothakhahon Prokashoni",
    description:
      "Literary publishing with editorial depth, timeless design, and modern Bengali storytelling.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${cormorant.variable} ${cinzel.variable} ${ebGaramond.variable} ${dmMono.variable} ${notoSerifBengali.variable} bg-void font-body text-parchment antialiased`}
        suppressHydrationWarning
      >
        <CartProvider>
          <div className="relative min-h-screen overflow-x-clip">
            <LenisProvider>
              <NavBar />
              <main>
                <PageTransition>{children}</PageTransition>
              </main>
              <Footer />
              <ScrollToTop />
              <CartDrawer />
            </LenisProvider>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { absoluteUrl } from "@/lib/utils";

const serif = Cormorant_Garamond({ subsets: ["latin", "latin-ext"], variable: "--font-serif", display: "swap", weight: ["400", "500", "600", "700"] });
const sans = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Galeria fotografii", template: "%s — Galeria fotografii" },
  description: "Autorska galeria fotografii o ciepłej, filmowej estetyce.",
  alternates: { canonical: absoluteUrl("/") },
  openGraph: { type: "website", locale: "pl_PL", siteName: "Galeria fotografii" },
  twitter: { card: "summary_large_image" },
  manifest: "/manifest.webmanifest",
  icons: [{ rel: "icon", url: "/favicon.svg", type: "image/svg+xml" }],
};

export const viewport: Viewport = { themeColor: "#1a120f", colorScheme: "dark", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}

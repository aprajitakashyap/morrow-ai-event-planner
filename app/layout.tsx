import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Fraunces, Manrope } from "next/font/google";
import { connection } from "next/server";

import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://morrow-planner.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Morrow — the calm way to plan a celebration",
    template: "%s · Morrow",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  description:
    "A GenAI planning assistant for weddings, birthdays, and community events. Get a grounded budget, a working timeline, a vendor checklist, and personal ideas.",
  applicationName: "Morrow",
  keywords: [
    "wedding planner",
    "event planning",
    "AI event planner",
    "budget planner",
    "vendor checklist",
  ],
  authors: [{ name: "Morrow" }],
  creator: "Morrow",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Morrow — the calm way to plan a celebration",
    description:
      "A grounded plan for weddings, birthdays, and community events — with a budget, timeline, vendor checklist, and an AI copilot that knows the details.",
    type: "website",
    locale: "en_GB",
    siteName: "Morrow",
  },
  twitter: {
    card: "summary_large_image",
    title: "Morrow — the calm way to plan a celebration",
    description:
      "A grounded plan for the occasions that matter. Budget, timeline, vendors, and Vela.",
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#f7f3ea",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  // Nonce-based CSP is applied by proxy.ts, so pages must render per request.
  await connection();

  return (
    <html lang="en-GB" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}

import "./globals.css";
import type { Metadata } from "next";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { academySeoKeywords, getAcademySiteUrl } from "@/lib/seo";

const siteUrl = getAcademySiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Nexus Talenta Indonesia Academy",
  title: {
    default: "Nexus Talenta Indonesia Academy | Belajar Online Bahasa dan Karier",
    template: "%s | Nexus Talenta Indonesia Academy",
  },
  description:
    "Belajar online bahasa Jepang, English interview, Arabic harian, dan PMP prep dengan AI tutor, mock test, progress tracking, dan platform resmi Nexus Talenta Indonesia.",
  keywords: [...academySeoKeywords],
  authors: [{ name: "PT Nexus Talenta Indonesia", url: "https://nexustalenta.com" }],
  creator: "PT Nexus Talenta Indonesia",
  publisher: "PT Nexus Talenta Indonesia",
  category: "education",
  alternates: {
    canonical: "/",
    languages: {
      "id-ID": "/",
      "en-US": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    alternateLocale: ["en_US"],
    url: "/",
    siteName: "Nexus Talenta Indonesia Academy",
    title: "Nexus Talenta Indonesia Academy | Belajar Online Bahasa dan Karier",
    description:
      "Platform belajar online NexusTalenta untuk bahasa Jepang, English interview, Arabic harian, PMP prep, AI tutor, dan persiapan karier global.",
    images: [
      {
        url: "/icon.png",
        width: 200,
        height: 200,
        alt: "Nexus Talenta Indonesia Academy",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Nexus Talenta Indonesia Academy",
    description:
      "Belajar online bahasa dan karier dengan AI tutor, mock test, dan progress tracking.",
    images: ["/icon.png"],
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "200x200" },
      { url: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}

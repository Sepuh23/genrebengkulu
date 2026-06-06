import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GenRe Kota Bengkulu",
    template: "%s | GenRe Kota Bengkulu",
  },
  description: "Program GenRe Kota Bengkulu dan PIK-R: informasi, pendaftaran, struktur organisasi, dan dokumentasi kegiatan.",
  keywords: [
    "GenRe",
    "PIK-R",
    "Kota Bengkulu",
    "Remaja",
    "Generasi Berencana",
    "Pusat Informasi dan Konseling",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "GenRe Kota Bengkulu",
    description: "Informasi resmi GenRe Kota Bengkulu: layanan PIK-R, struktur, pendaftaran, dan kegiatan.",
    siteName: "GenRe Kota Bengkulu",
    images: [
      {
        url: "/GenreBengkuluLogo.svg",
        width: 1200,
        height: 630,
        alt: "GenRe Kota Bengkulu",
      },
    ],
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    site: "@genre_bengkulu",
    creator: "@genre_bengkulu",
    title: "GenRe Kota Bengkulu",
    description: "Informasi resmi GenRe Kota Bengkulu: layanan PIK-R, struktur, pendaftaran, dan kegiatan.",
    images: [
      {
        url: "/GenreBengkuluLogo.svg",
        alt: "GenRe Kota Bengkulu",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': "large",
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: "/GenreBengkuluLogo.svg",
    apple: "/GenreBengkuluLogo.svg",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { kv } from '@vercel/kv';
import rawData from '@/data/bento-data.json';
import { mergeWithFallbackData } from '@/utils/raw-data';
import { DEFAULT_SITE_SETTINGS, getFaviconUrl, getSiteSettings } from '@/utils/site-settings';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const kvData = await kv.get('bento_data');
    const mergedData = mergeWithFallbackData(kvData, rawData);
    const site = getSiteSettings(mergedData);
    const faviconUrl = getFaviconUrl(site);

    return {
      title: site.title || 'Seulki Kang',
      description: 'Seulki Kang',
      icons: {
        icon: faviconUrl,
        shortcut: faviconUrl,
        apple: faviconUrl,
      },
    };
  } catch (error) {
    const fallbackFavicon = getFaviconUrl(DEFAULT_SITE_SETTINGS);
    return {
      title: 'Seulki Kang',
      description: 'Seulki Kang',
      icons: {
        icon: fallbackFavicon,
        shortcut: fallbackFavicon,
        apple: fallbackFavicon,
      },
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { kv } from '@vercel/kv';
import rawData from '@/data/bento-data.json';
import { mergeWithFallbackData } from '@/utils/raw-data';
import { DEFAULT_SITE_SETTINGS, getFaviconUrl, getSiteSettings } from '@/utils/site-settings';
import "./globals.css";

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
  } catch {
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
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link
          href="https://hangeul.pstatic.net/hangeul_static/css/maru-buri.css"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

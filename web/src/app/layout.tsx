import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Lexend_Giga, Noto_Serif_JP } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import type { ReactNode } from "react";
import { env } from "@/lib/env";

// Noto Sans JP は next/font/google 経由では読み込まない。
// Google Fonts が返すフォントファイル URL の形式変更（/l/font?kit=...）に
// next@15.5.x のローダーが対応しておらず、ビルドが失敗するため、
// スタイルシートを <link> で直接読み込む。
// CSS 変数 --font-noto-sans-jp は globals.css の :root で定義している。
const notoSansJpStylesheetUrl =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap";

const lexendGiga = Lexend_Giga({
  variable: "--font-lexend-giga",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
});

// トピックの代表意見など、引用文を明朝体で表示するために使用
const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const isDev = process.env.NODE_ENV === "development";
const isStaging = process.env.VERCEL_TARGET_ENV === "staging";
const siteTitle = "みらい議会＠東広島市";
const siteDescription =
  "東広島市議会で今どんな議案が検討されているか、わかりやすく伝える非公式プラットフォーム";
const siteName = "みらい議会＠東広島市";
const ogImage = {
  url: "/ogp.jpg",
  width: 1200,
  height: 630,
  alt: "みらい議会＠東広島市のOGPイメージ",
};

export const metadata: Metadata = {
  metadataBase: new URL(env.webUrl),
  title: siteTitle,
  description: siteDescription,
  keywords: [
    siteName,
    "議案",
    "政治",
    "東広島市",
    "東広島市議会",
    "政策",
    "解説",
  ],
  icons: {
    icon: isDev
      ? "/icons/pwa/icon_dev_192_v3.png"
      : isStaging
        ? "/icons/pwa/icon_staging_192.png"
        : "/icons/pwa/icon_android_192.png",
    apple: isStaging
      ? "/icons/pwa/icon_staging_ios.png"
      : "/icons/pwa/icon_ios.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    images: [ogImage],
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [ogImage.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#203864",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href={notoSansJpStylesheetUrl} rel="stylesheet" />
      </head>
      <body
        className={`${lexendGiga.variable} ${notoSerifJP.variable} font-sans antialiased bg-mirai-surface-light`}
      >
        <NextTopLoader showSpinner={false} color="#203864" />
        {children}
      </body>
    </html>
  );
}

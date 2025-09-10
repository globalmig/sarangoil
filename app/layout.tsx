import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import GNB from "./component/GNB";
import Footer from "./component/Footer";
import CallBtn from "./component/CallBtn";
import { Suspense } from "react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.modenoil.com"),
  icons: {
    icon: "/favicon2.ico",
  },
  title: {
    default: "모든 주유소 | 주유소 임대·매매·부지 전문",
    template: "%s | 모든 주유소",
  },
  description: "주유소 임대·매매·부지 전문 중개. 전국 물건 실시간 업데이트, 상담 031-245-5189.",
  alternates: { canonical: "https://www.modenoil.com" },
  openGraph: {
    type: "website",
    siteName: "모든 주유소",
    title: "모든 주유소 | 주유소 임대·매매·부지 전문",
    description: "주유소 임대·매매·부지 전문 중개. 전국 물건 실시간 업데이트, 상담 031-245-5189.",
    images: [{ url: "/img/Main/hero_bg_1.jpg", width: 1200, height: 630 }],
    locale: "ko_KR",
  },
  verification: {
    other: {
      // "google-site-verification": "구글_콘솔에서_받은_코드", // e.g. abcdefg...
      "naver-site-verification": "75cff2584cf7554b7fdae91a6d22869a56048c3d", // e.g. 1234567...
    },
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon2.ico" sizes="any" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <GNB />
        <CallBtn />
        <Suspense fallback={<div className="p-6 text-sm text-zinc-500 ">Loading…</div>}>
          <main className="flex-1 min-h-96">{children}</main>
        </Suspense>
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import GNB from "./component/GNB";
import Footer from "./component/Footer";
import CallBtn from "./component/CallBtn";

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
  title: "모든 주유소",
  description: "주유소 임대, 매매, 부지, 충전소 매물을 확인할 수 있는 사이트입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <GNB />
        <CallBtn />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

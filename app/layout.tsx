import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastContainer } from "@/components/ui/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "TravelGuide — AI 智能旅游攻略",
    template: "%s | TravelGuide",
  },
  description:
    "探索全球热门目的地，AI 智能生成个性化旅游攻略。涵盖景点推荐、交通攻略、美食指南、住宿推荐，让你的每一次旅行都完美无憾。",
  keywords: [
    "旅游攻略",
    "AI旅游规划",
    "景点推荐",
    "交通攻略",
    "美食指南",
    "住宿推荐",
    "旅行计划",
    "自由行",
  ],
  authors: [{ name: "TravelGuide" }],
  creator: "TravelGuide",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "TravelGuide",
    title: "TravelGuide — AI 智能旅游攻略",
    description:
      "探索全球热门目的地，AI 智能生成个性化旅游攻略。涵盖景点推荐、交通攻略、美食指南、住宿推荐。",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TravelGuide — AI 智能旅游攻略",
    description:
      "探索全球热门目的地，AI 智能生成个性化旅游攻略。涵盖景点推荐、交通攻略、美食指南、住宿推荐。",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${playfairDisplay.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-surface-50 text-surface-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ToastContainer />
      </body>
    </html>
  );
}

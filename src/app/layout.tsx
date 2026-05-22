import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/shared/BottomNav";
import { TopBar } from "@/components/shared/TopBar";

export const metadata: Metadata = {
  title: "HidyoNepal — Trek Together",
  description: "Community platform for trekkers in Nepal.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HidyoNepal",
  },
};

export const viewport: Viewport = {
  themeColor: "#c2410c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-green-50/50 text-gray-900 antialiased">
        {" "}
        <TopBar />
        <main className="min-h-screen pb-20 pt-14">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}

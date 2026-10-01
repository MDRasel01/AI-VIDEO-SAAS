import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FrameFlow | Automated Video Merging & Template Composition",
  description: "Drop your clips. Pick a template. Automatically generate cinematic, platform-ready videos in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full dark`}>
      <body className="h-screen w-screen overflow-hidden bg-[#08090D] text-[#F5F7FA] font-sans antialiased selection:bg-[#7C5CFF]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}

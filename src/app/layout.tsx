import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CineTube | Modern Streaming & Rating Portal",
  description: "Explore, rate, and review movies and TV series.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#050505] text-white min-h-screen flex flex-col`}>
        <Navbar />
        {/* Added padding-top to prevent content from hiding behind the fixed navbar */}
        <main className="grow pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

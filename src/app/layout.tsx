import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import AppMain from "@/components/shared/AppMain";
import { AuthProvider } from "@/context/AuthContext";
import FloatingAssistant from "@/components/ai/FloatingAssistant";

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
    <html lang="en" data-scroll-behavior="smooth" data-theme="dark">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)]`}>
        <AuthProvider>
          <Navbar />
          <AppMain>{children}</AppMain>
          <Footer />
          <FloatingAssistant />
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AnimatedBackground } from "@/components/background/AnimatedBackground";
import { TranslationProvider } from "@/lib/translation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DecisionUp - Personal Intelligence Feed",
  description: "Your daily intelligence feed. Signal, not noise. Make better decisions with curated insights from the world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans relative">
        <AnimatedBackground />
        <TranslationProvider>
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}

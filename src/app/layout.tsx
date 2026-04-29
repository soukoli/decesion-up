import type { Metadata, Viewport } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-creative";
import { AnimatedBackground } from "@/components/background/AnimatedBackground";
import { TranslationProvider } from "@/lib/translation";
import { SettingsProvider } from "@/lib/settings";
import { SettingsModal } from "@/components/settings";
import { PreloadTrigger } from "@/components/PreloadTrigger";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DecisionUp - Personal Intelligence Feed",
  description: "Your daily intelligence feed. Signal, not noise. Make better decisions with curated insights from the world.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DecisionUp",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans relative">
        <AnimatedBackground />
        <TranslationProvider>
          <SettingsProvider>
            <PreloadTrigger>
              {children}
              <SettingsModal />
            </PreloadTrigger>
          </SettingsProvider>
        </TranslationProvider>
      </body>
    </html>
  );
}

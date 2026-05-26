import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FontSizeProvider } from "@/lib/font-size";
import { ThemeProvider } from "@/lib/theme";
import { Snackbar } from "@/components/ui/Snackbar";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DecisionUp",
  description: "AI-powered personal decision system",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DecisionUp",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${inter.variable} h-full`}>
      <body className="h-dvh overflow-hidden bg-slate-950 text-white dark">
        <ThemeProvider>
          <FontSizeProvider>
            {children}
            <Snackbar />
          </FontSizeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

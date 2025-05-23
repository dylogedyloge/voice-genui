import type { Metadata } from "next";

import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";

import { Toaster } from "@/components/ui/sonner"
import localFont from "next/font/local";

import { TranslationsProvider } from "@/components/translations-context"


// Persian font
const vazir = localFont({
  src: "./fonts/YekanBakhFaNum-Light.ttf",
  display: "swap",
});

export const metadata: Metadata = {
  title: "دستیار صوتی آتریپا",
  description: "Next.js Starter for using the OpenAI Realtime API WebRTC method. Starter showcases capabilities of OpenAI's latest Realtime API (12/17/2024). It has all shadcn/ui components to build your own real-time voice AI application. Fastest & latest way to do Voice AI (Dec 2024), implementing API advancements of Day of OpenAI's 12 days of Christmas.",
  creator: "امیر نجفی",
  openGraph: {
    images: "/opengraph-image.png",
  },
  icons: {
    icon: "/favicon.ico",
  },
  keywords: ["AI Blocks", "OpenAI Blocks", "Blocks", "OpenAI Realtime API", "OpenAI Realtime", "OpenAI WebRTC", "Livekit", "OpenAI Realtime WebRTC", "OpenAI Realtime Starter", "Voice AI", "Voice AI components", "web components", "UI components", "UI Library", "shadcn", "aceternity", "AI", "Next.js", "React", "Tailwind CSS", "Framer Motion", "TypeScript", "Design engineer", "shadcn ai"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={vazir.className} dir="rtl">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TranslationsProvider>
            <div className="relative flex min-h-dvh flex-col bg-background items-center">
              {/* <Header /> */}
              {/* <Banner /> */}
              <main className="flex flex-1 justify-center items-start">
                {children}
              </main>
            </div>
            <Toaster />
          </TranslationsProvider>
        </ThemeProvider>
        {/* <Analytics /> */}
      </body>
    </html>
  );
}

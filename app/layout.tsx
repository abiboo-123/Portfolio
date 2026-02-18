import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: {
    default:
      "Habib Mohamed Gouda | Back-End Developer & AI-Focused Computer Science Student",
    template: "%s | Habib Mohamed Gouda",
  },
  description:
    "Portfolio of Habib Mohamed Gouda, a back-end developer and AI-focused Computer Science student based in Ingolstadt, Germany.",
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "Habib Mohamed Gouda | Back-End Developer",
    description:
      "Back-end developer and AI-focused Computer Science student building scalable systems and intelligent applications.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var k='portfolio-theme';var v=localStorage.getItem(k);if(v==='dark'||v==='light'){document.documentElement.classList.add(v);return;}var d=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.classList.add(d);})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-white text-slate-900 antialiased transition-colors duration-200 dark:bg-slate-900 dark:text-slate-100">
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-8">
              <div className="w-full space-y-10">{children}</div>
            </main>
            <Footer />
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

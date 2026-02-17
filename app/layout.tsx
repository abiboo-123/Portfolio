import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { ReactNode } from "react";

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
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900">
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-8">
            <div className="w-full space-y-10">{children}</div>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}


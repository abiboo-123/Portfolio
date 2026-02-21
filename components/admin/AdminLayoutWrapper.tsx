"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { ReactNode } from "react";

export function AdminLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="w-full max-w-7xl flex-1 px-4 py-12 mx-auto sm:px-6 lg:px-8 md:py-20">
        <div className="w-full max-w-5xl mx-auto space-y-10">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

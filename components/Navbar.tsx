"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const renderNavLinks = (className: string) =>
    links.map((link) => {
      const isActive =
        link.href === "/"
          ? pathname === "/"
          : pathname.startsWith(link.href);
      return (
        <Link
          key={link.href}
          href={link.href}
          className={[
            "rounded-full px-3 py-1 text-sm transition-colors",
            isActive
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
            className,
          ].join(" ")}
        >
          {link.label}
        </Link>
      );
    });

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-baseline gap-1 text-slate-900 dark:text-slate-100"
        >
          <span className="text-base font-semibold">Habib Gouda</span>
          <span className="hidden text-xs text-slate-500 dark:text-slate-400 sm:inline">
            Back-End & AI
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:focus:ring-offset-slate-900 md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}
          >
            <span className="block h-0.5 w-4 rounded bg-current" />
            <span className="sr-only">Open main menu</span>
          </button>
          <div className="md:hidden">
            <ThemeToggle />
          </div>
          <div className="ml-auto hidden items-center gap-4 md:flex">
            {renderNavLinks("")}
            <ThemeToggle />
          </div>
        </div>
      </nav>
      {isOpen && (
        <div className="border-t border-slate-100 bg-white/95 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6 lg:px-8">
            {renderNavLinks("w-full text-center")}
          </div>
        </div>
      )}
    </header>
  );
}

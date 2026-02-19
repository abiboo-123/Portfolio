import Link from "next/link";
import type { ReactNode } from "react";

type CTAButtonVariant = "primary" | "secondary" | "ghost";

interface CTAButtonProps {
  href: string;
  children: ReactNode;
  variant?: CTAButtonVariant;
  external?: boolean;
  className?: string;
}

const variantClasses: Record<CTAButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-dark shadow-soft hover:shadow-lg dark:shadow-soft-dark dark:hover:bg-accent-light",
  secondary:
    "bg-white text-accent border border-accent hover:bg-accent hover:text-white dark:bg-slate-800 dark:border-accent-light dark:text-accent-light dark:hover:bg-accent dark:hover:text-white dark:hover:border-accent",
  ghost:
    "bg-transparent text-slate-900 border border-slate-200 hover:bg-slate-50 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-800",
};

export function CTAButton({
  href,
  children,
  variant = "primary",
  external = false,
  className,
}: CTAButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900";

  const classes = [
    baseClasses,
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

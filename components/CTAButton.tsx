import Link from "next/link";
import type { ReactNode } from "react";

type CTAButtonVariant = "primary" | "secondary" | "ghost";

interface CTAButtonProps {
  href: string;
  children: ReactNode;
  variant?: CTAButtonVariant;
  external?: boolean;
}

const variantClasses: Record<CTAButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-dark shadow-soft hover:shadow-lg",
  secondary:
    "bg-white text-accent border border-accent hover:bg-accent hover:text-white",
  ghost:
    "bg-transparent text-slate-900 border border-slate-200 hover:bg-slate-50",
};

export function CTAButton({
  href,
  children,
  variant = "primary",
  external = false,
}: CTAButtonProps) {
  const classes =
    "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium transition-colors transition-shadow duration-150 " +
    variantClasses[variant];

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


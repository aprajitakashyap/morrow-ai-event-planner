import Link from "next/link";

import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string;
  compact?: boolean;
  className?: string;
};

export function Logo({ href = "/", compact = false, className }: LogoProps) {
  const content = (
    <>
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 34 34" fill="none">
          <path
            d="M6 27V16.5a11 11 0 0 1 22 0V27"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="17" cy="16.5" r="4" fill="currentColor" />
          <path d="M6 27h22" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </span>
      {!compact && <span className="logo-word">Morrow</span>}
    </>
  );

  if (!href) {
    return <span className={cn("logo", className)}>{content}</span>;
  }

  return (
    <Link href={href} className={cn("logo", className)} aria-label="Morrow home">
      {content}
    </Link>
  );
}

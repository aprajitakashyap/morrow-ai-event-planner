"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

export default function GlobalRouteError({
  error,
  reset,
  retry,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
}) {
  useEffect(() => {
    console.error("[morrow] Uncaught route error:", error);
  }, [error]);

  const handleRetry = () => {
    if (typeof retry === "function") {
      retry();
    } else if (typeof reset === "function") {
      reset();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="error-shell">
      <header className="error-header">
        <div className="container error-header__inner">
          <Logo />
          <Link className="button button--ghost button--small" href="/">
            Return home
          </Link>
        </div>
      </header>
      <main id="main" className="container error-main">
        <div className="error-card">
          <p className="eyebrow">Something interrupted the flow</p>
          <h1 className="display error-title">
            Take a breath. <em>We hit a small hitch.</em>
          </h1>
          <p className="error-lede">
            An unexpected error interrupted this view. Your saved plan and browser data
            have not been lost.
          </p>
          {error.digest && (
            <p className="error-digest">
              Reference code: <code>{error.digest}</code>
            </p>
          )}
          <div className="error-actions">
            <button type="button" className="button button--primary" onClick={handleRetry}>
              <Icon name="sparkles" size={16} />
              Try again
            </button>
            <Link className="button button--soft" href="/plan">
              <Icon name="calendar" size={16} />
              Return to workspace
            </Link>
            <Link className="button button--ghost" href="/">
              Go to homepage
            </Link>
          </div>
        </div>
      </main>
      <footer className="error-footer">
        <span>Morrow · plans remain stored in your browser</span>
      </footer>
    </div>
  );
}

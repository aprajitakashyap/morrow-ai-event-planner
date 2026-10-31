import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The celebration you were looking for could not be found.",
};

export default function NotFound() {
  return (
    <div className="error-shell">
      <header className="error-header">
        <div className="container error-header__inner">
          <Logo />
          <Link className="button button--ghost button--small" href="/plan">
            <Icon name="calendar" size={16} />
            My plan
          </Link>
        </div>
      </header>
      <main id="main" className="container error-main">
        <div className="error-card">
          <p className="eyebrow">404 · Nothing here</p>
          <h1 className="display error-title">
            This celebration has wandered <em>off the map.</em>
          </h1>
          <p className="error-lede">
            The page you are looking for has moved, expired, or never existed. Your saved plan
            and notes remain safe in your browser.
          </p>
          <div className="error-actions">
            <Link className="button button--primary" href="/">
              <Icon name="compass" size={16} />
              Return home
            </Link>
            <Link className="button button--soft" href="/plan">
              <Icon name="calendar" size={16} />
              Open workspace
            </Link>
            <Link className="button button--ghost" href="/create">
              Plan a celebration
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>
        </div>
      </main>
      <footer className="error-footer">
        <span>Morrow · the calm way to plan a celebration</span>
      </footer>
    </div>
  );
}

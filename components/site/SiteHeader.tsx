import Link from "next/link";

import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Logo />
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#intelligence">The intelligence</a>
          <a href="#accessibility">Accessibility</a>
        </nav>
        <Link className="button button--dark button--small site-header__cta" href="/create">
          <span>Plan a celebration</span>
          <Icon name="arrow-up-right" size={16} />
        </Link>
      </div>
    </header>
  );
}

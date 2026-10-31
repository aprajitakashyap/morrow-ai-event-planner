"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { readSavedPlan } from "@/lib/storage";

export function SiteHeader() {
  const [hasPlan, setHasPlan] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only available on the client after mount.
    setHasPlan(Boolean(readSavedPlan()));
  }, []);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Logo />
        <nav className="site-nav" aria-label="Main navigation">
          {hasPlan && (
            <Link href="/plan" className="site-nav__highlight">
              My plan
            </Link>
          )}
          <a href="#how-it-works">How it works</a>
          <a href="#intelligence">The intelligence</a>
          <a href="#accessibility">Accessibility</a>
        </nav>
        <div className="site-header__actions">
          {hasPlan ? (
            <Link className="button button--primary button--small site-header__cta" href="/plan">
              <span>Open my plan</span>
              <Icon name="arrow-right" size={16} />
            </Link>
          ) : (
            <Link className="button button--dark button--small site-header__cta" href="/create">
              <span>Plan a celebration</span>
              <Icon name="arrow-up-right" size={16} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";

import { Logo } from "@/components/ui/Logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__top">
        <div className="site-footer__brand">
          <Logo className="logo--light" />
          <p>The calm way to plan something unforgettable.</p>
        </div>
        <div className="site-footer__links">
          <div>
            <p className="footer-label">Plan</p>
            <Link href="/create">New celebration</Link>
            <Link href="/plan?demo=1">Sample plan</Link>
          </div>
          <div>
            <p className="footer-label">Built with care</p>
            <a href="#accessibility">Accessibility</a>
            <a href="https://github.com/aprajitakashyap/morrow-ai-event-planner" rel="noreferrer">
              Source code
            </a>
          </div>
        </div>
      </div>
      <div className="container site-footer__bottom">
        <span>© {new Date().getFullYear()} Morrow</span>
        <span>Plans stay in your browser unless AI is configured.</span>
      </div>
    </footer>
  );
}

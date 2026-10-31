import type { Metadata } from "next";
import Link from "next/link";

import { PlannerWizard } from "@/components/create/PlannerWizard";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Plan a celebration",
  description:
    "Tell Morrow about the occasion, budget, and priorities. Get a grounded event plan in minutes.",
};

export default function CreatePage() {
  return (
    <div className="create-shell">
      <header className="create-header">
        <div className="container create-header__inner">
          <Logo />
          <Link className="create-header__link" href="/plan">
            <Icon name="calendar" size={16} />
            My plan
          </Link>
        </div>
      </header>
      <main id="main" className="container create-main">
        <PlannerWizard />
      </main>
      <footer className="create-footer">
        <span>Morrow · a calmer plan for the moments that matter</span>
        <span>Plans stay in your browser</span>
      </footer>
    </div>
  );
}

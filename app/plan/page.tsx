import type { Metadata } from "next";

import { PlanWorkspace } from "@/components/plan/PlanWorkspace";

export const metadata: Metadata = {
  title: "Your plan",
  description:
    "Your living Morrow plan: budget, timeline, vendor checklist, ideas, and Vela.",
  robots: { index: false, follow: false },
};

export default function PlanPage() {
  return <PlanWorkspace />;
}

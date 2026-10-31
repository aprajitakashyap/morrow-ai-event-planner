import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Morrow — celebration planner",
    short_name: "Morrow",
    description:
      "A GenAI planning assistant for weddings, birthdays, and community events.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f3ea",
    theme_color: "#f7f3ea",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}

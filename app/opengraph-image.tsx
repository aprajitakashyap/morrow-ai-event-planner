import { ImageResponse } from "next/og";

export const alt = "Morrow — The calm way to plan a celebration";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#f7f3ea",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          color: "#1f2a24",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "#c96850",
            }}
          />
          <span
            style={{
              fontSize: "36px",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "#1f2a24",
            }}
          >
            Morrow
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <span
            style={{
              fontSize: "60px",
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              color: "#1f2a24",
            }}
          >
            A calmer way to plan a celebration.
          </span>
          <span
            style={{
              fontSize: "24px",
              color: "#5b675e",
              lineHeight: 1.4,
              maxWidth: "860px",
            }}
          >
            Grounded budgets, realistic timelines, and vendor checklists for weddings,
            birthdays, and community gatherings.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            fontSize: "20px",
            color: "#8a9a83",
            fontWeight: 600,
          }}
        >
          <span>Deterministic maths</span>
          <span>·</span>
          <span>No hallucinated budgets</span>
          <span>·</span>
          <span>In-browser privacy</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

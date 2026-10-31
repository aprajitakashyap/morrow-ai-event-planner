"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
  retry,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
}) {
  useEffect(() => {
    console.error("[morrow] Fatal root error:", error);
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: "40px 20px",
          background: "#f7f3ea",
          color: "#1f2a24",
          fontFamily: "system-ui, -apple-system, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            textAlign: "center",
            background: "#fffdf8",
            border: "1px solid rgba(31, 42, 36, 0.14)",
            borderRadius: "20px",
            padding: "36px 28px",
          }}
        >
          <h1 style={{ fontSize: "28px", margin: "0 0 12px", fontWeight: 700 }}>
            Something went wrong
          </h1>
          <p style={{ color: "#5b675e", fontSize: "15px", lineHeight: 1.6, margin: "0 0 24px" }}>
            Morrow encountered an unexpected error while loading the application.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            style={{
              background: "#1f2a24",
              color: "#fffdf8",
              border: "none",
              borderRadius: "10px",
              padding: "10px 20px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Try reloading
          </button>
        </div>
      </body>
    </html>
  );
}

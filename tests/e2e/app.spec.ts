import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

function futureDate(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

async function expectNoAccessibilityViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(
    results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.map((node) => node.target.join(" ")),
    })),
  ).toEqual([]);
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

test.describe("landing page", () => {
  test("introduces the product and its calls to action", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Morrow/);
    await expect(
      page.getByRole("heading", { level: 1, name: /Make room for the moment/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Plan your celebration/i }).first()).toHaveAttribute(
      "href",
      "/create",
    );
    await expect(page.getByRole("link", { name: /Explore a sample plan/i }).first()).toHaveAttribute(
      "href",
      "/plan?demo=1",
    );

    await expectNoHorizontalOverflow(page);
    await expectNoAccessibilityViolations(page);
  });

  test("keeps the sample preview grounded in real numbers", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Aarav & Meera").first()).toBeVisible();
    await expect(page.getByText(/Jaipur/).first()).toBeVisible();
    await expect(page.getByText(/180 guests/).first()).toBeVisible();
  });
});

test.describe("planner wizard", () => {
  test("builds a plan and supports the workspace workflow", async ({ page }) => {
    await page.goto("/create");

    await expect(page.getByRole("heading", { name: /What are we planning/i })).toBeVisible();

    await page.getByRole("radio", { name: /Wedding/ }).check({ force: true });
    await page.getByLabel("What are we calling it?").fill("Riverside Vow Renewal");
    await page.getByLabel("Date").fill(futureDate(120));
    await page.getByLabel("City or venue").fill("Bristol");
    await page.getByRole("button", { name: /Continue/ }).click();

    await expect(page.getByRole("heading", { name: /The people and the budget/i })).toBeVisible();
    await page.getByLabel("Guest count").fill("80");
    await page.getByLabel("Total budget").fill("900000");
    await page.getByText("Modern minimal", { exact: true }).click();
    await page.getByRole("button", { name: /Continue/ }).click();

    await expect(page.getByRole("heading", { name: /The details that make it yours/i })).toBeVisible();
    await page.getByLabel(/Access needs/).fill("Step-free access and a quiet room.");
    await page.getByLabel(/Dietary needs/).fill("One nut allergy.");
    await page.getByRole("button", { name: /Build my plan/ }).click();

    await page.waitForURL("**/plan", { timeout: 45_000 });
    await expect(
      page.getByRole("heading", { level: 1, name: "Riverside Vow Renewal" }),
    ).toBeVisible();
    await expect(page.getByText(/Bristol/).first()).toBeVisible();
    await expect(page.getByText(/80 guests/).first()).toBeVisible();

    const saved = await page.evaluate(() => {
      const raw = window.localStorage.getItem("morrow.plan.v1");
      return raw ? JSON.parse(raw).plan.brief.eventName : null;
    });
    expect(saved).toBe("Riverside Vow Renewal");

    await page
      .getByRole("navigation", { name: "Plan sections" })
      .getByRole("button", { name: /Budget/ })
      .click();
    await expect(page.getByRole("heading", { name: /Where the money goes/i })).toBeVisible();
    await expect(page.getByText(/Three honest levers/i)).toBeVisible();

    await page
      .getByRole("navigation", { name: "Plan sections" })
      .getByRole("button", { name: /Timeline/ })
      .click();
    const firstTaskToggle = page.getByRole("button", { name: "Mark “Book the venue” as complete" });
    await firstTaskToggle.click();
    await expect(
      page.getByRole("button", { name: "Mark “Book the venue” as not complete" }),
    ).toHaveAttribute("aria-pressed", "true");

    await page
      .getByRole("navigation", { name: "Plan sections" })
      .getByRole("button", { name: /Vendors/ })
      .click();
    const firstVendorGroup = page.getByRole("group", { name: /^Status for/ }).first();
    await firstVendorGroup.getByRole("button", { name: "Booked" }).click();
    await expect(
      firstVendorGroup.getByRole("button", { name: "Booked" }),
    ).toHaveAttribute("aria-pressed", "true");

    await page
      .getByRole("navigation", { name: "Plan sections" })
      .getByRole("button", { name: /Ideas/ })
      .click();
    const saveIdea = page.getByRole("button", { name: "Save idea" }).first();
    await saveIdea.click();
    await expect(page.getByRole("button", { name: "Saved" }).first()).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await expectNoAccessibilityViolations(page);
  });

  test("validates each step before moving on", async ({ page }) => {
    await page.goto("/create");

    await page.getByRole("button", { name: /Continue/ }).click();
    await expect(page.getByText(/Give your celebration a name/i)).toBeVisible();
    await expect(page.getByText(/Add a city or venue/i)).toBeVisible();

    await expectNoHorizontalOverflow(page);
  });

  test("works on a narrow viewport without horizontal scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/create");

    await expect(page.getByRole("heading", { name: /What are we planning/i })).toBeVisible();
    await expect(page.getByText(/Step 1 of 3/)).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expectNoAccessibilityViolations(page);
  });
});

test.describe("sample workspace", () => {
  test("opens a complete sample plan and adopts it", async ({ page }) => {
    await page.goto("/plan?demo=1");

    await expect(page.getByRole("heading", { level: 1, name: "Aarav & Meera" })).toBeVisible();
    await expect(page.getByText(/Sample plan\./)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Next best steps/i })).toBeVisible();

    await page.getByRole("button", { name: "Use this plan" }).click();
    await page.waitForURL("**/plan");
    await expect(page.getByText(/Sample plan\./)).toHaveCount(0);
    await expect(page.getByRole("status")).toContainText(/now belongs to you/i);

    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Aarav & Meera" })).toBeVisible();
    await expect(page.getByText(/Sample plan\./)).toHaveCount(0);

    await expectNoHorizontalOverflow(page);
    await expectNoAccessibilityViolations(page);
  });

  test("answers a copilot question with the guided engine", async ({ page }) => {
    await page.goto("/plan?demo=1");

    await page.getByRole("button", { name: "Ask Vela" }).click();
    const input = page.getByLabel("Ask Vela about this plan");
    await expect(input).toBeFocused();

    await input.fill("Where can I find room in the budget?");
    await page.getByRole("button", { name: "Send message to Vela" }).click();

    await expect(page.getByText(/The biggest lines are/)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Vela · guided").last()).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Ask Vela" })).toBeFocused();
  });

  test("removes the plan only after confirmation", async ({ page }) => {
    await page.goto("/plan?demo=1");
    await page.getByRole("button", { name: "Use this plan" }).click();

    await page.getByRole("button", { name: /Start over/ }).click();
    const confirmBar = page.getByRole("alert").filter({ hasText: "Start over?" });
    await expect(confirmBar).toContainText(/Start over\?/);
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(confirmBar).toHaveCount(0);

    await page.getByRole("button", { name: /Start over/ }).click();
    await page.getByRole("button", { name: "Remove plan" }).click();
    await expect(
      page.getByRole("heading", { name: /A plan starts with a few honest details/i }),
    ).toBeVisible();
  });

  test("shows an empty state when no plan has been saved", async ({ page }) => {
    await page.goto("/plan");

    await expect(
      page.getByRole("heading", { name: /A plan starts with a few honest details/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Start planning/i })).toHaveAttribute(
      "href",
      "/create",
    );

    await expectNoAccessibilityViolations(page);
  });
});

test.describe("http behaviour", () => {
  test("rejects malformed plan payloads", async ({ request }) => {
    const response = await request.post("/api/plan", {
      data: { eventName: "" },
    });

    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("sets a nonce-based content security policy", async ({ request }) => {
    const response = await request.get("/");
    const csp = response.headers()["content-security-policy"];

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'nonce-");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
  });
});

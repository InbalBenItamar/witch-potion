import { expect, test } from "@playwright/test";

test("a failed brew shows a toast and leaves the form usable (AC12)", async ({
  page,
}) => {
  // Make the brew fail: intercept the potion request and return a 500 so the
  // app never receives a potion, exercising the failure path (AC12).
  await page.route("**/api/potion", (route) =>
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({
        error: { code: "internal", message: "boom" },
        requestId: "e2e",
      }),
    }),
  );

  await page.goto("/");

  await page.getByLabel(/what is bothering you/i).fill("i miss someone");
  await page.getByRole("button", { name: /^brew$/i }).click();

  // The witch could-not-brew toast is visible, and nothing failed silently.
  await expect(page.getByText(/could not brew/i)).toBeVisible();

  // Back in front of a usable form: Brew is visible again, trouble intact,
  // no potion on screen.
  await expect(page.getByRole("button", { name: /^brew$/i })).toBeVisible();
  await expect(page.getByLabel(/what is bothering you/i)).toHaveValue(
    "i miss someone",
  );
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(0);
});

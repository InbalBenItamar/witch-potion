import { expect, test } from "@playwright/test";

test("a child can type a trouble, brew, and see the potion", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByLabel(/what is bothering you/i).fill("i miss someone");
  await page.getByRole("button", { name: /^brew$/i }).click();

  await expect(page.getByRole("button", { name: /brewing/i })).toBeDisabled();
  await expect(page.getByRole("heading", { level: 2 })).toBeVisible({
    timeout: 5000,
  });
  await expect(page.getByText(/not for eating or drinking/i)).toBeVisible();
});

test("Back returns to the form with the trouble intact", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel(/what is bothering you/i).fill("i miss someone");
  await page.getByRole("button", { name: /^brew$/i }).click();
  await expect(page.getByRole("heading", { level: 2 })).toBeVisible({
    timeout: 5000,
  });

  await page.getByRole("button", { name: /back/i }).click();

  await expect(page.getByLabel(/what is bothering you/i)).toHaveValue(
    "i miss someone",
  );
  await expect(page.getByRole("button", { name: /^brew$/i })).toBeVisible();
});

test("Escape returns to the form while presenting", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel(/what is bothering you/i).fill("i am bored");
  await page.getByRole("button", { name: /^brew$/i }).click();
  await expect(page.getByRole("heading", { level: 2 })).toBeVisible({
    timeout: 5000,
  });

  await page.keyboard.press("Escape");

  await expect(page.getByRole("button", { name: /^brew$/i })).toBeVisible();
});

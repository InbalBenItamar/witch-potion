import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 375, height: 667 } });

test("has no horizontal scroll at 375px", async ({ page }) => {
  await page.goto("/");

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(true);
});

test("body and potion text render at 18px or larger", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel(/what is bothering you/i).fill("i am bored");
  await page.getByRole("button", { name: /^brew$/i }).click();
  await expect(page.getByRole("heading", { level: 2 })).toBeVisible({
    timeout: 5000,
  });

  const sizes = await page.evaluate(() => {
    const nodes = document.querySelectorAll("main, main *");
    const values: number[] = [];
    nodes.forEach((node) => {
      // Leaf elements only — a parent inherits its children's textContent,
      // so measuring every ancestor too would just re-check the same text
      // at whichever size the innermost element actually renders it.
      const isLeaf = node.children.length === 0;
      if (isLeaf && node.textContent?.trim()) {
        values.push(parseFloat(getComputedStyle(node).fontSize));
      }
    });
    return values;
  });

  expect(sizes.length).toBeGreaterThan(0);
  for (const size of sizes) {
    expect(size).toBeGreaterThanOrEqual(18);
  }
});

test("every interactive target is at least 44 by 44 pixels", async ({
  page,
}) => {
  await page.goto("/");

  const targets = page.locator("button, textarea, input, a");
  const count = await targets.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const box = await targets.nth(i).boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  }
});

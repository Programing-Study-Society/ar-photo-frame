import { expect, test } from "@playwright/test";

const TARGET_PATH = "/graduation_with_diploma";

test.describe("responsive camera layout", () => {
  test("controls stay visible and keep minimum touch size", async ({ page }) => {
    await page.goto(TARGET_PATH);
    await page.waitForTimeout(1500);

    const buttons = page.locator("button");
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < Math.min(count, 2); i++) {
      const box = await buttons.nth(i).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(48);
      expect(box!.height).toBeGreaterThanOrEqual(48);
    }
  });

  test("camera area covers almost full viewport", async ({ page }) => {
    await page.goto(TARGET_PATH);
    await page.waitForTimeout(1500);

    const body = page.locator('[class*="body"]').first();
    await expect(body).toBeVisible();

    const viewport = page.viewportSize();
    const bodyBox = await body.boundingBox();
    expect(viewport).not.toBeNull();
    expect(bodyBox).not.toBeNull();

    const widthCoverage = bodyBox!.width / viewport!.width;
    const heightCoverage = bodyBox!.height / viewport!.height;

    expect(widthCoverage).toBeGreaterThan(0.95);
    expect(heightCoverage).toBeGreaterThan(0.95);
  });
});

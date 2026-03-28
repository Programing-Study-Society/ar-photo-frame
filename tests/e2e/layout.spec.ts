import { expect, test } from "@playwright/test";

const TARGET_PATH = "/graduation_with_diploma";

test.describe("responsive camera layout", () => {
  test("controls stay visible and keep minimum touch size", async ({ page }) => {
    await page.goto(TARGET_PATH);

    const layoutRoot = page.getByTestId("camera-layout-root");
    await expect(layoutRoot).toBeVisible();

    const controls = layoutRoot.getByTestId("camera-controls");
    await expect(controls).toBeVisible();

    const captureButton = controls.getByRole("button", { name: "撮影する" });
    const cameraToggleButton = controls.getByRole("button", { name: "カメラを切り替える" });

    await expect(captureButton).toBeVisible();
    await expect(cameraToggleButton).toBeVisible();

    for (const button of [captureButton, cameraToggleButton]) {
      const box = await button.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(48);
      expect(box!.height).toBeGreaterThanOrEqual(48);
    }
  });

  test("camera area covers almost full viewport", async ({ page }) => {
    await page.goto(TARGET_PATH);

    const body = page.getByTestId("camera-layout-root");
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

import { expect, test, waitForFrameReady } from "../helpers/fixtures";

test("カメラ切替後も再度撮影可能になる", async ({ page }) => {
  await page.goto("/faculty_of_architectural_design");
  await waitForFrameReady(page);

  const toggleButton = page.getByTestId("camera-toggle-button");
  await toggleButton.click();
  await expect(page.getByTestId("frame-error-message")).toHaveCount(0);
  await expect(
    page.getByTestId("capture-button").or(page.getByTestId("loading-camera-indicator"))
  ).toBeVisible();
  await waitForFrameReady(page);
});

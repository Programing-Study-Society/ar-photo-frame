import { expect, test, waitForFrameReady } from "../helpers/fixtures";

test("撮影時にシャッター演出が表示される", async ({ page }) => {
  await page.goto("/faculty_of_architectural_design");
  await waitForFrameReady(page);
  await page.getByTestId("capture-button").click();
  await expect(page.getByTestId("shutter-fade-out")).toBeVisible();
});

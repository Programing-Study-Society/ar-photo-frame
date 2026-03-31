import { expect, test } from "../helpers/fixtures";

test("フレーム初期表示でローディング遷移が進む", async ({ page }) => {
  await page.goto("/faculty_of_architectural_design");
  await expect(page.getByTestId("frame-error-message")).toHaveCount(0);
  await expect(
    page.getByTestId("capture-button").or(page.getByTestId("loading-camera-indicator"))
  ).toBeVisible();
  await expect(page.getByTestId("capture-button")).toBeVisible();
});

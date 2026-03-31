import { expect, test } from "../helpers/fixtures";
import { imagesData } from "../../src/data/images";

for (const image of imagesData) {
  test(`${image.id} が表示できる`, async ({ page }) => {
    await page.goto(`/${image.id}`);
    await expect(page).toHaveURL(new RegExp(`/${image.id}$`));
    await expect(page.getByTestId("frame-error-message")).toHaveCount(0);
    await expect(
      page.getByTestId("capture-button").or(page.getByTestId("loading-camera-indicator"))
    ).toBeVisible();
  });
}

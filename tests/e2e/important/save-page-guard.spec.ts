import { expect, test } from "../helpers/fixtures";

test("保存ページを直接開いた場合はエラー表示になる", async ({ page }) => {
  await page.goto("/savePNG");
  await expect(page.getByTestId("save-page-error-message")).toBeVisible();
});

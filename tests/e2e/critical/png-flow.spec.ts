import { expectDownloadBySaveButton, test, captureAndOpenSavePage } from "../helpers/fixtures";

test("pngフレームで撮影から保存まで完了できる", async ({ page }) => {
  await captureAndOpenSavePage(page, "/faculty_of_architectural_design", "/savePNG");
  await expectDownloadBySaveButton(page, ".png");
});
